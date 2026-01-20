# 책쓰기 코칭 6주 프로그램 API 명세서

> **버전**: 1.0.0
> **Base URL**: `https://api.book-coaching.com/api/v1`
> **인증**: Bearer Token (JWT)

---

## 1. API 개요

### 1.1 공통 응답 형식

```json
// 성공 응답
{
  "success": true,
  "data": { ... },
  "message": "요청이 성공적으로 처리되었습니다."
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "email",
        "message": "올바른 이메일 형식이 아닙니다."
      }
    ]
  }
}

// 페이지네이션 응답
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### 1.2 공통 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 422 | 입력값 오류 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 제한 초과 |
| `USAGE_LIMIT_EXCEEDED` | 429 | AI 사용량 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

### 1.3 인증 헤더

```http
Authorization: Bearer <access_token>
```

---

## 2. 인증 API (`/auth`)

### 2.1 회원가입

```http
POST /auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "student",
      "created_at": "2026-01-10T12:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 604800
  }
}
```

### 2.2 로그인

```http
POST /auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "student"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 604800
  }
}
```

### 2.3 토큰 갱신

```http
POST /auth/refresh
```

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2.4 비밀번호 재설정 요청

```http
POST /auth/password/reset-request
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

### 2.5 비밀번호 재설정

```http
POST /auth/password/reset
```

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

---

## 3. 사용자 API (`/users`)

### 3.1 현재 사용자 정보 조회

```http
GET /users/me
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "student",
    "avatar_url": "https://...",
    "created_at": "2026-01-10T12:00:00Z",
    "subscription": {
      "plan_type": "standard",
      "status": "active",
      "expires_at": "2026-03-10T12:00:00Z"
    },
    "current_enrollment": {
      "id": 5,
      "program_name": "6주 책쓰기 코칭",
      "current_week": 3,
      "status": "in_progress"
    }
  }
}
```

### 3.2 사용자 정보 수정

```http
PATCH /users/me
```

**Request Body**:
```json
{
  "name": "김철수",
  "phone": "010-9876-5432",
  "notification_settings": {
    "email": true,
    "kakao": true,
    "push": false
  }
}
```

### 3.3 사용자 목록 조회 (코치/관리자 전용)

```http
GET /users?role=student&page=1&limit=20
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `role` | string | 역할 필터 (student, coach, admin) |
| `status` | string | 상태 필터 (active, inactive) |
| `search` | string | 이름/이메일 검색 |
| `page` | int | 페이지 번호 |
| `limit` | int | 페이지당 항목 수 |

---

## 4. 수강 관리 API (`/enrollments`)

### 4.1 수강 등록

```http
POST /enrollments
```

**Request Body**:
```json
{
  "program_id": 1,
  "payment_key": "toss_payment_key_xxx"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 10,
    "user_id": 1,
    "program_id": 1,
    "program_name": "6주 책쓰기 코칭",
    "status": "active",
    "current_week": 1,
    "started_at": "2026-01-10T12:00:00Z",
    "expected_end_at": "2026-02-21T12:00:00Z",
    "assignments_count": 0,
    "completed_count": 0
  }
}
```

### 4.2 내 수강 목록 조회

```http
GET /enrollments/me
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "program_name": "6주 책쓰기 코칭",
        "status": "active",
        "current_week": 3,
        "progress_percentage": 45,
        "started_at": "2026-01-10T12:00:00Z",
        "expected_end_at": "2026-02-21T12:00:00Z"
      }
    ]
  }
}
```

### 4.3 수강 상세 조회

```http
GET /enrollments/{enrollment_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "user": {
      "id": 1,
      "name": "홍길동",
      "email": "user@example.com"
    },
    "program": {
      "id": 1,
      "name": "6주 책쓰기 코칭",
      "total_weeks": 6
    },
    "status": "active",
    "current_week": 3,
    "progress_percentage": 45,
    "started_at": "2026-01-10T12:00:00Z",
    "expected_end_at": "2026-02-21T12:00:00Z",
    "milestones": [
      {
        "week": 1,
        "title": "컨설팅지 분석",
        "status": "completed",
        "completed_at": "2026-01-12T15:30:00Z"
      },
      {
        "week": 2,
        "title": "주제/목차 확정",
        "status": "completed",
        "completed_at": "2026-01-18T10:00:00Z"
      },
      {
        "week": 3,
        "title": "초안 10장 작성",
        "status": "in_progress",
        "completed_at": null
      }
    ],
    "consultation": {
      "id": 5,
      "status": "analyzed",
      "analyzed_at": "2026-01-11T14:00:00Z"
    },
    "writing_style": {
      "id": 3,
      "analyzed": true
    }
  }
}
```

### 4.4 전체 수강생 현황 (코치 전용)

```http
GET /enrollments?status=active&risk_level=high&page=1
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | 상태 (active, completed, dropped) |
| `risk_level` | string | 위험 수준 (low, medium, high) |
| `week` | int | 현재 주차 필터 |
| `search` | string | 수강생 검색 |

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "user": {
          "id": 1,
          "name": "홍길동"
        },
        "current_week": 3,
        "progress_percentage": 45,
        "risk_level": "low",
        "last_activity_at": "2026-01-09T18:30:00Z",
        "days_since_submission": 1
      },
      {
        "id": 11,
        "user": {
          "id": 2,
          "name": "김영희"
        },
        "current_week": 2,
        "progress_percentage": 20,
        "risk_level": "high",
        "last_activity_at": "2026-01-02T10:00:00Z",
        "days_since_submission": 8
      }
    ],
    "summary": {
      "total_active": 35,
      "on_track": 28,
      "at_risk": 5,
      "critical": 2
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35
    }
  }
}
```

---

## 5. 과제 관리 API (`/assignments`)

### 5.1 과제 목록 조회

```http
GET /assignments?enrollment_id=10&week=3
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `enrollment_id` | int | 수강 ID (필수) |
| `week` | int | 주차 필터 |
| `status` | string | 상태 (pending, submitted, feedback_sent) |

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "week_number": 1,
        "type": "consultation",
        "title": "컨설팅지 작성",
        "description": "작가님의 경험과 전문성을 정리해주세요.",
        "due_date": "2026-01-14T23:59:59Z",
        "status": "feedback_sent",
        "submission": {
          "id": 5,
          "submitted_at": "2026-01-12T15:30:00Z",
          "feedback_count": 1
        }
      },
      {
        "id": 2,
        "week_number": 2,
        "type": "topic_selection",
        "title": "주제 선정",
        "description": "AI가 제안한 3가지 주제 중 하나를 선택해주세요.",
        "due_date": "2026-01-21T23:59:59Z",
        "status": "submitted",
        "submission": {
          "id": 8,
          "submitted_at": "2026-01-18T10:00:00Z",
          "feedback_count": 0
        }
      },
      {
        "id": 3,
        "week_number": 3,
        "type": "draft",
        "title": "1-5장 초안 작성",
        "description": "첫 5개 장의 초안을 작성해주세요.",
        "due_date": "2026-01-28T23:59:59Z",
        "status": "pending",
        "submission": null
      }
    ],
    "progress": {
      "total": 12,
      "completed": 2,
      "in_progress": 1,
      "pending": 9
    }
  }
}
```

### 5.2 과제 상세 조회

```http
GET /assignments/{assignment_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "week_number": 3,
    "type": "draft",
    "title": "1-5장 초안 작성",
    "description": "첫 5개 장의 초안을 작성해주세요.",
    "instructions": "## 작성 가이드\n\n1. 각 장은 최소 3,000자 이상\n2. AI 초안을 참고하되 본인 스타일로 작성\n3. 개인 경험과 사례 포함",
    "due_date": "2026-01-28T23:59:59Z",
    "chapters": [
      {
        "chapter_number": 1,
        "title": "프롤로그: 왜 이 책을 쓰게 되었나",
        "target_words": 3000,
        "ai_draft_available": true
      },
      {
        "chapter_number": 2,
        "title": "첫 번째 이야기: 시작",
        "target_words": 4000,
        "ai_draft_available": true
      }
    ],
    "resources": [
      {
        "type": "template",
        "title": "장 작성 템플릿",
        "url": "/resources/chapter-template.md"
      },
      {
        "type": "example",
        "title": "우수 사례",
        "url": "/resources/excellent-example.pdf"
      }
    ]
  }
}
```

### 5.3 과제 제출

```http
POST /assignments/{assignment_id}/submissions
```

**Request Body (JSON)**:
```json
{
  "content": "## 1장: 프롤로그\n\n책을 쓰기로 결심한 것은...",
  "chapter_number": 1,
  "word_count": 3500,
  "notes": "AI 초안을 참고했지만 80% 이상 새로 작성했습니다."
}
```

**Request Body (파일 업로드)**:
```http
Content-Type: multipart/form-data

file: <binary>
chapter_number: 1
notes: "워드 파일로 제출합니다."
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 15,
    "assignment_id": 3,
    "chapter_number": 1,
    "content": "## 1장: 프롤로그\n\n...",
    "word_count": 3500,
    "file_url": null,
    "status": "submitted",
    "submitted_at": "2026-01-25T14:30:00Z",
    "feedback_status": "pending",
    "message": "제출이 완료되었습니다. AI 피드백이 곧 생성됩니다."
  }
}
```

### 5.4 제출물 목록 조회

```http
GET /submissions?assignment_id=3
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 15,
        "chapter_number": 1,
        "word_count": 3500,
        "status": "feedback_sent",
        "submitted_at": "2026-01-25T14:30:00Z",
        "latest_feedback": {
          "id": 20,
          "type": "ai",
          "score": 78,
          "created_at": "2026-01-25T14:33:00Z"
        }
      },
      {
        "id": 16,
        "chapter_number": 2,
        "word_count": 4200,
        "status": "submitted",
        "submitted_at": "2026-01-26T10:00:00Z",
        "latest_feedback": null
      }
    ]
  }
}
```

### 5.5 제출물 상세 조회

```http
GET /submissions/{submission_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "assignment": {
      "id": 3,
      "title": "1-5장 초안 작성"
    },
    "chapter_number": 1,
    "chapter_title": "프롤로그: 왜 이 책을 쓰게 되었나",
    "content": "## 1장: 프롤로그\n\n책을 쓰기로 결심한 것은...",
    "word_count": 3500,
    "file_url": null,
    "status": "feedback_sent",
    "submitted_at": "2026-01-25T14:30:00Z",
    "feedbacks": [
      {
        "id": 20,
        "type": "ai",
        "score": 78,
        "created_at": "2026-01-25T14:33:00Z"
      }
    ]
  }
}
```

---

## 6. 피드백 API (`/feedback`)

### 6.1 AI 피드백 생성 요청

```http
POST /feedback/generate
```

**Request Body**:
```json
{
  "submission_id": 15
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "job_id": "fb_job_abc123",
    "status": "processing",
    "estimated_time_seconds": 180,
    "message": "AI 피드백 생성이 시작되었습니다."
  }
}
```

### 6.2 피드백 생성 상태 조회

```http
GET /feedback/jobs/{job_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "job_id": "fb_job_abc123",
    "status": "completed",
    "feedback_id": 20,
    "created_at": "2026-01-25T14:33:00Z"
  }
}
```

### 6.3 피드백 상세 조회

```http
GET /feedback/{feedback_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 20,
    "submission_id": 15,
    "type": "ai",
    "status": "approved",
    "score": 78,
    "scores_detail": {
      "structure": 80,
      "style": 75,
      "content": 78,
      "engagement": 79
    },
    "strengths": [
      {
        "category": "스토리텔링",
        "description": "개인 경험이 생생하게 전달됩니다.",
        "example": "'그날 아침, 창문 밖으로 보이는...' 부분이 특히 인상적입니다."
      },
      {
        "category": "문체",
        "description": "자연스러운 대화체가 독자와의 거리를 좁힙니다."
      }
    ],
    "improvements": [
      {
        "priority": 1,
        "category": "구조",
        "issue": "도입부가 다소 길어 핵심 메시지 전달이 늦습니다.",
        "suggestion": "도입부를 300자 내외로 줄이고, 핵심 메시지를 앞으로 배치해보세요.",
        "before": "책을 쓰기로 결심한 것은 어느 봄날의 일이었다. 그날은...",
        "after": "'당신도 책을 쓸 수 있습니다.' 이 말을 처음 들었을 때..."
      },
      {
        "priority": 2,
        "category": "디테일",
        "issue": "감정 표현이 추상적인 부분이 있습니다.",
        "suggestion": "구체적인 신체 반응이나 행동으로 감정을 표현해보세요.",
        "before": "나는 매우 기뻤다.",
        "after": "심장이 쿵쾅거렸고, 나도 모르게 주먹을 불끈 쥐었다."
      }
    ],
    "next_steps": [
      "도입부 수정 (예상 소요: 30분)",
      "감정 표현 3곳 이상 구체화 (예상 소요: 1시간)",
      "수정 후 재제출"
    ],
    "coach_comment": null,
    "approved_at": "2026-01-25T15:00:00Z",
    "approved_by": {
      "id": 100,
      "name": "준현 코치"
    },
    "created_at": "2026-01-25T14:33:00Z"
  }
}
```

### 6.4 피드백 승인 (코치 전용)

```http
POST /feedback/{feedback_id}/approve
```

**Request Body**:
```json
{
  "coach_comment": "AI 피드백에 동의합니다. 특히 도입부 수정을 우선적으로 진행해주세요.",
  "send_notification": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 20,
    "status": "approved",
    "approved_at": "2026-01-25T15:00:00Z",
    "notification_sent": true
  }
}
```

### 6.5 제출물별 피드백 목록

```http
GET /feedback?submission_id=15
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 20,
        "type": "ai",
        "score": 78,
        "status": "approved",
        "created_at": "2026-01-25T14:33:00Z"
      },
      {
        "id": 25,
        "type": "coach",
        "score": null,
        "status": "sent",
        "created_at": "2026-01-26T10:00:00Z"
      }
    ]
  }
}
```

### 6.6 코치 피드백 작성 (코치 전용)

```http
POST /feedback
```

**Request Body**:
```json
{
  "submission_id": 15,
  "type": "coach",
  "content": {
    "overall": "전체적으로 훌륭한 초안입니다. AI 피드백의 수정 사항을 반영하면 더욱 좋아질 것입니다.",
    "highlights": [
      "3번째 문단의 대화 장면이 매우 생생합니다.",
      "마무리 부분의 여운이 좋습니다."
    ],
    "additional_suggestions": [
      "독자에게 질문을 던지는 형식도 고려해보세요."
    ]
  },
  "send_notification": true
}
```

---

## 7. 챗봇 API (`/chatbot`)

### 7.1 새 채팅 세션 생성

```http
POST /chatbot/sessions
```

**Request Body**:
```json
{
  "context": {
    "enrollment_id": 10,
    "current_week": 3,
    "current_assignment": "1-5장 초안 작성"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "session_id": "sess_xyz789",
    "created_at": "2026-01-25T16:00:00Z",
    "welcome_message": "안녕하세요! 책쓰기 AI 도우미입니다. 3주차 초안 작성 중이시네요. 무엇을 도와드릴까요?"
  }
}
```

### 7.2 메시지 전송

```http
POST /chatbot/sessions/{session_id}/messages
```

**Request Body**:
```json
{
  "message": "초안 작성 중인데 막혀서요. 첫 문장을 어떻게 시작해야 할지 모르겠어요."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message_id": "msg_001",
    "user_message": "초안 작성 중인데 막혀서요. 첫 문장을 어떻게 시작해야 할지 모르겠어요.",
    "assistant_message": "첫 문장이 막막하시군요. 완벽한 첫 문장을 쓰려고 하면 더 어려워져요. 제가 몇 가지 방법을 알려드릴게요.\n\n**방법 1: 질문으로 시작하기**\n\"당신은 왜 책을 읽나요?\" 처럼 독자에게 질문을 던져보세요.\n\n**방법 2: 장면 묘사로 시작하기**\n\"2024년 어느 가을 저녁, 나는...\" 처럼 구체적인 장면으로 시작하세요.\n\n**방법 3: 대담한 주장으로 시작하기**\n\"누구나 책을 쓸 수 있다. 단, 한 가지만 있으면.\" 처럼 호기심을 유발하세요.\n\n지금 쓰시는 장의 주제가 무엇인가요? 더 구체적으로 도와드릴게요.",
    "suggestions": [
      "장 제목 알려주기",
      "AI 초안 보기",
      "다른 수강생 예시 보기"
    ],
    "created_at": "2026-01-25T16:01:00Z"
  }
}
```

### 7.3 채팅 기록 조회

```http
GET /chatbot/sessions/{session_id}/messages?limit=50
```

**Response**:
```json
{
  "success": true,
  "data": {
    "session_id": "sess_xyz789",
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "초안 작성 중인데 막혀서요...",
        "created_at": "2026-01-25T16:01:00Z"
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "첫 문장이 막막하시군요...",
        "created_at": "2026-01-25T16:01:02Z"
      }
    ],
    "pagination": {
      "has_more": false
    }
  }
}
```

### 7.4 AI 초안 요청 (챗봇 내)

```http
POST /chatbot/sessions/{session_id}/draft-request
```

**Request Body**:
```json
{
  "chapter_number": 1,
  "chapter_title": "프롤로그: 왜 이 책을 쓰게 되었나",
  "keywords": ["동기", "결심", "첫 걸음"],
  "tone": "따뜻한",
  "target_words": 3000
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "job_id": "draft_job_def456",
    "status": "processing",
    "estimated_time_seconds": 60,
    "message": "AI 초안을 생성 중입니다. 잠시만 기다려주세요."
  }
}
```

### 7.5 만족도 평가

```http
POST /chatbot/sessions/{session_id}/messages/{message_id}/feedback
```

**Request Body**:
```json
{
  "rating": "helpful",
  "comment": "질문 방법이 도움이 됐어요!"
}
```

**rating 옵션**: `helpful`, `not_helpful`, `needs_coach`

### 7.6 세션 목록 조회

```http
GET /chatbot/sessions?limit=10
```

---

## 8. 진도 관리 API (`/progress`)

### 8.1 내 진도 현황 조회

```http
GET /progress/me?enrollment_id=10
```

**Response**:
```json
{
  "success": true,
  "data": {
    "enrollment_id": 10,
    "program_name": "6주 책쓰기 코칭",
    "current_week": 3,
    "total_weeks": 6,
    "overall_progress": 45,
    "status": "on_track",
    "started_at": "2026-01-10T12:00:00Z",
    "expected_end_at": "2026-02-21T12:00:00Z",
    "weeks": [
      {
        "week": 1,
        "title": "컨설팅지 분석",
        "status": "completed",
        "progress": 100,
        "assignments": [
          {
            "id": 1,
            "title": "컨설팅지 작성",
            "status": "feedback_sent",
            "score": 85
          }
        ],
        "completed_at": "2026-01-12T15:30:00Z"
      },
      {
        "week": 2,
        "title": "주제/목차 확정",
        "status": "completed",
        "progress": 100,
        "assignments": [
          {
            "id": 2,
            "title": "주제 선정",
            "status": "feedback_sent",
            "score": 90
          },
          {
            "id": 3,
            "title": "40개 목차 확정",
            "status": "feedback_sent",
            "score": 88
          }
        ],
        "completed_at": "2026-01-18T10:00:00Z"
      },
      {
        "week": 3,
        "title": "초안 작성 (1-10장)",
        "status": "in_progress",
        "progress": 30,
        "assignments": [
          {
            "id": 4,
            "title": "1-5장 초안",
            "status": "submitted",
            "score": null
          },
          {
            "id": 5,
            "title": "6-10장 초안",
            "status": "pending",
            "score": null
          }
        ],
        "due_date": "2026-01-28T23:59:59Z"
      }
    ],
    "milestones": [
      {
        "id": 1,
        "title": "컨설팅지 제출",
        "achieved": true,
        "achieved_at": "2026-01-12T15:30:00Z"
      },
      {
        "id": 2,
        "title": "주제/목차 확정",
        "achieved": true,
        "achieved_at": "2026-01-18T10:00:00Z"
      },
      {
        "id": 3,
        "title": "10장 초안 완성",
        "achieved": false,
        "target_date": "2026-01-28T23:59:59Z"
      },
      {
        "id": 4,
        "title": "20장 초안 완성",
        "achieved": false,
        "target_date": "2026-02-04T23:59:59Z"
      }
    ],
    "statistics": {
      "total_submissions": 5,
      "average_score": 87.6,
      "total_words_written": 15000,
      "chatbot_messages": 23,
      "days_active": 15
    }
  }
}
```

### 8.2 전체 수강생 진도 대시보드 (코치 전용)

```http
GET /progress/dashboard
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_active": 35,
      "completed_this_week": 5,
      "on_track": 25,
      "behind": 7,
      "critical": 3
    },
    "by_week": [
      {
        "week": 1,
        "students_count": 5,
        "average_progress": 100
      },
      {
        "week": 2,
        "students_count": 8,
        "average_progress": 95
      },
      {
        "week": 3,
        "students_count": 12,
        "average_progress": 60
      }
    ],
    "at_risk_students": [
      {
        "user_id": 5,
        "name": "김영희",
        "current_week": 2,
        "days_inactive": 8,
        "last_activity": "2026-01-02T10:00:00Z",
        "risk_level": "critical",
        "suggested_action": "직접 연락 필요"
      },
      {
        "user_id": 12,
        "name": "박철수",
        "current_week": 3,
        "days_inactive": 5,
        "last_activity": "2026-01-05T14:00:00Z",
        "risk_level": "high",
        "suggested_action": "리마인더 발송"
      }
    ],
    "recent_completions": [
      {
        "user_id": 3,
        "name": "이민수",
        "milestone": "20장 초안 완성",
        "completed_at": "2026-01-09T16:00:00Z"
      }
    ]
  }
}
```

### 8.3 진도 체크 수동 실행 (관리자 전용)

```http
POST /progress/check-all
```

**Response**:
```json
{
  "success": true,
  "data": {
    "checked_count": 35,
    "reminders_sent": 7,
    "critical_alerts_sent": 2,
    "completed_at": "2026-01-10T09:05:00Z"
  }
}
```

### 8.4 개별 수강생 진도 로그

```http
GET /progress/{enrollment_id}/logs?limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 100,
        "event_type": "assignment_submitted",
        "description": "1-5장 초안 제출",
        "metadata": {
          "assignment_id": 4,
          "word_count": 3500
        },
        "created_at": "2026-01-25T14:30:00Z"
      },
      {
        "id": 99,
        "event_type": "feedback_received",
        "description": "AI 피드백 수신",
        "metadata": {
          "feedback_id": 20,
          "score": 78
        },
        "created_at": "2026-01-25T14:33:00Z"
      },
      {
        "id": 98,
        "event_type": "chatbot_session",
        "description": "챗봇 상담 (5 메시지)",
        "metadata": {
          "session_id": "sess_xyz789",
          "message_count": 5
        },
        "created_at": "2026-01-25T16:00:00Z"
      }
    ]
  }
}
```

---

## 9. 구독 관리 API (`/subscriptions`)

### 9.1 구독 플랜 목록 조회

```http
GET /subscriptions/plans
```

**Response**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "basic",
        "name": "베이직",
        "price": 500000,
        "duration_weeks": 6,
        "features": [
          "6주 코칭 프로그램",
          "AI 피드백 월 10회",
          "챗봇 일 20회",
          "이메일 알림"
        ],
        "limits": {
          "chatbot_daily": 20,
          "feedback_monthly": 10,
          "draft_monthly": 5
        }
      },
      {
        "id": "standard",
        "name": "스탠다드",
        "price": 800000,
        "duration_weeks": 6,
        "features": [
          "6주 코칭 프로그램",
          "AI 피드백 월 30회",
          "챗봇 일 50회",
          "카카오톡 + 이메일 알림",
          "1:1 코칭 세션 2회"
        ],
        "limits": {
          "chatbot_daily": 50,
          "feedback_monthly": 30,
          "draft_monthly": 15
        },
        "recommended": true
      },
      {
        "id": "premium",
        "name": "프리미엄",
        "price": 1500000,
        "duration_weeks": 6,
        "features": [
          "6주 코칭 프로그램",
          "AI 피드백 무제한",
          "챗봇 일 100회",
          "카카오톡 + 이메일 알림",
          "1:1 코칭 세션 6회",
          "출판사 연결 지원"
        ],
        "limits": {
          "chatbot_daily": 100,
          "feedback_monthly": 100,
          "draft_monthly": 50
        }
      }
    ]
  }
}
```

### 9.2 내 구독 정보 조회

```http
GET /subscriptions/me
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 50,
    "plan_type": "standard",
    "plan_name": "스탠다드",
    "status": "active",
    "started_at": "2026-01-10T12:00:00Z",
    "expires_at": "2026-02-21T12:00:00Z",
    "auto_renew": false,
    "usage": {
      "chatbot_today": 5,
      "chatbot_limit": 50,
      "feedback_this_month": 8,
      "feedback_limit": 30,
      "draft_this_month": 3,
      "draft_limit": 15
    },
    "payment_history": [
      {
        "id": 100,
        "amount": 800000,
        "status": "completed",
        "paid_at": "2026-01-10T12:00:00Z",
        "method": "card"
      }
    ]
  }
}
```

### 9.3 구독 신청 (결제)

```http
POST /subscriptions
```

**Request Body**:
```json
{
  "plan_id": "standard",
  "payment_key": "toss_payment_key_xxx",
  "order_id": "order_abc123",
  "amount": 800000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "subscription_id": 50,
    "plan_type": "standard",
    "status": "active",
    "started_at": "2026-01-10T12:00:00Z",
    "expires_at": "2026-02-21T12:00:00Z",
    "payment": {
      "id": 100,
      "amount": 800000,
      "status": "completed"
    },
    "message": "구독이 시작되었습니다."
  }
}
```

### 9.4 구독 업그레이드

```http
POST /subscriptions/upgrade
```

**Request Body**:
```json
{
  "new_plan_id": "premium",
  "payment_key": "toss_payment_key_xxx",
  "amount": 700000
}
```

### 9.5 구독 해지 요청

```http
POST /subscriptions/cancel
```

**Request Body**:
```json
{
  "cancel_type": "end_of_period",
  "reason": "프로그램 완료",
  "feedback": "매우 만족스러웠습니다."
}
```

**cancel_type**: `immediate` (즉시 해지), `end_of_period` (기간 만료 시 해지)

**Response**:
```json
{
  "success": true,
  "data": {
    "subscription_id": 50,
    "status": "cancellation_scheduled",
    "cancels_at": "2026-02-21T12:00:00Z",
    "message": "구독이 2026-02-21에 종료됩니다."
  }
}
```

### 9.6 사용량 조회

```http
GET /subscriptions/usage
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-31T23:59:59Z"
    },
    "chatbot": {
      "today": 5,
      "daily_limit": 50,
      "monthly_total": 120
    },
    "feedback": {
      "this_month": 8,
      "monthly_limit": 30
    },
    "draft": {
      "this_month": 3,
      "monthly_limit": 15
    },
    "reset_at": "2026-02-01T00:00:00Z"
  }
}
```

---

## 10. 알림 API (`/notifications`)

### 10.1 알림 목록 조회

```http
GET /notifications?unread_only=true&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 200,
        "type": "feedback_ready",
        "title": "피드백이 도착했습니다",
        "message": "1장 초안에 대한 AI 피드백이 준비되었습니다.",
        "data": {
          "submission_id": 15,
          "feedback_id": 20
        },
        "read": false,
        "created_at": "2026-01-25T14:33:00Z"
      },
      {
        "id": 199,
        "type": "milestone_achieved",
        "title": "마일스톤 달성!",
        "message": "축하합니다! 10장 초안을 완성했습니다.",
        "data": {
          "milestone_id": 3
        },
        "read": false,
        "created_at": "2026-01-24T18:00:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

### 10.2 알림 읽음 처리

```http
POST /notifications/{notification_id}/read
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 200,
    "read": true,
    "read_at": "2026-01-25T15:00:00Z"
  }
}
```

### 10.3 모든 알림 읽음 처리

```http
POST /notifications/read-all
```

### 10.4 알림 설정 조회

```http
GET /notifications/settings
```

**Response**:
```json
{
  "success": true,
  "data": {
    "email": {
      "enabled": true,
      "types": ["feedback_ready", "milestone_achieved", "weekly_report"]
    },
    "kakao": {
      "enabled": true,
      "types": ["feedback_ready", "assignment_reminder"]
    },
    "push": {
      "enabled": false,
      "types": []
    }
  }
}
```

### 10.5 알림 설정 변경

```http
PATCH /notifications/settings
```

**Request Body**:
```json
{
  "email": {
    "enabled": true,
    "types": ["feedback_ready", "milestone_achieved"]
  },
  "kakao": {
    "enabled": true,
    "types": ["feedback_ready"]
  }
}
```

### 10.6 수동 알림 발송 (코치/관리자 전용)

```http
POST /notifications/send
```

**Request Body**:
```json
{
  "user_ids": [1, 2, 3],
  "channels": ["email", "kakao"],
  "title": "이번 주 과제 안내",
  "message": "3주차 과제가 시작됩니다. 1-5장 초안을 작성해주세요.",
  "data": {
    "week": 3,
    "assignment_id": 4
  }
}
```

---

## 11. 결제 API (`/payments`)

### 11.1 결제 요청 준비

```http
POST /payments/prepare
```

**Request Body**:
```json
{
  "plan_id": "standard",
  "coupon_code": "WELCOME10"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_abc123",
    "order_name": "6주 책쓰기 코칭 - 스탠다드",
    "original_amount": 800000,
    "discount_amount": 80000,
    "final_amount": 720000,
    "coupon_applied": {
      "code": "WELCOME10",
      "discount_type": "percentage",
      "discount_value": 10
    }
  }
}
```

### 11.2 결제 승인

```http
POST /payments/confirm
```

**Request Body**:
```json
{
  "payment_key": "toss_payment_key_xxx",
  "order_id": "order_abc123",
  "amount": 720000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "payment_id": 100,
    "payment_key": "toss_payment_key_xxx",
    "order_id": "order_abc123",
    "amount": 720000,
    "status": "completed",
    "method": "card",
    "card_info": {
      "company": "삼성카드",
      "number": "****-****-****-1234"
    },
    "approved_at": "2026-01-10T12:00:00Z",
    "receipt_url": "https://..."
  }
}
```

### 11.3 결제 내역 조회

```http
GET /payments?limit=10
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 100,
        "order_id": "order_abc123",
        "order_name": "6주 책쓰기 코칭 - 스탠다드",
        "amount": 720000,
        "status": "completed",
        "method": "card",
        "paid_at": "2026-01-10T12:00:00Z",
        "receipt_url": "https://..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3
    }
  }
}
```

### 11.4 결제 취소 요청

```http
POST /payments/{payment_id}/cancel
```

**Request Body**:
```json
{
  "cancel_reason": "환불 요청",
  "refund_amount": 720000
}
```

### 11.5 결제 웹훅 (Toss -> Backend)

```http
POST /payments/webhook
```

**Request Body (from Toss)**:
```json
{
  "eventType": "PAYMENT_STATUS_CHANGED",
  "data": {
    "paymentKey": "toss_payment_key_xxx",
    "orderId": "order_abc123",
    "status": "DONE"
  }
}
```

---

## 12. 웹훅 API (`/webhooks`)

### 12.1 n8n 워크플로우 트리거

```http
POST /webhooks/n8n/submission-completed
```

**Request Body**:
```json
{
  "event": "submission_completed",
  "data": {
    "submission_id": 15,
    "user_id": 1,
    "assignment_id": 4,
    "enrollment_id": 10
  },
  "timestamp": "2026-01-25T14:30:00Z"
}
```

### 12.2 카카오톡 발송 결과 웹훅

```http
POST /webhooks/kakao/delivery-result
```

### 12.3 이메일 발송 결과 웹훅

```http
POST /webhooks/email/delivery-result
```

---

## 13. 관리자 API (`/admin`)

### 13.1 시스템 통계 대시보드

```http
GET /admin/dashboard
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 500,
      "active_students": 150,
      "new_this_month": 30
    },
    "subscriptions": {
      "active": 120,
      "basic": 40,
      "standard": 60,
      "premium": 20,
      "mrr": 96000000
    },
    "ai_usage": {
      "feedback_today": 45,
      "chatbot_today": 320,
      "draft_today": 15,
      "estimated_cost_today": 15000
    },
    "completion": {
      "completion_rate": 75,
      "average_duration_days": 45,
      "at_risk_count": 8
    }
  }
}
```

### 13.2 사용량 상세 조회

```http
GET /admin/usage?period=month&start=2026-01-01
```

### 13.3 쿠폰 관리

```http
POST /admin/coupons
```

**Request Body**:
```json
{
  "code": "WINTER2026",
  "discount_type": "percentage",
  "discount_value": 20,
  "max_uses": 100,
  "valid_from": "2026-01-01T00:00:00Z",
  "valid_until": "2026-01-31T23:59:59Z",
  "applicable_plans": ["standard", "premium"]
}
```

### 13.4 수강생 일괄 알림

```http
POST /admin/bulk-notification
```

**Request Body**:
```json
{
  "filter": {
    "status": "active",
    "current_week": [3, 4],
    "risk_level": ["high", "critical"]
  },
  "channels": ["email", "kakao"],
  "title": "진도 확인 안내",
  "message": "프로그램 절반을 지났습니다. 진도 확인 부탁드립니다."
}
```

---

## 14. Rate Limiting

| 엔드포인트 카테고리 | 제한 | 창 |
|--------------------|------|-----|
| 인증 API | 10 req | 1분 |
| 챗봇 메시지 | 플랜별 | 1일 |
| AI 피드백 생성 | 플랜별 | 1개월 |
| 일반 API | 100 req | 1분 |
| 파일 업로드 | 10 req | 1시간 |

**Rate Limit 헤더**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704931200
```

**Rate Limit 초과 응답**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 제한을 초과했습니다. 1분 후 다시 시도해주세요.",
    "retry_after": 60
  }
}
```

---

## 15. API 버전 관리

### 15.1 버전 정책

- 현재 버전: `v1`
- URL 기반 버전 관리: `/api/v1/...`
- 하위 호환성 유지 기간: 최소 6개월
- Deprecation 공지: 최소 3개월 전

### 15.2 버전 헤더

```http
API-Version: 2026-01-10
Deprecation: true
Sunset: 2026-07-01
```

---

## 16. SDK 및 클라이언트

### 16.1 TypeScript/JavaScript 클라이언트 예시

```typescript
// lib/api-client.ts

import { QueryClient } from '@tanstack/react-query';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await response.json();

    if (!json.success) {
      throw new APIError(json.error);
    }

    return json.data;
  }

  // 인증
  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password });
  }

  // 과제
  async getAssignments(enrollmentId: number) {
    return this.request('GET', `/assignments?enrollment_id=${enrollmentId}`);
  }

  async submitAssignment(assignmentId: number, data: SubmissionData) {
    return this.request('POST', `/assignments/${assignmentId}/submissions`, data);
  }

  // 피드백
  async generateFeedback(submissionId: number) {
    return this.request('POST', '/feedback/generate', { submission_id: submissionId });
  }

  async getFeedback(feedbackId: number) {
    return this.request('GET', `/feedback/${feedbackId}`);
  }

  // 챗봇
  async createChatSession(context: ChatContext) {
    return this.request('POST', '/chatbot/sessions', { context });
  }

  async sendMessage(sessionId: string, message: string) {
    return this.request('POST', `/chatbot/sessions/${sessionId}/messages`, { message });
  }

  // 진도
  async getProgress(enrollmentId: number) {
    return this.request('GET', `/progress/me?enrollment_id=${enrollmentId}`);
  }

  // 구독
  async getSubscription() {
    return this.request('GET', '/subscriptions/me');
  }

  async getUsage() {
    return this.request('GET', '/subscriptions/usage');
  }
}

export const api = new APIClient();
```

### 16.2 Python 클라이언트 예시

```python
# client.py

import httpx
from typing import Optional, Dict, Any

class BookCoachingAPI:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url
        self.token = token

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method,
                f"{self.base_url}{endpoint}",
                headers=self._headers(),
                json=data
            )
            result = response.json()
            if not result.get("success"):
                raise APIError(result.get("error"))
            return result.get("data")

    # 사용 예시
    async def get_progress(self, enrollment_id: int):
        return await self._request(
            "GET",
            f"/progress/me?enrollment_id={enrollment_id}"
        )

    async def submit_assignment(
        self,
        assignment_id: int,
        content: str,
        chapter_number: int
    ):
        return await self._request(
            "POST",
            f"/assignments/{assignment_id}/submissions",
            {"content": content, "chapter_number": chapter_number}
        )
```

---

*다음 문서: [데이터베이스 스키마](./database-schema.md)*
