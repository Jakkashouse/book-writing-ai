"""
투고 시스템 UI 컴포넌트
- 투고 입력 폼
- AI 분석 결과 표시
- "3개의 문" 선택지
"""
import streamlit as st
from config import SUBMISSION_URGENCY, PUBLISHING_ROUTES
from coaching.context_manager import (
    save_submission, save_submission_choice, send_submission_email,
    exit_submission_mode,
)
from llm.streaming import stream_submission_analysis


# ─── AI 분석 시스템 프롬프트 ──────────────────

SUBMISSION_ANALYSIS_PROMPT = """당신은 작가의집 출판사의 전문 편집자입니다.
투고된 원고(또는 기획안)를 분석하여 출간 가능성을 평가합니다.

## 평가 기준 (각 25점, 총 100점)

### 1. 시장성 (25점)
- 타깃 독자가 명확한가?
- 현재 출판 트렌드와 맞는가?
- 유사 도서 대비 차별점이 있는가?
- 제목이 서점에서 눈에 띄는가?

### 2. 전문성 (25점)
- 저자가 이 주제를 쓸 자격이 있는가?
- 독자에게 실질적 도움을 줄 수 있는가?
- 사례와 경험이 구체적인가?

### 3. 완성도 (25점)
- 구조가 논리적인가?
- 문장이 읽기 편한가?
- 분량이 적절한가? (목차만 있으면 목차 기준으로)

### 4. 몰입도 (25점)
- 첫 페이지에서 끌리는가?
- 스토리텔링이 있는가?
- 독자가 끝까지 읽고 싶은가?

## 출력 형식

반드시 아래 형식으로 출력하세요:

### 종합 점수

| 항목 | 점수 | 한줄 평가 |
|------|------|----------|
| 시장성 | __/25 | ... |
| 전문성 | __/25 | ... |
| 완성도 | __/25 | ... |
| 몰입도 | __/25 | ... |
| **총점** | **__/100** | ... |

### 이 원고가 빛나는 이유 (강점 3가지)

1. ...
2. ...
3. ...

### 출간 전 다듬으면 좋을 부분

(우선순위 순, Before/After 예시 포함)

### 예상 독자 & 포지셔닝

- 타깃 독자:
- 유사 도서:
- 차별점:

### 1년 판매량 예측 (보수적)

| 채널 | 예상 부수 |
|------|----------|
| 온라인 서점 | |
| 오프라인 서점 | |
| 저자 직판/강의 | |
| **합계** | **__~__부** |

### 편집자 한마디

(따뜻하고 솔직한 총평 — 격려 + 핵심 조언 1개)

## 규칙
- 긍정 우선: 강점부터 찾아서 칭찬
- 보수적 예측: 과도한 기대 금지
- 목차만 있어도 평가 가능 (완성도는 목차 구조 기준)
- 제목만 있어도 평가 가능 (시장성/제목 매력 중심)
- 한국어로 작성
"""


def render_submission_page():
    """투고 메인 페이지 — step에 따라 다른 화면"""
    step = st.session_state.get("submission_step", "input")

    if step == "input":
        _render_input_form()
    elif step == "analyzing":
        _render_analyzing()
    elif step == "result":
        _render_result()
    elif step == "consult":
        _render_consultation()
    elif step == "choice":
        _render_three_doors()


def _render_input_form():
    """투고 입력 폼"""
    st.markdown(
        '<h2 style="color:#2D5016;">📮 원고 투고</h2>',
        unsafe_allow_html=True,
    )
    st.markdown(
        "AI가 **시장성·전문성·완성도·몰입도**를 분석해드립니다. **무료**입니다."
    )

    st.divider()

    # 코칭에서 파악된 정보 자동 채우기
    user_data = st.session_state.get("user_data", {})

    with st.form("submission_form", clear_on_submit=False):
        col1, col2 = st.columns(2)
        with col1:
            author_name = st.text_input(
                "작가 이름 *",
                value=user_data.get("name", ""),
                placeholder="홍길동",
            )
        with col2:
            contact = st.text_input(
                "연락처 (선택)",
                placeholder="이메일 또는 전화번호",
            )

        book_title = st.text_input(
            "책 제목 *",
            value=user_data.get("book_title", ""),
            placeholder="예: 하루 1시간, 독서로 인생이 바뀐다",
        )

        toc = st.text_area(
            "목차 (있으면)",
            value=user_data.get("table_of_contents", ""),
            height=150,
            placeholder="PART 1. ...\n  1장. ...\n  2장. ...",
        )

        manuscript = st.text_area(
            "원고 본문 (있으면)",
            height=200,
            placeholder="초안이나 원고 일부를 붙여넣기하세요. 없으면 비워두셔도 됩니다.",
        )

        author_profile = st.text_area(
            "작가 소개 (선택)",
            value=user_data.get("expertise", ""),
            height=80,
            placeholder="어떤 분야에서 어떤 경험을 하셨는지",
        )

        st.markdown("---")

        submitted = st.form_submit_button(
            "📮 투고하기 — AI 분석 받기",
            use_container_width=True,
            type="primary",
        )

        if submitted:
            if not author_name or not book_title:
                st.error("작가 이름과 책 제목은 필수입니다.")
            else:
                # 긴급도 자동 판단
                if manuscript and len(manuscript) > 3000:
                    urgency = "high"
                elif toc and len(toc) > 100:
                    urgency = "medium"
                else:
                    urgency = "low"

                st.session_state.submission_data = {
                    "author_name": author_name,
                    "contact": contact,
                    "book_title": book_title,
                    "toc": toc,
                    "manuscript": manuscript,
                    "author_profile": author_profile,
                    "urgency": urgency,
                }
                st.session_state.submission_step = "analyzing"
                st.rerun()


def _render_analyzing():
    """AI 분석 진행 화면"""
    data = st.session_state.submission_data

    st.markdown(
        f'<h2 style="color:#2D5016;">📊 「{data["book_title"]}」 분석 중...</h2>',
        unsafe_allow_html=True,
    )

    # 투고 내용을 분석용 텍스트로 조합
    analysis_input = f"""## 투고 정보

- **작가**: {data.get('author_name', '')}
- **제목**: {data.get('book_title', '')}
- **작가 소개**: {data.get('author_profile', '(없음)')}

## 목차
{data.get('toc', '(없음)')}

## 원고 본문
{data.get('manuscript', '(없음)')}
"""

    # AI 분석 스트리밍
    with st.chat_message("assistant", avatar="📚"):
        result_chunks = []
        with st.status("AI가 원고를 분석하고 있습니다...", expanded=True) as status:
            result_area = st.empty()
            full_text = ""
            for chunk in stream_submission_analysis(
                SUBMISSION_ANALYSIS_PROMPT, analysis_input
            ):
                full_text += chunk
                result_area.markdown(full_text)
            status.update(label="분석 완료!", state="complete")

    st.session_state.submission_result = full_text
    st.session_state.submission_step = "result"

    # 투고 저장 + 이메일 알림
    record = save_submission({**data, "analysis": full_text})
    send_submission_email(record)

    st.rerun()


def _render_result():
    """분석 결과 표시 + 다음 단계 안내"""
    data = st.session_state.submission_data
    result = st.session_state.submission_result

    urgency_info = SUBMISSION_URGENCY.get(data.get("urgency", "low"), {})

    st.markdown(
        f'<h2 style="color:#2D5016;">📊 「{data["book_title"]}」 분석 결과</h2>',
        unsafe_allow_html=True,
    )
    st.caption(f"작가: {data.get('author_name', '')} · {urgency_info.get('label', '')}")

    st.divider()

    # 분석 결과 표시
    st.markdown(result)

    st.divider()

    # 산출물 다운로드
    download_text = (
        f"# 「{data['book_title']}」 투고 분석 리포트\n"
        f"작가: {data.get('author_name', '')}\n"
        f"분석일: {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}\n\n"
        f"---\n\n{result}"
    )
    st.download_button(
        "📥 분석 리포트 다운로드",
        data=download_text,
        file_name=f"투고분석_{data['book_title']}.md",
        mime="text/markdown",
        use_container_width=True,
    )

    st.markdown("")

    # 무료 1:1 상담 안내 — 캘린들리 링크
    st.markdown(
        '<div style="background:linear-gradient(135deg,#F0F7E8,#E8F0FF);'
        'padding:1.5rem;border-radius:12px;margin:1rem 0;">'
        '<h3 style="margin:0;color:#2D5016;">📞 무료 1:1 상담 (30분)</h3>'
        '<p style="margin:0.5rem 0 0;color:#555;font-size:0.95rem;">'
        '분석 결과를 바탕으로 대표가 직접 상담해드립니다.<br>'
        '비대면(전화/줌) · 대면(제주도 무료, 서울 등 출장 시 별도)<br>'
        '<strong>투고하신 분 한정 30분 무료입니다.</strong></p>'
        '</div>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        st.link_button(
            "📞 무료 상담 예약하기 (캘린들리)",
            url="https://calendly.com/joyful4/goodbook",
            use_container_width=True,
            type="primary",
        )
    with col2:
        if st.button(
            "건너뛰기 → 내 길 선택",
            use_container_width=True,
            key="skip_to_choice",
        ):
            st.session_state.submission_step = "choice"
            st.rerun()

    st.markdown("")
    if st.button(
        "← 코칭으로 돌아가기",
        use_container_width=True,
        key="back_to_coaching_from_result",
    ):
        exit_submission_mode()
        st.rerun()


def _render_consultation():
    """무료 1:1 상담 — 캘린들리 예약"""
    data = st.session_state.submission_data

    st.markdown(
        '<h2 style="color:#2D5016;">📞 무료 1:1 상담 예약 (30분)</h2>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f"**「{data.get('book_title', '')}」** 분석 결과를 바탕으로\n"
        "대표가 직접 상담해드립니다. **30분, 무료, 부담 없이.**"
    )

    st.divider()

    st.markdown(
        '<div style="background:#F0F7E8;padding:1.5rem;border-radius:12px;margin:1rem 0;">'
        '<p style="margin:0;font-size:0.95rem;color:#555;">'
        '<strong>비대면</strong>: 전화 또는 줌 (무료)<br>'
        '<strong>대면 - 제주도</strong>: 무료<br>'
        '<strong>대면 - 서울/기타</strong>: 출장비 별도 (공항 근처 가능)</p>'
        '</div>',
        unsafe_allow_html=True,
    )

    st.link_button(
        "📞 캘린들리에서 예약하기",
        url="https://calendly.com/joyful4/goodbook",
        use_container_width=True,
        type="primary",
    )

    st.markdown("")
    st.caption("예약 후 아래 버튼을 눌러 다음 단계로 이동하세요.")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("다음 → 내 길 선택", use_container_width=True, type="primary", key="consult_to_choice"):
            st.session_state.submission_step = "choice"
            st.rerun()
    with col2:
        if st.button("← 분석 결과 다시 보기", use_container_width=True, key="back_to_result"):
            st.session_state.submission_step = "result"
            st.rerun()


def _render_three_doors():
    """3개의 문 — 참가자가 스스로 고르게"""
    st.markdown(
        '<h2 style="color:#2D5016;">축하드립니다! 이제 3가지 길이 있어요.</h2>',
        unsafe_allow_html=True,
    )
    st.markdown("**어디로 가든 정답입니다.** 어떤 문도 '실패'가 아닙니다.")

    st.divider()

    # ─── 문 1: 혼자 ─────────────────────
    with st.container():
        st.markdown(
            '<div style="background:#F0F7E8;padding:1.5rem;border-radius:12px;'
            'border-left:4px solid #2D5016;margin-bottom:1rem;">'
            '<h3 style="margin:0;color:#2D5016;">✅ 문 1: "오늘로 충분해요!"</h3>'
            '<p style="margin:0.5rem 0 0;color:#555;">'
            '오늘 확정한 제목·목차로 혼자 써도 됩니다.<br>'
            '코칭앱은 <strong>무료로 계속</strong> 쓸 수 있어요.<br>'
            '후기만 올려주시면 저희에겐 최고의 선물입니다.</p>'
            '</div>',
            unsafe_allow_html=True,
        )
        if st.button("✅ 혼자 쓸게요!", use_container_width=True, key="door1"):
            save_submission_choice("alone")
            st.balloons()
            st.success(
                "멋진 선택입니다! 🎉\n\n"
                "코칭앱은 계속 무료로 쓰세요. "
                "나중에 원고가 완성되면 언제든 다시 투고해주세요.\n\n"
                "**응원합니다. 작가님의 책을 기다리겠습니다!** 📚"
            )
            if st.button("← 코칭으로 돌아가기", key="back_door1"):
                exit_submission_mode()
                st.rerun()
            return

    st.markdown("")

    # ─── 문 2: 알아보기 ──────────────────
    with st.container():
        st.markdown(
            '<div style="background:#FFF8E8;padding:1.5rem;border-radius:12px;'
            'border-left:4px solid #D4A017;margin-bottom:1rem;">'
            '<h3 style="margin:0;color:#8B6914;">💡 문 2: "좀 더 알아보고 싶어요"</h3>'
            '<p style="margin:0.5rem 0 0;color:#555;">'
            '<strong>무료 상담 30분</strong>을 예약해주세요.<br>'
            '내 원고 상태에서 출간까지 뭐가 필요한지,<br>'
            '어떤 루트가 맞는지, 비용은 얼마인지.<br>'
            '다 알려드리고, 그 후에 결정하시면 됩니다.</p>'
            '</div>',
            unsafe_allow_html=True,
        )
        st.link_button(
            "💡 무료 상담 예약하기 (캘린들리)",
            url="https://calendly.com/joyful4/goodbook",
            use_container_width=True,
        )

    st.markdown("")

    # ─── 문 3: 함께 ──────────────────────
    with st.container():
        st.markdown(
            '<div style="background:#F0E8FF;padding:1.5rem;border-radius:12px;'
            'border-left:4px solid #6B3FA0;margin-bottom:1rem;">'
            '<h3 style="margin:0;color:#6B3FA0;">🚀 문 3: "출간까지 함께 가고 싶어요"</h3>'
            '<p style="margin:0.5rem 0 0;color:#555;">'
            '저희 과정이 있습니다.<br>'
            '궁금하시면 무료 상담에서 안내드려요.</p>'
            '</div>',
            unsafe_allow_html=True,
        )

        with st.expander("🚀 출간 루트 비교 보기", expanded=False):
            for key, route in PUBLISHING_ROUTES.items():
                st.markdown(
                    f"**{route['name']}** — {route['desc']}\n"
                    f"> {route['detail']}"
                )

        st.link_button(
            "🚀 무료 상담 예약하기 (캘린들리)",
            url="https://calendly.com/joyful4/goodbook",
            use_container_width=True,
            type="primary",
        )

    st.divider()

    if st.button("← 코칭으로 돌아가기", use_container_width=True, key="back_to_coaching_from_choice"):
        exit_submission_mode()
        st.rerun()
