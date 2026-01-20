# 책쓰기 코칭 6주 프로그램 통합 시스템 아키텍처

> **버전**: 1.0.0
> **최종 수정**: 2026-01-10
> **목표**: 준현님의 케어 시간 80% 절감 + 수강생 만족도 유지

---

## 1. 시스템 개요

### 1.1 아키텍처 다이어그램

```
                              ┌─────────────────────────────────────────┐
                              │           External Services              │
                              │  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
                              │  │ KakaoTalk│ │  Email  │ │   n8n    │  │
                              │  │   API   │ │  SMTP   │ │Automation│  │
                              │  └────┬────┘ └────┬────┘ └────┬─────┘  │
                              │       │           │           │        │
                              └───────┼───────────┼───────────┼────────┘
                                      │           │           │
                              ┌───────▼───────────▼───────────▼────────┐
                              │           Notification Service          │
                              │        (Message Queue - Redis)          │
                              └─────────────────┬──────────────────────┘
                                                │
┌─────────────────────┐       ┌─────────────────▼──────────────────────┐
│                     │       │                                         │
│    Frontend         │       │              Backend API                │
│    (Next.js 16)     │◄─────►│           (FastAPI + Python)            │
│                     │       │                                         │
│  ┌───────────────┐  │       │  ┌─────────────────────────────────┐   │
│  │ 수강생 대시보드 │  │  REST  │  │        API Routers               │   │
│  │ - 과제 제출    │  │◄─────►│  │  /api/v1/assignments             │   │
│  │ - 진도 확인    │  │       │  │  /api/v1/feedback                │   │
│  │ - 챗봇 상담    │  │       │  │  /api/v1/chatbot                 │   │
│  │ - 알림 확인    │  │       │  │  /api/v1/progress                │   │
│  └───────────────┘  │       │  │  /api/v1/subscriptions           │   │
│                     │       │  │  /api/v1/notifications           │   │
│  ┌───────────────┐  │       │  │  /api/v1/users                   │   │
│  │ 코치 대시보드  │  │       │  │  /api/v1/enrollments             │   │
│  │ - 전체 현황    │  │       │  └─────────────────────────────────┘   │
│  │ - 수강생 관리  │  │       │                                         │
│  │ - AI 결과 승인 │  │       │  ┌─────────────────────────────────┐   │
│  │ - 통계 분석    │  │       │  │        Services Layer            │   │
│  └───────────────┘  │       │  │  - AIService (Claude API)        │   │
│                     │       │  │  - NotificationService           │   │
│  ┌───────────────┐  │       │  │  - ProgressTrackingService       │   │
│  │ 관리자 대시보드│  │       │  │  - SubscriptionService           │   │
│  │ - 결제 관리    │  │       │  │  - PaymentService (Toss)         │   │
│  │ - 사용량 모니터│  │       │  └─────────────────────────────────┘   │
│  │ - 시스템 설정  │  │       │                                         │
│  └───────────────┘  │       └─────────────────┬──────────────────────┘
│                     │                         │
└─────────────────────┘                         │
                                                │
        ┌───────────────────────────────────────┼───────────────────────┐
        │                                       │                       │
        ▼                                       ▼                       ▼
┌───────────────────┐   ┌───────────────────────────────┐   ┌──────────────────┐
│  Claude API       │   │      PostgreSQL Database       │   │   Redis Cache    │
│  (AI Processing)  │   │   ┌─────────────────────────┐  │   │                  │
│                   │   │   │ users                   │  │   │ - Session Store  │
│ - Consultation    │   │   │ enrollments             │  │   │ - Message Queue  │
│   Analysis        │   │   │ assignments             │  │   │ - Rate Limiting  │
│ - Topic Generation│   │   │ submissions             │  │   │ - Cache Layer    │
│ - Draft Writing   │   │   │ feedbacks               │  │   │                  │
│ - Feedback        │   │   │ chat_sessions           │  │   └──────────────────┘
│ - Chatbot         │   │   │ chat_messages           │  │
│ - Progress Check  │   │   │ subscriptions           │  │   ┌──────────────────┐
│                   │   │   │ usage_limits            │  │   │  File Storage    │
└───────────────────┘   │   │ notifications           │  │   │  (S3/MinIO)      │
                        │   │ progress_logs           │  │   │                  │
                        │   │ payment_history         │  │   │ - 과제 파일      │
                        │   └─────────────────────────┘  │   │ - 피드백 문서    │
                        │                                │   │ - 코칭 녹음      │
                        └────────────────────────────────┘   └──────────────────┘
```

### 1.2 기술 스택 상세

| 레이어 | 기술 | 버전 | 용도 |
|--------|------|------|------|
| **Frontend** | Next.js | 16.x | 웹 애플리케이션 |
| | React | 19.x | UI 컴포넌트 |
| | TailwindCSS | 4.x | 스타일링 |
| | next-auth | 4.x | 인증 |
| | react-hook-form | 7.x | 폼 관리 |
| | zod | 4.x | 유효성 검증 |
| | Toss Payments SDK | 0.12.x | 결제 위젯 |
| **Backend** | Python | 3.11+ | 서버 언어 |
| | FastAPI | 0.109+ | API 프레임워크 |
| | SQLAlchemy | 2.x | ORM |
| | Pydantic | 2.x | 데이터 검증 |
| | Celery | 5.x | 비동기 작업 |
| | Anthropic SDK | 0.x | Claude API |
| **Database** | PostgreSQL | 16.x | 메인 DB |
| | Redis | 7.x | 캐시/큐 |
| **Infrastructure** | Docker | 24.x | 컨테이너화 |
| | nginx | 1.25+ | 리버스 프록시 |
| | MinIO/S3 | - | 파일 저장소 |
| **External** | Claude API | claude-sonnet-4-5 | AI 처리 |
| | Toss Payments | - | 결제 |
| | SMTP (AWS SES) | - | 이메일 발송 |
| | KakaoTalk API | - | 알림톡 발송 |
| | n8n | 1.x | 워크플로우 자동화 |

---

## 2. 프론트엔드 아키텍처 (Next.js)

### 2.1 폴더 구조

```
webapp/
├── src/
│   ├── app/                          # App Router (Next.js 16)
│   │   ├── (auth)/                   # 인증 그룹
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (student)/                # 수강생 대시보드
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # 메인 대시보드
│   │   │   │   └── loading.tsx
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx          # 과제 목록
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx      # 과제 상세
│   │   │   │   │   └── submit/       # 과제 제출
│   │   │   │   └── create/           # 과제 생성 (코치용)
│   │   │   ├── progress/
│   │   │   │   └── page.tsx          # 진도 현황
│   │   │   ├── chat/
│   │   │   │   └── page.tsx          # AI 챗봇
│   │   │   ├── feedback/
│   │   │   │   └── [id]/page.tsx     # 피드백 상세
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx          # 알림 목록
│   │   │   └── layout.tsx
│   │   ├── (coach)/                  # 코치 대시보드
│   │   │   ├── students/
│   │   │   │   ├── page.tsx          # 수강생 목록
│   │   │   │   └── [id]/page.tsx     # 수강생 상세
│   │   │   ├── approvals/
│   │   │   │   └── page.tsx          # AI 결과 승인
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          # 통계/분석
│   │   │   └── layout.tsx
│   │   ├── (admin)/                  # 관리자 대시보드
│   │   │   ├── subscriptions/
│   │   │   ├── payments/
│   │   │   ├── usage/
│   │   │   └── layout.tsx
│   │   ├── api/                      # API Routes (BFF)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   └── proxy/                # Backend proxy
│   │   ├── layout.tsx
│   │   └── page.tsx                  # 랜딩 페이지
│   │
│   ├── components/
│   │   ├── ui/                       # 기본 UI 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── forms/                    # 폼 컴포넌트
│   │   │   ├── AssignmentForm.tsx
│   │   │   ├── SubmissionForm.tsx
│   │   │   └── ...
│   │   ├── dashboard/                # 대시보드 컴포넌트
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── StudentCard.tsx
│   │   │   ├── AssignmentList.tsx
│   │   │   └── ...
│   │   ├── chat/                     # 챗봇 컴포넌트
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ...
│   │   └── layout/                   # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                    # API 클라이언트
│   │   ├── auth.ts                   # 인증 설정
│   │   ├── utils.ts                  # 유틸리티
│   │   └── constants.ts              # 상수 정의
│   │
│   ├── hooks/
│   │   ├── useAssignments.ts
│   │   ├── useProgress.ts
│   │   ├── useChat.ts
│   │   ├── useNotifications.ts
│   │   └── ...
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── assignment.ts
│   │   ├── feedback.ts
│   │   └── ...
│   │
│   └── styles/
│       └── globals.css
│
├── public/
├── prisma/
│   └── schema.prisma                 # Prisma 스키마 (타입 생성용)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 2.2 주요 페이지 및 기능

#### 수강생 대시보드
| 페이지 | 경로 | 주요 기능 |
|--------|------|-----------|
| 메인 대시보드 | /dashboard | 전체 진행 상황, 이번 주 과제, 최근 피드백 |
| 과제 목록 | /assignments | 주차별 과제 목록, 제출 상태 |
| 과제 제출 | /assignments/[id]/submit | 파일/텍스트 업로드, 제출 |
| 진도 현황 | /progress | 6주 진도 차트, 마일스톤 달성 |
| AI 챗봇 | /chat | 실시간 AI 상담, 질문/답변 |
| 피드백 확인 | /feedback/[id] | AI/코치 피드백 상세 |
| 알림 | /notifications | 시스템 알림 목록 |

#### 코치 대시보드
| 페이지 | 경로 | 주요 기능 |
|--------|------|-----------|
| 수강생 현황 | /coach/students | 전체 수강생 진행 현황, 위험 표시 |
| 수강생 상세 | /coach/students/[id] | 개별 수강생 상세 정보 |
| AI 승인 | /coach/approvals | AI 분석 결과 검토/승인 |
| 통계 분석 | /coach/analytics | 완주율, 평균 진도, 주요 지표 |

#### 관리자 대시보드
| 페이지 | 경로 | 주요 기능 |
|--------|------|-----------|
| 구독 관리 | /admin/subscriptions | 구독 현황, 플랜 관리 |
| 결제 내역 | /admin/payments | 결제 로그, 환불 처리 |
| 사용량 모니터링 | /admin/usage | API 사용량, 비용 추적 |

### 2.3 상태 관리

```typescript
// 전역 상태는 최소화, 서버 상태는 React Query 사용
// lib/api.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30,   // 30분
    },
  },
});

// 커스텀 훅 예시
// hooks/useAssignments.ts
export function useAssignments(enrollmentId: number) {
  return useQuery({
    queryKey: ['assignments', enrollmentId],
    queryFn: () => api.get(`/assignments?enrollment_id=${enrollmentId}`),
  });
}

export function useSubmitAssignment() {
  return useMutation({
    mutationFn: (data: SubmissionData) => api.post('/submissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
```

---

## 3. 백엔드 아키텍처 (FastAPI)

### 3.1 폴더 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI 앱 진입점
│   │
│   ├── api/                          # API 라우터
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py             # v1 라우터 통합
│   │   │   ├── auth.py               # 인증 엔드포인트
│   │   │   ├── users.py              # 사용자 관리
│   │   │   ├── enrollments.py        # 수강 관리
│   │   │   ├── assignments.py        # 과제 관리
│   │   │   ├── submissions.py        # 제출물 관리
│   │   │   ├── feedback.py           # 피드백 관리
│   │   │   ├── chatbot.py            # 챗봇 API
│   │   │   ├── progress.py           # 진도 관리
│   │   │   ├── subscriptions.py      # 구독 관리
│   │   │   ├── notifications.py      # 알림 관리
│   │   │   ├── payments.py           # 결제 처리
│   │   │   └── webhooks.py           # 외부 웹훅
│   │   └── deps.py                   # 의존성 주입
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                 # 설정 관리
│   │   ├── database.py               # DB 연결
│   │   ├── security.py               # 보안 (JWT, 암호화)
│   │   └── exceptions.py             # 커스텀 예외
│   │
│   ├── models/                       # SQLAlchemy 모델
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── enrollment.py
│   │   ├── assignment.py
│   │   ├── submission.py
│   │   ├── feedback.py
│   │   ├── chat.py
│   │   ├── subscription.py
│   │   ├── notification.py
│   │   └── payment.py
│   │
│   ├── schemas/                      # Pydantic 스키마
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── enrollment.py
│   │   ├── assignment.py
│   │   ├── submission.py
│   │   ├── feedback.py
│   │   ├── chat.py
│   │   ├── subscription.py
│   │   └── notification.py
│   │
│   ├── services/                     # 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── ai_service.py             # Claude AI 통합
│   │   ├── notification_service.py   # 알림 발송
│   │   ├── progress_service.py       # 진도 추적
│   │   ├── subscription_service.py   # 구독 관리
│   │   ├── payment_service.py        # 결제 처리
│   │   └── email_service.py          # 이메일 발송
│   │
│   ├── tasks/                        # Celery 비동기 작업
│   │   ├── __init__.py
│   │   ├── celery_app.py             # Celery 설정
│   │   ├── ai_tasks.py               # AI 처리 작업
│   │   ├── notification_tasks.py     # 알림 작업
│   │   └── scheduled_tasks.py        # 스케줄 작업
│   │
│   └── utils/
│       ├── __init__.py
│       ├── prompts.py                # 프롬프트 로더
│       └── helpers.py                # 유틸리티 함수
│
├── prompts/                          # AI 프롬프트 파일 (심볼릭 링크)
├── migrations/                       # Alembic 마이그레이션
│   ├── versions/
│   └── env.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_assignments.py
│   ├── test_feedback.py
│   └── ...
│
├── alembic.ini
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

### 3.2 핵심 서비스 클래스

```python
# app/services/ai_service.py

from anthropic import Anthropic
from typing import Optional
from pathlib import Path
import json

class AIService:
    """Claude AI 통합 서비스"""

    def __init__(self):
        self.client = Anthropic()
        self.prompts_dir = Path(__file__).parent.parent.parent / "prompts"
        self.model = "claude-sonnet-4-5-20250929"

    def _load_prompt(self, prompt_name: str) -> str:
        """프롬프트 파일 로드"""
        prompt_path = self.prompts_dir / f"{prompt_name}.md"
        return prompt_path.read_text(encoding="utf-8")

    async def analyze_consultation(self, content: str) -> dict:
        """컨설팅지 분석 -> 3가지 주제 + 목차 제안"""
        system_prompt = self._load_prompt("28-상담분석")
        response = await self._call_claude(system_prompt, content)
        return self._parse_consultation_result(response)

    async def generate_topic_outline(self, consultation_analysis: dict) -> dict:
        """주제 기반 40개 목차 생성"""
        system_prompt = self._load_prompt("01-제목목차기획")
        # ...

    async def analyze_writing_style(self, sample_text: str) -> dict:
        """작가 필체 분석"""
        system_prompt = self._load_prompt("25-필체분석스타일학습")
        # ...

    async def generate_draft(
        self,
        chapter_info: dict,
        writing_style: dict
    ) -> str:
        """스타일 반영 초안 생성 (4,000자)"""
        system_prompt = self._load_prompt("41-스타일반영초안작성")
        # ...

    async def generate_feedback(
        self,
        submission_content: str,
        chapter_title: str
    ) -> dict:
        """초안 피드백 생성 (100점 평가)"""
        system_prompt = self._load_prompt("42-초안피드백생성")
        # ...

    async def chatbot_response(
        self,
        user_message: str,
        chat_history: list,
        context: dict
    ) -> str:
        """챗봇 응답 생성"""
        system_prompt = self._load_prompt("07-FAQ답변생성")
        # ...

    async def check_crisis_indicators(
        self,
        user_id: int,
        progress_data: dict
    ) -> dict:
        """위기 징후 감지"""
        # 진도 지연, 질문 패턴 등 분석
        # ...

    async def _call_claude(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 8000
    ) -> str:
        """Claude API 호출"""
        message = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )
        return message.content[0].text
```

### 3.3 비동기 작업 (Celery)

```python
# app/tasks/celery_app.py

from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "book-coaching",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.beat_schedule = {
    # 매일 오전 9시: 진도 체크 및 리마인더
    "daily-progress-check": {
        "task": "app.tasks.scheduled_tasks.check_all_progress",
        "schedule": crontab(hour=9, minute=0),
    },
    # 매주 월요일: 주간 리포트 생성
    "weekly-report": {
        "task": "app.tasks.scheduled_tasks.generate_weekly_reports",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },
    # 매일 자정: 구독 상태 체크
    "subscription-check": {
        "task": "app.tasks.scheduled_tasks.check_subscriptions",
        "schedule": crontab(hour=0, minute=0),
    },
}

# app/tasks/ai_tasks.py

@celery_app.task
def process_submission_feedback(submission_id: int):
    """제출물 AI 피드백 생성 (백그라운드)"""
    # 1. 제출물 조회
    # 2. AI 피드백 생성
    # 3. 피드백 저장
    # 4. 알림 발송
    pass

@celery_app.task
def analyze_consultation_async(consultation_id: int):
    """컨설팅지 비동기 분석"""
    pass

# app/tasks/notification_tasks.py

@celery_app.task
def send_kakao_notification(user_id: int, template_id: str, variables: dict):
    """카카오톡 알림 발송"""
    pass

@celery_app.task
def send_email_notification(user_id: int, template_name: str, context: dict):
    """이메일 발송"""
    pass

# app/tasks/scheduled_tasks.py

@celery_app.task
def check_all_progress():
    """전체 수강생 진도 체크 및 리마인더"""
    # 1. 지연된 수강생 조회
    # 2. 단계별 리마인더 발송 (D+3, D+7, D+14)
    # 3. 위기 수강생 코치에게 알림
    pass
```

---

## 4. AI 서비스 아키텍처

### 4.1 프롬프트 관리 체계

```
prompts/
├── consultation/           # 컨설팅 단계
│   ├── 28-상담분석.md
│   └── analysis-templates/
│
├── planning/               # 기획 단계
│   ├── 01-제목목차기획.md
│   └── topic-templates/
│
├── writing/                # 집필 단계
│   ├── 25-필체분석스타일학습.md
│   ├── 41-스타일반영초안작성.md
│   └── 42-초안피드백생성.md
│
├── coaching/               # 코칭 지원
│   ├── 07-FAQ답변생성.md
│   ├── 06-격려메시지생성.md
│   └── 13-진도트래커.md
│
├── automation/             # 자동화 시스템 (현재 문서)
│   ├── system-architecture-overview.md
│   ├── api-specification.md
│   └── database-schema.md
│
└── templates/              # 공통 템플릿
    └── ...
```

### 4.2 AI 처리 파이프라인

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AI Processing Pipeline                          │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  입력    │───►│ 전처리   │───►│  Claude  │───►│ 후처리   │     │
│  │ 검증    │    │ & 프롬프트│    │   API    │    │ & 파싱   │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  - 길이 체크      - 프롬프트 로드  - API 호출     - JSON 파싱      │
│  - 형식 검증      - 변수 치환      - 재시도 로직  - 구조화         │
│  - 사용량 체크    - 컨텍스트 추가  - 에러 핸들링  - 검증           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                              │
                              ▼
           ┌─────────────────────────────────────┐
           │           결과 처리                  │
           │  ┌─────────────────────────────┐    │
           │  │ - DB 저장                   │    │
           │  │ - 사용량 기록               │    │
           │  │ - 알림 트리거               │    │
           │  │ - 승인 대기 (필요시)        │    │
           │  └─────────────────────────────┘    │
           └─────────────────────────────────────┘
```

### 4.3 AI 사용량 관리

```python
# app/services/usage_service.py

class UsageLimitService:
    """AI 사용량 관리 서비스"""

    # 플랜별 제한
    LIMITS = {
        "basic": {
            "chatbot_daily": 20,
            "feedback_monthly": 10,
            "draft_monthly": 5,
        },
        "standard": {
            "chatbot_daily": 50,
            "feedback_monthly": 30,
            "draft_monthly": 15,
        },
        "premium": {
            "chatbot_daily": 100,
            "feedback_monthly": 100,
            "draft_monthly": 50,
        },
    }

    async def check_limit(
        self,
        user_id: int,
        feature: str
    ) -> bool:
        """사용량 제한 체크"""
        # ...

    async def record_usage(
        self,
        user_id: int,
        feature: str,
        tokens_used: int
    ):
        """사용량 기록"""
        # ...

    async def get_remaining(
        self,
        user_id: int
    ) -> dict:
        """남은 사용량 조회"""
        # ...
```

---

## 5. 데이터베이스 아키텍처

### 5.1 ERD 개요

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   users     │      │ enrollments  │      │ assignments │
│─────────────│      │──────────────│      │─────────────│
│ id (PK)     │─────┐│ id (PK)      │      │ id (PK)     │
│ email       │     ││ user_id (FK) │◄─────│ week_number │
│ name        │     ││ program_id   │      │ type        │
│ role        │     ││ status       │      │ title       │
│ ...         │     │└──────────────┘      │ due_offset  │
└─────────────┘     │        │             └─────────────┘
                    │        │                    │
                    │        ▼                    │
                    │ ┌──────────────┐           │
                    │ │ submissions  │           │
                    │ │──────────────│           │
                    │ │ id (PK)      │           │
                    └►│ enrollment_id│◄──────────┘
                      │ assignment_id│
                      │ content      │
                      │ file_url     │
                      │ status       │
                      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  feedbacks   │
                      │──────────────│
                      │ id (PK)      │
                      │ submission_id│
                      │ type         │
                      │ content      │
                      │ score        │
                      └──────────────┘

┌─────────────────┐    ┌────────────────┐
│ subscriptions   │    │ usage_limits   │
│─────────────────│    │────────────────│
│ id (PK)         │    │ id (PK)        │
│ user_id (FK)    │    │ user_id (FK)   │
│ plan_type       │    │ feature        │
│ status          │    │ used_count     │
│ started_at      │    │ reset_at       │
│ expires_at      │    └────────────────┘
└─────────────────┘

┌─────────────────┐    ┌────────────────┐
│ chat_sessions   │    │ chat_messages  │
│─────────────────│    │────────────────│
│ id (PK)         │    │ id (PK)        │
│ user_id (FK)    │    │ session_id(FK) │
│ created_at      │    │ role           │
│                 │    │ content        │
└─────────────────┘    │ created_at     │
                       └────────────────┘
```

### 5.2 주요 테이블 요약

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| users | 사용자 (수강생, 코치, 관리자) | email, role, subscription_plan |
| enrollments | 프로그램 등록 정보 | user_id, program_id, status, week |
| assignments | 과제 정의 | week_number, type, title, due_offset |
| submissions | 과제 제출물 | enrollment_id, assignment_id, content |
| feedbacks | AI/코치 피드백 | submission_id, type, content, score |
| chat_sessions | 챗봇 세션 | user_id, created_at |
| chat_messages | 챗봇 메시지 | session_id, role, content |
| subscriptions | 구독 정보 | user_id, plan_type, status |
| usage_limits | 사용량 제한 | user_id, feature, used_count |
| notifications | 알림 | user_id, type, content, read_at |
| progress_logs | 진도 로그 | enrollment_id, event_type, data |

---

## 6. 외부 연동 아키텍처

### 6.1 카카오톡 알림 연동

```python
# app/services/kakao_service.py

class KakaoNotificationService:
    """카카오톡 알림톡 서비스"""

    # 알림톡 템플릿
    TEMPLATES = {
        "assignment_reminder": "TP001",  # 과제 제출 알림
        "feedback_ready": "TP002",       # 피드백 완료 알림
        "progress_warning": "TP003",     # 진도 지연 알림
        "milestone_achieved": "TP004",   # 마일스톤 달성
        "coaching_scheduled": "TP005",   # 코칭 세션 예정
    }

    async def send_notification(
        self,
        phone_number: str,
        template_id: str,
        variables: dict
    ) -> bool:
        """알림톡 발송"""
        # 카카오 비즈메시지 API 호출
        pass
```

### 6.2 이메일 연동

```python
# app/services/email_service.py

class EmailService:
    """이메일 발송 서비스 (AWS SES)"""

    TEMPLATES = {
        "welcome": "welcome.html",
        "feedback_summary": "feedback_summary.html",
        "weekly_report": "weekly_report.html",
        "payment_receipt": "payment_receipt.html",
    }

    async def send_email(
        self,
        to_email: str,
        template_name: str,
        context: dict
    ) -> bool:
        """이메일 발송"""
        pass
```

### 6.3 n8n 워크플로우 연동

```yaml
# n8n 워크플로우 예시

# 1. 과제 제출 -> AI 피드백 -> 알림 발송
workflow: assignment_feedback_flow
triggers:
  - webhook: /webhook/submission
steps:
  - name: Generate AI Feedback
    type: http_request
    url: ${BACKEND_URL}/api/v1/feedback/generate
    method: POST

  - name: Wait for Coach Approval
    type: wait
    timeout: 24h

  - name: Send Kakao Notification
    type: http_request
    url: ${BACKEND_URL}/api/v1/notifications/kakao

  - name: Send Email
    type: http_request
    url: ${BACKEND_URL}/api/v1/notifications/email

# 2. 일일 진도 체크 워크플로우
workflow: daily_progress_check
triggers:
  - cron: "0 9 * * *"  # 매일 오전 9시
steps:
  - name: Check All Progress
    type: http_request
    url: ${BACKEND_URL}/api/v1/progress/check-all

  - name: Send Reminders
    type: loop
    items: ${previous.delayed_users}
    steps:
      - name: Send Reminder
        type: http_request
        url: ${BACKEND_URL}/api/v1/notifications/reminder
```

### 6.4 Toss Payments 결제 연동

```typescript
// webapp/src/lib/payment.ts

import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";

export const initPaymentWidget = async (clientKey: string) => {
  const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

  paymentWidget.renderPaymentMethods(
    "#payment-widget",
    { value: amount },
    { variantKey: "DEFAULT" }
  );

  return paymentWidget;
};

export const requestPayment = async (
  paymentWidget: any,
  orderInfo: OrderInfo
) => {
  await paymentWidget.requestPayment({
    orderId: orderInfo.orderId,
    orderName: orderInfo.orderName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};
```

```python
# backend/app/services/payment_service.py

class TossPaymentService:
    """토스페이먼츠 결제 서비스"""

    async def confirm_payment(
        self,
        payment_key: str,
        order_id: str,
        amount: int
    ) -> dict:
        """결제 승인"""
        # 토스 API 호출
        pass

    async def cancel_payment(
        self,
        payment_key: str,
        cancel_reason: str
    ) -> dict:
        """결제 취소"""
        pass

    async def get_payment(
        self,
        payment_key: str
    ) -> dict:
        """결제 조회"""
        pass
```

---

## 7. 자동화 워크플로우

### 7.1 과제 제출 -> AI 피드백 -> 알림 발송

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  수강생     │     │   Backend   │     │   Claude    │
│  과제 제출  │────►│   API       │────►│   API       │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           │◄───────────────────┘
                           │    AI 피드백 결과
                           │
                    ┌──────▼──────┐
                    │   피드백    │
                    │   저장      │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ 코치 알림  │   │ 카카오톡   │   │   이메일   │
   │ (승인대기) │   │ 알림톡    │   │   발송     │
   └────────────┘   └────────────┘   └────────────┘
```

### 7.2 진도 체크 -> 위기 감지 -> 대응

```
┌────────────────────────────────────────────────────────────────┐
│                    Daily Progress Check                         │
│                      (매일 오전 9시)                            │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   전체 수강생 조회      │
                    │   진도 상태 분석        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   정상 진행     │   │   D+3 지연      │   │   D+7+ 지연     │
│   (아무 조치 X) │   │   (리마인더)    │   │   (코치 알림)   │
└─────────────────┘   └────────┬────────┘   └────────┬────────┘
                               │                     │
                               ▼                     ▼
                      ┌─────────────────┐   ┌─────────────────┐
                      │ 자동 리마인더   │   │ 위기 수강생     │
                      │ 카톡 발송       │   │ 코치 대시보드   │
                      └─────────────────┘   │ 빨간불 표시     │
                                            └─────────────────┘
```

### 7.3 구독 관리 -> 결제 -> 권한 변경

```
┌────────────────────────────────────────────────────────────────┐
│                   Subscription Flow                             │
└────────────────────────────────────────────────────────────────┘

    신규 구독                    갱신/업그레이드              해지
       │                              │                       │
       ▼                              ▼                       ▼
┌────────────┐              ┌────────────────┐         ┌────────────┐
│ 결제 위젯  │              │ 자동 결제      │         │ 해지 요청  │
│ (Toss)     │              │ (정기 결제)    │         │            │
└─────┬──────┘              └───────┬────────┘         └─────┬──────┘
      │                             │                        │
      ▼                             ▼                        ▼
┌────────────┐              ┌────────────────┐         ┌────────────┐
│ 결제 승인  │              │ 결제 성공/실패 │         │ 즉시/만료일│
│ (Backend)  │              │                │         │ 해지 처리  │
└─────┬──────┘              └───────┬────────┘         └─────┬──────┘
      │                             │                        │
      ▼                             ▼                        ▼
┌────────────┐              ┌────────────────┐         ┌────────────┐
│ 구독 생성  │              │ 구독 갱신      │         │ 권한 해제  │
│ 권한 부여  │              │ 또는 정지      │         │ 데이터유지 │
└────────────┘              └────────────────┘         └────────────┘
```

---

## 8. 보안 아키텍처

### 8.1 인증/인가

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ 로그인   │───►│ NextAuth │───►│ Backend  │───►│   DB     │ │
│   │ 페이지   │    │ (JWT)    │    │ 검증     │    │ 사용자   │ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                                  │
│   Role-Based Access Control (RBAC)                              │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Role        │  Permissions                               │  │
│   │─────────────────────────────────────────────────────────│  │
│   │  student     │  자신의 과제/피드백/진도 조회/수정        │  │
│   │  coach       │  전체 수강생 조회, AI 결과 승인           │  │
│   │  admin       │  모든 권한, 구독/결제/시스템 관리         │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 API 보안

```python
# app/core/security.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """현재 사용자 인증"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def require_role(allowed_roles: list[str]):
    """역할 기반 접근 제어 데코레이터"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
```

### 8.3 데이터 보안

| 항목 | 보안 조치 |
|------|-----------|
| 비밀번호 | bcrypt 해싱 (salt rounds: 12) |
| API 키 | 환경변수, Vault 저장 |
| 사용자 데이터 | PostgreSQL RLS (Row-Level Security) |
| 전송 데이터 | TLS 1.3 (HTTPS) |
| 파일 저장 | S3 서버사이드 암호화 (AES-256) |
| 로그 | 민감정보 마스킹 |

---

## 9. 구현 우선순위 로드맵

### Phase 1: 핵심 기능 (4주)

| 주차 | 작업 내용 | 담당 |
|------|-----------|------|
| 1주차 | DB 스키마 설계 및 마이그레이션 | Backend |
| | 사용자 인증 (NextAuth + JWT) | Frontend/Backend |
| | 기본 API 구조 (users, enrollments) | Backend |
| 2주차 | 과제 관리 API (assignments, submissions) | Backend |
| | 수강생 대시보드 UI | Frontend |
| | 과제 제출 폼 | Frontend |
| 3주차 | AI 서비스 통합 (피드백 생성) | Backend |
| | 피드백 조회 UI | Frontend |
| | 알림 시스템 기초 (DB 저장) | Backend |
| 4주차 | 코치 대시보드 UI | Frontend |
| | AI 결과 승인 워크플로우 | Backend/Frontend |
| | 통합 테스트 | QA |

**Phase 1 완료 기준**:
- 수강생이 과제를 제출하고 AI 피드백을 받을 수 있음
- 코치가 AI 피드백을 검토/승인할 수 있음
- 기본적인 진도 현황 확인 가능

### Phase 2: 고급 기능 (4주)

| 주차 | 작업 내용 | 담당 |
|------|-----------|------|
| 5주차 | AI 챗봇 구현 | Backend |
| | 챗봇 UI | Frontend |
| | 사용량 제한 시스템 | Backend |
| 6주차 | 구독/결제 시스템 (Toss) | Backend/Frontend |
| | 구독 관리 대시보드 | Frontend |
| | 결제 웹훅 처리 | Backend |
| 7주차 | 카카오톡 알림 연동 | Backend |
| | 이메일 템플릿 및 발송 | Backend |
| | 알림 설정 UI | Frontend |
| 8주차 | 진도 자동 체크 (Celery) | Backend |
| | 위기 감지 시스템 | Backend |
| | 코치 알림 대시보드 개선 | Frontend |

**Phase 2 완료 기준**:
- 수강생이 AI 챗봇으로 24시간 질문 가능
- 구독 기반 요금제 운영 가능
- 자동 알림 발송 (카카오톡, 이메일)
- 진도 지연 수강생 자동 감지

### Phase 3: 최적화 (4주)

| 주차 | 작업 내용 | 담당 |
|------|-----------|------|
| 9주차 | n8n 워크플로우 구축 | DevOps |
| | 복잡한 자동화 시나리오 | Backend |
| | 코칭 세션 녹음 → 요약 | Backend |
| 10주차 | 성능 최적화 (캐싱, 쿼리) | Backend |
| | UI/UX 개선 | Frontend |
| | 모바일 반응형 완성 | Frontend |
| 11주차 | 분석 대시보드 고도화 | Frontend |
| | 리포팅 시스템 | Backend |
| | A/B 테스트 인프라 | Full-stack |
| 12주차 | 문서화 | 전체 |
| | 보안 감사 | DevOps |
| | 운영 환경 배포 | DevOps |

**Phase 3 완료 기준**:
- 완전 자동화된 6주 프로그램 운영
- 코치 시간 80% 절감 달성
- 안정적인 프로덕션 환경

---

## 10. 모니터링 및 운영

### 10.1 메트릭 수집

| 메트릭 | 수집 방법 | 알림 조건 |
|--------|-----------|-----------|
| API 응답 시간 | Prometheus | p95 > 2초 |
| 에러율 | Sentry | > 1% |
| Claude API 사용량 | 자체 로깅 | 일일 한도 80% |
| DB 커넥션 | PostgreSQL | > 80% |
| 메모리 사용량 | Grafana | > 85% |

### 10.2 로그 수집

```yaml
# 로그 레벨 정책
logging:
  levels:
    default: INFO
    api: INFO
    ai_service: DEBUG  # AI 응답 전체 로깅
    payment: DEBUG     # 결제 상세 로깅

  sensitive_fields:
    - password
    - card_number
    - api_key

  retention:
    application: 30d
    access: 90d
    audit: 365d
```

### 10.3 알림 채널

| 상황 | 알림 채널 | 담당자 |
|------|-----------|--------|
| 서버 다운 | Slack #alerts | DevOps |
| 결제 실패 | Slack #payments | Admin |
| 위기 수강생 | Slack #coaching | 준현님 |
| AI 사용량 한도 | Email | Admin |

---

## 11. 비용 예측

### 11.1 월간 예상 비용 (50명 수강생 기준)

| 항목 | 예상 비용 | 비고 |
|------|-----------|------|
| Claude API | $200-400 | 피드백 + 챗봇 |
| PostgreSQL (RDS) | $50-100 | db.t3.medium |
| Redis (ElastiCache) | $30-50 | cache.t3.micro |
| S3 | $10-20 | 파일 저장 |
| 서버 (EC2/ECS) | $100-200 | 2 instances |
| 카카오 알림톡 | $50-100 | 메시지 수 기준 |
| **총계** | **$440-870** | |

### 11.2 수강생 당 비용

- 예상 수강료: 50-100만원/6주
- 예상 비용: 1-2만원/수강생
- 예상 마진: 48-98만원/수강생

---

## 12. 결론

이 아키텍처는 **준현님의 시간 80% 절감**과 **수강생 만족도 유지**라는 두 가지 목표를 달성하기 위해 설계되었습니다.

**핵심 가치**:
1. AI가 반복 작업 자동화 (피드백, 진도 체크, Q&A)
2. 코치는 승인과 감성적 케어에만 집중
3. 수강생은 24시간 지원받는 느낌

**성공 지표**:
- 코치 주간 시간: 10시간 → 2시간
- 피드백 응답 시간: 24시간 → 3분
- 완주율: +10%p 향상

---

*다음 문서: [API 명세서](./api-specification.md)*
