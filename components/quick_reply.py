"""
Quick Reply 버튼 - Phase별 추천 선택지
"""
import streamlit as st
from coaching.phases import get_quick_replies


def render_quick_replies(key_prefix: str = "qr") -> str | None:
    """현재 Phase에 맞는 Quick Reply 버튼 표시

    각 단계에서 처음 몇 턴 동안만 표시 (단계가 바뀌면 다시 표시)
    """
    phase = st.session_state.current_phase
    options = get_quick_replies(phase)

    if not options:
        return None

    # 현재 단계 내 대화 수 계산 (단계가 바뀌면 리셋)
    phase_messages = [
        m for m in st.session_state.messages
        if m.get("phase") == phase and m["role"] == "user"
    ]

    # 단계별 처음 3턴까지만 퀵 리플라이 표시
    if len(phase_messages) >= 3:
        return None

    st.caption("💡 빠른 선택:")
    with st.container():
        st.markdown('<div class="quick-reply-area">', unsafe_allow_html=True)
        cols = st.columns(len(options))
        for i, (col, option) in enumerate(zip(cols, options)):
            with col:
                if st.button(option, key=f"{key_prefix}_{phase}_{i}", use_container_width=True):
                    return option
        st.markdown('</div>', unsafe_allow_html=True)

    return None


def render_phase_transition_buttons() -> str | None:
    """Phase 전환 확인 버튼"""
    st.info("이 단계의 핵심 내용이 정리되었습니다. 다음 단계로 넘어갈까요?")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("✅ 다음 단계로", use_container_width=True, key="next_phase"):
            return "next"
    with col2:
        if st.button("🔄 더 이야기하기", use_container_width=True, key="stay_phase"):
            return "stay"
    return None
