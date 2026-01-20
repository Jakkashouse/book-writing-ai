# Claude AI API 통합 가이드

## 설치 및 설정

### 1. 환경 변수 설정

`.env` 파일에 다음을 추가하세요:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://user:password@localhost:5432/bookwriting
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 2. 데이터베이스 마이그레이션

```bash
cd webapp
npx prisma migrate dev --name add_ai_usage_fields
npx prisma generate
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

---

## 빠른 시작

### 클라이언트 사이드에서 API 호출하기

#### 1. 제목 생성

```typescript
const response = await fetch('/api/ai/generate-title', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: '육아와 자기계발의 조화',
    genre: '육아서',
    targetAudience: '30-40대 워킹맘',
    keywords: ['육아', '자기계발', '워라밸'],
  }),
})

const data = await response.json()
if (data.success) {
  console.log(data.result) // AI가 생성한 제목
  console.log(data.usage) // 토큰 사용량
}
```

#### 2. 초안 생성 (스트리밍)

```typescript
const response = await fetch('/api/ai/generate-draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapterTitle: '완벽하지 않아도 괜찮아요',
    outline: '완벽주의에서 벗어나는 이야기',
    keyPoints: ['실수 인정', '자기 용서', '새로운 시작'],
    stream: true,
  }),
})

const reader = response.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6))

      if (event.type === 'text') {
        // 실시간으로 텍스트 표시
        console.log(event.content)
      } else if (event.type === 'done') {
        // 완료
        console.log('Usage:', event.usage)
      } else if (event.type === 'error') {
        // 에러 처리
        console.error(event.error)
      }
    }
  }
}
```

#### 3. 챗봇 대화

```typescript
const messages = [
  { role: 'user', content: '책 제목을 어떻게 정해야 하나요?' },
]

const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, stream: true }),
})

// 스트리밍 처리 (위와 동일)
```

#### 4. 사용량 통계 조회

```typescript
const response = await fetch('/api/ai/usage?days=7')
const data = await response.json()

console.log('총 요청:', data.data.overall.totalRequests)
console.log('총 비용:', data.data.overall.totalCost)
console.log('프롬프트별:', data.data.byPromptType)
```

---

## React 컴포넌트 예시

### 제목 생성 컴포넌트

```typescript
'use client'

import { useState } from 'react'
import type { GenerateTitleRequest, AIResponse } from '@/types/ai'

export function TitleGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const generateTitle = async (data: GenerateTitleRequest) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json: AIResponse = await response.json()

      if (json.success && json.result) {
        setResult(json.result)
      } else {
        alert(json.error || '오류가 발생했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() =>
          generateTitle({
            theme: '사용자 입력',
            genre: '육아서',
          })
        }
        disabled={loading}
      >
        {loading ? '생성 중...' : '제목 생성'}
      </button>

      {result && (
        <div className="mt-4 whitespace-pre-wrap">{result}</div>
      )}
    </div>
  )
}
```

### 스트리밍 초안 작성 컴포넌트

```typescript
'use client'

import { useState } from 'react'
import type { GenerateDraftRequest } from '@/types/ai'

export function DraftGenerator() {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const generateDraft = async (data: GenerateDraftRequest) => {
    setLoading(true)
    setContent('')

    try {
      const response = await fetch('/api/ai/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, stream: true }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'text') {
              setContent(prev => prev + event.content)
            } else if (event.type === 'error') {
              alert(event.error)
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() =>
          generateDraft({
            chapterTitle: '챕터 제목',
            outline: '챕터 개요',
          })
        }
        disabled={loading}
      >
        {loading ? '작성 중...' : '초안 작성'}
      </button>

      {content && (
        <div className="mt-4 whitespace-pre-wrap">{content}</div>
      )}
    </div>
  )
}
```

### 챗봇 컴포넌트

```typescript
'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/types/ai'

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: input },
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, stream: true }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'text') {
              assistantMessage += event.content
              setMessages([
                ...newMessages,
                { role: 'assistant', content: assistantMessage },
              ])
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block px-4 py-2 rounded ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  )
}
```

---

## 에러 처리

### Rate Limit 초과 처리

```typescript
const response = await fetch('/api/ai/generate-title', {
  method: 'POST',
  body: JSON.stringify(data),
})

if (response.status === 429) {
  const json = await response.json()
  const retryAfter = json.retryAfter || 60
  alert(`요청 한도를 초과했습니다. ${retryAfter}초 후 다시 시도해주세요.`)
  return
}
```

### 인증 오류 처리

```typescript
if (response.status === 401) {
  // 로그인 페이지로 리다이렉트
  window.location.href = '/login'
  return
}
```

---

## 프로덕션 고려사항

### 1. Rate Limiting 강화

프로덕션에서는 Redis를 사용한 분산 Rate Limiting을 권장합니다:

```typescript
// lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
) {
  const key = `ratelimit:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, Math.ceil(config.interval / 1000))
  }

  return {
    success: count <= config.maxRequests,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
  }
}
```

### 2. 캐싱

자주 요청되는 내용은 캐싱하여 비용 절감:

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis(...)

async function getCachedOrGenerate(key: string, generator: () => Promise<string>) {
  const cached = await redis.get(key)
  if (cached) return cached

  const result = await generator()
  await redis.set(key, result, { ex: 3600 }) // 1시간 캐시
  return result
}
```

### 3. 큐 시스템

대량 요청은 큐에 넣어 순차 처리:

```typescript
import { Queue } from 'bullmq'

const aiQueue = new Queue('ai-generation', {
  connection: { host: 'localhost', port: 6379 },
})

await aiQueue.add('generate-draft', {
  userId: 'user123',
  data: { chapterTitle: '...' },
})
```

---

## 모니터링

### 사용량 대시보드

```typescript
'use client'

import { useEffect, useState } from 'react'
import type { AIUsageStats } from '@/types/ai'

export function UsageDashboard() {
  const [stats, setStats] = useState<AIUsageStats | null>(null)

  useEffect(() => {
    fetch('/api/ai/usage?days=30')
      .then(res => res.json())
      .then(data => setStats(data.data))
  }, [])

  if (!stats) return <div>로딩 중...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold">총 요청</h3>
        <p className="text-2xl">{stats.overall.totalRequests}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold">총 토큰</h3>
        <p className="text-2xl">{stats.overall.totalTokens.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold">총 비용</h3>
        <p className="text-2xl">${stats.overall.totalCost.toFixed(2)}</p>
      </div>
    </div>
  )
}
```

---

## 트러블슈팅

### 스트리밍이 작동하지 않는 경우

1. 프록시나 미들웨어가 스트리밍을 차단하는지 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. Next.js 버전이 13 이상인지 확인

### 토큰 사용량이 로깅되지 않는 경우

1. 데이터베이스 연결 확인
2. Prisma schema가 최신인지 확인 (`npx prisma generate`)
3. 마이그레이션 실행 확인

### Rate Limit이 작동하지 않는 경우

1. 서버 재시작 (메모리 기반 저장소이므로)
2. 프로덕션에서는 Redis 사용 권장

---

## 추가 리소스

- [API 문서](./API_DOCUMENTATION.md)
- [Claude API 공식 문서](https://docs.anthropic.com/claude/reference)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Prisma 문서](https://www.prisma.io/docs)

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
