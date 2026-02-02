"""
채팅 UI 컴포넌트 - 메시지 표시, 스트리밍, 액션 버튼
"""
import streamlit as st
from config import COACH_AVATAR, USER_AVATAR, ACTION_BUTTONS


def render_chat_history():
    """저장된 대화 내역 표시 (마지막 메시지에 액션 버튼 포함)"""
    messages = st.session_state.messages
    for idx, msg in enumerate(messages):
        avatar = COACH_AVATAR if msg["role"] == "assistant" else USER_AVATAR
        with st.chat_message(msg["role"], avatar=avatar):
            st.markdown(msg["content"])

            # 마지막 AI 메시지에만 액션 버튼 표시
            if msg["role"] == "assistant" and idx == len(messages) - 1:
                _render_action_buttons(idx)


def render_assistant_message_streaming(stream_generator):
    """AI 응답을 스트리밍으로 표시하고 완성된 텍스트 반환"""
    with st.chat_message("assistant", avatar=COACH_AVATAR):
        response = st.write_stream(stream_generator)
    return response


def render_user_message(content: str):
    """사용자 메시지 표시"""
    with st.chat_message("user", avatar=USER_AVATAR):
        st.markdown(content)


def render_milestone_celebration(milestone: dict):
    """마일스톤 달성 축하 효과"""
    st.balloons()
    st.toast(f"{milestone['icon']} {milestone['label']}", icon=milestone['icon'])


def render_phase_transition_notice(phase_num: int):
    """Phase 전환 안내 - 그라데이션 배너"""
    from config import PHASE_NAMES, PHASE_ICONS, PHASE_DESCRIPTIONS
    name = PHASE_NAMES.get(phase_num, "")
    icon = PHASE_ICONS.get(phase_num, "")
    desc = PHASE_DESCRIPTIONS.get(phase_num, "")

    st.markdown(
        f'<div class="phase-transition">'
        f'<h3 style="color:white!important;margin:0;">{icon} {phase_num}단계: {name}</h3>'
        f'<p style="color:rgba(255,255,255,0.9)!important;margin:0.3rem 0 0;">{desc}</p>'
        f'</div>',
        unsafe_allow_html=True,
    )


def _render_action_buttons(msg_idx: int):
    """AI 메시지 하단 원클릭 액션 버튼 (칩 스타일)"""
    st.markdown('<div class="action-btn-area">', unsafe_allow_html=True)
    cols = st.columns(5)
    actions = list(ACTION_BUTTONS.items())

    for i, (col, (action_key, action_info)) in enumerate(zip(cols, actions)):
        with col:
            if st.button(
                action_info["label"],
                key=f"action_{action_key}_{msg_idx}",
                use_container_width=True,
            ):
                st.session_state.action_pending = action_key
                st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)
