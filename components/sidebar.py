"""
사이드바 컴포넌트 - 진행현황, 통계, 산출물 다운로드, 세션 관리
"""
import streamlit as st
from config import TOTAL_PHASES, PHASE_NAMES, PHASE_ICONS, PHASE_DESCRIPTIONS
from coaching.context_manager import (
    get_progress_percentage, get_stats, reset_session,
    save_session_to_file, load_session_from_file,
)


def render_sidebar():
    """사이드바 렌더링"""
    with st.sidebar:
        # ─── 브랜드 헤더 ────────────────────
        st.markdown(
            '<div style="text-align:center;padding:0.5rem 0 0.2rem;">'
            '<span style="font-size:2.2rem;">📚</span>'
            '</div>',
            unsafe_allow_html=True,
        )
        st.markdown(
            '<h1 style="text-align:center;margin:0;padding:0;">작가의집</h1>',
            unsafe_allow_html=True,
        )
        st.markdown(
            '<p style="text-align:center;color:#888;font-size:0.85rem;margin-top:0.1rem;">'
            'AI 책쓰기 코치</p>',
            unsafe_allow_html=True,
        )

        st.divider()

        # ─── 전체 진행률 ──────────────────────
        progress = get_progress_percentage()
        pct = int(progress * 100)
        st.markdown(
            f'<p style="font-size:0.8rem;color:#666;margin-bottom:0.3rem;">'
            f'전체 진행률 <strong style="color:#2D5016;">{pct}%</strong></p>',
            unsafe_allow_html=True,
        )
        st.progress(progress)

        # ─── 통계 메트릭 ──────────────────────
        stats = get_stats()
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("대화", f"{stats['total_messages']}회")
        with col2:
            st.metric("단계", f"{stats['phases_completed']}/4")
        with col3:
            st.metric("글자수", f"{stats['total_chars']:,}")

        st.divider()

        # ─── Phase별 상태 (타임라인) ─────────
        st.subheader("코칭 단계")
        current_phase = st.session_state.current_phase
        phase_completed = st.session_state.phase_completed

        for i in range(1, TOTAL_PHASES + 1):
            if phase_completed.get(i):
                icon = "✅"
                status = "완료"
            elif i == current_phase:
                icon = "▶️"
                status = "진행 중"
            else:
                icon = "⬜"
                status = "대기"

            label = f"{icon} {i}단계: {PHASE_NAMES[i]} ({status})"
            with st.expander(label, expanded=(i == current_phase)):
                st.caption(f"{PHASE_ICONS[i]} {PHASE_DESCRIPTIONS[i]}")

                # 현재 진행 중인 단계에 목표 표시
                if i == current_phase and not phase_completed.get(i):
                    step = st.session_state.current_step
                    st.caption(f"📊 대화 {step}회 진행")

                output = st.session_state.outputs.get(i)
                if output:
                    st.success("산출물 완성!")
                    st.download_button(
                        label=f"📥 {i}단계 산출물 다운로드",
                        data=output,
                        file_name=f"작가의집_{i}단계_{PHASE_NAMES[i]}_산출물.md",
                        mime="text/markdown",
                        key=f"download_{i}",
                        use_container_width=True,
                    )

        st.divider()

        # ─── 파악된 정보 요약 ──────────────────
        user_data = st.session_state.user_data
        if user_data:
            st.subheader("파악된 정보")
            field_labels = {
                "expertise": "📌 전문 분야",
                "core_message": "💡 핵심 메시지",
                "target_audience": "👥 타깃 독자",
                "book_title": "📖 책 제목",
            }
            for key, label in field_labels.items():
                value = user_data.get(key)
                if value:
                    truncated = value[:40] + ("..." if len(str(value)) > 40 else "")
                    st.caption(f"{label}: {truncated}")
            st.divider()

        # ─── 달성한 마일스톤 ───────────────────
        milestones = st.session_state.milestones_achieved
        if milestones:
            with st.expander(f"🏆 마일스톤 ({len(milestones)}개)", expanded=False):
                from config import MILESTONES
                for key in milestones:
                    info = MILESTONES.get(key, {})
                    st.caption(f"{info.get('icon', '🏆')} {info.get('label', key)}")

        # ─── 세션 관리 ────────────────────────
        st.subheader("세션 관리")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("💾 저장", use_container_width=True, key="save_btn"):
                filepath = save_session_to_file()
                st.toast(f"저장 완료!", icon="✅")

        with col2:
            if st.button("📂 불러오기", use_container_width=True, key="load_btn"):
                if load_session_from_file():
                    st.toast("이전 세션을 불러왔습니다!", icon="📂")
                    st.rerun()
                else:
                    st.toast("저장된 세션이 없습니다.", icon="⚠️")

        # 전체 대화 내보내기
        if st.session_state.messages:
            full_export = _export_full_conversation()
            st.download_button(
                label="📄 전체 대화 내보내기",
                data=full_export,
                file_name="작가의집_코칭대화_전체.md",
                mime="text/markdown",
                key="export_all",
                use_container_width=True,
            )

        if st.button("🔄 새 대화 시작", use_container_width=True, type="secondary"):
            reset_session()
            st.rerun()


def _export_full_conversation() -> str:
    """전체 대화를 마크다운으로 내보내기"""
    lines = ["# 작가의집 AI 코칭 대화 기록\n"]

    user_data = st.session_state.user_data
    if user_data.get("book_title"):
        lines.append(f"**책 제목(잠정)**: {user_data['book_title']}\n")

    lines.append("---\n")

    current_phase = None
    for msg in st.session_state.messages:
        phase = msg.get("phase", 1)
        if phase != current_phase:
            current_phase = phase
            lines.append(f"\n## {phase}단계: {PHASE_NAMES.get(phase, '')}\n")

        role = "**코치**" if msg["role"] == "assistant" else "**나**"
        lines.append(f"{role}: {msg['content']}\n")

    # 산출물 첨부
    outputs = st.session_state.outputs
    if outputs:
        lines.append("\n---\n## 산출물\n")
        for phase_num, content in sorted(outputs.items()):
            lines.append(f"### {phase_num}단계 산출물\n{content}\n")

    return "\n".join(lines)
