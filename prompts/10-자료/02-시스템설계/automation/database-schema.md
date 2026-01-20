# 책쓰기 코칭 6주 프로그램 데이터베이스 스키마

> **버전**: 1.0.0
> **최종 수정**: 2026-01-10
> **데이터베이스**: PostgreSQL 16.x

---

## 1. ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Core Tables                                           │
│                                                                                  │
│  ┌────────────────┐         ┌────────────────┐         ┌────────────────┐       │
│  │     users      │         │   programs     │         │   coupons      │       │
│  │────────────────│         │────────────────│         │────────────────│       │
│  │ id (PK)        │         │ id (PK)        │         │ id (PK)        │       │
│  │ email          │         │ name           │         │ code           │       │
│  │ name           │         │ description    │         │ discount_type  │       │
│  │ role           │         │ duration_weeks │         │ discount_value │       │
│  │ ...            │         │ price          │         │ ...            │       │
│  └───────┬────────┘         └───────┬────────┘         └────────────────┘       │
│          │                          │                                            │
│          │ 1:N                      │ 1:N                                        │
│          ▼                          ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           enrollments                                    │    │
│  │─────────────────────────────────────────────────────────────────────────│    │
│  │ id (PK) │ user_id (FK) │ program_id (FK) │ status │ current_week │ ... │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                   │                                                              │
│                   │ 1:N                                                          │
│                   ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐         │
│  │                        submissions                                  │         │
│  │────────────────────────────────────────────────────────────────────│         │
│  │ id │ enrollment_id │ assignment_id │ content │ status │ ...       │         │
│  └────────────────────────────────────────────────────────────────────┘         │
│                   │                                                              │
│                   │ 1:N                                                          │
│                   ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐         │
│  │                         feedbacks                                   │         │
│  │────────────────────────────────────────────────────────────────────│         │
│  │ id │ submission_id │ type │ content │ score │ status │ ...        │         │
│  └────────────────────────────────────────────────────────────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Chatbot Tables                                          │
│                                                                                  │
│  ┌────────────────┐                    ┌────────────────┐                       │
│  │ chat_sessions  │      1:N           │ chat_messages  │                       │
│  │────────────────│──────────────────► │────────────────│                       │
│  │ id (PK)        │                    │ id (PK)        │                       │
│  │ user_id (FK)   │                    │ session_id(FK) │                       │
│  │ context        │                    │ role           │                       │
│  │ created_at     │                    │ content        │                       │
│  └────────────────┘                    │ rating         │                       │
│                                        └────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                       Subscription & Payment Tables                              │
│                                                                                  │
│  ┌────────────────┐                    ┌────────────────┐                       │
│  │ subscriptions  │      1:N           │    payments    │                       │
│  │────────────────│──────────────────► │────────────────│                       │
│  │ id (PK)        │                    │ id (PK)        │                       │
│  │ user_id (FK)   │                    │ subscription_id│                       │
│  │ plan_type      │                    │ amount         │                       │
│  │ status         │                    │ status         │                       │
│  │ ...            │                    │ payment_key    │                       │
│  └────────────────┘                    └────────────────┘                       │
│                                                                                  │
│  ┌────────────────┐                                                             │
│  │  usage_limits  │                                                             │
│  │────────────────│                                                             │
│  │ id (PK)        │                                                             │
│  │ user_id (FK)   │                                                             │
│  │ feature        │                                                             │
│  │ used_count     │                                                             │
│  │ reset_at       │                                                             │
│  └────────────────┘                                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Tracking & Notification Tables                           │
│                                                                                  │
│  ┌────────────────┐        ┌────────────────┐        ┌────────────────┐        │
│  │ progress_logs  │        │ notifications  │        │ notification_  │        │
│  │────────────────│        │────────────────│        │    settings    │        │
│  │ id (PK)        │        │ id (PK)        │        │────────────────│        │
│  │ enrollment_id  │        │ user_id (FK)   │        │ id (PK)        │        │
│  │ event_type     │        │ type           │        │ user_id (FK)   │        │
│  │ metadata       │        │ title          │        │ channel        │        │
│  │ created_at     │        │ read_at        │        │ enabled        │        │
│  └────────────────┘        └────────────────┘        └────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 테이블 상세 정의

### 2.1 users (사용자)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT users_role_check CHECK (role IN ('student', 'coach', 'admin'))
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**컬럼 설명**:

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| id | SERIAL | 사용자 고유 ID | 1 |
| email | VARCHAR(255) | 이메일 (로그인 ID) | user@example.com |
| hashed_password | VARCHAR(255) | bcrypt 해시 비밀번호 | $2b$12$... |
| name | VARCHAR(100) | 이름 | 홍길동 |
| phone | VARCHAR(20) | 전화번호 | 010-1234-5678 |
| role | VARCHAR(20) | 역할 | student, coach, admin |
| avatar_url | VARCHAR(500) | 프로필 이미지 URL | https://... |
| is_active | BOOLEAN | 활성화 여부 | true |
| email_verified_at | TIMESTAMP | 이메일 인증 일시 | 2026-01-10 12:00:00 |
| created_at | TIMESTAMP | 생성 일시 | 2026-01-10 12:00:00 |
| updated_at | TIMESTAMP | 수정 일시 | 2026-01-10 12:00:00 |
| deleted_at | TIMESTAMP | 삭제 일시 (소프트 삭제) | NULL |

---

### 2.2 programs (프로그램)

```sql
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL DEFAULT 6,
    price INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    curriculum JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 예시 데이터
INSERT INTO programs (name, description, duration_weeks, price, curriculum) VALUES
(
    '6주 책쓰기 코칭',
    '6주 만에 책 한 권 완성하는 집중 코칭 프로그램',
    6,
    800000,
    '{
        "weeks": [
            {"week": 1, "title": "컨설팅지 분석", "goals": ["컨설팅지 작성", "AI 분석 리포트 수령"]},
            {"week": 2, "title": "주제/목차 확정", "goals": ["3가지 주제 중 선택", "40개 목차 확정"]},
            {"week": 3, "title": "초안 작성 1", "goals": ["1-10장 초안 완성"]},
            {"week": 4, "title": "초안 작성 2", "goals": ["11-20장 초안 완성"]},
            {"week": 5, "title": "초안 작성 3", "goals": ["21-30장 초안 완성"]},
            {"week": 6, "title": "마무리", "goals": ["31-40장 초안 완성", "최종 검토"]}
        ]
    }'
);
```

**컬럼 설명**:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | 프로그램 고유 ID |
| name | VARCHAR(200) | 프로그램명 |
| description | TEXT | 프로그램 설명 |
| duration_weeks | INTEGER | 프로그램 기간 (주) |
| price | INTEGER | 기본 가격 (원) |
| is_active | BOOLEAN | 활성화 여부 |
| curriculum | JSONB | 주차별 커리큘럼 |

---

### 2.3 enrollments (수강 정보)

```sql
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    program_id INTEGER NOT NULL REFERENCES programs(id),
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    current_week INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_end_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    dropped_at TIMESTAMP WITH TIME ZONE,
    drop_reason TEXT,
    coach_id INTEGER REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT enrollments_status_check CHECK (
        status IN ('pending', 'active', 'completed', 'dropped', 'paused')
    ),
    CONSTRAINT enrollments_unique_active UNIQUE (user_id, program_id, started_at)
);

-- 인덱스
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_coach_id ON enrollments(coach_id);
CREATE INDEX idx_enrollments_current_week ON enrollments(current_week) WHERE status = 'active';
```

**컬럼 설명**:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | 수강 고유 ID |
| user_id | INTEGER | 수강생 ID (FK) |
| program_id | INTEGER | 프로그램 ID (FK) |
| status | VARCHAR(30) | 상태 (pending, active, completed, dropped, paused) |
| current_week | INTEGER | 현재 진행 주차 |
| started_at | TIMESTAMP | 시작 일시 |
| expected_end_at | TIMESTAMP | 예상 종료 일시 |
| completed_at | TIMESTAMP | 완료 일시 |
| dropped_at | TIMESTAMP | 중도 포기 일시 |
| drop_reason | TEXT | 포기 사유 |
| coach_id | INTEGER | 담당 코치 ID (FK) |
| metadata | JSONB | 추가 메타데이터 |

**status 상태 흐름**:
```
pending → active → completed
                 ↘ dropped
        active → paused → active
```

---

### 2.4 assignments (과제 정의)

```sql
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id),
    week_number INTEGER NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 1,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_offset_days INTEGER NOT NULL DEFAULT 7,
    target_words INTEGER,
    chapter_numbers INTEGER[],
    resources JSONB DEFAULT '[]',
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT assignments_type_check CHECK (
        type IN ('consultation', 'topic_selection', 'outline', 'draft', 'revision', 'final')
    ),
    CONSTRAINT assignments_unique_program_week_seq UNIQUE (program_id, week_number, sequence)
);

-- 인덱스
CREATE INDEX idx_assignments_program_week ON assignments(program_id, week_number);

-- 예시 데이터
INSERT INTO assignments (program_id, week_number, sequence, type, title, description, target_words, chapter_numbers) VALUES
(1, 1, 1, 'consultation', '컨설팅지 작성', '작가님의 경험, 전문성, 책 쓰기 목표를 정리해주세요.', NULL, NULL),
(1, 2, 1, 'topic_selection', '주제 선정', 'AI가 제안한 3가지 주제 중 하나를 선택하고 그 이유를 작성해주세요.', 500, NULL),
(1, 2, 2, 'outline', '목차 확정', '40개 목차를 검토하고 수정/확정해주세요.', NULL, NULL),
(1, 3, 1, 'draft', '1-5장 초안 작성', '첫 5개 장의 초안을 작성해주세요.', 15000, ARRAY[1,2,3,4,5]),
(1, 3, 2, 'draft', '6-10장 초안 작성', '6-10장의 초안을 작성해주세요.', 20000, ARRAY[6,7,8,9,10]),
(1, 4, 1, 'draft', '11-20장 초안 작성', '11-20장의 초안을 작성해주세요.', 40000, ARRAY[11,12,13,14,15,16,17,18,19,20]),
(1, 5, 1, 'draft', '21-30장 초안 작성', '21-30장의 초안을 작성해주세요.', 40000, ARRAY[21,22,23,24,25,26,27,28,29,30]),
(1, 6, 1, 'draft', '31-40장 초안 작성', '31-40장의 초안을 작성해주세요.', 40000, ARRAY[31,32,33,34,35,36,37,38,39,40]),
(1, 6, 2, 'final', '최종 검토', '전체 원고를 검토하고 수정사항을 반영해주세요.', NULL, NULL);
```

**컬럼 설명**:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | 과제 고유 ID |
| program_id | INTEGER | 프로그램 ID (FK) |
| week_number | INTEGER | 해당 주차 |
| sequence | INTEGER | 주차 내 순서 |
| type | VARCHAR(50) | 과제 유형 |
| title | VARCHAR(300) | 과제 제목 |
| description | TEXT | 과제 설명 |
| instructions | TEXT | 상세 가이드 |
| due_offset_days | INTEGER | 마감 오프셋 (주차 시작일로부터 일수) |
| target_words | INTEGER | 목표 글자수 |
| chapter_numbers | INTEGER[] | 해당 장 번호 배열 |
| resources | JSONB | 참고 자료 목록 |
| is_required | BOOLEAN | 필수 과제 여부 |

---

### 2.5 submissions (제출물)

```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
    assignment_id INTEGER NOT NULL REFERENCES assignments(id),
    chapter_number INTEGER,
    content TEXT,
    file_url VARCHAR(500),
    word_count INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT submissions_status_check CHECK (
        status IN ('draft', 'submitted', 'under_review', 'feedback_pending', 'feedback_sent', 'revision_requested')
    )
);

-- 인덱스
CREATE INDEX idx_submissions_enrollment_id ON submissions(enrollment_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);

-- 유니크 제약 (같은 수강-과제-장에 대해 하나의 제출만)
CREATE UNIQUE INDEX idx_submissions_unique_chapter ON submissions(enrollment_id, assignment_id, chapter_number)
WHERE chapter_number IS NOT NULL;
```

**컬럼 설명**:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | 제출물 고유 ID |
| enrollment_id | INTEGER | 수강 ID (FK) |
| assignment_id | INTEGER | 과제 ID (FK) |
| chapter_number | INTEGER | 장 번호 (해당 시) |
| content | TEXT | 제출 내용 |
| file_url | VARCHAR(500) | 첨부 파일 URL |
| word_count | INTEGER | 글자수 |
| status | VARCHAR(30) | 상태 |
| notes | TEXT | 제출자 메모 |
| submitted_at | TIMESTAMP | 제출 일시 |
| reviewed_at | TIMESTAMP | 검토 완료 일시 |

**status 상태 흐름**:
```
draft → submitted → under_review → feedback_pending → feedback_sent
                                                     ↘ revision_requested → submitted
```

---

### 2.6 feedbacks (피드백)

```sql
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    content JSONB NOT NULL,
    score INTEGER,
    scores_detail JSONB,
    coach_comment TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    sent_to_student BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT feedbacks_type_check CHECK (type IN ('ai', 'coach')),
    CONSTRAINT feedbacks_status_check CHECK (
        status IN ('pending', 'processing', 'generated', 'approved', 'sent', 'rejected')
    ),
    CONSTRAINT feedbacks_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

-- 인덱스
CREATE INDEX idx_feedbacks_submission_id ON feedbacks(submission_id);
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);

-- 코치 승인 대기 피드백 빠른 조회
CREATE INDEX idx_feedbacks_pending_approval ON feedbacks(created_at)
WHERE type = 'ai' AND status = 'generated';
```

**content JSONB 구조 (AI 피드백)**:
```json
{
  "strengths": [
    {
      "category": "스토리텔링",
      "description": "개인 경험이 생생하게 전달됩니다.",
      "example": "'그날 아침...' 부분이 특히 인상적입니다."
    }
  ],
  "improvements": [
    {
      "priority": 1,
      "category": "구조",
      "issue": "도입부가 다소 깁니다.",
      "suggestion": "도입부를 300자 내외로 줄여보세요.",
      "before": "책을 쓰기로 결심한 것은...",
      "after": "'당신도 책을 쓸 수 있습니다.' 이 말을..."
    }
  ],
  "next_steps": [
    "도입부 수정 (예상 30분)",
    "감정 표현 구체화 (예상 1시간)"
  ],
  "overall_comment": "전체적으로 잘 작성된 초안입니다."
}
```

**scores_detail JSONB 구조**:
```json
{
  "structure": 80,
  "style": 75,
  "content": 78,
  "engagement": 79
}
```

---

### 2.7 chat_sessions (챗봇 세션)

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    enrollment_id INTEGER REFERENCES enrollments(id),
    context JSONB DEFAULT '{}',
    message_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_enrollment_id ON chat_sessions(enrollment_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);
```

**context JSONB 구조**:
```json
{
  "enrollment_id": 10,
  "current_week": 3,
  "current_assignment": "1-5장 초안 작성",
  "writing_style_id": 5
}
```

---

### 2.8 chat_messages (챗봇 메시지)

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    rating VARCHAR(20),
    rating_comment TEXT,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT chat_messages_rating_check CHECK (rating IS NULL OR rating IN ('helpful', 'not_helpful', 'needs_coach'))
);

-- 인덱스
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- 세션별 메시지 순서 조회 최적화
CREATE INDEX idx_chat_messages_session_order ON chat_messages(session_id, created_at);
```

**metadata JSONB 구조**:
```json
{
  "suggestions": ["장 제목 알려주기", "AI 초안 보기"],
  "related_resources": [
    {"type": "template", "title": "장 작성 템플릿", "url": "/resources/..."}
  ],
  "triggered_action": null
}
```

---

### 2.9 subscriptions (구독 정보)

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    coupon_id INTEGER REFERENCES coupons(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT subscriptions_plan_type_check CHECK (
        plan_type IN ('basic', 'standard', 'premium', 'enterprise')
    ),
    CONSTRAINT subscriptions_status_check CHECK (
        status IN ('pending', 'active', 'expired', 'cancelled', 'paused')
    )
);

-- 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at) WHERE status = 'active';

-- 사용자별 활성 구독 유니크 (한 사용자는 하나의 활성 구독만)
CREATE UNIQUE INDEX idx_subscriptions_user_active ON subscriptions(user_id)
WHERE status = 'active';
```

**플랜별 제한**:
```sql
-- 참조 테이블로 관리하거나 설정에서 관리
-- plan_type | chatbot_daily | feedback_monthly | draft_monthly
-- basic     | 20            | 10               | 5
-- standard  | 50            | 30               | 15
-- premium   | 100           | 100              | 50
```

---

### 2.10 payments (결제 내역)

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subscription_id INTEGER REFERENCES subscriptions(id),
    order_id VARCHAR(100) NOT NULL UNIQUE,
    order_name VARCHAR(300) NOT NULL,
    payment_key VARCHAR(200) UNIQUE,
    amount INTEGER NOT NULL,
    original_amount INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    method VARCHAR(50),
    card_info JSONB,
    receipt_url VARCHAR(500),
    approved_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    refund_amount INTEGER,
    coupon_id INTEGER REFERENCES coupons(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT payments_status_check CHECK (
        status IN ('pending', 'completed', 'cancelled', 'failed', 'refunded', 'partial_refunded')
    )
);

-- 인덱스
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_key ON payments(payment_key);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

**card_info JSONB 구조**:
```json
{
  "company": "삼성카드",
  "number": "****-****-****-1234",
  "installment_months": 0
}
```

---

### 2.11 usage_limits (사용량 제한)

```sql
CREATE TABLE usage_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    feature VARCHAR(50) NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    limit_count INTEGER NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT usage_limits_feature_check CHECK (
        feature IN ('chatbot', 'feedback', 'draft', 'consultation_analysis')
    ),
    CONSTRAINT usage_limits_period_type_check CHECK (
        period_type IN ('daily', 'weekly', 'monthly')
    ),
    CONSTRAINT usage_limits_unique_user_feature_period UNIQUE (user_id, feature, period_start)
);

-- 인덱스
CREATE INDEX idx_usage_limits_user_feature ON usage_limits(user_id, feature);
CREATE INDEX idx_usage_limits_reset_at ON usage_limits(reset_at);
```

**사용량 체크 함수**:
```sql
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id INTEGER,
    p_feature VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_used INTEGER;
    v_limit INTEGER;
BEGIN
    SELECT used_count, limit_count INTO v_used, v_limit
    FROM usage_limits
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND reset_at > CURRENT_TIMESTAMP;

    IF NOT FOUND THEN
        RETURN TRUE; -- 제한 설정 없음
    END IF;

    RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- 사용량 증가 함수
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id INTEGER,
    p_feature VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    UPDATE usage_limits
    SET used_count = used_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND reset_at > CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

---

### 2.12 notifications (알림)

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels VARCHAR(20)[] NOT NULL DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    sent_via_email BOOLEAN NOT NULL DEFAULT false,
    sent_via_kakao BOOLEAN NOT NULL DEFAULT false,
    sent_via_push BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT notifications_type_check CHECK (
        type IN (
            'feedback_ready', 'assignment_reminder', 'milestone_achieved',
            'progress_warning', 'coaching_scheduled', 'payment_completed',
            'subscription_expiring', 'system_announcement'
        )
    )
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

### 2.13 notification_settings (알림 설정)

```sql
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    channel VARCHAR(20) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT notification_settings_channel_check CHECK (
        channel IN ('email', 'kakao', 'push')
    ),
    CONSTRAINT notification_settings_unique UNIQUE (user_id, channel, notification_type)
);

-- 인덱스
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

---

### 2.14 progress_logs (진도 로그)

```sql
CREATE TABLE progress_logs (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
    event_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT progress_logs_event_type_check CHECK (
        event_type IN (
            'enrollment_started', 'week_started', 'week_completed',
            'assignment_submitted', 'feedback_received', 'milestone_achieved',
            'chatbot_session', 'coaching_session', 'enrollment_completed',
            'enrollment_dropped', 'reminder_sent', 'warning_triggered'
        )
    )
);

-- 인덱스
CREATE INDEX idx_progress_logs_enrollment_id ON progress_logs(enrollment_id);
CREATE INDEX idx_progress_logs_event_type ON progress_logs(event_type);
CREATE INDEX idx_progress_logs_created_at ON progress_logs(created_at);

-- 시계열 데이터 파티셔닝 (선택적)
-- CREATE TABLE progress_logs_2026_01 PARTITION OF progress_logs
--     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

### 2.15 coupons (쿠폰)

```sql
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INTEGER NOT NULL,
    min_purchase_amount INTEGER DEFAULT 0,
    max_discount_amount INTEGER,
    applicable_plans VARCHAR(50)[] DEFAULT '{}',
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT coupons_discount_type_check CHECK (
        discount_type IN ('percentage', 'fixed')
    ),
    CONSTRAINT coupons_valid_period CHECK (valid_from < valid_until)
);

-- 인덱스
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_valid_period ON coupons(valid_from, valid_until) WHERE is_active = true;
```

---

### 2.16 coupon_usages (쿠폰 사용 내역)

```sql
CREATE TABLE coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    payment_id INTEGER REFERENCES payments(id),
    discount_amount INTEGER NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT coupon_usages_unique UNIQUE (coupon_id, user_id)
);

-- 인덱스
CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages(user_id);
```

---

### 2.17 consultations (컨설팅지)

```sql
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id),
    file_url VARCHAR(500),
    text_content TEXT NOT NULL,
    analysis_result JSONB,
    analysis_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    analyzed_at TIMESTAMP WITH TIME ZONE,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT consultations_analysis_status_check CHECK (
        analysis_status IN ('pending', 'processing', 'completed', 'failed')
    )
);

-- 인덱스
CREATE INDEX idx_consultations_enrollment_id ON consultations(enrollment_id);
CREATE INDEX idx_consultations_analysis_status ON consultations(analysis_status);
```

**analysis_result JSONB 구조**:
```json
{
  "writer_profile": {
    "name": "홍길동",
    "expertise": ["마케팅", "스타트업"],
    "experience_years": 10,
    "unique_stories": ["첫 회사 실패 경험", "재기 스토리"]
  },
  "topic_proposals": [
    {
      "number": 1,
      "title": "실패해도 괜찮아: 30대 창업가의 재기 스토리",
      "subtitle": "실패에서 배운 10가지 교훈",
      "target_readers": "창업을 꿈꾸는 2030",
      "market_analysis": {
        "similar_books": 3,
        "differentiation": "실제 실패 경험 기반",
        "estimated_sales": "최소 1,000부"
      },
      "outline": [
        {"chapter": 1, "title": "프롤로그: 실패의 시작"},
        {"chapter": 2, "title": "첫 번째 교훈: 준비의 중요성"}
      ]
    }
  ],
  "strengths": ["풍부한 실전 경험", "스토리텔링 능력"],
  "improvements": ["타겟 독자 명확화 필요"]
}
```

---

### 2.18 topic_selections (주제 선택)

```sql
CREATE TABLE topic_selections (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id),
    consultation_id INTEGER NOT NULL REFERENCES consultations(id),
    selected_topic_number INTEGER NOT NULL,
    selection_reason TEXT,
    final_title VARCHAR(300),
    final_subtitle VARCHAR(300),
    final_outline JSONB,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT topic_selections_topic_number_check CHECK (selected_topic_number BETWEEN 1 AND 3)
);

-- 인덱스
CREATE INDEX idx_topic_selections_enrollment_id ON topic_selections(enrollment_id);
CREATE INDEX idx_topic_selections_consultation_id ON topic_selections(consultation_id);
```

---

### 2.19 writing_styles (필체 분석)

```sql
CREATE TABLE writing_styles (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id),
    sample_text TEXT NOT NULL,
    analysis_result JSONB,
    analysis_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    analyzed_at TIMESTAMP WITH TIME ZONE,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT writing_styles_analysis_status_check CHECK (
        analysis_status IN ('pending', 'processing', 'completed', 'failed')
    )
);

-- 인덱스
CREATE INDEX idx_writing_styles_enrollment_id ON writing_styles(enrollment_id);
```

**analysis_result JSONB 구조**:
```json
{
  "avg_sentence_length": 28,
  "common_endings": ["~어요", "~죠", "~습니다"],
  "vocabulary_level": "일상적",
  "tone": "따뜻하고 친근한",
  "sentence_structure": "단문 위주",
  "dialog_style": "자연스러운 대화체",
  "emotion_expression": "직접적",
  "paragraph_length": "중간",
  "storytelling_preference": "경험 기반",
  "full_analysis": "작가님의 글은 따뜻하고 친근한 톤으로..."
}
```

---

### 2.20 ai_drafts (AI 초안)

```sql
CREATE TABLE ai_drafts (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(300),
    keywords VARCHAR(100)[],
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    writing_style_id INTEGER REFERENCES writing_styles(id),
    generation_status VARCHAR(30) NOT NULL DEFAULT 'completed',
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ai_drafts_unique UNIQUE (enrollment_id, chapter_number)
);

-- 인덱스
CREATE INDEX idx_ai_drafts_enrollment_id ON ai_drafts(enrollment_id);
```

---

## 3. 공통 함수 및 트리거

### 3.1 updated_at 자동 갱신 함수

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ... (다른 테이블들도 동일하게)
```

### 3.2 진도 로그 자동 기록 트리거

```sql
CREATE OR REPLACE FUNCTION log_submission_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO progress_logs (enrollment_id, event_type, description, metadata)
        VALUES (
            NEW.enrollment_id,
            'assignment_submitted',
            format('과제 제출: %s', (SELECT title FROM assignments WHERE id = NEW.assignment_id)),
            jsonb_build_object(
                'submission_id', NEW.id,
                'assignment_id', NEW.assignment_id,
                'chapter_number', NEW.chapter_number,
                'word_count', NEW.word_count
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_submission
    AFTER INSERT ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION log_submission_event();
```

### 3.3 피드백 완료 시 제출물 상태 업데이트

```sql
CREATE OR REPLACE FUNCTION update_submission_on_feedback()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'sent' THEN
        UPDATE submissions
        SET status = 'feedback_sent',
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.submission_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_submission_feedback
    AFTER UPDATE OF status ON feedbacks
    FOR EACH ROW
    WHEN (NEW.status = 'sent')
    EXECUTE FUNCTION update_submission_on_feedback();
```

### 3.4 채팅 세션 메시지 수 자동 증가

```sql
CREATE OR REPLACE FUNCTION increment_chat_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET message_count = message_count + 1,
        last_message_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_chat_count
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_chat_message_count();
```

---

## 4. 뷰 (Views)

### 4.1 수강생 진도 현황 뷰

```sql
CREATE VIEW v_student_progress AS
SELECT
    e.id AS enrollment_id,
    u.id AS user_id,
    u.name AS student_name,
    u.email AS student_email,
    p.name AS program_name,
    e.current_week,
    p.duration_weeks AS total_weeks,
    e.status,
    e.started_at,
    e.expected_end_at,

    -- 과제 통계
    (SELECT COUNT(*) FROM assignments WHERE program_id = e.program_id) AS total_assignments,
    (SELECT COUNT(*) FROM submissions s
     JOIN assignments a ON s.assignment_id = a.id
     WHERE s.enrollment_id = e.id AND s.status IN ('submitted', 'feedback_sent')
    ) AS completed_assignments,

    -- 평균 점수
    (SELECT ROUND(AVG(f.score), 1)
     FROM feedbacks f
     JOIN submissions s ON f.submission_id = s.id
     WHERE s.enrollment_id = e.id AND f.score IS NOT NULL
    ) AS average_score,

    -- 마지막 활동
    GREATEST(
        e.updated_at,
        (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
        (SELECT MAX(created_at) FROM chat_sessions WHERE enrollment_id = e.id)
    ) AS last_activity_at,

    -- 지연 일수
    CASE
        WHEN e.status != 'active' THEN NULL
        ELSE EXTRACT(DAY FROM CURRENT_TIMESTAMP -
            COALESCE(
                (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
                e.started_at
            ))
    END AS days_since_last_submission,

    -- 위험 수준
    CASE
        WHEN e.status != 'active' THEN 'N/A'
        WHEN EXTRACT(DAY FROM CURRENT_TIMESTAMP -
            COALESCE(
                (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
                e.started_at
            )) > 7 THEN 'critical'
        WHEN EXTRACT(DAY FROM CURRENT_TIMESTAMP -
            COALESCE(
                (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
                e.started_at
            )) > 3 THEN 'high'
        ELSE 'low'
    END AS risk_level

FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN programs p ON e.program_id = p.id
WHERE u.deleted_at IS NULL;
```

### 4.2 코치 대시보드 요약 뷰

```sql
CREATE VIEW v_coach_dashboard AS
SELECT
    COALESCE(e.coach_id, 0) AS coach_id,
    COUNT(*) AS total_students,
    COUNT(*) FILTER (WHERE e.status = 'active') AS active_students,
    COUNT(*) FILTER (WHERE e.status = 'completed') AS completed_students,
    COUNT(*) FILTER (WHERE e.status = 'dropped') AS dropped_students,

    -- 위험 수준별 집계
    COUNT(*) FILTER (WHERE
        e.status = 'active' AND
        EXTRACT(DAY FROM CURRENT_TIMESTAMP -
            COALESCE(
                (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
                e.started_at
            )) > 7
    ) AS critical_count,
    COUNT(*) FILTER (WHERE
        e.status = 'active' AND
        EXTRACT(DAY FROM CURRENT_TIMESTAMP -
            COALESCE(
                (SELECT MAX(submitted_at) FROM submissions WHERE enrollment_id = e.id),
                e.started_at
            )) BETWEEN 4 AND 7
    ) AS high_risk_count,

    -- 승인 대기 피드백
    (SELECT COUNT(*) FROM feedbacks f
     JOIN submissions s ON f.submission_id = s.id
     WHERE s.enrollment_id IN (SELECT id FROM enrollments WHERE coach_id = e.coach_id)
       AND f.type = 'ai'
       AND f.status = 'generated'
    ) AS pending_approvals

FROM enrollments e
GROUP BY e.coach_id;
```

### 4.3 AI 사용량 통계 뷰

```sql
CREATE VIEW v_ai_usage_stats AS
SELECT
    DATE(created_at) AS date,
    COUNT(*) FILTER (WHERE type = 'ai') AS feedback_count,
    SUM(tokens_used) FILTER (WHERE type = 'ai') AS feedback_tokens,
    (SELECT COUNT(*) FROM chat_messages WHERE DATE(created_at) = DATE(f.created_at) AND role = 'assistant') AS chatbot_messages,
    (SELECT SUM(tokens_used) FROM chat_messages WHERE DATE(created_at) = DATE(f.created_at) AND role = 'assistant') AS chatbot_tokens
FROM feedbacks f
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 5. 인덱스 전략

### 5.1 복합 인덱스

```sql
-- 수강생별 과제 조회 최적화
CREATE INDEX idx_submissions_enrollment_assignment
ON submissions(enrollment_id, assignment_id);

-- 기간별 결제 조회
CREATE INDEX idx_payments_user_date
ON payments(user_id, created_at DESC);

-- 사용량 조회 최적화
CREATE INDEX idx_usage_limits_lookup
ON usage_limits(user_id, feature, reset_at)
WHERE reset_at > CURRENT_TIMESTAMP;
```

### 5.2 부분 인덱스

```sql
-- 활성 수강생만
CREATE INDEX idx_enrollments_active
ON enrollments(user_id, current_week)
WHERE status = 'active';

-- 미읽음 알림만
CREATE INDEX idx_notifications_unread
ON notifications(user_id, created_at DESC)
WHERE read_at IS NULL;

-- 승인 대기 피드백만
CREATE INDEX idx_feedbacks_pending_approval
ON feedbacks(submission_id, created_at)
WHERE type = 'ai' AND status = 'generated';
```

### 5.3 GIN 인덱스 (JSONB)

```sql
-- 컨설팅 분석 결과 검색
CREATE INDEX idx_consultations_analysis_gin
ON consultations USING GIN (analysis_result);

-- 피드백 내용 검색
CREATE INDEX idx_feedbacks_content_gin
ON feedbacks USING GIN (content);

-- 진도 로그 메타데이터 검색
CREATE INDEX idx_progress_logs_metadata_gin
ON progress_logs USING GIN (metadata);
```

---

## 6. 데이터 마이그레이션

### 6.1 기존 SQLite에서 PostgreSQL로 마이그레이션

```sql
-- 1. 기존 테이블 구조를 새 스키마로 매핑

-- users 마이그레이션
INSERT INTO users (id, email, name, hashed_password, role, created_at)
SELECT
    id,
    email,
    name,
    hashed_password,
    COALESCE(role, 'student'),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM old_schema.users;

-- projects -> enrollments 마이그레이션
INSERT INTO enrollments (id, user_id, program_id, status, current_week, started_at)
SELECT
    p.id,
    p.user_id,
    1, -- 기본 프로그램 ID
    CASE p.status
        WHEN 'consultation' THEN 'active'
        WHEN 'topic_selection' THEN 'active'
        WHEN 'drafting' THEN 'active'
        WHEN 'completed' THEN 'completed'
        ELSE 'active'
    END,
    CASE p.status
        WHEN 'consultation' THEN 1
        WHEN 'topic_selection' THEN 2
        WHEN 'drafting' THEN 3
        ELSE 1
    END,
    COALESCE(p.created_at, CURRENT_TIMESTAMP)
FROM old_schema.projects p;

-- consultation_forms -> consultations 마이그레이션
INSERT INTO consultations (enrollment_id, text_content, analysis_status, analyzed_at, created_at)
SELECT
    cf.project_id, -- project_id가 enrollment_id로 매핑된다고 가정
    cf.text_content,
    CASE WHEN cf.analyzed_at IS NOT NULL THEN 'completed' ELSE 'pending' END,
    cf.analyzed_at,
    COALESCE(cf.created_at, CURRENT_TIMESTAMP)
FROM old_schema.consultation_forms cf;

-- chapters + feedbacks 마이그레이션은 별도 스크립트 필요
```

### 6.2 Alembic 마이그레이션 예시

```python
# migrations/versions/001_initial_schema.py

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None

def upgrade():
    # users 테이블
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('phone', sa.String(20)),
        sa.Column('role', sa.String(20), nullable=False, default='student'),
        sa.Column('avatar_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('email_verified_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
    )

    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'], postgresql_where=sa.text('deleted_at IS NULL'))

    # ... 나머지 테이블들

def downgrade():
    op.drop_table('users')
    # ...
```

---

## 7. 백업 및 복구 전략

### 7.1 자동 백업 설정

```sql
-- pg_dump 기반 일일 백업 (cron 작업)
-- 0 3 * * * /usr/bin/pg_dump -h localhost -U app_user -Fc book_coaching > /backups/book_coaching_$(date +\%Y\%m\%d).dump

-- 포인트 인 타임 복구를 위한 WAL 아카이빙
-- postgresql.conf:
-- archive_mode = on
-- archive_command = 'cp %p /archive/%f'
```

### 7.2 테이블별 데이터 보존 정책

| 테이블 | 보존 기간 | 정책 |
|--------|-----------|------|
| users | 영구 | 소프트 삭제 |
| enrollments | 영구 | 보관 |
| submissions | 영구 | 보관 |
| feedbacks | 영구 | 보관 |
| chat_messages | 1년 | 아카이브 후 삭제 |
| progress_logs | 2년 | 아카이브 후 삭제 |
| notifications | 6개월 | 삭제 |
| usage_limits | 1년 | 리셋 기록만 삭제 |

### 7.3 아카이브 테이블

```sql
-- 오래된 채팅 메시지 아카이브
CREATE TABLE chat_messages_archive (
    LIKE chat_messages INCLUDING ALL
);

-- 아카이브 프로시저
CREATE OR REPLACE FUNCTION archive_old_chat_messages()
RETURNS void AS $$
BEGIN
    INSERT INTO chat_messages_archive
    SELECT * FROM chat_messages
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

    DELETE FROM chat_messages
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
```

---

## 8. 성능 최적화

### 8.1 파티셔닝 (대용량 테이블)

```sql
-- progress_logs 테이블 월별 파티셔닝
CREATE TABLE progress_logs (
    id SERIAL,
    enrollment_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 월별 파티션 생성
CREATE TABLE progress_logs_2026_01 PARTITION OF progress_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE progress_logs_2026_02 PARTITION OF progress_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- 자동 파티션 생성 함수
CREATE OR REPLACE FUNCTION create_progress_logs_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'progress_logs_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := partition_date;
    end_date := partition_date + INTERVAL '1 month';

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF progress_logs
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;
```

### 8.2 쿼리 최적화 예시

```sql
-- 비효율적인 쿼리
SELECT e.*, u.name,
    (SELECT COUNT(*) FROM submissions WHERE enrollment_id = e.id) as submission_count,
    (SELECT AVG(score) FROM feedbacks f JOIN submissions s ON f.submission_id = s.id WHERE s.enrollment_id = e.id) as avg_score
FROM enrollments e
JOIN users u ON e.user_id = u.id
WHERE e.status = 'active';

-- 최적화된 쿼리
WITH submission_stats AS (
    SELECT
        enrollment_id,
        COUNT(*) as submission_count,
        AVG(f.score) as avg_score
    FROM submissions s
    LEFT JOIN feedbacks f ON f.submission_id = s.id
    GROUP BY enrollment_id
)
SELECT e.*, u.name, ss.submission_count, ss.avg_score
FROM enrollments e
JOIN users u ON e.user_id = u.id
LEFT JOIN submission_stats ss ON ss.enrollment_id = e.id
WHERE e.status = 'active';
```

### 8.3 연결 풀링 설정

```python
# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,           # 기본 연결 수
    max_overflow=20,        # 추가 연결 수
    pool_timeout=30,        # 연결 대기 타임아웃 (초)
    pool_recycle=1800,      # 연결 재활용 주기 (초)
    pool_pre_ping=True,     # 연결 상태 확인
)
```

---

## 9. 보안 설정

### 9.1 Row Level Security (RLS)

```sql
-- RLS 활성화
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 수강생은 자신의 제출물만 조회 가능
CREATE POLICY submissions_student_policy ON submissions
    FOR SELECT
    USING (
        enrollment_id IN (
            SELECT id FROM enrollments WHERE user_id = current_setting('app.current_user_id')::INTEGER
        )
    );

-- 코치는 담당 수강생의 제출물 조회 가능
CREATE POLICY submissions_coach_policy ON submissions
    FOR SELECT
    USING (
        enrollment_id IN (
            SELECT id FROM enrollments WHERE coach_id = current_setting('app.current_user_id')::INTEGER
        )
    );

-- 관리자는 모든 데이터 접근 가능
CREATE POLICY submissions_admin_policy ON submissions
    FOR ALL
    USING (
        current_setting('app.current_user_role') = 'admin'
    );
```

### 9.2 민감 데이터 암호화

```sql
-- pgcrypto 확장 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 민감 데이터 암호화 함수
CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql;

-- 복호화 함수
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted_data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key);
END;
$$ LANGUAGE plpgsql;
```

### 9.3 감사 로그

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 감사 로그 트리거 함수
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true)::INTEGER);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true)::INTEGER);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true)::INTEGER);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 주요 테이블에 감사 트리거 적용
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 10. 모니터링 쿼리

### 10.1 테이블 크기 모니터링

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### 10.2 슬로우 쿼리 로그

```sql
-- postgresql.conf 설정
-- log_min_duration_statement = 1000  -- 1초 이상 쿼리 로깅

-- 현재 실행 중인 쿼리 조회
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
  AND state != 'idle';
```

### 10.3 인덱스 사용률 모니터링

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 사용되지 않는 인덱스 찾기
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%';
```

---

*이 문서는 시스템 아키텍처와 API 명세서와 함께 통합 시스템의 기반을 구성합니다.*
