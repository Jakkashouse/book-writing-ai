"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.";
      case "AccessDenied":
        return "접근이 거부되었습니다.";
      case "Verification":
        return "인증 토큰이 만료되었거나 이미 사용되었습니다.";
      case "OAuthSignin":
        return "OAuth 로그인을 시작하는 중 오류가 발생했습니다.";
      case "OAuthCallback":
        return "OAuth 콜백 처리 중 오류가 발생했습니다.";
      case "OAuthCreateAccount":
        return "OAuth 계정 생성 중 오류가 발생했습니다.";
      case "EmailCreateAccount":
        return "이메일 계정 생성 중 오류가 발생했습니다.";
      case "Callback":
        return "콜백 처리 중 오류가 발생했습니다.";
      case "OAuthAccountNotLinked":
        return "이 이메일은 이미 다른 방법으로 가입되어 있습니다.";
      case "SessionRequired":
        return "로그인이 필요한 페이지입니다.";
      case "Default":
      default:
        return "인증 중 오류가 발생했습니다.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            인증 오류
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인 페이지로 돌아가기
          </a>
          <a
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            홈으로 이동
          </a>
        </div>

        {error && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            에러 코드: {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
