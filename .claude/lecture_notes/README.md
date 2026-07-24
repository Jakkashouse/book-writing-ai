# 강의 노트 정리 폴더

> 패스트캠퍼스 「클로드 코드로 100명 규모 기업 통째로 자동화」 강의 노트
> 강의 URL: https://fastcampus.co.kr/classroom/262691
> 강사: 정상록 (퀀텀점프클럽 대표)
> 시작일: 2026-05-13

---

## 폴더 구조

```
.claude/lecture_notes/
├── README.md                       # 이 파일
├── 00_setup/                       # Step 0. 세팅 4시간 (5/13 완료)
│   ├── 01_basic_install.md         # Node.js, Git 등 기본 설치
│   ├── 02_claude_code_install.md   # Claude Code 설치 + 환경 세팅
│   ├── 03_claudemd_writing.md      # CLAUDE.md 작성법
│   └── 04_terminal_basics.md       # 터미널 기초
├── 01_step1_ai_org/                # Step 1. AI 조직 세팅
│   ├── 01_prompt_formulas.md       # 7가지 프롬프트 공식
│   ├── 02_session_management.md    # 세션 관리 전략
│   ├── 03_mcp_integration.md       # MCP 연동
│   ├── 04_automation_triggers.md   # 자동화 트리거 조건
│   ├── 05_agent_onboarding.md      # JD별 매뉴얼 .md로 에이전트 온보딩
│   └── 06_multi_agent_collab.md    # 멀티 에이전트 협업 (강의 핵심)
├── 02_step2_24h_run/               # Step 2. 24시간 자동화
│   ├── 01_always_on_env.md         # 컴퓨터 꺼져있어도 작동
│   ├── 02_mobile_remote.md         # 모바일 원격 명령
│   └── 03_error_handling.md        # 5가지 오류 대응 가이드
└── 03_practice_30/                 # Step 3. 30실습 (7부서)
    ├── 01_marketing_5/             # 마케팅부 5명
    │   ├── 01_keyword_researcher.md
    │   ├── 02_content_writer.md
    │   ├── 03_editor.md
    │   ├── 04_sns_publisher.md
    │   └── 05_design_creator.md
    ├── 02_sales_4/                 # 영업부 4명
    ├── 03_finance_4/               # 재무부 4명
    ├── 04_hr_4/                    # 인사부 4명
    ├── 05_cs_4/                    # 고객지원부 4명
    ├── 06_legal_4/                 # 법무부 4명
    └── 07_management_5/            # 경영지원부 5명
```

---

## 챕터 노트 작성 템플릿

각 .md 파일은 아래 구조로:

```markdown
# 챕터 [번호] — [제목]

- 강의 일자: 2026-MM-DD
- 강의 시간: HH:MM ~ HH:MM (분량 N분)
- 텍스트 출처: [CLOVA Note 자동 / 수동 메모 / 자막 파일 / 기타]

## 핵심 메시지 (한 줄)


## 강사가 알려준 내용

### 코드/명령어 (그대로 복사)
```bash
# 명령어 또는 코드
```

### 프롬프트 (있다면)
```
프롬프트 텍스트
```

### 슬라이드/다이어그램 (있다면 캡처 경로)
- `screenshots/chapter01_slide03.png`

## 우리 출판사 자산에 어떻게 박을 것인가
- 적용 대상 책/계약/시스템:
- 변환 아이디어:
- 우선순위:

## Windows 환경 차이 / 막힌 부분
- (있으면 기록, 없으면 "없음")

## 강사의 명언/팁
- (인상 깊은 한 마디 기록)
```

---

## 진행 상태 트래커

| 단계 | 완료 | 메모 |
|---|---|---|
| Step 0. 세팅 (4시간) | ⏳ 텍스트화 중 | 5/13 시청, 5/14 정리 |
| Step 1. AI 조직 세팅 | ⏳ 5/14 시작 | 본강의 시작 |
| Step 2. 24시간 자동화 | 미시청 | |
| Step 3. 30실습 | 미시청 | 마케팅부 5명 우선 |

---

## 텍스트 던지실 때 — 빠른 가이드

대표님이 텍스트 던지시면 제가:
1. **타임스탬프·말버릇 제거** (어/그래서/네 그렇죠)
2. **챕터별로 분할** → 위 폴더 구조에 정리
3. **우리 자산 매핑** → `MARKETING_AUTOMATION_MASTER.md`에 통합
4. **Windows 변환 필요 부분 표시**
5. **즉시 적용 가능한 명령어/.md 정의 추출**

던지실 때 한 줄만 같이 주세요:
- 어느 챕터인지 (예: "Step 0 - Claude Code 설치 부분")
- 분량 대략 (예: "20분 분량")
- 특별 요청 (예: "이 부분 ADHD책에 어떻게 적용할지 봐줘")

---

## 관련 문서

- [마스터 청사진](../MARKETING_AUTOMATION_MASTER.md) — 30 에이전트 × 우리 자산 매핑
- [3-에이전트 메모리](C:/Users/JUN/.claude/projects/C--Users-JUN-my-first-project-book-writing-ai/memory/project_marketing_agents.md) — 자동 메모리
