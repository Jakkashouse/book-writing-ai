# 토스페이먼츠 결제 시스템 연동 완료 요약

## 작업 완료 내역

### 1. 데이터베이스 스키마 업데이트
- **파일**: `C:\Users\JUN\my-first-project\book-writing-ai\webapp\prisma\schema.prisma`
- **변경사항**:
  - 구독 플랜: `BASIC` → `PRO`로 변경, `PREMIUM` 추가
  - `Payment` 모델에 필드 추가: `subscriptionId`, `cancelReason`, `cancelledAt`, `failReason`, `receiptUrl`, `metadata`
  - `Subscription` 모델에 필드 추가: `trialEndsAt`, `billingCycleStart`, `billingCycleEnd`, `cancelledAt`

### 2. 결제 API 라우트 (8개)
1. **POST** `/api/payment/create` - 결제 생성
2. **POST** `/api/payment/confirm` - 결제 승인
3. **POST** `/api/payment/cancel` - 결제 취소
4. **GET** `/api/payment/[id]` - 결제 조회
5. **GET** `/api/payment/list` - 결제 내역 목록
6. **GET** `/api/subscription` - 구독 조회
7. **POST** `/api/subscription/change` - 구독 변경
8. **POST** `/api/subscription/cancel` - 구독 취소

### 3. Webhook 처리
- **파일**: `/api/webhook/toss/route.ts`
- **지원 이벤트**:
  - `PAYMENT_APPROVED` - 결제 승인
  - `PAYMENT_CANCELLED` - 결제 취소
  - `PAYMENT_FAILED` - 결제 실패
  - `VIRTUAL_ACCOUNT_ISSUED` - 가상계좌 발급
  - `VIRTUAL_ACCOUNT_DEPOSIT` - 가상계좌 입금

### 4. UI 컴포넌트 및 페이지
- **결제 위젯**: `PaymentWidget.tsx`
- **요금제 카드**: `PricingCard.tsx`
- **결제 페이지**: `/payment/page.tsx`
- **결제 성공**: `/payment/success/page.tsx`
- **결제 실패**: `/payment/fail/page.tsx`
- **결제 내역**: `/payment/history/page.tsx`

### 5. 라이브러리 및 타입
- **토스페이먼츠 클라이언트**: `src/lib/toss.ts`
- **타입 정의**: `src/types/payment.ts`

### 6. 환경 변수
- `.env.example` 업데이트 완료
- 필수 환경 변수:
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`

---

## 결제 플로우

```
사용자 → 요금제 선택 (/pricing)
  ↓
결제 페이지 (/payment?plan=PRO)
  ↓
결제 정보 입력 (토스페이먼츠 위젯)
  ↓
POST /api/payment/create (백엔드에 주문 생성)
  ↓
토스페이먼츠로 결제 요청
  ↓
결제 승인/실패
  ↓
성공: /payment/success → POST /api/payment/confirm
실패: /payment/fail
  ↓
구독 생성/업데이트 (자동)
  ↓
결제 내역 확인 (/payment/history)
```

---

## 구독 플랜 정책

### FREE 플랜
- 가격: 무료
- 6주 수료 후 3개월 무료 (AI 코치 월 10회)
- 프로젝트 1개

### PRO 플랜
- 가격: 29,000원/월
- AI 코치 월 50회
- 프로젝트 5개
- 우선 고객 지원

### PREMIUM 플랜
- 가격: 59,000원/월
- AI 코치 무제한
- 프로젝트 무제한
- 1:1 전담 컨설팅
- 출판사 연결 지원

---

## 다음 단계

### 1. 데이터베이스 마이그레이션
```bash
cd webapp
npx prisma migrate dev --name add_payment_subscription
npx prisma generate
```

### 2. 환경 변수 설정
`.env.local` 파일에 토스페이먼츠 키 추가:
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_xxxxxxxxxxxxxxxxxxxx"
TOSS_SECRET_KEY="test_sk_xxxxxxxxxxxxxxxxxxxx"
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 테스트
1. http://localhost:3000/pricing 접속
2. 플랜 선택
3. 테스트 카드로 결제: `1234-1234-1234-1234`

### 5. Webhook 설정 (운영 환경)
- 토스페이먼츠 개발자센터에서 Webhook URL 등록
- `https://your-domain.com/api/webhook/toss`

---

## API 사용 예제

### 결제 생성
```typescript
const response = await fetch('/api/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan: 'PRO',
    amount: 29000,
    orderName: '프로 플랜 구독',
    customerEmail: 'user@example.com',
    customerName: '홍길동'
  })
})

const { orderId, amount, orderName } = await response.json()
```

### 결제 승인
```typescript
const response = await fetch('/api/payment/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentKey: 'payment_key_xxx',
    orderId: 'order_1234567890_abc123',
    amount: 29000
  })
})

const payment = await response.json()
```

### 구독 조회
```typescript
const response = await fetch('/api/subscription')
const subscription = await response.json()

console.log(subscription.plan)  // 'PRO'
console.log(subscription.status) // 'ACTIVE'
```

### 결제 취소
```typescript
const response = await fetch('/api/payment/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId: 'payment_id',
    cancelReason: '단순 변심'
  })
})
```

---

## 주요 파일 목록

### API 라우트
- `src/app/api/payment/create/route.ts`
- `src/app/api/payment/confirm/route.ts`
- `src/app/api/payment/cancel/route.ts`
- `src/app/api/payment/[id]/route.ts`
- `src/app/api/payment/list/route.ts`
- `src/app/api/subscription/route.ts`
- `src/app/api/subscription/change/route.ts`
- `src/app/api/subscription/cancel/route.ts`
- `src/app/api/webhook/toss/route.ts`

### 페이지
- `src/app/payment/page.tsx`
- `src/app/payment/success/page.tsx`
- `src/app/payment/fail/page.tsx`
- `src/app/payment/history/page.tsx`

### 컴포넌트
- `src/components/payment/PaymentWidget.tsx`
- `src/components/payment/PricingCard.tsx`

### 라이브러리 및 타입
- `src/lib/toss.ts`
- `src/types/payment.ts`

### 문서
- `PAYMENT_SETUP.md` - 상세 설정 가이드
- `PAYMENT_SUMMARY.md` - 작업 요약 (이 문서)

---

## 보안 주의사항

1. **시크릿 키 보호**
   - `TOSS_SECRET_KEY`는 절대 클라이언트에 노출하지 말 것
   - 서버 사이드에서만 사용
   - `.env.local` 파일은 `.gitignore`에 포함

2. **금액 검증**
   - 결제 승인 시 반드시 백엔드에서 금액 재검증
   - 클라이언트에서 전송된 금액을 그대로 신뢰하지 말 것

3. **Webhook 보안**
   - 운영 환경에서는 Webhook 서명 검증 구현 권장
   - IP 화이트리스트 설정 고려

4. **세션 관리**
   - 인증된 사용자만 결제 가능하도록 검증
   - NextAuth 세션 확인

---

## 문의 및 지원

- 토스페이먼츠 문서: https://docs.tosspayments.com/
- 토스페이먼츠 고객센터: https://www.tosspayments.com/support

---

작업 완료일: 2026-01-10
