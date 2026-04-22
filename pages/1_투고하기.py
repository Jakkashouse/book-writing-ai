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

# ─── 랜딩 모드 판별 (?landing=1이면 사이드바·메뉴 전부 숨김) ──────
_params = st.query_params
IS_LANDING = _params.get("landing") == "1"

st.set_page_config(
    page_title="투고하기 | 작가의집",
    page_icon="📮",
    layout="centered",
    initial_sidebar_state="collapsed" if IS_LANDING else "expanded",
)

if IS_LANDING:
    st.markdown(
        """
        <style>
        [data-testid="stSidebar"] { display: none !important; }
        [data-testid="collapsedControl"] { display: none !important; }
        [data-testid="stHeader"] { visibility: hidden; }
        #MainMenu { visibility: hidden; }
        footer { visibility: hidden; }
        </style>
        """,
        unsafe_allow_html=True,
    )

# ─── 상단 히어로 ──────────────────────────────
st.title("📮 당신의 원고, 여기서 시작됩니다")
st.markdown(
    """
##### 출판사 대표가 AI와 함께 원고를 즉시 평가합니다.
##### 평균 **15초**, 100점 만점 리포트. 무료.
"""
)

# 소셜프루프 3카드
sp1, sp2, sp3 = st.columns(3)
with sp1:
    st.metric("연 출간", "100권+", help="작가의집은 연 100권을 출간하는 1인 출판사입니다.")
with sp2:
    st.metric("평균 분석 시간", "15초", help="실측: 다이어트 원고 69,000자 기준 14.7초")
with sp3:
    st.metric("당신이 내는 돈", "0원", help="AI 분석 리포트는 완전 무료입니다.")

st.markdown(
    """
**📌 투고하시면 받으시는 것 — 전부 무료**

- 📊 **100점 만점 AI 분석 리포트** · 시장성 · 전문성 · SNS · 완성도
- ✨ **편집장의 한 줄 평가** · 한 줄 소개 · 킬러 문장 · 강점 3가지 · 제안 제목 3안
- 🎯 **맞춤 다음 단계** · 등급별로 대표 1:1 상담·부트캠프·PDF 중 자동 안내

검토 후 원고에 어울린다고 판단되면 **기획출판 제안**이나 **대표 1:1 무료 상담**을 드립니다.

##### 3단계 — 업로드 → 15초 분석 → 즉시 리포트 + 작가 메일

> 💡 **AI는 원고에서 주제·독자·고통을 직접 읽어냅니다.**
> 작가님은 AI가 모르는 것만 알려주시면 돼요 — SNS 채널·자가구매·상담 목적.
"""
)
st.divider()

# ─── 제출 완료 상태면 감사 화면 ─────────────
if st.session_state.get("submission_done"):
    info = st.session_state.get("submission_result", {})
    grade = info.get("grade", "?")
    score = info.get("score", 0)
    author = info.get("author", "")
    pitch = info.get("pitch", "")
    book_category = info.get("book_category", "")
    killer = info.get("killer", "")
    strengths = info.get("strengths") or []
    titles = info.get("titles") or []
    who = info.get("who_should_read", "")

    st.success(f"**{author} 작가님, 원고 잘 받았습니다.** 🎉")
    st.markdown(
        f"""
### 📊 AI 1차 분석 (방금 끝났어요)
- **종합 점수**: {score}/100점
- **등급**: {grade}
"""
    )

    if pitch:
        st.info(f"💡 **AI가 파악한 이 책 한 줄**\n\n{pitch}")

    if book_category:
        st.markdown(f"📖 **주제·분야**: {book_category}")

    if who:
        st.markdown(f"🎯 **핵심 독자**: {who}")

    if killer:
        st.markdown(
            f"""
> ✨ **원고에서 뽑은 킬러 문장**
>
> *"{killer}"*
"""
        )

    if strengths:
        st.markdown("### 🌟 이 원고가 빛나는 3가지")
        for s in strengths[:3]:
            st.markdown(f"- {s}")

    if titles:
        st.markdown("### 📚 AI가 제안하는 제목 후보")
        for i, t in enumerate(titles[:3], 1):
            st.markdown(f"{i}. **{t}**")

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
        "해당 분야 경력 (년)", min_value=0, max_value=60, value=0, step=1,
        help="원고 주제와 관련된 분야의 경력. 예) 재테크 책 → 재무상담 경력",
    )
with col4:
    title_candidate = st.text_input(
        "제목 후보 (있으면)",
        placeholder="예: 퇴사 말고 재설계 — 없어도 OK",
    )

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
st.markdown("### 📄 원고 업로드")
st.caption(
    f"지원 포맷: {', '.join(sorted(SUPPORTED_EXTS))} · 최대 200MB. "
    "한글파일(.hwp)은 .docx 또는 .pdf로 저장 후 올려주세요."
)

manuscript_file = st.file_uploader(
    "전체 원고 * (필수)",
    type=["md", "txt", "docx", "pdf"],
    help="완성된 전체 원고면 좋지만, 일부 챕터(최소 100자)만 있어도 분석 가능합니다. AI는 앞 15,000자를 심층적으로 읽어요.",
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

    with st.spinner("📖 원고를 열어보는 중..."):
        content = extract_text(manuscript_file.name, manuscript_bytes)

    if len(content.strip()) < 100:
        st.error(
            "원고에서 텍스트를 100자 이상 추출하지 못했습니다. "
            "이미지로만 이루어진 PDF일 수 있어요. "
            ".docx 또는 .md로 변환 후 다시 올려주시거나, "
            "텍스트 내용이 정말 100자 이상인지 확인해주세요."
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

    with st.spinner("🤖 7년차 책쓰기 코치 및 출판사 대표가 원고를 직접 보고 있어요 · 1~2분 소요"):
        analysis = run_full_analysis(content, author_info)

    payload = {
        **author_info,
        "manuscript_filename": manuscript_file.name,
        "manuscript_bytes": manuscript_bytes,
        "manuscript_text": content,  # 대시보드 미리보기·후속 분석용
    }

    with st.spinner("📮 접수 처리 중..."):
        ok, msg = save_manuscript_submission(payload, analysis)

    if ok:
        grade, label, _ = analysis["classification"]
        llm = analysis.get("llm") or {}
        st.session_state["submission_done"] = True
        st.session_state["submission_result"] = {
            "author": name.strip(),
            "grade": f"{grade} ({label})",
            "score": analysis["scores"]["total"],
            "pitch": llm.get("one_line_pitch", ""),
            "book_category": llm.get("book_category", "")
                             or analysis["market_data"]["primary_category"],
            "who_should_read": llm.get("who_should_read", ""),
            "killer": llm.get("killer_line", ""),
            "strengths": llm.get("strengths") or [],
            "titles": llm.get("title_suggestions") or [],
        }
        st.balloons()
        st.rerun()
    else:
        st.error(msg)
        st.info(
            "잠시 후 다시 시도해주세요. "
            "계속 실패하면 대표 이메일(joyfuljun4@gmail.com)로 "
            "원고 파일을 직접 보내주셔도 됩니다."
        )
