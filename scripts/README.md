# 투고 자동화 스크립트

투고 시스템의 후속 이메일·주간 리포트·월간 백업을 자동화하는 cron 스크립트 모음입니다.

## 구성

| 스크립트 | 주기 | 역할 |
|--------|------|------|
| `followup_3d.py` | 매일 KST 10:00 | 접수 3~7일 경과 · 상담 미예약자에게 리마인더 |
| `followup_7d.py` | 매일 KST 10:00 | 접수 7~14일 경과 · 상담 미예약자에게 최종 리드마그넷 |
| `weekly_report.py` | 월요일 KST 09:00 | 지난 주 투고 요약 + VIP/미예약 리스트 대표 메일 |
| `monthly_snapshot.py` | 매월 1일 KST 02:00 | 시트 전체 CSV를 대표 메일에 첨부 백업 |

스케줄 설정: `.github/workflows/cron.yml`

## GitHub Secrets 세팅 (필수)

GitHub 레포 → Settings → Secrets and variables → Actions → New repository secret

| Secret 이름 | 값 | 비고 |
|-----------|---|------|
| `RESEND_API_KEY` | Resend API 키 | Streamlit Cloud의 것 그대로 |
| `GCP_SERVICE_ACCOUNT` | 서비스 계정 JSON **전체 문자열** | `jakkas-xxx.json` 내용 그대로 |
| `GSHEET_URL` | `https://docs.google.com/spreadsheets/d/1zo0jZMeWVhjXQ1pCZN2bcdze3DLpE-vmbQPZwp6j7Lg` | |
| `ADMIN_EMAIL` | `joyfuljun4@gmail.com` | 선택, 기본값 동일 |
| `RESEND_FROM` | `onboarding@resend.dev` | 선택, 도메인 인증 후 `noreply@jagabook.co.kr` |

## 시트 컬럼 자동 관리

`pages/1_투고하기.py`로 접수된 투고는 다음 컬럼에 자동 기록되며, 스크립트가 이를 참조합니다.

| 컬럼 | 용도 |
|-----|------|
| `접수시간` | 경과일 계산 |
| `이메일` | 발송 대상 |
| `등급` | S/A/B/C 템플릿 선택 |
| `저자 구매 의향` | 긴급도 태그 (100부+/200부+) |
| `상담 예약` | **대표가 수동으로 값 채우면** 후속 발송 중단 |
| `3일 후속 발송` | 발송 시 자동 타임스탬프 기록 (중복 방지) |
| `7일 후속 발송` | 동일 |
| `원고 미리보기` | 시트에 첫 500자 저장, 대시보드 노출 |

## 상담 예약 기록 방법

대표가 상담을 잡은 작가가 있으면, 시트에서 해당 행의 **`상담 예약`** 컬럼에
아무 값이나(예: 날짜, `"예약"`) 넣어두세요. 이후 후속 cron이 자동으로 skip합니다.

## 수동 실행

GitHub 레포 → Actions → "투고 자동화 cron" → Run workflow → job 선택 → Run

로컬 테스트:
```bash
export RESEND_API_KEY="..."
export GCP_SERVICE_ACCOUNT='{"type": "service_account", ...}'
export GSHEET_URL="https://docs.google.com/spreadsheets/d/1zo0jZMeWVhjXQ1pCZN2bcdze3DLpE-vmbQPZwp6j7Lg"
python -m scripts.weekly_report
```

## 트러블슈팅

**"환경변수 GCP_SERVICE_ACCOUNT 누락"**
→ GitHub Secrets에 JSON 전체를 **한 줄 압축 없이 원문 그대로** 붙여넣었는지 확인.

**"시트에 '3일 후속 발송' 컬럼이 없습니다"**
→ 이전 버전에서 만든 시트는 헤더가 짧아요. 아무 투고 하나 새로 접수되면 헤더가 자동 확장됩니다.
또는 시트 1행 끝에 `원고 미리보기`, `작가 회신 발송`, `3일 후속 발송`, `7일 후속 발송`, `상담 예약` 5개 컬럼을 수동 추가해도 됩니다.

**발송은 됐는데 받은 게 없음**
→ Resend 무료 티어는 가입 이메일(`joyfuljun4@gmail.com`)로만 수신 가능. 도메인 인증 전에는
외부 작가 이메일로는 발송 실패할 수 있음. `onboarding@resend.dev`로는 발송 가능하지만
스팸함으로 갈 수 있으니 jagabook.co.kr 도메인 인증을 먼저 마치는 걸 추천.
