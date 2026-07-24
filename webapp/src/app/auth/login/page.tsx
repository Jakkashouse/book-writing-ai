import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "로그인 - Book Writing AI",
  description: "AI 기반 책 쓰기 플랫폼에 로그인하세요",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
