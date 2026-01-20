import { User } from "@prisma/client";

/**
 * NextAuth 세션 사용자 타입 확장
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string;
    provider?: string;
  }
}

/**
 * 로그인 폼 데이터
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * 회원가입 폼 데이터
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

/**
 * 비밀번호 변경 폼 데이터
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * 프로필 업데이트 폼 데이터
 */
export interface ProfileUpdateFormData {
  name: string;
  image?: string;
}

/**
 * API 응답 타입
 */
export interface AuthResponse {
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * 이메일 확인 응답
 */
export interface EmailCheckResponse {
  available: boolean;
  message: string;
}

/**
 * 사용자 세션 정보
 */
export interface UserSession {
  id: string;
  email: string;
  name: string;
  image?: string;
}

/**
 * 사용자 프로필
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OAuth 제공자
 */
export type OAuthProvider = "google" | "kakao" | "naver";

/**
 * 인증 에러 타입
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_EMAIL = "INVALID_EMAIL",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  UNAUTHORIZED = "UNAUTHORIZED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SERVER_ERROR = "SERVER_ERROR",
}

/**
 * 인증 에러 클래스
 */
export class AuthError extends Error {
  type: AuthErrorType;
  statusCode: number;

  constructor(type: AuthErrorType, message: string, statusCode: number = 400) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

/**
 * 폼 검증 에러
 */
export interface FormValidationError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}
