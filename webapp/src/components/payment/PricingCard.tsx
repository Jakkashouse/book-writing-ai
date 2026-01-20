'use client'

import { useState } from 'react'
import { SubscriptionPlan, SubscriptionPlanInfo } from '@/types/payment'

interface PricingCardProps {
  plan: SubscriptionPlanInfo
  currentPlan?: SubscriptionPlan
  onSelect: (plan: SubscriptionPlan) => void
}

export function PricingCard({ plan, currentPlan, onSelect }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isCurrent = currentPlan === plan.name
  const isPopular = plan.name === 'PRO'

  const handleSelect = async () => {
    setIsLoading(true)
    try {
      await onSelect(plan.name)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`relative rounded-lg border-2 p-6 ${
        isPopular
          ? 'border-blue-600 shadow-lg'
          : 'border-gray-200'
      } ${isCurrent ? 'bg-blue-50' : 'bg-white'}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">
            인기
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            현재 플랜
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold">{plan.displayName}</h3>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">
          {plan.price === 0 ? '무료' : `${plan.price.toLocaleString('ko-KR')}원`}
        </span>
        {plan.price > 0 && (
          <span className="text-gray-500 ml-2">/월</span>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        disabled={isLoading || isCurrent}
        className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
          isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? '처리 중...' : isCurrent ? '현재 플랜' : '선택하기'}
      </button>
    </div>
  )
}
