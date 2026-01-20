import { NextRequest, NextResponse } from "next/server";
import { requireAuth, updateUser, validateName } from "@/lib/auth";

/**
 * 사용자 프로필 업데이트 API
 * PATCH /api/user/profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const session = await requireAuth();

    const body = await request.json();
    const { name, image } = body;

    // 이름 검증
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return NextResponse.json(
          { error: nameValidation.message },
          { status: 400 }
        );
      }
    }

    // 프로필 업데이트
    const updatedUser = await updateUser(session.user.id, {
      name: name?.trim(),
      image,
    });

    return NextResponse.json({
      message: "프로필이 성공적으로 업데이트되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
