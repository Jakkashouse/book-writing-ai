# 마케팅 자동화 셋팅 가이드 (작가의집)

## 한눈 그림

```
사장님 한 줄 명령 (/마케팅 책쓰기 코칭)
   ↓
content-creator (블로그·인스타·유튜브 3종 생성)
   ↓
sns-publisher (4채널 포맷 변환)
   ↓
publish_to_buffer.py → Make Webhook POST
   ├─ Buffer 큐 자동 업로드 → 예약 발행
   ├─ Notion DB 백업
   └─ Gmail 알림 (주간 다이제스트)
   ↓
매일 자정 Make scheduler → Buffer 성과 수집 → Notion 업데이트
   ↓
매주 월요일 09:07 → insight-analyzer → 주간 리포트 PDF → Gmail 발송
```

## 사장님이 직접 해주실 일 (총 30분)

### 1단계: Make.com 가입 + Webhook 생성 (10분)
1. https://www.make.com 가입
2. 우상단 Subscribe → **Core plan ($9/월)** 결제
3. New Scenario → 검색창에 "webhook" → **Custom webhook** 선택
4. "Add" 클릭 → 이름 "claude-publish" → **URL 복사**
5. 사장님 PC에서 프로젝트 폴더 열고 `.env.example` → `.env`로 복사
6. `.env`의 `MAKE_WEBHOOK_URL=` 뒤에 복사한 URL 붙여넣기

### 2단계: Buffer API 토큰 발급 (5분)
1. https://publish.buffer.com → 로그인
2. 우상단 프로필 → **Account** → **Apps & Extras** → **Create Token**
3. 토큰 복사 → `.env`의 `BUFFER_ACCESS_TOKEN=` 뒤에 붙여넣기
4. 프로필 ID 확인:
   ```
   브라우저에서 열기:
   https://api.bufferapp.com/1/profiles.json?access_token=<위에서 받은 토큰>
   ```
   응답 JSON에서 각 채널 `id`를 `.env`에 채워넣기

### 3단계: Make 시나리오에 모듈 추가 (10분)
`automation/make/scenario_buffer_publish.json` 파일 참고해서 Make 시나리오에 다음 모듈 순서대로 추가:
1. **Webhook** (1단계에서 만든 것) — 이미 있음
2. **Buffer → Create Update** — OAuth 연결, 채널은 payload의 `channel` 값으로 분기
3. **Notion → Create a Database Item** — DB 미리 만들어야 함 (아래)
4. **Gmail → Send an Email** — 매주 월요일 다이제스트 (Aggregator 모듈로 묶기)
5. **Webhook Response** — `{"ok": true}`
6. 좌하단 **Scheduling** OFF→ON, **Run scenario every: 즉시 실행**

### 4단계: Notion DB 만들기 (5분)
1. Notion에서 새 페이지 → "작가의집_SNS발행로그" 데이터베이스 생성
2. 속성 추가:
   | 속성명 | 타입 |
   |--------|------|
   | 주제 | Title |
   | 채널 | Select (instagram/facebook/twitter/linkedin) |
   | 본문 | Rich text |
   | 해시태그 | Rich text |
   | 예약시각 | Date |
   | 원천도서 | Select |
   | 상태 | Select (예약완료/발행됨/실패/검수대기) |
   | Buffer_ID | Rich text |
   | 성과_좋아요 | Number |
   | 성과_도달 | Number |
   | 성과_업데이트 | Date |
3. DB URL에서 ID 복사 (`https://notion.so/<workspace>/<32자ID>?v=...` 의 32자 부분)
4. Make의 Notion 모듈에 그 ID 입력

### 5단계: 연결 테스트 (1분)
```powershell
cd C:\Users\JUN\my-first-project\book-writing-ai
pip install requests python-dotenv
python automation/scripts/test_make_webhook.py
```
**예상 결과**:
- 콘솔에 `Status: 200` 표시
- Buffer 큐에 "[테스트] Make 연결 확인" 게시물 보임 → **즉시 삭제**
- Notion DB에 새 행 생김 → 확인 후 삭제

## 사장님이 결정만 하시면 되는 것

### A. 정기 스케줄 영구 등록 (`/schedule` 스킬)
지금은 임시(7일 만료)로 등록돼 있어요. 사장님이 직접 한 번 쳐주셔야 영구로 갑니다:

```
/schedule 매주 월요일 9시 7분 → 주간 인사이트 리포트
/schedule 매일 7시 3분 → 일간 SNS 콘텐츠 1건 자동 발행
/schedule 매주 금요일 17시 17분 → 책 진척도 점검
/schedule 매월 1일 2시 23분 → 백업·정리
```

### B. GA4 (랜딩페이지 트래픽 추적) — 선택
expert-workbook 랜딩 트래픽까지 보고 싶으면 GA4 service account key 발급 필요.
**안 하시면**: SNS 성과(좋아요·도달)만 추적, 랜딩 전환율은 수동 입력.

### C. Claude Design (HTML→PDF) 의존성 설치
```powershell
pip install jinja2 weasyprint
```
Windows에서 weasyprint 설치 까다로워요. 안 되면 사장님이 알려주세요 — Playwright 대안으로 갈아탑니다.

## 비용 정리
| 항목 | 월 비용 | 비고 |
|------|---------|------|
| Buffer Essentials | $6 | 기존 유지 |
| Make.com Core | $9 | 신규 |
| Notion | $0 | Free plan 충분 |
| **합계** | **$15/월** | 약 2만원 |

## 가동 후 흐름 (사장님이 하실 일)

**매일**: 아무것도 안 함. 자동.
**주 1회 (월요일 아침)**: Gmail 받은 주간 리포트 확인 → 다음 주 5개 주제 중 마음에 드는 거 골라서 클로드에 알려주기
**문제 시**: `python automation/scripts/test_make_webhook.py` 한 번 돌려보기

## 끄고 싶을 때
- 전체 정지: Make 시나리오 우하단 토글 OFF
- 특정 책만 빼고: `.claude/commands/마케팅.md`의 로테이션 표 수정
- 정기 스케줄 정지: `/schedule list` → `/schedule delete <id>`
