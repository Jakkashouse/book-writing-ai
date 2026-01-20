# 책 쓰기 AI 코칭 웹앱

AI 기반 책 쓰기 코칭 플랫폼입니다. 사용자가 프롬프트를 활용하여 제목, 목차, 초안, 출간기획서까지 만들 수 있는 올인원 솔루션을 제공합니다.

## 주요 기능

### 📚 책 쓰기 워크플로우
- **제목 & 목차 생성**: AI를 활용한 책 제목과 목차 자동 생성
- **초안 작성**: 챕터별 초안 작성 도구
- **원고 교정**: AI 기반 교정 및 피드백
- **출판 기획서**: 전문적인 출판 기획서 자동 생성

### 🤖 AI 코칭
- **Claude AI 통합**: Anthropic Claude API를 활용한 고품질 콘텐츠 생성
- **맞춤형 프롬프트**: 27개 이상의 전문 프롬프트 템플릿
- **실시간 피드백**: 작성 중인 내용에 대한 즉각적인 AI 피드백

### 💳 결제 & 구독
- **토스페이먼츠 연동**: 안전한 결제 시스템
- **유연한 구독 플랜**: FREE, BASIC, PRO, ENTERPRISE
- **사용량 추적**: AI 토큰 사용량 및 비용 관리

### 🔐 인증 & 보안
- **소셜 로그인**: 구글, 카카오, 네이버 로그인 지원
- **이메일 인증**: 전통적인 이메일/비밀번호 인증
- **NextAuth.js**: 안전하고 검증된 인증 시스템

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js

### AI & External Services
- **AI Provider**: Anthropic Claude API
- **Payment**: 토스페이먼츠 (Toss Payments)

## 시작하기

### 사전 요구사항
- Node.js 18.x 이상
- PostgreSQL 14 이상
- npm

### 설치

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env.local
```

3. 데이터베이스 설정
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

## 프로젝트 구조

```
webapp/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # React 컴포넌트
│   ├── lib/             # 유틸리티 함수
│   ├── hooks/           # Custom React Hooks
│   └── types/           # TypeScript 타입 정의
├── prisma/
│   └── schema.prisma    # 데이터베이스 스키마
└── public/              # 정적 파일
```

## 배포

Vercel을 사용한 배포를 권장합니다.

## 라이선스

개인 프로젝트
