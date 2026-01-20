'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PaymentResponse, SubscriptionResponse } from '@/types/payment'

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentsRes, subscriptionRes] = await Promise.all([
          fetch('/api/payment/list'),
          fetch('/api/subscription'),
        ])

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          setPayments(paymentsData)
        }

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json()
          setSubscription(subscriptionData)
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCancelPayment = async (paymentId: string) => {
    if (!confirm('정말로 결제를 취소하시겠습니까?')) {
      return
    }

    const cancelReason = prompt('취소 사유를 입력해주세요:')
    if (!cancelReason) {
      return
    }

    try {
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          cancelReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '결제 취소에 실패했습니다.')
      }

      alert('결제가 취소되었습니다.')
      window.location.reload()
    } catch (err: any) {
      console.error('Payment cancellation error:', err)
      alert(err.message || '결제 취소 중 오류가 발생했습니다.')
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            결제 관리
          </h1>
          <p className="text-gray-600">
            구독 정보와 결제 내역을 확인하세요
          </p>
        </div>

        {subscription && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              현재 구독
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">플랜</p>
                <p className="text-lg font-bold text-gray-900">
                  {subscription.plan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">상태</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : subscription.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.status === 'ACTIVE'
                    ? '활성'
                    : subscription.status === 'CANCELLED'
                    ? '취소됨'
                    : '만료됨'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">시작일</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            {subscription.endDate && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">종료일</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(subscription.endDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            )}
            <div className="mt-6 space-x-4">
              <Link
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                플랜 변경
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              결제 내역
            </h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-600">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">결제 내역이 없습니다.</p>
              <Link
                href="/pricing"
                className="inline-block text-blue-600 hover:underline"
              >
                구독 시작하기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.orderName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString('ko-KR')}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status === 'COMPLETED'
                            ? '완료'
                            : payment.status === 'PENDING'
                            ? '대기'
                            : payment.status === 'CANCELLED'
                            ? '취소'
                            : '실패'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            영수증
                          </a>
                        )}
                        {payment.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleCancelPayment(payment.id)}
                            className="text-red-600 hover:underline"
                          >
                            취소
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
