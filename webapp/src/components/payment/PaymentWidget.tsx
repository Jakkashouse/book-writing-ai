'use client'

import { useEffect, useRef, useState } from 'react'
import { loadTossPaymentWidget } from '@/lib/toss'
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/types/payment'

interface PaymentWidgetProps {
  plan: SubscriptionPlan
  customerEmail: string
  customerName?: string
}

export function PaymentWidget({ plan, customerEmail, customerName }: PaymentWidgetProps) {
  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const planInfo = SUBSCRIPTION_PLANS[plan]

  useEffect(() => {
    async function initializePaymentWidget() {
      try {
        const paymentWidget = await loadTossPaymentWidget(customerEmail)

        paymentWidgetRef.current = paymentWidget

        // Render payment methods
        await paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: planInfo.price }
        )

        setIsLoading(false)
      } catch (err: any) {
        console.error('Payment widget initialization error:', err)
        setError(err.message || 'Failed to load payment widget')
        setIsLoading(false)
      }
    }

    initializePaymentWidget()
  }, [plan, customerEmail, planInfo.price])

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) {
      setError('Payment widget not initialized')
      return
    }

    try {
      setIsLoading(true)

      // Create payment record
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          amount: planInfo.price,
          orderName: `${planInfo.displayName} 구독`,
          customerEmail,
          customerName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { orderId } = await response.json()

      // Request payment
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: `${planInfo.displayName} 구독`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail,
        customerName: customerName || '',
      })
    } catch (err: any) {
      console.error('Payment request error:', err)
      setError(err.message || 'Failed to request payment')
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">{planInfo.displayName}</h3>
        <div className="space-y-2 mb-6">
          {planInfo.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-green-600 mt-0.5"
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
            </div>
          ))}
        </div>
        <div className="text-3xl font-bold">
          {planInfo.price.toLocaleString('ko-KR')}원
          <span className="text-base font-normal text-gray-500 ml-2">/월</span>
        </div>
      </div>

      <div id="payment-widget" className="rounded-lg border bg-white p-6" />

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '처리 중...' : '결제하기'}
      </button>
    </div>
  )
}
