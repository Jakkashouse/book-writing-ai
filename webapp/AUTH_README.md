# NextAuth.js 인증 시스템 구현 가이드

## 개요

이 프로젝트는 NextAuth.js v4를 기반으로 한 완전한 인증 시스템을 구현합니다.

### 주요 기능

- ✅ 이메일/비밀번호 인증 (Credentials Provider)
- ✅ 소셜 로그인 (Google, Kakao, Naver)
- ✅ bcryptjs를 사용한 안전한 비밀번호 해싱
- ✅ JWT 기반 세션 관리
- ✅ 미들웨어를 통한 라우트 보호
- ✅ 사용자 프로필 관리
- ✅ 비밀번호 변경 기능
- ✅ TypeScript 완전 지원

## 파일 구조

```
webapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts          # NextAuth 설정
│   │   │   │   └── register/
│   │   │   │       └── route.ts          # 회원가입 API
│   │   │   └── user/
│   │   │       ├── profile/
│   │   │       │   └── route.ts          # 프로필 업데이트 API
│   │   │       └── password/
│   │   │           └── route.ts          # 비밀번호 변경 API
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # 로그인 페이지
│   │   │   ├── signup/
│   │   │   │   └── page.tsx              # 회원가입 페이지
│   │   │   └── error/
│   │   │       └── page.tsx              # 인증 에러 페이지
│   │   └── profile/
│   │       └── page.tsx                  # 프로필 페이지
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx            # 로그인 폼
│   │   │   ├── signup-form.tsx           # 회원가입 폼
│   │   │   └── user-nav.tsx              # 사용자 네비게이션
│   │   ├── profile/
│   │   │   └── profile-content.tsx       # 프로필 관리 UI
│   │   └── providers/
│   │       └── session-provider.tsx      # NextAuth 세션 프로바이더
│   ├── lib/
│   │   └── auth.ts                       # 인증 유틸리티 함수
│   └── types/
│       └── auth.ts                       # 인증 관련 TypeScript 타입
├── middleware.ts                         # 라우트 보호 미들웨어
└── .env.example                          # 환경변수 예시
```

## 설치 및 설정

### 1. 의존성 설치

이미 설치된 패키지:
```bash
npm install next-auth@^4.24.13
npm install @next-auth/prisma-adapter
npm install bcryptjs
npm install @types/bcryptjs
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요:

```bash
cp .env.example .env
```

필수 환경 변수:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/book_writing_ai"

# NextAuth Secret (아래 명령어로 생성)
# openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# OAuth Providers (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```

### 3. 데이터베이스 마이그레이션

Prisma 스키마가 이미 설정되어 있으므로 마이그레이션만 실행:

```bash
npx prisma migrate dev
```

### 4. 루트 레이아웃에 세션 프로바이더 추가

`src/app/layout.tsx` 파일을 수정:

```tsx
import AuthProvider from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 사용 방법

### 클라이언트 컴포넌트에서 세션 사용

```tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "unauthenticated") {
    return <button onClick={() => signIn()}>로그인</button>;
  }

  return (
    <div>
      <p>환영합니다, {session?.user?.name}님!</p>
      <button onClick={() => signOut()}>로그아웃</button>
    </div>
  );
}
```

### 서버 컴포넌트에서 세션 사용

```tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1>보호된 페이지</h1>
      <p>환영합니다, {user.name}님!</p>
    </div>
  );
}
```

### API 라우트 보호

```tsx
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // 인증된 사용자만 접근 가능한 로직
    return NextResponse.json({ data: "protected data" });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

## 보안 기능

### 비밀번호 정책

- 최소 8자 이상
- 영문 대문자 포함
- 영문 소문자 포함
- 숫자 포함
- 특수문자 포함

### 비밀번호 해싱

- bcryptjs 사용
- Salt rounds: 12
- 비동기 해싱으로 성능 최적화

### 세션 관리

- JWT 기반 세션
- 세션 유효기간: 30일
- 자동 갱신: 24시간마다

### CSRF 보호

NextAuth.js가 자동으로 CSRF 토큰을 관리합니다.

## 보호된 라우트

미들웨어가 다음 경로를 자동으로 보호합니다:

- `/profile/*` - 사용자 프로필
- `/projects/*` - 프로젝트 관리
- `/dashboard/*` - 대시보드
- `/settings/*` - 설정
- `/api/*` - API 엔드포인트 (auth 제외)

인증되지 않은 사용자는 `/auth/login`으로 리다이렉트됩니다.

## OAuth 설정 가이드

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "OAuth 2.0 Client ID" 선택
5. Authorized redirect URIs에 추가:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### Kakao OAuth

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. "제품 설정" > "카카오 로그인" 활성화
4. Redirect URI 설정:
   - `http://localhost:3000/api/auth/callback/kakao`
   - `https://yourdomain.com/api/auth/callback/kakao`

### Naver OAuth

1. [Naver Developers](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. "API 설정" 에서 Callback URL 추가:
   - `http://localhost:3000/api/auth/callback/naver`
   - `https://yourdomain.com/api/auth/callback/naver`

## API 엔드포인트

### 인증 관련

- `POST /api/auth/register` - 회원가입
- `GET /api/auth/register?email=test@example.com` - 이메일 중복 확인
- `POST /api/auth/signin` - 로그인 (NextAuth 자동 처리)
- `POST /api/auth/signout` - 로그아웃 (NextAuth 자동 처리)

### 사용자 관리

- `PATCH /api/user/profile` - 프로필 업데이트
- `PATCH /api/user/password` - 비밀번호 변경

## 트러블슈팅

### "NEXTAUTH_SECRET" 에러

`.env` 파일에 `NEXTAUTH_SECRET` 값을 설정하세요:

```bash
openssl rand -base64 32
```

### OAuth 로그인 실패

1. 환경변수가 올바르게 설정되었는지 확인
2. Redirect URI가 올바른지 확인
3. OAuth 제공자 콘솔에서 클라이언트 ID/Secret 확인

### 세션이 유지되지 않음

1. 쿠키 설정 확인
2. HTTPS 사용 여부 확인 (프로덕션)
3. `NEXTAUTH_URL` 환경변수 확인

## 프로덕션 배포 체크리스트

- [ ] `NEXTAUTH_SECRET` 강력한 값으로 설정
- [ ] `NEXTAUTH_URL` 프로덕션 URL로 변경
- [ ] OAuth Redirect URIs에 프로덕션 URL 추가
- [ ] DATABASE_URL 프로덕션 DB로 변경
- [ ] HTTPS 사용 확인
- [ ] 환경변수 안전하게 관리 (절대 커밋하지 말 것)

## 참고 자료

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [Prisma 어댑터](https://next-auth.js.org/adapters/prisma)
- [JWT 세션 전략](https://next-auth.js.org/configuration/options#session)
