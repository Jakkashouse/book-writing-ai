'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

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
            결제가 실패했습니다
          </h1>

          {errorMessage && (
            <p className="text-gray-600 mb-2">
              {decodeURIComponent(errorMessage)}
            </p>
          )}

          {errorCode && (
            <p className="text-sm text-gray-500 mb-8">
              오류 코드: {errorCode}
            </p>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              결제 실패 원인
            </h3>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              <li>• 카드 한도 초과</li>
              <li>• 잔액 부족</li>
              <li>• 카드 정보 오류</li>
              <li>• 사용자 취소</li>
              <li>• 네트워크 오류</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              다시 시도하기
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              홈으로 돌아가기
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              문제가 계속되면 고객센터로 문의해주세요.
            </p>
            <a
              href="mailto:support@example.com"
              className="text-sm text-blue-600 hover:underline"
            >
              support@example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}
