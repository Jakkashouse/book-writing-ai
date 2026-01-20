import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  changePassword,
  validatePasswordStrength,
} from "@/lib/auth";

/**
 * 비밀번호 변경 API
 * PATCH /api/user/password
 */
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const session = await requireAuth();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 새 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다." },
        { status: 400 }
      );
    }

    // 비밀번호 변경
    await changePassword(session.user.id, currentPassword, newPassword);

    return NextResponse.json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    console.error("Password change error:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "인증이 필요합니다." },
          { status: 401 }
        );
      }

      if (error.message.includes("일치하지 않습니다")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes("찾을 수 없습니다")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
