/**
 * 제목 생성 API
 * POST /api/ai/generate-title
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { anthropic } from '@/lib/anthropic'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { TokenTracker } from '@/lib/ai-logger'
import { TITLE_TOC_SYSTEM_PROMPT, createTitlePrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`title-${clientIP}`)

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
    const { genre, theme, targetAudience, keywords } = body

    if (!theme) {
      return NextResponse.json(
        { error: '핵심 주제(theme)는 필수입니다.' },
        { status: 400 }
      )
    }

    // 토큰 추적 시작
    const tracker = new TokenTracker(
      session.user.email || 'unknown',
      '/api/ai/generate-title',
      'title',
      'claude-3-5-sonnet-20241022',
      { genre, targetAudience, keywordsCount: keywords?.length || 0 }
    )

    // 프롬프트 생성
    const userPrompt = createTitlePrompt({
      genre,
      theme,
      targetAudience,
      keywords,
    })

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.8, // 창의성을 위해 약간 높게
      system: TITLE_TOC_SYSTEM_PROMPT,
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
    console.error('Title generation error:', error)

    // 에러 로깅 (토큰 추적이 이미 시작된 경우)
    if (error.message !== 'No session') {
      const session = await getServerSession()
      if (session?.user) {
        const tracker = new TokenTracker(
          session.user.email || 'unknown',
          '/api/ai/generate-title',
          'title'
        )
        await tracker.logError(error)
      }
    }

    return NextResponse.json(
      {
        error: error.message || '제목 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
