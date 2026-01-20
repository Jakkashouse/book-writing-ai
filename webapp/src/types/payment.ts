export type SubscriptionPlan = 'FREE' | 'PRO' | 'PREMIUM'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface SubscriptionPlanInfo {
  name: SubscriptionPlan
  displayName: string
  price: number
  features: string[]
  aiCoachingLimit: number
  maxProjects: number
  priority: number
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanInfo> = {
  FREE: {
    name: 'FREE',
    displayName: '무료 플랜',
    price: 0,
    features: [
      '6주 수료 후 3개월 무료',
      'AI 코치 월 10회',
      '프로젝트 1개',
      '기본 프롬프트 템플릿',
    ],
    aiCoachingLimit: 10,
    maxProjects: 1,
    priority: 1,
  },
  PRO: {
    name: 'PRO',
    displayName: '프로 플랜',
    price: 29000,
    features: [
      'AI 코치 월 50회',
      '프로젝트 5개',
      '모든 프롬프트 템플릿',
      '우선 고객 지원',
    ],
    aiCoachingLimit: 50,
    maxProjects: 5,
    priority: 2,
  },
  PREMIUM: {
    name: 'PREMIUM',
    displayName: '프리미엄 플랜',
    price: 59000,
    features: [
      'AI 코치 무제한',
      '프로젝트 무제한',
      '모든 프롬프트 템플릿',
      '1:1 전담 컨설팅',
      '출판사 연결 지원',
    ],
    aiCoachingLimit: -1, // -1 means unlimited
    maxProjects: -1,
    priority: 3,
  },
}

export interface PaymentCreateRequest {
  plan: SubscriptionPlan
  amount: number
  orderName: string
  customerEmail?: string
  customerName?: string
}

export interface PaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface PaymentCancelRequest {
  paymentId: string
  cancelReason: string
  cancelAmount?: number
}

export interface PaymentResponse {
  id: string
  orderId: string
  orderName: string
  amount: number
  status: PaymentStatus
  method?: string
  approvedAt?: Date
  paymentKey?: string
  receiptUrl?: string
  createdAt: Date
}

export interface SubscriptionResponse {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: Date
  endDate?: Date
  trialEndsAt?: Date
  autoRenew: boolean
  cancelledAt?: Date
  createdAt: Date
}
