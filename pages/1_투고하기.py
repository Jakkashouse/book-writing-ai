"""
📮 투고 랜딩 + 원고 접수 + AI 자동 분석

URL: /투고하기 (Streamlit multipage 자동 라우팅)
흐름:
  1) 6문항 폼 + 원고 파일 업로드
  2) 제출 → 원고 텍스트 추출 → analyzer.run_full_analysis
  3) 구글시트 저장 + 대표 이메일 발송 (원고 첨부 + 리포트 본문)
  4) 작가에게 접수 확인 화면
"""
import streamlit as st

from coaching.analyzer import run_full_analysis
from coaching.context_manager import save_manuscript_submission
from coaching.file_reader import extract_text, is_supported, SUPPORTED_EXTS

st.set_page_config(
    page_title="투고하기 | 작가의집",
    page_icon="📮",
    layout="centered",
)

# ─── 상단 히어로 ──────────────────────────────
st.title("📮 당신의 원고, 여기서 시작됩니다")
st.markdown(
    """
##### 원고를 쓰셨다는 것만으로 이미 대단한 일을 하신 겁니다.
##### 올려주시면 AI가 먼저 읽고, 대표가 직접 피드백을 보내드립니다.

**📌 투고하시면 받으시는 것 — 모두 무료**

| | 대상 | 받으시는 것 |
|:-:|---|---|
| 📄 | **모든 투고** | AI 분석 리포트 (100점 평가 · 시장성 · 문장력 · 편집 포인트) |
| 📞 | **상위 등급** | 대표 1:1 15분 무료 상담 — 책 방향·판매 전략 |
| 🚀 | **최상위 5%** | 작가의집이 **출판비 전액 투자해 기획출판** |

> 주제·독자·독자의 고통은 **AI가 원고에서 읽어냅니다.**
> 작가님은 AI가 모르는 것만 알려주시면 됩니다 — SNS 채널·판매 의향·상담 목적.
> 연 100권을 내는 작가의집이 24시간 내로 연락드릴게요.
"""
)
st.divider()

# ─── 제출 완료 상태면 감사 화면 ─────────────
if st.session_state.get("submission_done"):
    info = st.session_state.get("submission_result", {})
    grade = info.get("grade", "?")
    score = info.get("score", 0)
    category = info.get("category", "-")
    author = info.get("author", "")
    pitch = info.get("pitch", "")

    st.success(f"**{author} 작가님, 원고 잘 받았습니다.** 🎉")
    st.markdown(
        f"""
### 📊 AI 1차 분석 (방금 끝났어요)
- **종합 점수**: {score}/100점
- **등급**: {grade}
- **주제 카테고리**: {category}
"""
    )
    if pitch:
        st.info(f"💬 **AI가 파악한 이 책 한 줄**: {pitch}")

    st.markdown("---")
    st.markdown("### 📅 지금 바로 다음 한 걸음")
    st.markdown(
        """
대표가 원고를 읽고 직접 피드백드리는 **15분 무료 상담**,
바로 일정을 잡아주세요. (제주/서울/비대면 모두 가능)
"""
    )
    st.link_button(
        "📅 15분 무료 상담 일정 잡기",
        "https://calendly.com/joyful4/goodbook",
        type="primary",
        use_container_width=True,
    )
    st.caption(
        "상담이 부담스러우시면 이메일로만 상세 리포트 받으셔도 됩니다 — "
        "3~5일 내 발송됩니다."
    )

    st.markdown("---")
    if st.button("다시 제출하기 (새 작가)"):
        for key in ("submission_done", "submission_result"):
            st.session_state.pop(key, None)
        st.rerun()
    st.stop()

# ─── 투고 폼 ──────────────────────────────────
st.markdown("### ✍️ 작가 정보")

col1, col2 = st.columns(2)
with col1:
    name = st.text_input("이름 *", placeholder="홍길동")
    phone = st.text_input("연락처 *", placeholder="010-0000-0000")
with col2:
    email = st.text_input("이메일 *", placeholder="author@example.com")
    profession = st.text_input("직업·경력 요약 *", placeholder="예: 10년차 재무상담사")

col3, col4 = st.columns(2)
with col3:
    expertise_years = st.number_input(
        "해당 분야 경력 (년)", min_value=0, max_value=60, value=0, step=1
    )
with col4:
    title_candidate = st.text_input("제목 후보 (있으면)", placeholder="예: 퇴사 말고 재설계")

st.markdown("### 🏅 보유한 자격·이력 (해당하는 것 모두 클릭)")
credentials = st.pills(
    "자격·이력",
    options=[
        "대학 강의·교수", "기업·공공 강연 50회 이상", "자격증·전문 라이선스",
        "유튜브·블로그 정기 운영", "언론 기고·인터뷰", "기출간 도서 있음",
    ],
    selection_mode="multi",
    label_visibility="collapsed",
)
if credentials is None:
    credentials = []

st.markdown("### 📱 SNS·플랫폼 (없으면 0)")
col5, col6, col7, col8 = st.columns(4)
with col5:
    insta = st.number_input("인스타 팔로워", min_value=0, value=0, step=100)
with col6:
    youtube = st.number_input("유튜브 구독자", min_value=0, value=0, step=100)
with col7:
    blog = st.number_input("블로그 월 방문자", min_value=0, value=0, step=100)
with col8:
    other_sns = st.number_input("기타(브런치 등)", min_value=0, value=0, step=100)

st.markdown("### 📚 저자 구매 의향")
st.caption(
    "저자는 정가의 **60%**로 구매 가능합니다. "
    "지인 선물·강의 교재·명함 대용으로 활용하시면 됩니다."
)
author_purchase = st.radio(
    "출간 시 저자 구매 의향 *",
    ["없음", "50부", "100부", "200부", "300부 이상", "상담 후 결정"],
    index=2,
    horizontal=True,
)

st.markdown("### 🎯 상담에서 얻고 싶은 것 (해당하는 것 모두 클릭)")
consult_topics = st.pills(
    "상담 희망 사항",
    options=[
        "주제 구체화·포지셔닝", "목차 구성 피드백", "출간 방향 (자비/기획/독립)",
        "브랜딩·수익화 전략", "판매·마케팅 전략", "기타",
    ],
    selection_mode="multi",
    default=["목차 구성 피드백"],
    label_visibility="collapsed",
)
if consult_topics is None:
    consult_topics = []

memo = st.text_area(
    "하고 싶은 말 / 궁금한 점 (선택)", placeholder="편하게 적어주세요", height=80
)

st.divider()

# ─── 파일 업로드 ─────────────────────────────
st.markdown("### 📄 파일 업로드")
st.caption(
    f"지원 포맷: {', '.join(sorted(SUPPORTED_EXTS))}. "
    "한글(.hwp)은 .docx 또는 .pdf로 변환 후 올려주세요."
)

manuscript_file = st.file_uploader(
    "전체 원고 * (필수)",
    type=["md", "txt", "docx", "pdf"],
    help="가급적 전체 원고. 일부라도 가능하지만 100자 이상 필요합니다.",
)

st.divider()

# ─── 제출 ────────────────────────────────────
submit = st.button("📮 투고 제출하기", type="primary", use_container_width=True)

if submit:
    # 1) 필수 필드 검증
    errors = []
    if not name.strip():
        errors.append("이름을 입력해주세요.")
    if not email.strip() or "@" not in email:
        errors.append("유효한 이메일을 입력해주세요.")
    if not phone.strip():
        errors.append("연락처를 입력해주세요.")
    if not profession.strip():
        errors.append("직업·경력 요약을 입력해주세요.")
    if manuscript_file is None:
        errors.append("전체 원고 파일을 업로드해주세요.")

    if errors:
        for e in errors:
            st.error(e)
        st.stop()

    # 2) 원고 텍스트 추출
    manuscript_bytes = manuscript_file.getvalue()
    if not is_supported(manuscript_file.name):
        st.error("지원하지 않는 파일 형식입니다.")
        st.stop()

    with st.spinner("원고를 읽는 중..."):
        content = extract_text(manuscript_file.name, manuscript_bytes)

    if len(content.strip()) < 100:
        st.error(
            "원고에서 텍스트를 100자 이상 추출하지 못했습니다. "
            "파일 형식을 확인하시거나 .md/.txt로 변환 후 다시 시도해주세요."
        )
        st.stop()

    # 3) 분석
    total_followers = int(insta + youtube + blog + other_sns)
    author_info = {
        "name": name.strip(),
        "email": email.strip(),
        "phone": phone.strip(),
        "profession": profession.strip(),
        "expertise_years": int(expertise_years),
        "credentials": credentials,
        "total_followers": total_followers,
        "sns_platforms": {
            "인스타": insta, "유튜브": youtube,
            "블로그": blog, "기타": other_sns,
        },
        "title_candidate": title_candidate.strip() or "(미기재)",
        "author_purchase": author_purchase,
        "consult_topics": ", ".join(consult_topics) or "(미선택)",
        "memo": memo.strip() or "(없음)",
    }

    with st.spinner("AI가 원고를 분석하는 중... (1~2분 소요)"):
        analysis = run_full_analysis(content, author_info)

    payload = {
        **author_info,
        "manuscript_filename": manuscript_file.name,
        "manuscript_bytes": manuscript_bytes,
    }

    with st.spinner("저장·발송 중..."):
        ok, msg = save_manuscript_submission(payload, analysis)

    if ok:
        grade, label, _ = analysis["classification"]
        st.session_state["submission_done"] = True
        st.session_state["submission_result"] = {
            "author": name.strip(),
            "grade": f"{grade} ({label})",
            "score": analysis["scores"]["total"],
            "category": analysis["market_data"]["primary_category"],
            "pitch": (analysis.get("llm") or {}).get("one_line_pitch", ""),
        }
        st.balloons()
        st.rerun()
    else:
        st.error(msg)
