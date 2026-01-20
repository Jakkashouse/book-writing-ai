import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  isValidEmail,
  validatePasswordStrength,
  validateName,
} from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * 회원가입 API 엔드포인트
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          error: "필수 정보를 모두 입력해주세요.",
          details: {
            email: !email ? "이메일을 입력해주세요." : undefined,
            password: !password ? "비밀번호를 입력해주세요." : undefined,
            name: !name ? "이름을 입력해주세요." : undefined,
          },
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 이름 검증
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.message },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 성공 응답
    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Prisma 에러 처리
    if (error instanceof Error) {
      // 중복 키 에러
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "이미 사용중인 이메일입니다." },
          { status: 409 }
        );
      }
    }

    // 일반 에러
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 이메일 중복 확인 API
 * GET /api/auth/register?email=test@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? "이미 사용중인 이메일입니다."
        : "사용 가능한 이메일입니다.",
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "이메일 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
