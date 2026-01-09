# 🎯 n8n 완전 초보 가이드 (랜드봇 경험자용)

> **랜드봇처럼 쉽습니다! 차근차근 따라하세요.**

---

## 📌 Step 1: n8n 설치 및 실행

### 1-1. n8n 설치 (한 번만)
터미널(CMD 또는 PowerShell)을 열고:

```bash
npm install -g n8n
```

### 1-2. n8n 실행
```bash
n8n
```

**실행하면 자동으로 브라우저가 열립니다:**
- 주소: `http://localhost:5678`
- 계정 생성 화면이 나오면 이메일/비밀번호 입력

---

## 📌 Step 2: 책쓰기 자동화 워크플로우 가져오기

### 방법 1: JSON 파일로 가져오기 (추천)

1. **n8n 화면 왼쪽 상단**에서 `+` 버튼 클릭
2. `Import from File` 선택
3. 아래 파일 선택:
   ```
   C:\Users\JUN\my-first-project\book-writing-ai\book-coaching-workflow.json
   ```

### 방법 2: 직접 만들기
아래 워크플로우를 직접 구성할 수도 있습니다.

---

## 📌 Step 3: 워크플로우 구조 (랜드봇처럼 쉽게!)

### 🔹 노드 1: Webhook (시작점)
- **역할**: 사용자가 폼을 제출하면 자동 시작
- **설정**:
  - HTTP Method: `POST`
  - Path: `book-coaching`
  - URL: `http://localhost:5678/webhook/book-coaching`

### 🔹 노드 2: OpenAI (제목 생성)
- **역할**: AI가 책 제목 10개 생성
- **설정**:
  - Model: `gpt-4o-mini`
  - Prompt:
    ```
    사용자의 주제: {{$json.body.topic}}
    나이: {{$json.body.age}}
    직업: {{$json.body.job}}

    위 정보를 바탕으로 출판사가 바로 계약할 책 제목 10개를 생성해주세요.
    제목 공식 10가지를 활용하세요.
    ```

### 🔹 노드 3: OpenAI (목차 생성)
- **역할**: 40꼭지 목차 자동 생성
- **설정**:
  - Model: `gpt-4o-mini`
  - Prompt:
    ```
    제목: {{$node["OpenAI"].json.choices[0].message.content}}

    Why-What-How-Do-Future 5부 구조로 40꼭지 목차를 생성해주세요.
    ```

### 🔹 노드 4: Google Sheets (저장)
- **역할**: 결과를 스프레드시트에 자동 저장
- **설정**:
  - Spreadsheet: 새로 만들기 또는 기존 시트 선택
  - Sheet: `책쓰기 코칭 결과`
  - 저장 데이터:
    - 이름: `{{$json.body.name}}`
    - 이메일: `{{$json.body.email}}`
    - 주제: `{{$json.body.topic}}`
    - 생성된 제목: `{{$node["OpenAI"].json.choices[0].message.content}}`
    - 생성일: `{{$now}}`

### 🔹 노드 5: Gmail (이메일 발송)
- **역할**: 사용자에게 결과 자동 발송
- **설정**:
  - To: `{{$json.body.email}}`
  - Subject: `🎉 {{$json.body.name}}님의 책 제목 10개가 완성되었습니다!`
  - Message:
    ```
    안녕하세요, {{$json.body.name}}님!

    요청하신 책 제목 10개와 목차 40꼭지가 완성되었습니다.

    📚 생성된 제목:
    {{$node["OpenAI"].json.choices[0].message.content}}

    📖 생성된 목차:
    {{$node["OpenAI 2"].json.choices[0].message.content}}

    6주 책쓰기 완성 프로그램에 참여하시면
    이 제목과 목차로 바로 출간까지 도와드립니다!

    감사합니다.
    작가의집 드림
    ```

---

## 📌 Step 4: 웹 폼 만들기 (사용자 입력)

### HTML 파일 위치:
```
C:\Users\JUN\my-first-project\book-writing-ai\book-coaching-form.html
```

### 브라우저에서 열기:
1. 파일 탐색기에서 `book-coaching-form.html` 더블클릭
2. 또는 브라우저 주소창에:
   ```
   file:///C:/Users/JUN/my-first-project/book-writing-ai/book-coaching-form.html
   ```

---

## 📌 Step 5: 테스트 실행

### 5-1. n8n 워크플로우 활성화
1. n8n 화면 오른쪽 상단 `Inactive` → `Active` 토글

### 5-2. 웹 폼에서 테스트
1. `book-coaching-form.html` 열기
2. 정보 입력:
   - 이름: 홍길동
   - 이메일: test@example.com
   - 나이: 35
   - 직업: 마케터
   - 주제: SNS 마케팅 성공법
3. **제출** 버튼 클릭

### 5-3. 결과 확인
- **즉시**: 화면에 제목 10개 표시
- **이메일**: Gmail로 전체 결과 수신
- **Google Sheets**: 자동 저장 확인

---

## 📌 Step 6: 실제 서비스 배포 (선택)

### 무료 배포 방법:

#### 🔹 n8n Cloud (추천)
- https://n8n.cloud
- 무료 플랜: 월 5,000회 실행
- 클릭 몇 번으로 배포 완료

#### 🔹 Railway.app
- https://railway.app
- 무료 플랜: 월 500시간
- GitHub 연동으로 자동 배포

---

## 📌 문제 해결

### ❓ "Webhook URL이 안 떠요"
```bash
# n8n 재시작
Ctrl + C (종료)
n8n (다시 시작)
```

### ❓ "OpenAI 연결이 안 돼요"
1. n8n 화면 오른쪽 상단 `Credentials` 클릭
2. `OpenAI` 선택
3. API Key 입력: `sk-...`

### ❓ "Gmail 발송이 안 돼요"
1. `Credentials` → `Gmail` 선택
2. Google 계정 연동
3. "앱 비밀번호" 사용 권장

---

## 📌 다음 단계

### ✅ 완료하면 할 수 있는 것들:
1. **자동 책 제목 생성기** - 24시간 무인 운영
2. **자동 목차 생성기** - 1일 만에 40꼭지 완성
3. **자동 이메일 발송** - 100명에게 동시 발송
4. **Google Sheets 자동 수집** - 데이터 자동 정리
5. **AI 프롬프트 27종 자동화** - 모든 과정 자동화

### 🎯 수익화 아이디어:
- **제목 생성 서비스**: 건당 5만원
- **목차 생성 서비스**: 건당 10만원
- **전체 기획서**: 건당 50만원
- **자동화 시스템 판매**: 1개당 100만원

---

## 💡 랜드봇과 비교

| 기능 | 랜드봇 | n8n |
|------|--------|-----|
| 챗봇 | ✅ 쉬움 | ✅ 똑같음 |
| AI 연동 | ✅ 클릭 | ✅ 클릭 |
| 무료 | ❌ 제한 | ✅ 무제한 |
| 커스텀 | ❌ 제한 | ✅ 자유 |
| 코딩 | ❌ 불필요 | ❌ 불필요 |

**결론**: 랜드봇 쓸 줄 알면 n8n도 쓸 수 있습니다!

---

## 📞 지원

- **n8n 공식 문서**: https://docs.n8n.io
- **한국어 커뮤니티**: 디스코드, 카카오톡 오픈채팅
- **유튜브 튜토리얼**: "n8n 한국어" 검색

---

**🎉 시작하세요!**

```bash
n8n
```

브라우저가 열리면 → 워크플로우 가져오기 → 활성화 → 테스트!
