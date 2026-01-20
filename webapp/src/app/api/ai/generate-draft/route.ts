/**
 * 초안 생성 API (스트리밍 지원)
 * POST /api/ai/generate-draft
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { anthropic } from '@/lib/anthropic'
import { checkRateLimit, getClientIP, STRICT_RATE_LIMIT } from '@/lib/rate-limit'
import { TokenTracker } from '@/lib/ai-logger'
import { DRAFT_SYSTEM_PROMPT, createDraftPrompt } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession()
    if (!session?.user) {
      return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting (스트리밍은 더 엄격하게)
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`draft-${clientIP}`, STRICT_RATE_LIMIT)

    if (!rateLimit.success) {
      return new Response(
        JSON.stringify({
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      )
    }

    // 요청 바디 파싱
    const body = await request.json()
    const { chapterTitle, outline, keyPoints, targetLength, style, stream = true } = body

    if (!chapterTitle) {
      return new Response(
        JSON.stringify({ error: '챕터 제목(chapterTitle)은 필수입니다.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 토큰 추적 시작
    const tracker = new TokenTracker(
      session.user.email || 'unknown',
      '/api/ai/generate-draft',
      'draft',
      'claude-3-5-sonnet-20241022',
      { chapterTitle, targetLength, hasOutline: !!outline, keyPointsCount: keyPoints?.length || 0 }
    )

    // 프롬프트 생성
    const userPrompt = createDraftPrompt({
      chapterTitle,
      outline,
      keyPoints,
      targetLength,
      style,
    })

    // 스트리밍 응답
    if (stream) {
      const encoder = new TextEncoder()
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const stream = await anthropic.messages.stream({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 8192, // 긴 초안을 위해 더 많은 토큰
              temperature: 0.7,
              system: DRAFT_SYSTEM_PROMPT,
              messages: [
                {
                  role: 'user',
                  content: userPrompt,
                },
              ],
            })

            let inputTokens = 0
            let outputTokens = 0

            // 스트림 이벤트 처리
            stream.on('text', (text) => {
              const data = JSON.stringify({ type: 'text', content: text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            })

            stream.on('message', (message) => {
              inputTokens = message.usage.input_tokens
              outputTokens = message.usage.output_tokens
            })

            stream.on('error', (error) => {
              console.error('Stream error:', error)
              const errorData = JSON.stringify({
                type: 'error',
                error: error.message,
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
              controller.close()
            })

            stream.on('end', async () => {
              // 토큰 사용량 로깅
              await tracker.logSuccess(inputTokens, outputTokens)

              const doneData = JSON.stringify({
                type: 'done',
                usage: {
                  inputTokens,
                  outputTokens,
                  totalTokens: inputTokens + outputTokens,
                },
              })
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
              controller.close()
            })
          } catch (error: any) {
            console.error('Draft streaming error:', error)
            await tracker.logError(error)

            const errorData = JSON.stringify({
              type: 'error',
              error: error.message || '초안 생성 중 오류가 발생했습니다.',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      })
    }

    // 일반 응답 (스트리밍 아님)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      temperature: 0.7,
      system: DRAFT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    const result = textContent.text

    // 토큰 사용량 로깅
    await tracker.logSuccess(message.usage.input_tokens, message.usage.output_tokens)

    return new Response(
      JSON.stringify({
        success: true,
        result,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error: any) {
    console.error('Draft generation error:', error)

    return new Response(
      JSON.stringify({
        error: error.message || '초안 생성 중 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
