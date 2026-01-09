# 🚀 전체 시스템 빠른 시작 가이드

> **5분 안에 웹 시스템 전체를 실행하세요!**

---

## 📋 준비물

- Python 3.8 이상
- Claude API 키 ([https://console.anthropic.com](https://console.anthropic.com))
- 웹 브라우저

---

## ⚡ 5분 시작 가이드

### Step 1: API 키 설정 (1분)

```bash
# 프로젝트 폴더로 이동
cd book-writing-ai/backend

# .env 파일 생성
copy .env.example .env

# 메모장으로 .env 파일 열어서 API 키 입력
notepad .env
```

`.env` 파일 내용:
```
ANTHROPIC_API_KEY=sk-ant-여기에-실제-API-키-입력
```

### Step 2: 패키지 설치 (2분)

```bash
# backend 폴더에서
pip install -r requirements.txt
```

### Step 3: 서버 실행 (2분)

**터미널 1 - 백엔드 서버:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

성공 시 메시지:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**터미널 2 - 프론트엔드 서버:**
```bash
# 새 터미널 열기
cd frontend
python -m http.server 8080
```

성공 시 메시지:
```
Serving HTTP on 0.0.0.0 port 8080
```

### Step 4: 브라우저 열기

http://localhost:8080 접속

**완료! 🎉**

---

## 🧪 기능별 테스트

### 1️⃣ 컨설팅지 분석 테스트

**브라우저에서:**

1. "1. 컨설팅지 분석" 탭 선택
2. 프로젝트 ID: `1` (기본값)
3. 다음 샘플 텍스트 복사/붙여넣기:

```
작가: 김미소
직업: 초등학교 교사 10년차
전문성: 기질이 다른 두 아이를 키우는 엄마, 예민한 아이 육아 전문
독자: 예민한 아이를 키우는 부모
메시지: 예민함은 약점이 아니라 강점이다
차별화: 교사 + 엄마 이중 관점, 38가지 구체적 솔루션
```

4. "컨설팅지 분석 시작" 버튼 클릭
5. 2-3분 대기
6. **결과 확인!** → 3가지 주제 + 목차 120개

---

### 2️⃣ 초안 작성 테스트

**먼저 테스트 데이터 생성:**

```bash
# Python 인터프리터 실행
python

# 다음 코드 실행:
```

```python
import sys
sys.path.append("C:\\Users\\JUN\\my-first-project\\book-writing-ai\\backend")

from app.core.database import SessionLocal, engine
from app.models.models import Base, Project, User, Chapter, WritingStyle

# 테이블 생성
Base.metadata.create_all(bind=engine)

# 세션 생성
db = SessionLocal()

# 테스트 사용자
user = User(
    email="test@test.com",
    name="테스트 작가",
    hashed_password="test123",
    role="writer"
)
db.add(user)
db.commit()

# 테스트 프로젝트
project = Project(user_id=user.id, title="예민한 아이 육아서")
db.add(project)
db.commit()

# 필체 분석 (샘플)
style = WritingStyle(
    project_id=project.id,
    analysis_result={
        "full_analysis": """
필체 분석 결과:
- 어미: ~어요, ~죠
- 문장 길이: 중간 (30자)
- 톤: 따뜻하고 공감적
"""
    }
)
db.add(style)
db.commit()

# 테스트 장
chapter = Chapter(
    project_id=project.id,
    chapter_number=1,
    title="1장. 완벽하지 않아도 괜찮아요"
)
db.add(chapter)
db.commit()

print(f"✅ 테스트 데이터 생성 완료!")
print(f"Chapter ID: {chapter.id}")

db.close()
exit()
```

**브라우저에서:**

1. "2. 초안 작성" 탭 선택
2. 장 ID: `1` (위에서 출력된 ID)
3. "AI 초안 생성" 버튼 클릭
4. 2-3분 대기
5. **결과 확인!** → 4,000자 초안 (작가 스타일 반영)

---

### 3️⃣ 피드백 생성 테스트

**작가 초안 먼저 업로드:**

1. "2. 초안 작성" 탭에서 아래로 스크롤
2. "작가님이 직접 쓴 초안" 텍스트박스에 다음 붙여넣기:

```
어제 아침, 저는 아이에게 소리를 질렀어요.
"빨리 안 입어?!"

알람을 10번도 넘게 미루고, 간신히 일어난 아이가
옷 입기 싫다고 바닥에 드러누웠거든요.

솔직히 말하면, 그 순간 화가 치밀었어요.
'내가 이러려고 엄마가 됐나...'
매일 아침이 전쟁터예요.

그런데 소리를 지르고 나면, 더 괴로운 건 저예요.
아이 얼굴에 번진 놀라움, 그리고 눈물.

'나는 나쁜 엄마야.'
저만 이렇게 못난 엄마인 것 같아요.
```

3. "작가 초안 업로드" 버튼 클릭
4. 알림 확인: "작가 초안이 업로드되었습니다!"

**피드백 생성:**

1. "3. 피드백 생성" 탭 선택
2. 장 ID: `1`
3. "AI 피드백 생성" 버튼 클릭
4. 1-2분 대기
5. **결과 확인!** → 100점 평가 + 구체적 개선안

---

## 🔗 API 직접 테스트

### Swagger UI 사용

http://localhost:8000/docs 접속

모든 API를 직접 테스트할 수 있습니다!

**주요 API:**

1. `POST /api/v1/consultations/upload` - 컨설팅지 분석
2. `POST /api/v1/chapters/{chapter_id}/generate-draft` - 초안 생성
3. `POST /api/v1/chapters/{chapter_id}/upload` - 작가 초안 업로드
4. `POST /api/v1/chapters/{chapter_id}/feedback` - 피드백 생성

---

## 📊 전체 흐름 확인

### curl로 테스트 (선택)

```bash
# 1. 컨설팅지 분석
curl -X POST http://localhost:8000/api/v1/consultations/upload \
  -F "project_id=1" \
  -F "text_content=작가: 김미소..."

# 2. AI 초안 생성
curl -X POST http://localhost:8000/api/v1/chapters/1/generate-draft

# 3. 작가 초안 업로드
curl -X POST "http://localhost:8000/api/v1/chapters/1/upload?content=어제아침..."

# 4. 피드백 생성
curl -X POST http://localhost:8000/api/v1/chapters/1/feedback
```

---

## ❓ 문제 해결

### 1. "ModuleNotFoundError"

```bash
pip install -r backend/requirements.txt
```

### 2. "Invalid API key"

`.env` 파일 확인:
```bash
notepad backend\.env
```

### 3. "No such table"

Python으로 테이블 생성:
```python
python

>>> from backend.app.core.database import engine, Base
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

### 4. "Connection refused"

백엔드 서버가 실행 중인지 확인:
```bash
# 터미널 1
cd backend
python -m uvicorn app.main:app --reload
```

### 5. "CORS error"

프론트엔드도 HTTP 서버로 실행:
```bash
# 터미널 2
cd frontend
python -m http.server 8080
```

---

## 🎯 구현 완료!

다음 3가지 기능이 모두 작동합니다:

### ✅ 1. 컨설팅지 → 3가지 주제
- 업로드: 텍스트 또는 파일
- 분석: AI 자동 분석 (3분)
- 결과: 3가지 주제 + 각 40개 목차

### ✅ 2. 초안 작성
- 필체 분석: 작가 스타일 학습
- AI 초안: 4,000자 자동 작성
- 작가 업로드: 직접 쓴 초안 제출

### ✅ 3. 피드백 생성
- 자동 분석: 작가 초안 검토
- 평가: 100점 만점 점수
- 개선안: 구체적 Before/After

---

## 🚀 다음 단계

### 실전 사용
1. 실제 작가 데이터로 테스트
2. 코치 대시보드 추가
3. 이메일 자동 발송 연동

### 고도화
1. 사용자 인증/권한
2. 파일 업로드 개선
3. 프로덕션 배포

### 문서
- 전체 설계: `SYSTEM-DESIGN-V2.md`
- 간단 사용: `SIMPLE-USAGE-GUIDE.md`
- 자동화 README: `AUTO-COACHING-README.md`

---

**🎉 축하합니다! 전체 시스템이 작동합니다!**

**Made with ❤️ by 작가의집 × Claude AI**
