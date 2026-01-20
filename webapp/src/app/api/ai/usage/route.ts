/**
 * AI 사용량 통계 조회 API
 * GET /api/ai/usage
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserAIStats, getUsageByPromptType } from '@/lib/ai-logger'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) {
      startDate = new Date(startDateParam)
    }
    if (endDateParam) {
      endDate = new Date(endDateParam)
    }

    // 날짜가 지정되지 않은 경우 기본값 설정
    if (!startDate && !endDate) {
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // 전체 통계 조회
    const stats = await getUserAIStats(session.user.email, startDate, endDate)

    // 프롬프트 타입별 통계
    const byPromptType = await getUsageByPromptType(session.user.email, days)

    return NextResponse.json({
      success: true,
      data: {
        overall: stats,
        byPromptType,
        period: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          days,
        },
      },
    })
  } catch (error: any) {
    console.error('Usage stats error:', error)

    return NextResponse.json(
      {
        error: error.message || '사용량 통계 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
