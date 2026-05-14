# book-writing-ai — 매뉴얼

## 프로젝트 목적
작가의집 출판사를 위한 AI 책쓰기 코칭 플랫폼. Streamlit 본체(`app.py`) + Next.js 신버전(`book-coaching-next/`, `webapp/`) + 한국어 출판 워크플로 프롬프트(`prompts/`).

## 절대 룰 (NEVER / ALWAYS)
1. **NEVER** 결과물 파일을 프로젝트 폴더에 저장하지 말 것. **항상 `C:\Users\JUN\Downloads\`** 에 저장.
2. **NEVER** 원고 교정 시 수정본 파일을 만들지 말 것. **Before/After 리포트만** 보고.
3. **NEVER** 독자용 원고에 메타 텍스트(판본 노트·v번호·편집 요약박스) 금지. 말투는 "-습니다" 에세이 톤.
4. **NEVER** 홍보물에 수료증 관련 내용 포함 금지.
5. **ALWAYS** 보도자료는 `.docx`, 나머지 홍보물은 `.md`+`.pdf` 동시 생성.
6. **ALWAYS** 카드뉴스는 10장 이상, 에피소드+명문장+스토리 풍성하게.
7. **ALWAYS** 보도자료 리드 크레딧 기본값: `[북트립 이철화 기자]`.
8. **ALWAYS** 멀티 리포 환경 — 문서 보여드릴 때 현재 폴더 자동 판단 말고 **리포·브랜치·경로부터 확인**.

## 검증 체크리스트 (작업 끝나면 스스로 점검)
- [ ] 결과물이 `Downloads/`에 저장됐는가?
- [ ] 홍보물이면 작가용 5종 / 출판사 내부용으로 분리됐는가?
- [ ] 원고 교정이면 수정본 파일 없이 Before/After만 보고했는가?
- [ ] 맞춤법 요청이면 2-3라운드 반복 검토했는가?

## 트리거 단어 → 자동 동작
- **`/홍보물`** → 보도자료(.docx) + 카드뉴스(10장+, .md/.pdf) + 릴스 내레이션 영상 2개 + 작가용/출판사용 분리
- **`/교정`** → 1라운드(반복/구조) → 2라운드(비문/오탈자) → 3라운드(재채점) 자동, Before/After 리포트만
- **`/진단`** → 구조(25)+문장(25)+메시지(25)+몰입도(25) = 100점 채점. 목표 90점+
- **`/마케팅 <주제>`** → 3-에이전트 파이프라인: content-creator → sns-publisher → insight-analyzer
- **`/배포 <폴더>`** → Next.js→Vercel, 정적→Netlify 자동 판별 배포 + 200 응답 확인

## 서브 에이전트 (`.claude/agents/`)
- **content-creator** — 블로그·인스타·유튜브 3종 동시 생성
- **sns-publisher** — 플랫폼별 포맷 변환 + 발행 예약
- **insight-analyzer** — 성과 분석 + 다음 주 5개 주제 제안
원칙: 분신 남용 금지. 진짜 독립적 작업(자료조사·다중 콘텐츠)에만 사용.

## 사용 도구
- Python 3.12 (`python` / `py`), Streamlit, FastAPI
- Node.js (Next.js 14, App Router, TypeScript, Tailwind)
- pandoc(docx 변환), python-docx, reportlab(PDF), pdftotext(추출)
- Git, Netlify(랜딩), Vercel(Next.js), Railway(FastAPI)

## 매뉴얼 업데이트 원칙
이 파일은 50줄 이내로 유지. 새 규칙은 직접 손대지 말고 "이 규칙 매뉴얼에 추가해줘"라고 지시할 것.
