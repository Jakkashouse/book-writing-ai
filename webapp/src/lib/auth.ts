import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * 서버 사이드에서 현재 세션 정보를 가져옵니다.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * 서버 사이드에서 현재 로그인한 사용자 정보를 가져옵니다.
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * 비밀번호를 해싱합니다.
 * @param password 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호를 검증합니다.
 * @param password 평문 비밀번호
 * @param hashedPassword 해싱된 비밀번호
 * @returns 비밀번호 일치 여부
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 이메일 형식을 검증합니다.
 * @param email 이메일 주소
 * @returns 유효성 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도를 검증합니다.
 * 최소 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
 * @param password 비밀번호
 * @returns 유효성 여부와 메시지
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "비밀번호는 최소 8자 이상이어야 합니다.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "비밀번호에 영문 소문자를 포함해야 합니다.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "비밀번호에 영문 대문자를 포함해야 합니다.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "비밀번호에 숫자를 포함해야 합니다.",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "비밀번호에 특수문자를 포함해야 합니다.",
    };
  }

  return { isValid: true };
}

/**
 * 사용자 이름을 검증합니다.
 * @param name 사용자 이름
 * @returns 유효성 여부와 메시지
 */
export function validateName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (name.length < 2) {
    return {
      isValid: false,
      message: "이름은 최소 2자 이상이어야 합니다.",
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      message: "이름은 최대 50자까지 가능합니다.",
    };
  }

  return { isValid: true };
}

/**
 * 인증이 필요한 API 라우트를 보호합니다.
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * 사용자가 특정 리소스에 접근 권한이 있는지 확인합니다.
 * @param userId 사용자 ID
 * @param resourceUserId 리소스 소유자 ID
 * @returns 권한 여부
 */
export function hasPermission(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * 사용자 생성
 * @param data 사용자 생성 데이터
 * @returns 생성된 사용자
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const { email, password, name } = data;

  // 이메일 중복 체크
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * 이메일로 사용자 찾기
 * @param email 이메일 주소
 * @returns 사용자 정보
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}

/**
 * 사용자 ID로 찾기
 * @param id 사용자 ID
 * @returns 사용자 정보
 */
export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 사용자 정보 업데이트
 * @param id 사용자 ID
 * @param data 업데이트할 데이터
 * @returns 업데이트된 사용자 정보
 */
export async function updateUser(
  id: string,
  data: {
    name?: string;
    image?: string;
  }
) {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      updatedAt: true,
    },
  });
}

/**
 * 비밀번호 변경
 * @param userId 사용자 ID
 * @param currentPassword 현재 비밀번호
 * @param newPassword 새 비밀번호
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.password) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  // 현재 비밀번호 확인
  const isValid = await verifyPassword(currentPassword, user.password);

  if (!isValid) {
    throw new Error("현재 비밀번호가 일치하지 않습니다.");
  }

  // 새 비밀번호 해싱
  const hashedPassword = await hashPassword(newPassword);

  // 비밀번호 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}
