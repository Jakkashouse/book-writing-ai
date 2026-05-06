"""
사이드바 컴포넌트 - 진행현황, 통계, 산출물 다운로드, 투고, 세션 관리
"""
import streamlit as st
from config import (
    TOTAL_PHASES, PHASE_NAMES, PHASE_ICONS, PHASE_DESCRIPTIONS, APP_VERSION,
)
from coaching.context_manager import (
    get_progress_percentage, get_stats, reset_session,
    save_session_to_file, load_session_from_file,
    init_submission_state, enter_submission_mode, exit_submission_mode,
    load_session_from_gsheet, _upsert_session_meta,
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

        # ─── 작가 식별 (영구 저장 ON) ─────────
        # 이메일이 있어야 글이 구글시트에 저장되어 재배포 후에도 살아남음
        email_input = st.text_input(
            "✍️ 작가 이메일 (자동 저장 ON)",
            value=st.session_state.get("author_email", ""),
            placeholder="이메일을 입력하면 글이 영구 저장됩니다",
            key="author_email_input",
            help="이메일이 있어야 작성한 글이 구글시트에 자동 저장됩니다. "
                 "비워두면 화면을 닫는 순간 모두 사라집니다.",
        )
        normalized = (email_input or "").strip().lower()
        if normalized != st.session_state.get("author_email", ""):
            st.session_state.author_email = normalized

        if not st.session_state.get("author_email"):
            st.warning("⚠️ 이메일을 입력하지 않으면 글이 저장되지 않습니다.")
        else:
            col_load, col_save = st.columns(2)
            with col_load:
                if st.button(
                    "📂 이전 글 이어쓰기",
                    use_container_width=True,
                    key="load_from_sheet_btn",
                    help="같은 이메일로 저장된 글이 있으면 불러옵니다",
                ):
                    if load_session_from_gsheet(st.session_state.author_email):
                        st.toast("이전 글을 불러왔습니다!", icon="📂")
                        st.rerun()
                    else:
                        st.toast("저장된 글이 없습니다.", icon="⚠️")
            with col_save:
                if st.button(
                    "💾 지금 저장",
                    use_container_width=True,
                    key="save_to_sheet_btn",
                    help="현재까지 글을 구글시트에 저장합니다",
                ):
                    try:
                        _upsert_session_meta()
                        st.toast("저장 완료!", icon="✅")
                    except Exception as e:
                        st.error(f"저장 실패: {e}")
            st.caption("ℹ️ 메시지를 보낼 때마다 자동으로 저장됩니다.")

        st.divider()

        # ─── 현재 단계 하이라이트 카드 ─────────
        current_phase = st.session_state.current_phase
        phase_completed = st.session_state.phase_completed

        if current_phase <= TOTAL_PHASES:
            phase_name = PHASE_NAMES.get(current_phase, "")
            phase_icon = PHASE_ICONS.get(current_phase, "")
            phase_desc = PHASE_DESCRIPTIONS.get(current_phase, "")
            from coaching.phases import PHASE_QUESTIONS
            phase_output = PHASE_QUESTIONS.get(current_phase, {}).get("output", "")

            is_done = phase_completed.get(current_phase, False)
            if is_done and current_phase == TOTAL_PHASES:
                st.markdown(
                    '<div class="current-phase-card done">'
                    '<p style="margin:0;font-weight:700;font-size:1rem;color:#2D5016;">'
                    '🎉 모든 단계 완료!</p>'
                    '<p style="margin:0.2rem 0 0;font-size:0.82rem;color:#555;">'
                    '산출물을 다운로드하세요</p>'
                    '</div>',
                    unsafe_allow_html=True,
                )
            else:
                step = st.session_state.current_step
                st.markdown(
                    f'<div class="current-phase-card">'
                    f'<p style="margin:0;font-size:0.7rem;color:#888;text-transform:uppercase;'
                    f'letter-spacing:0.05em;">현재 단계</p>'
                    f'<p style="margin:0.2rem 0;font-weight:700;font-size:1.05rem;color:#2D5016;">'
                    f'{phase_icon} {current_phase}단계: {phase_name}</p>'
                    f'<p style="margin:0;font-size:0.8rem;color:#555;">{phase_desc}</p>'
                    f'<p style="margin:0.3rem 0 0;font-size:0.72rem;color:#888;">'
                    f'산출물: {phase_output} · 대화 {step}회</p>'
                    f'</div>',
                    unsafe_allow_html=True,
                )

        st.markdown('<div style="height:0.5rem;"></div>', unsafe_allow_html=True)

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

        # ─── 투고하기 버튼 ─────────────────────
        init_submission_state()
        is_sub_mode = st.session_state.get("submission_mode", False)

        if is_sub_mode:
            if st.button(
                "← 코칭으로 돌아가기",
                use_container_width=True,
                key="sidebar_back_to_coaching",
            ):
                exit_submission_mode()
                st.rerun()
        else:
            if st.button(
                "📮 투고하기",
                use_container_width=True,
                type="primary",
                key="sidebar_submit_btn",
            ):
                enter_submission_mode()
                st.rerun()
            st.caption("AI가 무료로 원고를 분석해드립니다")

        st.divider()

        # ─── Phase별 상태 ─────────────────────
        st.subheader("코칭 단계")

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
                save_session_to_file()
                st.toast("저장 완료!", icon="✅")

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

        # 새 대화 시작 (확인 포함)
        if "confirm_reset" not in st.session_state:
            st.session_state.confirm_reset = False

        if not st.session_state.confirm_reset:
            if st.button("🔄 새 대화 시작", use_container_width=True, type="secondary"):
                if st.session_state.messages:
                    st.session_state.confirm_reset = True
                    st.rerun()
                else:
                    reset_session()
                    st.rerun()
        else:
            st.warning("진행 중인 대화가 삭제됩니다.")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("확인", use_container_width=True, key="confirm_yes", type="primary"):
                    st.session_state.confirm_reset = False
                    reset_session()
                    st.rerun()
            with c2:
                if st.button("취소", use_container_width=True, key="confirm_no"):
                    st.session_state.confirm_reset = False
                    st.rerun()

        # ─── 푸터 ────────────────────────────
        st.markdown(
            f'<div class="sidebar-footer">'
            f'<p>Powered by Claude AI</p>'
            f'<p>작가의집 출판사 · v{APP_VERSION}</p>'
            f'</div>',
            unsafe_allow_html=True,
        )


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
