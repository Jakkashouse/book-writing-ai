/**
 * AI API 타입 정의
 */

// 공통 응답 타입
export interface AIResponse<T = string> {
  success: boolean
  result?: T
  error?: string
  usage?: TokenUsage
}

// 토큰 사용량
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

// Rate Limit 정보
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

// 스트리밍 이벤트 타입
export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'done'; usage: TokenUsage }
  | { type: 'error'; error: string }

// 제목 생성 요청
export interface GenerateTitleRequest {
  genre?: string
  theme: string
  targetAudience?: string
  keywords?: string[]
}

// 목차 생성 요청
export interface GenerateTOCRequest {
  title: string
  genre?: string
  theme: string
  targetAudience?: string
  structure?: string
}

// 초안 생성 요청
export interface GenerateDraftRequest {
  chapterTitle: string
  outline?: string
  keyPoints?: string[]
  targetLength?: number
  style?: string
  stream?: boolean
}

// 기획서 생성 요청
export interface GenerateProposalRequest {
  title: string
  subtitle?: string
  genre?: string
  theme: string
  targetAudience?: string
  authorBio?: string
  uniqueValue?: string
  toc?: string
}

// 과제 분석 요청
export interface AnalyzeAssignmentRequest {
  assignmentType: string
  content: string
  criteria?: string[]
}

// 챗봇 메시지
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// 챗봇 요청
export interface ChatRequest {
  messages: ChatMessage[]
  stream?: boolean
}

// AI 사용량 통계
export interface AIUsageStats {
  overall: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    totalInputTokens: number
    totalOutputTokens: number
    totalTokens: number
    totalCost: number
    avgDuration: number
  }
  byPromptType: Array<{
    promptType: string
    requests: number
    totalTokens: number
    totalCost: number
  }>
  period: {
    startDate?: string
    endDate?: string
    days: number
  }
}

// 에러 응답
export interface APIError {
  error: string
  retryAfter?: number
}
