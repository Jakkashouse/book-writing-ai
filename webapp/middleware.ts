import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * NextAuth 미들웨어로 보호된 라우트 설정
 * 인증이 필요한 경로에 접근 시 로그인 페이지로 리다이렉트
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    // 인증된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 보호된 라우트에 비인증 사용자 접근 시 로그인 페이지로 리다이렉트
    if (!isAuthPage && !isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized({ token }) {
        // token이 있으면 인증됨
        return !!token;
      },
    },
  }
);

/**
 * 미들웨어가 적용될 경로 설정
 * - /profile: 사용자 프로필 페이지
 * - /projects: 책 프로젝트 관리
 * - /dashboard: 대시보드
 * - /settings: 설정
 * - /api/*: API 라우트 (auth 제외)
 */
export const config = {
  matcher: [
    "/profile/:path*",
    "/projects/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};
