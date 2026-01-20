/**
 * AI Usage Logger
 * Claude AI 사용량 추적 및 로깅
 */

import { prisma } from './prisma'
import type { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages'

export interface AILogData {
  userId: string
  endpoint: string
  promptType: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  duration?: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

// Claude API 가격표 (2024년 기준, USD per 1M tokens)
const PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 3.0, // $3 per 1M input tokens
    output: 15.0, // $15 per 1M output tokens
  },
  'claude-3-opus-latest': {
    input: 15.0,
    output: 75.0,
  },
  'claude-3-haiku-20240307': {
    input: 0.25,
    output: 1.25,
  },
} as const

/**
 * 비용 계산
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing =
    PRICING[model as keyof typeof PRICING] || PRICING['claude-3-5-sonnet-20241022']

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}

/**
 * AI 사용 로그 기록
 */
export async function logAIUsage(data: AILogData): Promise<void> {
  try {
    const cost = calculateCost(data.model, data.inputTokens, data.outputTokens)

    await prisma.aIUsageLog.create({
      data: {
        userId: data.userId,
        endpoint: data.endpoint,
        promptType: data.promptType,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        cost,
        duration: data.duration,
        success: data.success,
        errorMessage: data.errorMessage,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    })
  } catch (error) {
    // 로깅 실패는 메인 플로우에 영향을 주지 않음
    console.error('Failed to log AI usage:', error)
  }
}

/**
 * 사용자의 AI 사용량 통계 조회
 */
export async function getUserAIStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const where = {
    userId,
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  }

  const [totalLogs, successLogs, stats] = await Promise.all([
    // 전체 로그 수
    prisma.aIUsageLog.count({ where }),

    // 성공한 요청 수
    prisma.aIUsageLog.count({
      where: { ...where, success: true },
    }),

    // 통계 집계
    prisma.aIUsageLog.aggregate({
      where,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        cost: true,
      },
      _avg: {
        duration: true,
      },
    }),
  ])

  return {
    totalRequests: totalLogs,
    successfulRequests: successLogs,
    failedRequests: totalLogs - successLogs,
    totalInputTokens: stats._sum.inputTokens || 0,
    totalOutputTokens: stats._sum.outputTokens || 0,
    totalTokens: stats._sum.totalTokens || 0,
    totalCost: stats._sum.cost || 0,
    avgDuration: stats._avg.duration || 0,
  }
}

/**
 * 프롬프트 타입별 사용량 통계
 */
export async function getUsageByPromptType(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const logs = await prisma.aIUsageLog.groupBy({
    by: ['promptType'],
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      totalTokens: true,
      cost: true,
    },
  })

  return logs.map(log => ({
    promptType: log.promptType,
    requests: log._count.id,
    totalTokens: log._sum.totalTokens || 0,
    totalCost: log._sum.cost || 0,
  }))
}

/**
 * 토큰 사용량 추적 헬퍼
 */
export class TokenTracker {
  private startTime: number
  private userId: string
  private endpoint: string
  private promptType: string
  private model: string
  private metadata?: Record<string, any>

  constructor(
    userId: string,
    endpoint: string,
    promptType: string,
    model: string = 'claude-3-5-sonnet-20241022',
    metadata?: Record<string, any>
  ) {
    this.startTime = Date.now()
    this.userId = userId
    this.endpoint = endpoint
    this.promptType = promptType
    this.model = model
    this.metadata = metadata
  }

  /**
   * 성공 로그 기록
   */
  async logSuccess(inputTokens: number, outputTokens: number): Promise<void> {
    const duration = Date.now() - this.startTime

    await logAIUsage({
      userId: this.userId,
      endpoint: this.endpoint,
      promptType: this.promptType,
      model: this.model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      duration,
      success: true,
      metadata: this.metadata,
    })
  }

  /**
   * 실패 로그 기록
   */
  async logError(error: Error): Promise<void> {
    const duration = Date.now() - this.startTime

    await logAIUsage({
      userId: this.userId,
      endpoint: this.endpoint,
      promptType: this.promptType,
      model: this.model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      duration,
      success: false,
      errorMessage: error.message,
      metadata: this.metadata,
    })
  }
}
