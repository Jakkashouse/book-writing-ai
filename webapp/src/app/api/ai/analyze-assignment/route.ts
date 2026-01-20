/**
 * 과제 분석 API
 * POST /api/ai/analyze-assignment
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { anthropic } from '@/lib/anthropic'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { TokenTracker } from '@/lib/ai-logger'
import { ASSIGNMENT_SYSTEM_PROMPT, createAssignmentAnalysisPrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`analyze-${clientIP}`)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      )
    }

    // 요청 바디 파싱
    const body = await request.json()
    const { assignmentType, content, criteria } = body

    if (!assignmentType || !content) {
      return NextResponse.json(
        { error: '과제 유형(assignmentType)과 내용(content)은 필수입니다.' },
        { status: 400 }
      )
    }

    // 내용이 너무 긴지 확인 (약 20,000자 제한)
    if (content.length > 20000) {
      return NextResponse.json(
        { error: '분석할 내용이 너무 깁니다. 20,000자 이하로 줄여주세요.' },
        { status: 400 }
      )
    }

    // 토큰 추적 시작
    const tracker = new TokenTracker(
      session.user.email || 'unknown',
      '/api/ai/analyze-assignment',
      'assignment_analysis',
      'claude-3-5-sonnet-20241022',
      { assignmentType, contentLength: content.length, hasCriteria: !!criteria }
    )

    // 프롬프트 생성
    const userPrompt = createAssignmentAnalysisPrompt({
      assignmentType,
      content,
      criteria,
    })

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: ASSIGNMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // 응답 파싱
    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    const result = textContent.text

    // 토큰 사용량 로깅
    await tracker.logSuccess(message.usage.input_tokens, message.usage.output_tokens)

    // 응답 반환
    return NextResponse.json(
      {
        success: true,
        result,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error: any) {
    console.error('Assignment analysis error:', error)

    // 에러 로깅
    if (error.message !== 'No session') {
      const session = await getServerSession()
      if (session?.user) {
        const tracker = new TokenTracker(
          session.user.email || 'unknown',
          '/api/ai/analyze-assignment',
          'assignment_analysis'
        )
        await tracker.logError(error)
      }
    }

    return NextResponse.json(
      {
        error: error.message || '과제 분석 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
