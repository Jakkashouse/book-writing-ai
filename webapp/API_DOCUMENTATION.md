# Claude AI API 통합 문서

## 개요

Book Writing AI 웹앱에 Claude AI API가 완벽하게 통합되었습니다. 모든 AI 기능은 스트리밍 응답, 토큰 사용량 추적, Rate Limiting, 에러 핸들링을 지원합니다.

## API 엔드포인트 목록

### 1. 제목 생성 API

**Endpoint:** `POST /api/ai/generate-title`

**설명:** 책의 핵심 정보를 바탕으로 매력적인 제목과 부제를 생성합니다.

**요청 예시:**
```json
{
  "genre": "육아서",
  "theme": "기질이 다른 두 아이를 키우는 엄마의 이야기",
  "targetAudience": "30-40대 엄마",
  "keywords": ["육아", "기질", "맞춤 양육"]
}
```

**필수 파라미터:**
- `theme` (string): 책의 핵심 주제

**선택 파라미터:**
- `genre` (string): 책의 장르
- `targetAudience` (string): 타겟 독자
- `keywords` (string[]): 주요 키워드

**응답 예시:**
```json
{
  "success": true,
  "result": "## 📚 제목 제안\n\n### 최종 추천 제목...",
  "usage": {
    "inputTokens": 523,
    "outputTokens": 1247,
    "totalTokens": 1770
  }
}
```

**Rate Limit:** 1분에 20회

---

### 2. 목차 생성 API

**Endpoint:** `POST /api/ai/generate-toc`

**설명:** 책의 제목과 주제를 바탕으로 논리적이고 매력적인 목차를 구성합니다.

**요청 예시:**
```json
{
  "title": "아이를 키우는 법, 나를 키우는 법",
  "genre": "육아서",
  "theme": "엄마와 아이가 함께 성장하는 이야기",
  "targetAudience": "초보 엄마",
  "structure": "8개 파트 구성"
}
```

**필수 파라미터:**
- `title` (string): 책 제목
- `theme` (string): 핵심 주제

**선택 파라미터:**
- `genre` (string): 책의 장르
- `targetAudience` (string): 타겟 독자
- `structure` (string): 희망하는 목차 구조

**응답 예시:**
```json
{
  "success": true,
  "result": "## 📖 목차 제안\n\n### 전체 구조 개요...",
  "usage": {
    "inputTokens": 612,
    "outputTokens": 2134,
    "totalTokens": 2746
  }
}
```

**Rate Limit:** 1분에 20회

---

### 3. 초안 생성 API (스트리밍 지원)

**Endpoint:** `POST /api/ai/generate-draft`

**설명:** 챕터 제목과 개요를 바탕으로 독자를 사로잡는 초안을 작성합니다. 실시간 스트리밍 응답을 지원합니다.

**요청 예시:**
```json
{
  "chapterTitle": "완벽하지 않아도 괜찮아요",
  "outline": "완벽한 엄마가 되려는 압박에서 벗어나는 과정",
  "keyPoints": [
    "완벽주의의 함정",
    "실수를 통한 성장",
    "있는 그대로의 나를 받아들이기"
  ],
  "targetLength": 3000,
  "style": "따뜻하고 공감되는 문체",
  "stream": true
}
```

**필수 파라미터:**
- `chapterTitle` (string): 챕터 제목

**선택 파라미터:**
- `outline` (string): 챕터 개요
- `keyPoints` (string[]): 핵심 포인트
- `targetLength` (number): 목표 글자 수
- `style` (string): 희망 문체
- `stream` (boolean): 스트리밍 응답 여부 (기본값: true)

**응답 (스트리밍):**
```
data: {"type":"text","content":"## 📝 완벽하지 않아도 괜찮아요\n\n"}
data: {"type":"text","content":"새벽 3시..."}
...
data: {"type":"done","usage":{"inputTokens":456,"outputTokens":3421,"totalTokens":3877}}
```

**응답 (일반):**
```json
{
  "success": true,
  "result": "## 📝 완벽하지 않아도 괜찮아요\n\n새벽 3시...",
  "usage": {
    "inputTokens": 456,
    "outputTokens": 3421,
    "totalTokens": 3877
  }
}
```

**Rate Limit:** 1분에 5회 (스트리밍 때문에 더 엄격)

---

### 4. 출판 기획서 생성 API

**Endpoint:** `POST /api/ai/generate-proposal`

**설명:** 출판사에 제출할 전문적인 출판 기획서를 작성합니다.

**요청 예시:**
```json
{
  "title": "아이를 키우는 법, 나를 키우는 법",
  "subtitle": "30년 육아 전문가가 들려주는 진짜 육아 이야기",
  "genre": "육아서",
  "theme": "엄마와 아이의 공동 성장",
  "targetAudience": "30-40대 초보 엄마",
  "authorBio": "유아교육 전문가, 20년 경력",
  "uniqueValue": "이론이 아닌 실제 경험 기반",
  "toc": "1부: 시작\n2부: 깨달음\n..."
}
```

**필수 파라미터:**
- `title` (string): 책 제목
- `theme` (string): 핵심 주제

**선택 파라미터:**
- `subtitle` (string): 부제
- `genre` (string): 장르
- `targetAudience` (string): 타겟 독자
- `authorBio` (string): 저자 소개
- `uniqueValue` (string): 차별화 포인트
- `toc` (string): 목차

**응답 예시:**
```json
{
  "success": true,
  "result": "# 출판 기획서\n\n## 1. 도서 기본 정보...",
  "usage": {
    "inputTokens": 723,
    "outputTokens": 2567,
    "totalTokens": 3290
  }
}
```

**Rate Limit:** 1분에 20회

---

### 5. 과제 분석 API

**Endpoint:** `POST /api/ai/analyze-assignment`

**설명:** 작가가 제출한 과제나 원고를 분석하고 건설적인 피드백을 제공합니다.

**요청 예시:**
```json
{
  "assignmentType": "챕터 초안",
  "content": "새벽 3시, 나는 주방 바닥에 주저앉아 김치찌개를 먹고 있었다...",
  "criteria": ["구조", "내용", "문체", "감정", "완성도"]
}
```

**필수 파라미터:**
- `assignmentType` (string): 과제 유형
- `content` (string): 분석할 내용 (최대 20,000자)

**선택 파라미터:**
- `criteria` (string[]): 평가 기준

**응답 예시:**
```json
{
  "success": true,
  "result": "## 📋 과제 분석 및 피드백\n\n### 잘된 점...",
  "usage": {
    "inputTokens": 1234,
    "outputTokens": 1876,
    "totalTokens": 3110
  }
}
```

**Rate Limit:** 1분에 20회

---

### 6. 챗봇 API (스트리밍 지원)

**Endpoint:** `POST /api/ai/chat`

**설명:** 책 쓰기 전문 AI 코치와 대화형으로 상담합니다. 실시간 스트리밍 응답을 지원합니다.

**요청 예시:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "책 제목을 정하는 게 너무 어려워요. 어떻게 시작해야 할까요?"
    }
  ],
  "stream": true
}
```

**필수 파라미터:**
- `messages` (array): 대화 메시지 배열
  - `role` (string): "user" 또는 "assistant"
  - `content` (string): 메시지 내용

**선택 파라미터:**
- `stream` (boolean): 스트리밍 응답 여부 (기본값: true)

**응답 (스트리밍):**
```
data: {"type":"text","content":"안녕하세요! "}
data: {"type":"text","content":"제목 정하기가 어려우시군요..."}
...
data: {"type":"done","usage":{"inputTokens":123,"outputTokens":567,"totalTokens":690}}
```

**응답 (일반):**
```json
{
  "success": true,
  "result": "안녕하세요! 제목 정하기가 어려우시군요...",
  "usage": {
    "inputTokens": 123,
    "outputTokens": 567,
    "totalTokens": 690
  }
}
```

**Rate Limit:** 1분에 5회

---

### 7. AI 사용량 통계 조회 API

**Endpoint:** `GET /api/ai/usage`

**설명:** 사용자의 AI 사용량 통계를 조회합니다.

**쿼리 파라미터:**
- `days` (number): 조회 기간 (기본값: 30일)
- `startDate` (string): 시작 날짜 (ISO 8601 형식)
- `endDate` (string): 종료 날짜 (ISO 8601 형식)

**요청 예시:**
```
GET /api/ai/usage?days=7
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalRequests": 45,
      "successfulRequests": 43,
      "failedRequests": 2,
      "totalInputTokens": 12345,
      "totalOutputTokens": 45678,
      "totalTokens": 58023,
      "totalCost": 0.87,
      "avgDuration": 2345
    },
    "byPromptType": [
      {
        "promptType": "title",
        "requests": 12,
        "totalTokens": 15234,
        "totalCost": 0.23
      },
      {
        "promptType": "draft",
        "requests": 20,
        "totalTokens": 35678,
        "totalCost": 0.54
      }
    ],
    "period": {
      "startDate": "2024-01-03T00:00:00.000Z",
      "endDate": "2024-01-10T00:00:00.000Z",
      "days": 7
    }
  }
}
```

**인증:** 필수

---

## 공통 기능

### 인증
모든 API는 Next-Auth 세션 인증이 필요합니다. 로그인하지 않은 사용자는 401 에러를 받습니다.

### Rate Limiting
- **기본 제한:** 1분에 20회
- **엄격한 제한 (스트리밍):** 1분에 5회
- Rate limit을 초과하면 429 에러와 함께 재시도 시간을 반환합니다.

**응답 헤더:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1704902400000
```

### 토큰 사용량 추적
모든 API 호출은 자동으로 데이터베이스에 로깅됩니다:
- 입력/출력 토큰 수
- 총 비용 (USD)
- 응답 시간
- 성공/실패 여부
- 에러 메시지 (실패 시)

### 에러 응답

**표준 에러 형식:**
```json
{
  "error": "에러 메시지"
}
```

**주요 에러 코드:**
- `400`: 잘못된 요청 (필수 파라미터 누락 등)
- `401`: 인증 필요
- `429`: Rate limit 초과
- `500`: 서버 내부 오류

### 스트리밍 응답 처리

스트리밍 응답은 Server-Sent Events (SSE) 형식을 사용합니다.

**클라이언트 예시 (JavaScript):**
```javascript
const response = await fetch('/api/ai/generate-draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapterTitle: '제목',
    stream: true,
  }),
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))

      if (data.type === 'text') {
        console.log(data.content)
      } else if (data.type === 'done') {
        console.log('Usage:', data.usage)
      } else if (data.type === 'error') {
        console.error('Error:', data.error)
      }
    }
  }
}
```

---

## 프롬프트 템플릿

모든 API는 `/c/Users/JUN/my-first-project/book-writing-ai/prompts/` 디렉토리의 프롬프트 파일을 기반으로 구성되었습니다.

### 사용된 프롬프트:
1. **01-제목목차기획.md**: 제목/목차 생성 시스템 프롬프트
2. **02-초안작성.md**: 초안 작성 시스템 프롬프트

### 커스터마이징
프롬프트는 `/webapp/src/lib/prompts.ts` 파일에서 수정할 수 있습니다.

---

## 비용 추정

Claude 3.5 Sonnet 기준 (2024년 1월):
- 입력: $3 / 1M tokens
- 출력: $15 / 1M tokens

**예상 비용:**
- 제목 생성 (1회): 약 $0.03
- 목차 생성 (1회): 약 $0.05
- 초안 생성 (1회): 약 $0.08
- 기획서 생성 (1회): 약 $0.06
- 챗봇 (10회 대화): 약 $0.15

---

## 데이터베이스 마이그레이션

스키마가 업데이트되었으므로 다음 명령어로 마이그레이션을 실행해야 합니다:

```bash
cd webapp
npx prisma migrate dev --name add_ai_usage_fields
npx prisma generate
```

---

## 환경 변수

`.env` 파일에 다음 환경 변수가 필요합니다:

```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 테스트

### cURL 예시

**제목 생성:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-title \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "theme": "AI를 활용한 책쓰기",
    "genre": "자기계발",
    "targetAudience": "초보 작가"
  }'
```

**챗봇 (스트리밍):**
```bash
curl -N -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "책 제목 정하기 팁 알려주세요"}
    ],
    "stream": true
  }'
```

---

## 문의 및 지원

API 사용 중 문제가 발생하면 다음을 확인하세요:
1. 인증 토큰이 유효한지
2. Rate limit을 초과하지 않았는지
3. 필수 파라미터가 모두 포함되었는지
4. 데이터베이스 연결이 정상인지

로그는 서버 콘솔에서 확인할 수 있습니다.
