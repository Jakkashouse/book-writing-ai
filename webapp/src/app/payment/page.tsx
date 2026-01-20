'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PaymentWidget } from '@/components/payment/PaymentWidget'
import { SubscriptionPlan } from '@/types/payment'

function PaymentContent() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<SubscriptionPlan>('PRO')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const planParam = searchParams.get('plan') as SubscriptionPlan
    if (planParam && ['FREE', 'PRO', 'PREMIUM'].includes(planParam)) {
      setPlan(planParam)
    }

    async function fetchUserInfo() {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const session = await response.json()
          if (session?.user) {
            setCustomerEmail(session.user.email || '')
            setCustomerName(session.user.name || '')
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!customerEmail) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-gray-600 mb-6">
              결제를 진행하려면 먼저 로그인해주세요.
            </p>
            <a
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              로그인하기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            결제하기
          </h1>
          <p className="text-gray-600">
            안전하게 결제를 진행해주세요
          </p>
        </div>

        <PaymentWidget
          plan={plan}
          customerEmail={customerEmail}
          customerName={customerName}
        />
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
