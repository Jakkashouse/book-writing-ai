/**
 * Rate Limiting Utility
 * IP 기반 레이트 리미팅 구현
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// 메모리 기반 레이트 리미트 저장소
// 프로덕션에서는 Redis 사용 권장
const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  interval: number // 시간 간격 (밀리초)
  maxRequests: number // 최대 요청 수
}

// 기본 레이트 리미트: 1분에 20회
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  interval: 60 * 1000, // 1분
  maxRequests: 20,
}

// 엄격한 레이트 리미트: 1분에 5회 (스트리밍용)
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  interval: 60 * 1000,
  maxRequests: 5,
}

/**
 * 레이트 리미트 체크
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): {
  success: boolean
  limit: number
  remaining: number
  reset: number
} {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // 첫 요청이거나 리셋 시간이 지났을 경우
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.interval,
    }
  }

  // 요청 횟수 증가
  entry.count++

  // 제한 초과 체크
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * 클라이언트 IP 추출 (Next.js)
 */
export function getClientIP(request: Request): string {
  // Vercel, Cloudflare 등의 프록시 헤더 체크
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // 기본값
  return 'unknown'
}

/**
 * 레이트 리미트 정리 (메모리 관리)
 * 주기적으로 호출하여 만료된 항목 제거
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  const keysToDelete: string[] = []

  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach(key => rateLimitMap.delete(key))
}

// 1시간마다 정리 실행
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 60 * 60 * 1000)
}
