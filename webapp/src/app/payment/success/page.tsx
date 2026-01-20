'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    async function confirmPayment() {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.')
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '결제 승인에 실패했습니다.')
        }

        const data = await response.json()
        setPaymentInfo(data)
        setIsProcessing(false)
      } catch (err: any) {
        console.error('Payment confirmation error:', err)
        setError(err.message || '결제 승인 중 오류가 발생했습니다.')
        setIsProcessing(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            결제를 처리하고 있습니다
          </h2>
          <p className="text-gray-600">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제 처리 실패
            </h1>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            <div className="space-x-4">
              <Link
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                요금제 페이지로
              </Link>
              <Link
                href="/"
                className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              결제가 완료되었습니다!
            </h1>
            <p className="text-gray-600">
              구독이 성공적으로 시작되었습니다.
            </p>
          </div>

          {paymentInfo && (
            <div className="border-t border-b border-gray-200 py-6 mb-8">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-600">주문번호</dt>
                  <dd className="font-medium text-gray-900">
                    {paymentInfo.orderId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">상품명</dt>
                  <dd className="font-medium text-gray-900">
                    {paymentInfo.orderName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">결제금액</dt>
                  <dd className="text-xl font-bold text-gray-900">
                    {paymentInfo.amount.toLocaleString('ko-KR')}원
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">결제수단</dt>
                  <dd className="font-medium text-gray-900">
                    {paymentInfo.method}
                  </dd>
                </div>
                {paymentInfo.approvedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">승인시각</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(paymentInfo.approvedAt).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="space-y-4">
            {paymentInfo?.receiptUrl && (
              <a
                href={paymentInfo.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
              >
                영수증 보기
              </a>
            )}
            <Link
              href="/dashboard"
              className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              대시보드로 이동
            </Link>
            <Link
              href="/payment/history"
              className="block w-full text-center bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              결제 내역 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
