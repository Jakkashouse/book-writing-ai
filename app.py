"""
작가의집 AI 책쓰기 코치 - 메인 앱
=====================================
Streamlit 기반 대화형 AI 코칭 웹앱

실행: streamlit run app.py
"""
import streamlit as st
from pathlib import Path

from config import APP_TITLE, APP_ICON, COACH_AVATAR, USER_AVATAR, ACTION_BUTTONS
from coaching.context_manager import (
    init_session_state,
    init_submission_state,
    add_message,
    get_api_messages,
    get_last_assistant_message,
    advance_step,
    advance_phase,
    check_phase_complete,
    clean_response,
    save_output,
    consume_pending_milestone,
)
from coaching.phases import get_welcome_message
from coaching.prompts import build_system_prompt, build_action_prompt
from components.sidebar import render_sidebar
from components.submission import render_submission_page
from components.chat_ui import (
    render_chat_history,
    render_assistant_message_streaming,
    render_milestone_celebration,
    render_phase_transition_notice,
)
from components.quick_reply import render_quick_replies
from llm.streaming import stream_response, stream_action_response

# ═══════════════════════════════════════════════
# 페이지 설정
# ═══════════════════════════════════════════════
st.set_page_config(
    page_title=APP_TITLE,
    page_icon=APP_ICON,
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── 커스텀 CSS ──────────────────────────────
css_file = Path(__file__).parent / "assets" / "style.css"
if css_file.exists():
    st.markdown(
        f"<style>{css_file.read_text(encoding='utf-8')}</style>",
        unsafe_allow_html=True,
    )

# ─── 세션 초기화 ─────────────────────────────
init_session_state()
init_submission_state()

# ─── 사이드바 ────────────────────────────────
render_sidebar()

# ═══════════════════════════════════════════════
# 투고 모드 분기
# ═══════════════════════════════════════════════
if st.session_state.get("submission_mode", False):
    render_submission_page()
    st.stop()

# ═══════════════════════════════════════════════
# 메인 채팅 영역
# ═══════════════════════════════════════════════
st.title(f"{APP_ICON} {APP_TITLE}")
st.caption("질문을 통해 당신의 전문성을 끌어내는 AI 코치 | 작가의집 출판사")

# 현재 단계 표시
from config import PHASE_NAMES, PHASE_ICONS
_phase = st.session_state.current_phase
_phase_name = PHASE_NAMES.get(_phase, "")
_phase_icon = PHASE_ICONS.get(_phase, "")
st.markdown(
    f'<div style="background:linear-gradient(90deg,#2D5016,#4A8C2A);'
    f'color:white;padding:0.5rem 1rem;border-radius:10px;margin-bottom:1rem;'
    f'font-size:0.85rem;font-weight:600;">'
    f'{_phase_icon} {_phase}단계: {_phase_name} 진행 중</div>',
    unsafe_allow_html=True,
)

# ─── 환영 메시지 (첫 방문) ────────────────────
if not st.session_state.initialized:
    welcome = get_welcome_message()
    add_message("assistant", welcome)
    st.session_state.initialized = True

# ─── 마일스톤 축하 ───────────────────────────
milestone = consume_pending_milestone()
if milestone:
    render_milestone_celebration(milestone)

# ─── 대화 내역 표시 ──────────────────────────
render_chat_history()

# ─── Quick Reply 버튼 ────────────────────────
quick_reply = render_quick_replies()


# ═══════════════════════════════════════════════
# 응답 생성 함수
# ═══════════════════════════════════════════════
def process_user_input(user_input: str):
    """사용자 입력 처리 → AI 응답 생성"""
    # 빈 입력 무시
    if not user_input or not user_input.strip():
        return

    user_input = user_input.strip()

    # 사용자 메시지 표시 및 저장
    with st.chat_message("user", avatar=USER_AVATAR):
        st.markdown(user_input)
    add_message("user", user_input)

    # 시스템 프롬프트 생성
    system_prompt = build_system_prompt(
        phase=st.session_state.current_phase,
        step=st.session_state.current_step,
        user_data=st.session_state.user_data,
    )

    # API 메시지 준비
    api_messages = get_api_messages()

    # AI 응답 스트리밍
    try:
        response = render_assistant_message_streaming(
            stream_response(system_prompt, api_messages)
        )

        # Phase 완료 감지
        if check_phase_complete(response):
            cleaned = clean_response(response)
            # 산출물 저장
            save_output(st.session_state.current_phase, cleaned)
            # 응답 저장 (태그 제거 버전)
            add_message("assistant", cleaned)
            # Phase 전환
            advance_phase()
            render_phase_transition_notice(st.session_state.current_phase)
        else:
            add_message("assistant", response)

        advance_step()

    except ValueError as e:
        st.error(str(e))
    except Exception as e:
        st.error(f"오류가 발생했습니다: {str(e)}")
        col1, col2 = st.columns([3, 1])
        with col1:
            st.info(
                "**해결 방법:**\n"
                "1. API 키가 올바른지 확인하세요\n"
                "2. 인터넷 연결 상태를 확인하세요"
            )
        with col2:
            if st.button("🔄 다시 시도", key="retry_btn", use_container_width=True):
                st.rerun()


def process_action(action_key: str):
    """원클릭 액션 처리"""
    action_info = ACTION_BUTTONS.get(action_key)
    if not action_info:
        return

    last_response = get_last_assistant_message()
    action_prompt = build_action_prompt(action_key, last_response)

    system_prompt = build_system_prompt(
        phase=st.session_state.current_phase,
        step=st.session_state.current_step,
        user_data=st.session_state.user_data,
    )

    api_messages = get_api_messages()

    try:
        # 액션 요청을 사용자 메시지로 표시
        with st.chat_message("user", avatar=USER_AVATAR):
            st.markdown(f"*{action_info['label']}*")
        add_message("user", f"[액션: {action_info['label']}]")

        # AI 응답
        response = render_assistant_message_streaming(
            stream_action_response(system_prompt, action_prompt, api_messages)
        )
        add_message("assistant", response)

    except Exception as e:
        st.error(f"오류: {str(e)}")


# ═══════════════════════════════════════════════
# 입력 처리
# ═══════════════════════════════════════════════

# 입력창은 항상 표시
prompt = st.chat_input("메시지를 입력하세요...")

# 1. 원클릭 액션이 대기 중이면 처리
if st.session_state.action_pending:
    action_key = st.session_state.action_pending
    st.session_state.action_pending = None
    process_action(action_key)

# 2. Quick Reply 버튼 클릭
elif quick_reply:
    process_user_input(quick_reply)

# 3. 일반 텍스트 입력
elif prompt:
    process_user_input(prompt)
