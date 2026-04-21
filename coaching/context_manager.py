"""
대화 컨텍스트 누적 관리
- session_state 관리
- 마일스톤 추적
- JSON 저장/불러오기
"""
import json
import streamlit as st
from pathlib import Path
from datetime import datetime
from config import TOTAL_PHASES, DATA_DIR, SAVE_FILENAME, MILESTONES, GSHEET_URL

# Phase별 진행률 가중치
# 1단계(발견/제목) 완료 = 40%, 2단계(구조화/목차) 완료 = 80%
# 3단계(집필) 완료 = 95%, 4단계(마무리) 완료 = 100%
PHASE_WEIGHTS = {
    0: 0.0,    # 시작 전
    1: 0.40,   # 1단계 완료
    2: 0.80,   # 2단계 완료 (제목+목차 = 80%)
    3: 0.95,   # 3단계 완료
    4: 1.00,   # 4단계 완료
}


def init_session_state():
    """세션 상태 초기화"""
    defaults = {
        "messages": [],
        "current_phase": 1,
        "current_step": 0,  # 0부터 시작 (3% 버그 수정)
        "phase_completed": {i: False for i in range(1, TOTAL_PHASES + 1)},
        "user_data": {},
        "outputs": {},
        "initialized": False,
        "milestones_achieved": [],
        "pending_milestone": None,
        "total_user_messages": 0,
        "action_pending": None,
        "session_start": datetime.now().isoformat(),
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def add_message(role: str, content: str):
    """메시지 추가 + 자동 저장"""
    st.session_state.messages.append({
        "role": role,
        "content": content,
        "phase": st.session_state.current_phase,
        "timestamp": datetime.now().isoformat(),
    })
    if role == "user":
        st.session_state.total_user_messages += 1
        _check_message_milestones()

    # 자동 저장 (매 메시지마다)
    try:
        save_session_to_file()
    except Exception:
        pass  # 저장 실패해도 대화는 계속


def get_api_messages() -> list:
    """LLM API에 전달할 메시지 목록 (최근 대화 중심)"""
    messages = st.session_state.messages
    recent = messages[-24:] if len(messages) > 24 else messages

    api_messages = []
    for msg in recent:
        api_messages.append({
            "role": msg["role"],
            "content": msg["content"],
        })
    return api_messages


def get_last_assistant_message() -> str:
    """마지막 AI 응답 텍스트"""
    for msg in reversed(st.session_state.messages):
        if msg["role"] == "assistant":
            return msg["content"]
    return ""


def advance_step():
    """대화 스텝 증가"""
    st.session_state.current_step += 1


def advance_phase():
    """다음 Phase로 이동"""
    current = st.session_state.current_phase
    st.session_state.phase_completed[current] = True

    # Phase 완료 마일스톤
    milestone_key = f"phase{current}_done"
    _trigger_milestone(milestone_key)

    if current < TOTAL_PHASES:
        st.session_state.current_phase = current + 1
        st.session_state.current_step = 0


def check_phase_complete(response: str) -> bool:
    """AI 응답에 [PHASE_COMPLETE] 태그가 있는지 확인"""
    return "[PHASE_COMPLETE]" in response


def clean_response(response: str) -> str:
    """응답에서 시스템 태그 제거"""
    return response.replace("[PHASE_COMPLETE]", "").strip()


def update_user_data(key: str, value):
    """사용자 데이터 업데이트"""
    st.session_state.user_data[key] = value


def save_output(phase: int, content: str):
    """Phase별 산출물 저장"""
    st.session_state.outputs[phase] = content


def get_progress_percentage() -> float:
    """전체 진행률 (0~1), 가중치 적용

    - 아무것도 안 했으면 0%
    - 1단계 완료 = 40%
    - 2단계 완료 (제목+목차) = 80%
    - 3단계 완료 = 95%
    - 4단계 완료 = 100%
    - Phase 내에서는 대화 스텝에 따라 서서히 증가
    """
    completed_count = sum(1 for v in st.session_state.phase_completed.values() if v)
    current_phase = st.session_state.current_phase
    step = st.session_state.current_step

    # 완료된 Phase까지의 기본 진행률
    base = PHASE_WEIGHTS.get(completed_count, 0.0)

    # 현재 Phase 내 진행도 (0~1)
    phase_internal = min(step / 7, 1.0) if step > 0 else 0.0

    # 현재 Phase의 구간 크기
    next_weight = PHASE_WEIGHTS.get(completed_count + 1, 1.0)
    phase_range = next_weight - base

    return base + (phase_internal * phase_range)


def get_stats() -> dict:
    """현재 세션 통계"""
    total_msgs = len(st.session_state.messages)
    user_msgs = st.session_state.total_user_messages
    assistant_msgs = total_msgs - user_msgs

    total_chars = sum(
        len(m["content"]) for m in st.session_state.messages
        if m["role"] == "assistant"
    )

    return {
        "total_messages": total_msgs,
        "user_messages": user_msgs,
        "assistant_messages": assistant_msgs,
        "total_chars": total_chars,
        "phases_completed": sum(1 for v in st.session_state.phase_completed.values() if v),
        "milestones": len(st.session_state.milestones_achieved),
    }


# ─── 마일스톤 ──────────────────────────────────

def _trigger_milestone(key: str):
    """마일스톤 달성"""
    if key not in st.session_state.milestones_achieved and key in MILESTONES:
        st.session_state.milestones_achieved.append(key)
        st.session_state.pending_milestone = key


def _check_message_milestones():
    """메시지 수 기반 마일스톤 체크"""
    count = st.session_state.total_user_messages
    if count == 1:
        _trigger_milestone("first_message")
    elif count == 10:
        _trigger_milestone("messages_10")
    elif count == 30:
        _trigger_milestone("messages_30")
    elif count == 50:
        _trigger_milestone("messages_50")


def consume_pending_milestone() -> dict | None:
    """대기 중인 마일스톤 소비 (표시 후 제거)"""
    key = st.session_state.pending_milestone
    if key:
        st.session_state.pending_milestone = None
        return MILESTONES.get(key)
    return None


# ─── 데이터 저장/불러오기 ──────────────────────

def save_session_to_file():
    """세션 데이터를 JSON으로 저장"""
    data_dir = Path(DATA_DIR)
    data_dir.mkdir(exist_ok=True)

    data = {
        "messages": st.session_state.messages,
        "current_phase": st.session_state.current_phase,
        "current_step": st.session_state.current_step,
        "phase_completed": {str(k): v for k, v in st.session_state.phase_completed.items()},
        "user_data": st.session_state.user_data,
        "outputs": {str(k): v for k, v in st.session_state.outputs.items()},
        "milestones_achieved": st.session_state.milestones_achieved,
        "total_user_messages": st.session_state.total_user_messages,
        "saved_at": datetime.now().isoformat(),
    }

    filepath = data_dir / SAVE_FILENAME
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return filepath


def load_session_from_file() -> bool:
    """JSON에서 세션 데이터 불러오기"""
    filepath = Path(DATA_DIR) / SAVE_FILENAME
    if not filepath.exists():
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    st.session_state.messages = data.get("messages", [])
    st.session_state.current_phase = data.get("current_phase", 1)
    st.session_state.current_step = data.get("current_step", 0)
    st.session_state.phase_completed = {int(k): v for k, v in data.get("phase_completed", {}).items()}
    st.session_state.user_data = data.get("user_data", {})
    st.session_state.outputs = {int(k): v for k, v in data.get("outputs", {}).items()}
    st.session_state.milestones_achieved = data.get("milestones_achieved", [])
    st.session_state.total_user_messages = data.get("total_user_messages", 0)
    st.session_state.initialized = True
    return True


def reset_session():
    """세션 초기화"""
    keys_to_delete = [
        "messages", "current_phase", "current_step", "phase_completed",
        "user_data", "outputs", "initialized", "milestones_achieved",
        "pending_milestone", "total_user_messages", "action_pending",
        "session_start", "submission_mode", "submission_data",
        "submission_result", "submission_step",
    ]
    for key in keys_to_delete:
        if key in st.session_state:
            del st.session_state[key]


# ─── 투고 시스템 ──────────────────────────────

def init_submission_state():
    """투고 관련 세션 상태 초기화"""
    defaults = {
        "submission_mode": False,
        "submission_step": "input",  # input → analyzing → result → choice
        "submission_data": {},
        "submission_result": None,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def enter_submission_mode():
    """투고 모드 진입"""
    init_submission_state()
    st.session_state.submission_mode = True
    st.session_state.submission_step = "input"


def exit_submission_mode():
    """투고 모드 종료 → 코칭으로 복귀"""
    st.session_state.submission_mode = False


def save_submission(data: dict):
    """투고 데이터 저장 (로컬 JSON)"""
    st.session_state.submission_data = data

    # data/ 폴더에 투고 기록 저장
    data_dir = Path(DATA_DIR)
    data_dir.mkdir(exist_ok=True)
    submissions_file = data_dir / "submissions.json"

    submissions = []
    if submissions_file.exists():
        with open(submissions_file, "r", encoding="utf-8") as f:
            submissions = json.load(f)

    record = {
        **data,
        "submitted_at": datetime.now().isoformat(),
        "user_data": st.session_state.user_data,
    }
    submissions.append(record)

    with open(submissions_file, "w", encoding="utf-8") as f:
        json.dump(submissions, f, ensure_ascii=False, indent=2)

    return record


def save_submission_choice(choice: str, contact: dict = None):
    """3개의 문 선택 저장"""
    data_dir = Path(DATA_DIR)
    data_dir.mkdir(exist_ok=True)
    choices_file = data_dir / "submission_choices.json"

    choices = []
    if choices_file.exists():
        with open(choices_file, "r", encoding="utf-8") as f:
            choices = json.load(f)

    record = {
        "choice": choice,
        "contact": contact,
        "submission_data": st.session_state.submission_data,
        "chosen_at": datetime.now().isoformat(),
    }
    choices.append(record)

    with open(choices_file, "w", encoding="utf-8") as f:
        json.dump(choices, f, ensure_ascii=False, indent=2)

    return record


def send_submission_email(submission: dict):
    """투고 접수 이메일 알림 (SMTP 설정 시 작동)"""
    try:
        email_config = st.secrets.get("email_notify", {})
        if not email_config:
            return False

        import smtplib
        from email.mime.text import MIMEText

        urgency = submission.get("urgency", "low")
        urgency_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(urgency, "🟢")
        author = submission.get("author_name", "미상")
        title = submission.get("book_title", "제목 미정")

        subject = f"[투고 접수] {author} — {urgency_emoji} 「{title}」"
        body = (
            f"투고가 접수되었습니다.\n\n"
            f"작가: {author}\n"
            f"제목: {title}\n"
            f"긴급도: {urgency_emoji}\n"
            f"접수 시간: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
            f"목차:\n{submission.get('toc', '(없음)')}\n\n"
            f"원고 분량: {len(submission.get('manuscript', ''))}자\n"
        )

        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = email_config["smtp_user"]
        msg["To"] = email_config["to"]

        with smtplib.SMTP(email_config["smtp_server"], int(email_config["smtp_port"])) as server:
            server.starttls()
            server.login(email_config["smtp_user"], email_config["smtp_pass"])
            server.send_message(msg)

        return True
    except Exception:
        return False


# ══════════════════════════════════════════════════
# 원고 업로드 투고 시스템 (pages/1_투고하기.py 전용)
# - 기존 투고 시스템(위쪽)과 병존
# - 구글시트 '투고_원고접수' 탭 + 대표 이메일 리포트 + 원고 첨부
# ══════════════════════════════════════════════════

def _get_gsheet_client():
    """서비스 계정으로 구글시트 클라이언트 생성 (없으면 None)."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials
        creds_dict = dict(st.secrets["gcp_service_account"])
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        return gspread.authorize(creds)
    except Exception:
        return None


def _get_spreadsheet():
    gc = _get_gsheet_client()
    if gc is None:
        return None
    try:
        return gc.open_by_url(GSHEET_URL)
    except Exception:
        return None


def _get_or_create_worksheet(spreadsheet, title: str, headers: list):
    import gspread
    try:
        ws = spreadsheet.worksheet(title)
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title=title, rows=1000, cols=len(headers))
        ws.update(f"A1:{chr(64+len(headers))}1", [headers])
        ws.format(f"A1:{chr(64+len(headers))}1", {"textFormat": {"bold": True}})
    return ws


def save_manuscript_submission(payload: dict, analysis: dict) -> tuple[bool, str]:
    """원고 투고 전용 저장 + 대표 이메일 리포트."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    author = payload.get("name", "무명").strip() or "무명"
    grade, label, _ = analysis["classification"]
    score = analysis["scores"]["total"]

    sheet_ok = False
    spreadsheet = _get_spreadsheet()
    if spreadsheet is not None:
        headers = [
            "접수시간", "작가명", "이메일", "연락처",
            "직업·경력", "제목 후보", "SNS 팔로워", "SNS 등급",
            "저자 구매 의향", "상담 희망", "메모",
            "글자수", "주제 카테고리", "트렌드 키워드",
            "점수", "등급", "원고 파일명", "설문지 파일명",
        ]
        try:
            ws = _get_or_create_worksheet(spreadsheet, "투고_원고접수", headers)
            ws.append_row([
                now, author,
                payload.get("email", ""), payload.get("phone", ""),
                payload.get("profession", ""), payload.get("title_candidate", ""),
                payload.get("total_followers", 0), analysis["scores"]["sns_tier"],
                payload.get("author_purchase", ""), payload.get("consult_topics", ""),
                payload.get("memo", ""),
                analysis["text_stats"]["chars_no_space"],
                analysis["market_data"]["primary_category"],
                ", ".join(analysis["market_data"]["trending_matches"].keys()),
                score, grade,
                payload.get("manuscript_filename", ""),
                payload.get("survey_filename", "") or "(미업로드)",
            ], value_input_option="USER_ENTERED")
            sheet_ok = True
        except Exception:
            pass

    email_ok = _send_manuscript_email(payload, analysis)

    if sheet_ok and email_ok:
        return True, "✅ 투고 접수 완료! 대표님 메일과 구글시트에 기록됐습니다."
    if email_ok:
        return True, "✅ 접수 완료 (이메일 발송됨). 시트 저장은 실패했으나 누락 없음."
    if sheet_ok:
        return True, "✅ 접수 완료 (시트 저장됨). 이메일 발송은 실패 — 대표 확인 필요."
    return False, "⚠️ 저장/발송 모두 실패. 네트워크 확인 후 다시 시도해주세요."


def _send_manuscript_email(payload: dict, analysis: dict) -> bool:
    """원고 투고용 대표 이메일 — 분석 리포트 본문 + 원고/설문지 파일 첨부."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.base import MIMEBase
    from email import encoders

    try:
        cfg = st.secrets.get("email_notify", {})
        to_email = cfg.get("to", "")
        smtp_server = cfg.get("smtp_server", "smtp.gmail.com")
        smtp_port = int(cfg.get("smtp_port", 587))
        smtp_user = cfg.get("smtp_user", "")
        smtp_pass = cfg.get("smtp_pass", "")
        if not (to_email and smtp_user and smtp_pass):
            return False

        grade, _label, _ = analysis["classification"]
        score = analysis["scores"]["total"]
        category = analysis["market_data"]["primary_category"]
        author = payload.get("name", "무명")

        msg = MIMEMultipart()
        msg["Subject"] = f"[투고] {author} — {grade}등급 {score}점 — {category}"
        msg["From"] = smtp_user
        msg["To"] = to_email
        msg.attach(MIMEText(analysis["email_body"], "plain", "utf-8"))

        for key_data, key_name in (
            ("manuscript_bytes", "manuscript_filename"),
            ("survey_bytes", "survey_filename"),
        ):
            data = payload.get(key_data)
            fname = payload.get(key_name)
            if data and fname:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(data)
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition", "attachment",
                    filename=("utf-8", "", fname),
                )
                msg.attach(part)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception:
        return False
