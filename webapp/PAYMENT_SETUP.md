# 토스페이먼츠 결제 시스템 연동 가이드

## 목차
1. [개요](#개요)
2. [구독 플랜](#구독-플랜)
3. [결제 플로우](#결제-플로우)
4. [API 엔드포인트](#api-엔드포인트)
5. [환경 설정](#환경-설정)
6. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
7. [사용 방법](#사용-방법)
8. [Webhook 설정](#webhook-설정)

---

## 개요

이 프로젝트는 **토스페이먼츠(Toss Payments)**를 사용하여 구독 기반 결제 시스템을 구현했습니다.

### 주요 기능
- ✅ 구독 플랜 관리 (FREE, PRO, PREMIUM)
- ✅ 결제 생성/승인/취소
- ✅ 결제 내역 조회
- ✅ Webhook을 통한 결제 상태 자동 업데이트
- ✅ 6주 수료 후 3개월 무료 혜택

---

## 구독 플랜

### FREE 플랜
- **가격**: 무료
- **혜택**:
  - 6주 수료 후 3개월 무료
  - AI 코치 월 10회
  - 프로젝트 1개
  - 기본 프롬프트 템플릿

### PRO 플랜
- **가격**: 29,000원/월
- **혜택**:
  - AI 코치 월 50회
  - 프로젝트 5개
  - 모든 프롬프트 템플릿
  - 우선 고객 지원

### PREMIUM 플랜
- **가격**: 59,000원/월
- **혜택**:
  - AI 코치 무제한
  - 프로젝트 무제한
  - 모든 프롬프트 템플릿
  - 1:1 전담 컨설팅
  - 출판사 연결 지원

---

## 결제 플로우

### 1. 사용자가 플랜 선택
```
/pricing → 플랜 선택 → /payment?plan=PRO
```

### 2. 결제 위젯 표시
```typescript
// PaymentWidget 컴포넌트가 자동으로 로드됨
- 토스페이먼츠 위젯 초기화
- 사용자 정보 자동 입력
- 결제 수단 선택
```

### 3. 결제 요청
```typescript
POST /api/payment/create
{
  "plan": "PRO",
  "amount": 29000,
  "orderName": "프로 플랜 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}

Response:
{
  "orderId": "order_1234567890_abc123",
  "amount": 29000,
  "orderName": "프로 플랜 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}
```

### 4. 토스페이먼츠로 리다이렉트
- 사용자가 결제 정보 입력
- 결제 승인 또는 취소

### 5. 결제 승인
```typescript
// 성공 시: /payment/success?paymentKey=xxx&orderId=xxx&amount=xxx

POST /api/payment/confirm
{
  "paymentKey": "xxx",
  "orderId": "order_1234567890_abc123",
  "amount": 29000
}

// 백엔드에서 토스페이먼츠 API 호출하여 최종 승인
// 승인 성공 시 구독 생성 또는 업데이트
```

### 6. 결제 실패
```
/payment/fail?code=xxx&message=xxx
```

---

## API 엔드포인트

### 결제 API

#### 1. 결제 생성
```http
POST /api/payment/create
Content-Type: application/json

{
  "plan": "PRO",
  "amount": 29000,
  "orderName": "프로 플랜 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}
```

**Response:**
```json
{
  "orderId": "order_1234567890_abc123",
  "amount": 29000,
  "orderName": "프로 플랜 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}
```

#### 2. 결제 승인
```http
POST /api/payment/confirm
Content-Type: application/json

{
  "paymentKey": "payment_key_xxx",
  "orderId": "order_1234567890_abc123",
  "amount": 29000
}
```

**Response:**
```json
{
  "id": "payment_id",
  "orderId": "order_1234567890_abc123",
  "orderName": "프로 플랜 구독",
  "amount": 29000,
  "status": "COMPLETED",
  "method": "카드",
  "approvedAt": "2024-01-10T12:00:00.000Z",
  "receiptUrl": "https://..."
}
```

#### 3. 결제 취소
```http
POST /api/payment/cancel
Content-Type: application/json

{
  "paymentId": "payment_id",
  "cancelReason": "단순 변심"
}
```

#### 4. 결제 조회
```http
GET /api/payment/{id}
```

#### 5. 결제 내역 목록
```http
GET /api/payment/list
```

### 구독 API

#### 1. 현재 구독 조회
```http
GET /api/subscription
```

**Response:**
```json
{
  "id": "subscription_id",
  "userId": "user_id",
  "plan": "PRO",
  "status": "ACTIVE",
  "startDate": "2024-01-10T00:00:00.000Z",
  "endDate": "2024-02-10T00:00:00.000Z",
  "autoRenew": true,
  "createdAt": "2024-01-10T00:00:00.000Z"
}
```

#### 2. 구독 변경
```http
POST /api/subscription/change
Content-Type: application/json

{
  "plan": "PREMIUM"
}
```

#### 3. 구독 취소
```http
POST /api/subscription/cancel
```

### Webhook API

#### 토스페이먼츠 Webhook
```http
POST /api/webhook/toss
Content-Type: application/json

{
  "eventType": "PAYMENT_APPROVED",
  "data": {
    "orderId": "order_1234567890_abc123",
    "paymentKey": "payment_key_xxx",
    "method": "카드",
    "approvedAt": "2024-01-10T12:00:00.000Z"
  }
}
```

**지원하는 이벤트:**
- `PAYMENT_APPROVED`: 결제 승인
- `PAYMENT_CANCELLED`: 결제 취소
- `PAYMENT_FAILED`: 결제 실패
- `VIRTUAL_ACCOUNT_ISSUED`: 가상계좌 발급
- `VIRTUAL_ACCOUNT_DEPOSIT`: 가상계좌 입금

---

## 환경 설정

### 1. 토스페이먼츠 가입
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 로그인
3. 애플리케이션 생성
4. 클라이언트 키와 시크릿 키 발급

### 2. 환경 변수 설정
`.env.local` 파일에 다음 내용 추가:

```bash
# Payment (Toss Payments)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_xxxxxxxxxxxxxxxxxxxx"
TOSS_SECRET_KEY="test_sk_xxxxxxxxxxxxxxxxxxxx"
TOSS_SUCCESS_URL="http://localhost:3000/payment/success"
TOSS_FAIL_URL="http://localhost:3000/payment/fail"
```

**주의사항:**
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 브라우저에서 사용 (Public)
- `TOSS_SECRET_KEY`: 서버에서만 사용 (Private, 절대 노출 금지)
- 테스트 키는 `test_` 접두사, 운영 키는 `live_` 접두사

### 3. 테스트 카드 번호
토스페이먼츠 테스트 환경에서 사용 가능한 카드 번호:
- **성공**: `1234-1234-1234-1234`
- **실패**: `1234-1234-1234-5678`
- CVC: 아무 숫자
- 유효기간: 미래 날짜

---

## 데이터베이스 마이그레이션

### 1. Prisma 스키마 변경 적용
```bash
# webapp 디렉토리에서 실행
npx prisma migrate dev --name add_payment_subscription

# 또는 프로덕션 환경
npx prisma migrate deploy
```

### 2. Prisma Client 재생성
```bash
npx prisma generate
```

### 3. 데이터베이스 확인
```bash
npx prisma studio
```

---

## 사용 방법

### 1. 개발 서버 시작
```bash
cd webapp
npm install
npm run dev
```

### 2. 결제 테스트
1. `http://localhost:3000/pricing` 접속
2. 플랜 선택
3. 결제 정보 입력 (테스트 카드 사용)
4. 결제 승인 확인

### 3. 결제 내역 확인
1. `http://localhost:3000/payment/history` 접속
2. 결제 내역 및 구독 정보 확인
3. 필요시 결제 취소 가능

---

## Webhook 설정

### 1. 로컬 개발 환경
로컬 환경에서 Webhook을 테스트하려면 **ngrok** 사용:

```bash
# ngrok 설치
npm install -g ngrok

# ngrok 실행
ngrok http 3000

# 출력된 URL을 토스페이먼츠 개발자센터에 등록
# 예: https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/api/webhook/toss
```

### 2. 토스페이먼츠 Webhook 등록
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 로그인
2. 애플리케이션 선택
3. Webhook 설정 메뉴 진입
4. Webhook URL 등록: `https://your-domain.com/api/webhook/toss`
5. 이벤트 선택:
   - 결제 승인
   - 결제 취소
   - 결제 실패
   - 가상계좌 발급
   - 가상계좌 입금

### 3. Webhook 보안
Webhook 요청의 진위 여부를 확인하려면 토스페이먼츠에서 제공하는 서명 검증 사용:

```typescript
// 향후 추가 가능
import crypto from 'crypto'

function verifyWebhookSignature(payload: string, signature: string, secret: string) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return hash === signature
}
```

---

## 주요 파일 구조

```
webapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── payment/
│   │   │   │   ├── create/route.ts      # 결제 생성
│   │   │   │   ├── confirm/route.ts     # 결제 승인
│   │   │   │   ├── cancel/route.ts      # 결제 취소
│   │   │   │   ├── list/route.ts        # 결제 목록
│   │   │   │   └── [id]/route.ts        # 결제 조회
│   │   │   ├── subscription/
│   │   │   │   ├── route.ts             # 구독 조회
│   │   │   │   ├── change/route.ts      # 구독 변경
│   │   │   │   └── cancel/route.ts      # 구독 취소
│   │   │   └── webhook/
│   │   │       └── toss/route.ts        # Webhook 처리
│   │   ├── payment/
│   │   │   ├── page.tsx                 # 결제 페이지
│   │   │   ├── success/page.tsx         # 결제 성공 페이지
│   │   │   ├── fail/page.tsx            # 결제 실패 페이지
│   │   │   └── history/page.tsx         # 결제 내역 페이지
│   │   └── pricing/page.tsx             # 요금제 페이지
│   ├── components/
│   │   └── payment/
│   │       ├── PaymentWidget.tsx        # 결제 위젯
│   │       └── PricingCard.tsx          # 요금제 카드
│   ├── lib/
│   │   └── toss.ts                      # 토스페이먼츠 API 클라이언트
│   └── types/
│       └── payment.ts                   # 결제 타입 정의
├── prisma/
│   └── schema.prisma                    # 데이터베이스 스키마
└── .env.example                         # 환경 변수 예제
```

---

## 트러블슈팅

### 1. 결제 위젯이 로드되지 않음
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- 네트워크 탭에서 토스페이먼츠 스크립트 로딩 확인

### 2. 결제 승인 실패
- `TOSS_SECRET_KEY`가 올바르게 설정되었는지 확인
- 결제 금액이 일치하는지 확인
- 서버 로그 확인

### 3. Webhook이 작동하지 않음
- Webhook URL이 올바르게 등록되었는지 확인
- 서버가 외부에서 접근 가능한지 확인 (로컬 환경이면 ngrok 사용)
- 토스페이먼츠 개발자센터에서 Webhook 로그 확인

### 4. 데이터베이스 오류
- Prisma 마이그레이션이 완료되었는지 확인
- `DATABASE_URL`이 올바르게 설정되었는지 확인
- Prisma Client가 최신 버전으로 생성되었는지 확인

---

## 참고 자료

- [토스페이먼츠 개발자 문서](https://docs.tosspayments.com/)
- [토스페이먼츠 결제위젯 SDK](https://docs.tosspayments.com/reference/widget-sdk)
- [토스페이먼츠 API 레퍼런스](https://docs.tosspayments.com/reference)
- [Prisma 문서](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
