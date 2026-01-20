# 6주 수강 완료 후 이용 정책 시스템

## 목차
1. [정책 개요](#1-정책-개요)
2. [수강생 등급 시스템](#2-수강생-등급-시스템)
3. [수료 후 무료 제공 범위](#3-수료-후-무료-제공-범위)
4. [유료 구독 플랜 설계](#4-유료-구독-플랜-설계)
5. [전환 유도 시스템](#5-전환-유도-시스템)
6. [데이터베이스 스키마](#6-데이터베이스-스키마)
7. [API 엔드포인트 설계](#7-api-엔드포인트-설계)
8. [알림 메시지 템플릿](#8-알림-메시지-템플릿)
9. [FAQ 대응 스크립트](#9-faq-대응-스크립트)
10. [구현 체크리스트](#10-구현-체크리스트)

---

## 1. 정책 개요

### 1.1 배경
6주 책쓰기 프로그램 수료 후 "계속 사용할 수 있나요?"라는 질문에 체계적으로 대응하기 위한 정책 시스템입니다.

### 1.2 핵심 원칙
| 원칙 | 설명 |
|------|------|
| **감사 표현** | 6주간 함께한 수강생에게 무료 혜택 제공 |
| **지속 가치** | 수료 후에도 책 출간까지 지원 |
| **자연스러운 전환** | 압박 없이 유료 가치를 경험하게 함 |
| **명확한 구분** | 무료/유료 범위를 투명하게 안내 |

### 1.3 정책 타임라인
```
[수강 중 1-6주] → [수료 직후] → [무료 기간 3개월] → [구독 전환]
     ↓                ↓               ↓                ↓
  전체 기능        등급 부여       제한적 무료        FREE/PRO/PREMIUM
```

---

## 2. 수강생 등급 시스템

### 2.1 등급 분류

| 등급 | 조건 | 코드 | 상태 |
|------|------|------|------|
| **수강 중** | 1-6주차 진행 중 | `ENROLLED` | active |
| **수료생** | 6주 과정 완료 | `GRADUATED` | active |
| **프리미엄 수료생** | 6주 + 1:1 컨설팅 완료 | `PREMIUM_GRADUATED` | active |
| **무료 구독자** | 무료 기간 중 or FREE 플랜 | `FREE_SUBSCRIBER` | active |
| **유료 구독자** | PRO/PREMIUM 플랜 결제 | `PAID_SUBSCRIBER` | active |
| **휴면** | 6개월 미접속 | `DORMANT` | inactive |
| **탈퇴** | 서비스 탈퇴 | `WITHDRAWN` | inactive |

### 2.2 등급별 권한 매트릭스

| 기능 | 수강 중 | 수료생 (3개월) | FREE | PRO | PREMIUM |
|------|---------|----------------|------|-----|---------|
| 기본 챗봇 FAQ | 무제한 | 무제한 | 무제한 | 무제한 | 무제한 |
| AI 코치 질문 | 주 10-30회 | 월 10회 | 월 5회 | 월 50회 | 무제한 |
| 프롬프트 템플릿 | 전체 27종 | 전체 27종 | 기본 10종 | 전체 + 신규 | 전체 + 신규 + 독점 |
| 과제 피드백 | O | X | X | O | O |
| 1:1 컨설팅 | 2회 무료 | 유료 | 유료 | 월 1회 포함 | 월 4회 포함 |
| 출판사 매칭 | X | X | X | 기본 | 우선 지원 |
| 진도 대시보드 | O | 읽기 전용 | X | O | O |
| 커뮤니티 접근 | O | O | O | O | O + VIP 채널 |

### 2.3 등급 전환 로직

```javascript
// 등급 전환 규칙
const gradeTransitions = {
  ENROLLED: {
    conditions: {
      '6주차 완료': 'GRADUATED',
      '6주차 + 1:1 컨설팅 완료': 'PREMIUM_GRADUATED',
      '중도 포기': 'WITHDRAWN'
    }
  },
  GRADUATED: {
    conditions: {
      '3개월 경과 + 미구독': 'FREE_SUBSCRIBER',
      'PRO 결제': 'PAID_SUBSCRIBER',
      'PREMIUM 결제': 'PAID_SUBSCRIBER'
    }
  },
  PAID_SUBSCRIBER: {
    conditions: {
      '결제 취소': 'FREE_SUBSCRIBER',
      '6개월 미접속': 'DORMANT'
    }
  }
};
```

---

## 3. 수료 후 무료 제공 범위

### 3.1 무료 기간: 수료 후 3개월

#### 제공 혜택
| 기능 | 제공 범위 | 제한 사항 | 비고 |
|------|-----------|-----------|------|
| **기본 챗봇 FAQ** | 무제한 | - | 간단한 질문 자동 응답 |
| **AI 코치 질문** | 월 10회 | 매월 1일 리셋 | 미사용분 이월 불가 |
| **프롬프트 템플릿** | 전체 27종 | 신규 템플릿 제외 | 수강 중 사용한 것 유지 |
| **커뮤니티 접근** | 읽기/쓰기 | - | 졸업생 전용 채널 |
| **학습 자료** | 읽기 전용 | 다운로드 불가 | 6주 커리큘럼 복습 |

#### 제공하지 않는 기능
| 기능 | 사유 | 대안 |
|------|------|------|
| **과제 피드백** | 강사 리소스 소요 | PRO 플랜 전환 시 제공 |
| **1:1 컨설팅** | 고가치 서비스 | 회당 50,000원 유료 |
| **출판사 매칭** | 프리미엄 서비스 | PREMIUM 플랜 |
| **신규 프롬프트** | 구독자 전용 | PRO 플랜 이상 |

### 3.2 사용량 추적 시스템

```
[월간 AI 코치 사용량]

사용: ██████░░░░ 6/10회

남은 횟수: 4회
리셋일: 2026년 2월 1일

[이번 달 질문 기록]
- 01/05: "제목 수정 방법 문의" ✓
- 01/08: "출판사 제안서 양식 질문" ✓
- 01/10: "마케팅 전략 조언" ✓
...
```

### 3.3 무료 기간 종료 처리

| 시점 | 처리 | 알림 |
|------|------|------|
| D-14 | 사전 안내 | 카카오톡 + 이메일 |
| D-7 | 혜택 안내 | 유료 전환 혜택 제안 |
| D-3 | 최종 안내 | 특별 할인 쿠폰 발송 |
| D-1 | 마지막 알림 | 자정 종료 안내 |
| D-Day | 등급 전환 | FREE 플랜으로 자동 전환 |

---

## 4. 유료 구독 플랜 설계

### 4.1 플랜 비교표

| 구분 | FREE | PRO | PREMIUM |
|------|------|-----|---------|
| **가격** | 0원 | 월 29,000원 | 월 99,000원 |
| **연간 결제** | - | 월 24,000원 (17% 할인) | 월 79,000원 (20% 할인) |
| **대상** | 수료생 기본 | 출간 준비 중인 작가 | 전문 작가/다작 작가 |

### 4.2 FREE 플랜 상세

```
===============================================
           FREE 플랜 (수료생 평생 무료)
===============================================

[포함 기능]
- 기본 챗봇 FAQ: 무제한
- AI 코치 질문: 월 5회
- 프롬프트 템플릿: 기본 10종
  1. 제목 생성 프롬프트
  2. 목차 구성 프롬프트
  3. 초안 작성 프롬프트
  4. 문장 교정 프롬프트
  5. 요약문 생성 프롬프트
  6. 블로그 변환 프롬프트
  7. SNS 콘텐츠 프롬프트
  8. 독자 타겟팅 프롬프트
  9. 제안서 작성 프롬프트
  10. FAQ 답변 프롬프트
- 커뮤니티 접근: 기본 채널

[제한 사항]
- 과제 피드백: X
- 1:1 컨설팅: 유료 (회당 50,000원)
- 신규 프롬프트: X
- 출판사 매칭: X
- 고급 분석 리포트: X

[적합한 분]
- 책 출간 완료 후 유지 목적
- 가끔 AI 도움이 필요한 분
- 비용 부담 없이 사용하고 싶은 분
===============================================
```

### 4.3 PRO 플랜 상세

```
===============================================
            PRO 플랜 (월 29,000원)
===============================================

[포함 기능 - FREE의 모든 기능 +]
- AI 코치 질문: 월 50회 (10배 증가)
- 프롬프트 템플릿: 전체 27종 + 매월 신규
- 과제 피드백: 무제한 (AI 자동 피드백)
- 1:1 컨설팅: 월 1회 무료 포함 (30분)
- 출판사 매칭: 기본 서비스
  - 장르별 출판사 추천 10곳
  - 제안 이메일 템플릿
- 진도 대시보드: 전체 기능
- 고급 분석 리포트: 월 1회

[추가 혜택]
- PRO 전용 라이브 세션 (월 1회)
- 신규 프롬프트 우선 접근
- 이메일 우선 응대 (24시간 내)

[적합한 분]
- 현재 책 집필 중인 분
- 출판사 제안 준비 중인 분
- 정기적인 피드백이 필요한 분
- 월 29,000원으로 1:1 컨설팅 1회 포함

===============================================
```

### 4.4 PREMIUM 플랜 상세

```
===============================================
          PREMIUM 플랜 (월 99,000원)
===============================================

[포함 기능 - PRO의 모든 기능 +]
- AI 코치 질문: 무제한
- 1:1 컨설팅: 월 4회 무료 포함 (각 30분)
  * 추가 컨설팅 50% 할인 (25,000원)
- 출판사 매칭: 우선 지원
  - 출판사 담당자 직접 연결
  - 제안서 1:1 검토
  - 계약 협상 조언
- VIP 커뮤니티 채널 접근
- 프리미엄 전용 프롬프트 (독점)
- 고급 분석 리포트: 주 1회
- 전담 매니저 배정

[추가 혜택]
- PREMIUM 전용 오프라인 모임 (분기 1회)
- 출간 도서 홍보 지원
  - SNS 채널 소개
  - 뉴스레터 발송
- 베스트셀러 전략 컨설팅
- 강연/북토크 연결 지원

[적합한 분]
- 전문 작가로 활동 중인 분
- 연 2권 이상 출간 계획이 있는 분
- 집중적인 1:1 지원이 필요한 분
- 출판사 연결이 필요한 분

===============================================
```

### 4.5 플랜별 ROI 분석

```
[PRO 플랜 가치 분석]

포함 서비스 개별 가격:
- 1:1 컨설팅 1회: 50,000원
- AI 코치 50회: 약 25,000원 상당
- 프롬프트 27종: 약 54,000원 상당 (종당 2,000원)
- 출판사 매칭: 약 30,000원 상당

총 가치: 159,000원
결제 금액: 29,000원
━━━━━━━━━━━━━━━━━━━━
절약 금액: 130,000원 (82% 할인)


[PREMIUM 플랜 가치 분석]

포함 서비스 개별 가격:
- 1:1 컨설팅 4회: 200,000원
- AI 코치 무제한: 약 100,000원 상당
- 프롬프트 전체 + 독점: 약 70,000원 상당
- 출판사 우선 매칭: 약 100,000원 상당
- 전담 매니저: 약 50,000원 상당

총 가치: 520,000원
결제 금액: 99,000원
━━━━━━━━━━━━━━━━━━━━
절약 금액: 421,000원 (81% 할인)
```

---

## 5. 전환 유도 시스템

### 5.1 무료 기간 종료 알림

#### D-14 알림

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[안내] 무료 이용 기간 2주 남았습니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

안녕하세요, {이름}님!

6주 책쓰기 프로그램을 함께해 주셔서 감사합니다.

{수료일}에 수료하신 후 제공된 무료 혜택이
2주 후 종료됩니다.

📅 종료일: {종료일}

[현재 이용 현황]
- AI 코치 누적 사용: {사용횟수}회
- 프롬프트 사용: {템플릿수}종
- 마지막 접속: {접속일}

무료 기간 종료 후에도 FREE 플랜으로
기본 기능은 계속 이용하실 수 있습니다.

더 많은 기능이 필요하시면 PRO 플랜을
검토해 보세요!

[PRO 플랜 알아보기] →

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### D-7 알림 (혜택 강조)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[특별 안내] 수료생 전용 혜택 1주일 남았습니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{이름}님, 무료 기간이 7일 남았습니다.

지금까지의 성과를 확인해 보세요!

📊 {이름}님의 활동 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- AI 코치 질문: 총 {질문수}회
- 가장 많이 사용한 프롬프트: {프롬프트명}
- 커뮤니티 활동: {활동수}회
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

무료 기간 종료 전 PRO 플랜 가입 시
특별 혜택을 드립니다!

🎁 첫 달 50% 할인 (29,000원 → 14,500원)
🎁 1:1 컨설팅 1회 추가 증정
🎁 프리미엄 프롬프트 팩 무료 제공

[지금 PRO 가입하기] → (D-7 특별가)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### D-3 알림 (할인 쿠폰)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[긴급] 3일 후 혜택이 변경됩니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{이름}님을 위한 마지막 특별 제안입니다.

📅 무료 기간 종료: {종료일} 자정

종료 후 변경되는 사항:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재                    종료 후
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI 코치 월 10회    →    월 5회
프롬프트 27종      →    10종
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎫 특별 할인 쿠폰 발급!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
쿠폰 코드: GRAD-{USER_ID}-50
할인율: 첫 3개월 50% 할인
유효기간: {종료일}까지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRO 3개월: 87,000원 → 43,500원
PREMIUM 3개월: 297,000원 → 148,500원

[쿠폰 사용하기] →

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### D-1 알림 (최종)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[최종 안내] 내일 자정 무료 기간이 종료됩니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{이름}님, 마지막 알림입니다.

내일({종료일}) 자정(00:00) 이후:
- AI 코치 월 10회 → 5회로 축소
- 프롬프트 27종 → 10종으로 축소

오늘까지 결정하시면:
🎁 첫 3개월 50% 할인 유지
🎁 추가 혜택 모두 적용

할인 쿠폰: GRAD-{USER_ID}-50
(오늘 자정까지만 유효)

[마지막 기회! PRO 가입하기] →

PS. 무료로 계속 이용하셔도 괜찮습니다.
    FREE 플랜으로 자동 전환되며,
    언제든 업그레이드하실 수 있습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5.2 인앱 전환 유도 UI

#### AI 코치 사용량 알림

```
┌─────────────────────────────────────────┐
│ 💬 AI 코치 사용량                        │
├─────────────────────────────────────────┤
│                                         │
│   이번 달 사용: 8/10회                   │
│   ████████░░                            │
│                                         │
│   남은 횟수: 2회                         │
│   리셋일: 2월 1일                        │
│                                         │
├─────────────────────────────────────────┤
│ PRO 플랜으로 업그레이드하면               │
│ 월 50회까지 사용할 수 있어요!            │
│                                         │
│     [PRO 플랜 알아보기]                  │
└─────────────────────────────────────────┘
```

#### 사용 한도 도달 시

```
┌─────────────────────────────────────────┐
│ ⚠️ 이번 달 AI 코치 사용량을 모두         │
│    사용했습니다                          │
├─────────────────────────────────────────┤
│                                         │
│   사용: 10/10회 ✓                        │
│   ██████████                            │
│                                         │
│   다음 리셋: 2월 1일 (21일 후)           │
│                                         │
├─────────────────────────────────────────┤
│ 지금 PRO로 업그레이드하면                 │
│ 즉시 40회 추가 사용 가능!                │
│                                         │
│ 첫 달 50% 할인: 14,500원                 │
│                                         │
│  [업그레이드] [다음 달까지 기다리기]      │
└─────────────────────────────────────────┘
```

### 5.3 할인 쿠폰 시스템

| 쿠폰 유형 | 할인율 | 적용 대상 | 유효기간 | 발급 조건 |
|-----------|--------|-----------|----------|-----------|
| `GRAD-50` | 50% | 첫 달 | 무료기간 종료일 | 수료생 전원 |
| `GRAD3-50` | 50% | 첫 3개월 | 무료기간 종료 3일전 | 활성 사용자 |
| `COMEBACK-30` | 30% | 첫 달 | 7일 | 휴면 복귀자 |
| `ANNUAL-20` | 20% | 연간 결제 | 상시 | 전체 |
| `REFERRAL-30` | 30% | 첫 달 | 30일 | 추천인/피추천인 |

### 5.4 전환율 목표

| 전환 경로 | 목표 전환율 | 측정 방법 |
|-----------|-------------|-----------|
| 수료생 → FREE | 95% | 자동 전환 |
| FREE → PRO | 15% | 3개월 내 |
| FREE → PREMIUM | 3% | 3개월 내 |
| PRO → PREMIUM | 10% | 6개월 내 |
| 이탈 방지 | 85% | 12개월 유지율 |

---

## 6. 데이터베이스 스키마

### 6.1 사용자 테이블 확장

```sql
-- 기존 users 테이블 확장
ALTER TABLE users ADD COLUMN (
    -- 등급 관련
    user_grade ENUM('ENROLLED', 'GRADUATED', 'PREMIUM_GRADUATED',
                    'FREE_SUBSCRIBER', 'PAID_SUBSCRIBER',
                    'DORMANT', 'WITHDRAWN') DEFAULT 'ENROLLED',
    grade_updated_at TIMESTAMP,

    -- 수강 관련
    enrollment_date DATE,           -- 수강 시작일
    graduation_date DATE,           -- 수료일
    free_period_end_date DATE,      -- 무료 기간 종료일 (수료일 + 90일)

    -- 컨설팅 관련
    consulting_sessions_used INT DEFAULT 0,    -- 사용한 1:1 컨설팅 횟수
    consulting_sessions_total INT DEFAULT 2,   -- 총 무료 컨설팅 횟수

    -- 구독 관련
    subscription_id INT REFERENCES subscriptions(id),
    subscription_status ENUM('none', 'active', 'cancelled', 'expired') DEFAULT 'none'
);

-- 인덱스 추가
CREATE INDEX idx_user_grade ON users(user_grade);
CREATE INDEX idx_free_period_end ON users(free_period_end_date);
CREATE INDEX idx_subscription_status ON users(subscription_status);
```

### 6.2 구독 테이블

```sql
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(id),

    -- 플랜 정보
    plan_type ENUM('FREE', 'PRO', 'PREMIUM') NOT NULL,
    billing_cycle ENUM('monthly', 'annual') DEFAULT 'monthly',

    -- 가격 정보
    base_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,

    -- 기간 정보
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_billing_date DATE,

    -- 상태 정보
    status ENUM('active', 'cancelled', 'expired', 'suspended') DEFAULT 'active',
    cancellation_date DATE,
    cancellation_reason TEXT,

    -- 결제 정보
    payment_method_id INT REFERENCES payment_methods(id),
    last_payment_date DATE,
    last_payment_amount DECIMAL(10, 2),

    -- 쿠폰 정보
    coupon_code VARCHAR(50),
    coupon_discount_percent INT,

    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_subscription (user_id),
    INDEX idx_plan_type (plan_type),
    INDEX idx_status (status),
    INDEX idx_next_billing (next_billing_date)
);
```

### 6.3 사용량 추적 테이블

```sql
CREATE TABLE usage_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(id),

    -- 기간 정보
    period_year INT NOT NULL,
    period_month INT NOT NULL,
    period_week INT,  -- 수강 중일 때만 사용

    -- AI 코치 사용량
    ai_coach_used INT DEFAULT 0,
    ai_coach_limit INT NOT NULL,

    -- 프롬프트 사용량
    prompts_used JSON,  -- {"prompt_id": count, ...}

    -- 기타 사용량
    faq_queries INT DEFAULT 0,
    consulting_sessions INT DEFAULT 0,

    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_period (user_id, period_year, period_month),
    INDEX idx_user_usage (user_id),
    INDEX idx_period (period_year, period_month)
);

-- 상세 사용 로그
CREATE TABLE usage_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(id),

    -- 사용 정보
    usage_type ENUM('ai_coach', 'prompt', 'faq', 'consulting', 'feature') NOT NULL,
    usage_detail VARCHAR(100),  -- 프롬프트 ID, 기능명 등

    -- 요청/응답 정보
    request_summary TEXT,
    response_summary TEXT,
    tokens_used INT,

    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),

    INDEX idx_user_logs (user_id),
    INDEX idx_usage_type (usage_type),
    INDEX idx_created_at (created_at)
);
```

### 6.4 쿠폰 테이블

```sql
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- 쿠폰 정보
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- 할인 정보
    discount_type ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,

    -- 적용 조건
    applicable_plans JSON,  -- ["PRO", "PREMIUM"]
    applicable_billing_cycles JSON,  -- ["monthly", "annual"]
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,

    -- 사용 제한
    max_uses INT,
    current_uses INT DEFAULT 0,
    max_uses_per_user INT DEFAULT 1,

    -- 기간 제한
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,

    -- 대상 제한
    target_user_grades JSON,  -- ["GRADUATED", "FREE_SUBSCRIBER"]

    -- 상태
    is_active BOOLEAN DEFAULT TRUE,

    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES admin_users(id),

    INDEX idx_code (code),
    INDEX idx_valid_period (valid_from, valid_until),
    INDEX idx_active (is_active)
);

-- 쿠폰 사용 내역
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL REFERENCES coupons(id),
    user_id INT NOT NULL REFERENCES users(id),
    subscription_id INT REFERENCES subscriptions(id),

    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discount_applied DECIMAL(10, 2),

    UNIQUE KEY unique_coupon_user (coupon_id, user_id),
    INDEX idx_coupon_usage (coupon_id),
    INDEX idx_user_coupon (user_id)
);
```

### 6.5 알림 테이블

```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(id),

    -- 알림 정보
    notification_type ENUM(
        'free_period_d14', 'free_period_d7', 'free_period_d3', 'free_period_d1',
        'usage_limit_warning', 'usage_limit_reached',
        'subscription_renewed', 'subscription_expiring', 'subscription_expired',
        'coupon_issued', 'coupon_expiring',
        'grade_changed', 'feature_unlocked'
    ) NOT NULL,

    -- 내용
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    -- 전송 채널
    channel ENUM('email', 'kakao', 'push', 'in_app') NOT NULL,

    -- 상태
    status ENUM('pending', 'sent', 'failed', 'read') DEFAULT 'pending',
    sent_at TIMESTAMP,
    read_at TIMESTAMP,

    -- 관련 데이터
    related_data JSON,  -- {"coupon_code": "xxx", "discount": 50, ...}

    -- 메타 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP,

    INDEX idx_user_notifications (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at)
);
```

---

## 7. API 엔드포인트 설계

### 7.1 사용자 등급 API

```
GET /api/v1/users/{userId}/grade
Response:
{
    "user_id": 12345,
    "grade": "GRADUATED",
    "grade_label": "수료생",
    "graduation_date": "2026-01-01",
    "free_period_end_date": "2026-04-01",
    "days_remaining": 81,
    "permissions": {
        "ai_coach_limit": 10,
        "prompts_access": "full_27",
        "consulting_available": true,
        "consulting_price": 50000
    }
}
```

### 7.2 사용량 API

```
GET /api/v1/users/{userId}/usage
Response:
{
    "period": "2026-01",
    "ai_coach": {
        "used": 6,
        "limit": 10,
        "remaining": 4,
        "reset_date": "2026-02-01"
    },
    "prompts": {
        "total_used": 45,
        "by_type": {
            "title_generator": 12,
            "outline_builder": 8,
            ...
        }
    },
    "faq_queries": 23,
    "consulting_sessions": {
        "used": 2,
        "total": 2,
        "additional_price": 50000
    }
}

POST /api/v1/users/{userId}/usage/ai-coach
Request:
{
    "question": "제목 수정 방법",
    "context": "..."
}
Response:
{
    "success": true,
    "usage": {
        "used": 7,
        "limit": 10,
        "remaining": 3
    },
    "response": "..."
}
// OR
{
    "success": false,
    "error": "usage_limit_reached",
    "message": "이번 달 사용량을 모두 소진했습니다.",
    "upgrade_options": [...]
}
```

### 7.3 구독 API

```
GET /api/v1/subscriptions/plans
Response:
{
    "plans": [
        {
            "type": "FREE",
            "name": "FREE 플랜",
            "price": 0,
            "features": [...],
            "limits": {...}
        },
        {
            "type": "PRO",
            "name": "PRO 플랜",
            "monthly_price": 29000,
            "annual_price": 288000,
            "annual_monthly_equivalent": 24000,
            "features": [...],
            "limits": {...}
        },
        {
            "type": "PREMIUM",
            "name": "PREMIUM 플랜",
            "monthly_price": 99000,
            "annual_price": 948000,
            "annual_monthly_equivalent": 79000,
            "features": [...],
            "limits": {...}
        }
    ]
}

POST /api/v1/users/{userId}/subscriptions
Request:
{
    "plan_type": "PRO",
    "billing_cycle": "monthly",
    "coupon_code": "GRAD-12345-50",
    "payment_method_id": 1
}
Response:
{
    "success": true,
    "subscription": {
        "id": 100,
        "plan_type": "PRO",
        "start_date": "2026-01-10",
        "end_date": "2026-02-10",
        "original_price": 29000,
        "discount_applied": 14500,
        "final_price": 14500
    }
}

DELETE /api/v1/users/{userId}/subscriptions/{subscriptionId}
Request:
{
    "reason": "비용 문제",
    "feedback": "..."
}
Response:
{
    "success": true,
    "subscription": {
        "status": "cancelled",
        "effective_until": "2026-02-10",
        "downgrade_to": "FREE"
    }
}
```

### 7.4 쿠폰 API

```
GET /api/v1/users/{userId}/coupons
Response:
{
    "available_coupons": [
        {
            "code": "GRAD-12345-50",
            "name": "수료생 50% 할인",
            "discount_type": "percent",
            "discount_value": 50,
            "valid_until": "2026-04-01",
            "applicable_plans": ["PRO", "PREMIUM"]
        }
    ]
}

POST /api/v1/coupons/validate
Request:
{
    "code": "GRAD-12345-50",
    "user_id": 12345,
    "plan_type": "PRO",
    "billing_cycle": "monthly"
}
Response:
{
    "valid": true,
    "discount_type": "percent",
    "discount_value": 50,
    "original_price": 29000,
    "final_price": 14500
}
// OR
{
    "valid": false,
    "error": "coupon_expired",
    "message": "쿠폰 유효기간이 만료되었습니다."
}
```

---

## 8. 알림 메시지 템플릿

### 8.1 카카오톡 알림톡 템플릿

#### 수료 축하 메시지

```
[책쓰기 AI] 수료를 축하합니다!

#{이름}님, 6주 프로그램을 완주하셨습니다!

지금까지의 성과:
- 작성한 챕터: #{챕터수}개
- AI 코치 질문: #{질문수}회
- 총 작성 분량: #{분량}자

앞으로 3개월간 무료로 서비스를
이용하실 수 있습니다.

무료 기간: #{수료일} ~ #{종료일}

[내 대시보드 바로가기]

책 출간까지 함께 응원하겠습니다!
```

#### 무료 기간 종료 알림 (D-7)

```
[책쓰기 AI] 무료 기간 7일 남았습니다

#{이름}님, 수료생 무료 혜택이
7일 후 종료됩니다.

종료 예정일: #{종료일}

지금 PRO 플랜 가입 시 특별 혜택:
- 첫 달 50% 할인 (14,500원)
- 1:1 컨설팅 1회 추가 증정

쿠폰 코드: #{쿠폰코드}

[PRO 플랜 가입하기]
```

### 8.2 이메일 템플릿

#### 수료 후 정책 안내 이메일

```html
제목: [책쓰기 AI] #{이름}님, 수료 축하드립니다! 앞으로의 혜택 안내

안녕하세요, #{이름}님!

6주간의 책쓰기 여정을 완주하신 것을 진심으로 축하드립니다!

## 수료생 혜택 안내

### 무료 이용 기간 (3개월)
#{수료일}부터 #{종료일}까지 다음 혜택을 무료로 이용하실 수 있습니다:

- 기본 챗봇 FAQ: 무제한
- AI 코치 질문: 월 10회
- 프롬프트 템플릿: 전체 27종
- 졸업생 커뮤니티: 접근 가능

### 무료 기간 종료 후
FREE 플랜으로 자동 전환되어 기본 기능은 계속 이용 가능합니다.

더 많은 기능이 필요하시면 PRO 플랜을 검토해 보세요!

[혜택 자세히 보기]

앞으로도 #{이름}님의 책 출간을 응원합니다!

책쓰기 AI 팀 드림
```

---

## 9. FAQ 대응 스크립트

### 9.1 자주 묻는 질문과 답변

#### Q1: 6주 과정 끝나면 계속 쓸 수 있나요?

```
네, 물론입니다!

6주 과정을 완료하시면 수료생 등급이 되어
3개월간 무료로 계속 이용하실 수 있습니다.

무료 제공 범위:
- 기본 챗봇 FAQ: 무제한
- AI 코치 질문: 월 10회
- 프롬프트 템플릿: 전체 27종

3개월 후에는 FREE 플랜(무료)으로 전환되며,
기본 기능은 평생 무료로 이용 가능합니다.

더 많은 기능이 필요하시면 PRO/PREMIUM 플랜도 있습니다.

[플랜 비교표 보기]
```

#### Q2: 무료로 쓸 수 있는 건 뭐예요?

```
수료생께서 무료로 이용하실 수 있는 기능입니다:

[수료 후 3개월 무료 기간]
- 기본 챗봇 FAQ: 무제한
- AI 코치 질문: 월 10회
- 프롬프트 템플릿: 전체 27종
- 졸업생 커뮤니티: 접근 가능
- 학습 자료: 복습 가능

[3개월 후 FREE 플랜]
- 기본 챗봇 FAQ: 무제한
- AI 코치 질문: 월 5회
- 프롬프트 템플릿: 기본 10종
- 커뮤니티: 접근 가능

유료로만 이용 가능한 기능:
- 과제 피드백 (PRO 이상)
- 1:1 컨설팅 (회당 50,000원 또는 PRO 이상)
- 출판사 매칭 (PRO 이상)
```

#### Q3: 유료 플랜은 얼마예요?

```
유료 플랜 가격 안내입니다:

[PRO 플랜]
- 월 결제: 29,000원/월
- 연 결제: 24,000원/월 (17% 할인)

포함 기능:
- AI 코치 월 50회
- 프롬프트 전체 + 신규
- 1:1 컨설팅 월 1회 무료
- 과제 피드백 무제한

[PREMIUM 플랜]
- 월 결제: 99,000원/월
- 연 결제: 79,000원/월 (20% 할인)

포함 기능:
- AI 코치 무제한
- 1:1 컨설팅 월 4회 무료
- 출판사 우선 매칭
- VIP 커뮤니티
- 전담 매니저

수료생 전용 할인 쿠폰도 있으니 확인해 보세요!

[내 쿠폰 확인하기]
```

#### Q4: 1:1 컨설팅은 어떻게 받아요?

```
1:1 컨설팅 이용 방법입니다:

[수강 중]
- 무료 2회 제공
- 추가 이용: 회당 50,000원

[수료 후 - FREE 플랜]
- 무료 제공 없음
- 회당 50,000원

[PRO 플랜]
- 월 1회 무료 포함
- 추가: 회당 50,000원

[PREMIUM 플랜]
- 월 4회 무료 포함
- 추가: 회당 25,000원 (50% 할인)

예약 방법:
1. [내 계정] > [1:1 컨설팅] 메뉴
2. 원하는 일정 선택
3. 상담 주제 작성
4. 예약 완료

[컨설팅 예약하기]
```

#### Q5: AI 코치 횟수를 다 썼어요

```
이번 달 AI 코치 사용량을 모두 소진하셨습니다.

현재 상태:
- 사용: #{사용횟수}/#{제한횟수}회
- 다음 리셋: #{리셋일}

선택 가능한 옵션:

1. 다음 달까지 기다리기
   - #{리셋일}에 자동 리셋됩니다

2. PRO 플랜으로 업그레이드
   - 즉시 40회 추가 사용 가능
   - 월 29,000원 (첫 달 50% 할인 적용 가능)

3. 기본 챗봇 이용
   - FAQ 답변은 무제한으로 가능합니다

[PRO 플랜 알아보기]
```

### 9.2 챗봇 대응 로직

```javascript
// FAQ 자동 분류 및 응답 로직
const faqResponses = {
  patterns: [
    {
      keywords: ['끝나', '종료', '완료', '계속', '써도'],
      intent: 'post_course_usage',
      response: 'Q1_TEMPLATE'
    },
    {
      keywords: ['무료', '공짜', '비용없이'],
      intent: 'free_features',
      response: 'Q2_TEMPLATE'
    },
    {
      keywords: ['얼마', '가격', '요금', '비용', '플랜'],
      intent: 'pricing',
      response: 'Q3_TEMPLATE'
    },
    {
      keywords: ['1:1', '컨설팅', '상담', '코칭'],
      intent: 'consulting',
      response: 'Q4_TEMPLATE'
    },
    {
      keywords: ['횟수', '다 썼', '소진', '제한'],
      intent: 'usage_limit',
      response: 'Q5_TEMPLATE'
    }
  ],

  fallback: {
    message: '질문을 이해하지 못했습니다. 더 구체적으로 말씀해 주시거나, 아래 카테고리에서 선택해 주세요.',
    options: [
      '수료 후 이용 정책',
      '무료 기능 안내',
      '유료 플랜 가격',
      '1:1 컨설팅',
      '기타 문의'
    ]
  }
};
```

---

## 10. 구현 체크리스트

### 10.1 Phase 1: 기본 시스템 (2주)

#### 데이터베이스
- [ ] users 테이블 컬럼 추가 (등급, 수료일 등)
- [ ] subscriptions 테이블 생성
- [ ] usage_tracking 테이블 생성
- [ ] usage_logs 테이블 생성
- [ ] coupons, coupon_usage 테이블 생성
- [ ] notifications 테이블 생성
- [ ] 마이그레이션 스크립트 작성

#### 백엔드 API
- [ ] 사용자 등급 조회 API
- [ ] 사용량 조회/기록 API
- [ ] 구독 플랜 조회 API
- [ ] 사용량 제한 미들웨어
- [ ] 등급 전환 스케줄러

### 10.2 Phase 2: 구독 시스템 (2주)

#### 결제 연동
- [ ] 결제 게이트웨이 연동 (토스페이먼츠/카카오페이)
- [ ] 구독 생성 API
- [ ] 구독 취소 API
- [ ] 자동 결제 갱신 로직
- [ ] 결제 실패 재시도 로직

#### 쿠폰 시스템
- [ ] 쿠폰 생성 관리자 API
- [ ] 쿠폰 검증 API
- [ ] 쿠폰 적용 로직
- [ ] 자동 쿠폰 발급 (수료생)

### 10.3 Phase 3: 알림 시스템 (1주)

#### 알림 발송
- [ ] 카카오 알림톡 연동
- [ ] 이메일 발송 연동
- [ ] 인앱 푸시 알림
- [ ] 알림 스케줄러 (D-14, D-7, D-3, D-1)

#### 관리자 기능
- [ ] 알림 템플릿 관리
- [ ] 발송 이력 조회
- [ ] 수동 알림 발송

### 10.4 Phase 4: 프론트엔드 (2주)

#### 사용자 UI
- [ ] 내 등급 현황 페이지
- [ ] 사용량 대시보드
- [ ] 플랜 비교 페이지
- [ ] 구독 관리 페이지
- [ ] 결제 페이지
- [ ] 인앱 알림 UI

#### 전환 유도 UI
- [ ] 사용량 경고 모달
- [ ] 업그레이드 유도 배너
- [ ] 쿠폰 적용 UI

### 10.5 Phase 5: 테스트 및 최적화 (1주)

#### 테스트
- [ ] 등급 전환 테스트
- [ ] 결제 플로우 테스트
- [ ] 쿠폰 적용 테스트
- [ ] 알림 발송 테스트
- [ ] 사용량 제한 테스트

#### 모니터링
- [ ] 전환율 대시보드
- [ ] 사용량 분석 리포트
- [ ] 이탈률 모니터링
- [ ] 수익 현황 대시보드

---

## 부록: 플랜별 상세 기능 매트릭스

| 기능 카테고리 | 세부 기능 | FREE | PRO | PREMIUM |
|---------------|-----------|------|-----|---------|
| **AI 코치** | 월간 질문 횟수 | 5회 | 50회 | 무제한 |
| | 응답 품질 | 기본 | 상세 | 프리미엄 |
| | 우선 응답 | X | O | O |
| **프롬프트** | 기본 템플릿 (10종) | O | O | O |
| | 고급 템플릿 (17종) | X | O | O |
| | 신규 템플릿 | X | O | O |
| | 독점 템플릿 | X | X | O |
| **피드백** | 과제 AI 피드백 | X | O | O |
| | 원고 분석 리포트 | X | 월 1회 | 주 1회 |
| **컨설팅** | 포함 횟수 | 0회 | 1회/월 | 4회/월 |
| | 추가 비용 | 50,000원 | 50,000원 | 25,000원 |
| **출판사 매칭** | 추천 리스트 | X | 10곳 | 무제한 |
| | 직접 연결 | X | X | O |
| | 계약 조언 | X | X | O |
| **커뮤니티** | 기본 채널 | O | O | O |
| | PRO 전용 채널 | X | O | O |
| | VIP 채널 | X | X | O |
| **이벤트** | 라이브 세션 | X | 월 1회 | 월 1회 |
| | 오프라인 모임 | X | X | 분기 1회 |
| **지원** | 이메일 응대 | 72시간 | 24시간 | 12시간 |
| | 전담 매니저 | X | X | O |

---

## 문서 정보

- **작성일**: 2026-01-10
- **버전**: 1.0
- **작성자**: Book Writing AI Team
- **참고 문서**: webapp/AUTOMATION_STRATEGY.md
- **다음 검토일**: 2026-02-10

---

*이 문서는 6주 책쓰기 프로그램 수료 후 이용 정책의 공식 가이드라인입니다.*
