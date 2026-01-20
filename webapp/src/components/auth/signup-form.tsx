"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupFormData, FormValidationError } from "@/types/auth";

export function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [errors, setErrors] = useState<FormValidationError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormValidationError = {};

    // 이름 검증
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    } else if (formData.name.length < 2) {
      newErrors.name = "이름은 최소 2자 이상이어야 합니다.";
    } else if (formData.name.length > 50) {
      newErrors.name = "이름은 최대 50자까지 가능합니다.";
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "영문 소문자를 포함해야 합니다.";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "영문 대문자를 포함해야 합니다.";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "숫자를 포함해야 합니다.";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      newErrors.password = "특수문자를 포함해야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || "회원가입 중 오류가 발생했습니다.");
        return;
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push("/auth/login?message=signup_success");
    } catch (error) {
      console.error("Signup error:", error);
      setGeneralError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = (password: string): {
    strength: number;
    label: string;
    color: string;
  } => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "약함", color: "bg-red-500" };
    if (strength <= 4) return { strength, label: "보통", color: "bg-yellow-500" };
    return { strength, label: "강함", color: "bg-green-500" };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="mt-2 text-gray-600">새 계정을 만드세요</p>
      </div>

      {generalError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            이름
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="홍길동"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="email@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">비밀번호 강도:</span>
                <span className={`font-medium ${
                  passwordStrength.strength <= 2
                    ? "text-red-600"
                    : passwordStrength.strength <= 4
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            최소 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-2"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">이미 계정이 있으신가요? </span>
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          로그인
        </a>
      </div>
    </div>
  );
}
