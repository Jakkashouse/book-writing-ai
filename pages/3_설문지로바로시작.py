"""
📋 설문지로 바로 시작 — 업로드/붙여넣기 → 제목·목차·프롤로그·꼭지 4개 (총 5꼭지)

흐름:
  1) 설문지 업로드 (.md/.txt/.docx/.pdf) 또는 텍스트 붙여넣기
  2) 작가 이름·이메일 입력
  3) [시작] → Claude 스트리밍으로 제목 3안 + 40꼭지 목차 + 프롤로그 + 꼭지 1~4
  4) 5꼭지 완료 → 업셀 배너 (나머지 35꼭지는 T2 코칭에서)

이 페이지는 다른 코칭 워크플로우에 영향을 주지 않습니다 (독립형).
"""
from __future__ import annotations

import streamlit as st
import anthropic

from config import ANTHROPIC_API_KEY, MODEL_NAME, MAX_TOKENS_LONG
from coaching.file_reader import extract_text, is_supported, SUPPORTED_EXTS

# ─── 페이지 설정 ─────────────────────────────
st.set_page_config(
    page_title="설문지로 바로 시작 | 작가의집",
    page_icon="📋",
    layout="centered",
)

st.title("📋 설문지로 바로 시작")
st.caption("설문지 하나면 제목·목차·프롤로그·꼭지 4편까지 **총 5꼭지**를 단번에 생성합니다.")

# ─── 시스템 프롬프트 ────────────────────────
SYSTEM_PROMPT = """당신은 작가의 집 출판사 대표 황준연의 AI 책쓰기 코치입니다.
140명 이상을 코칭하며 축적한 노하우로, 작가 설문지를 분석하고
제목·목차·프롤로그·초반 4꼭지까지 한번에 써드립니다.

## 응답 구조 (순서 고정)

### 1. 제목 3안
각 안은 아래 형식으로:
**1안** — 「제목 — 부제」 (한 줄 설명)
채점표 (호기심 15 / 감정 15 / 명확성 10 / 독창성 10 / 합계 50)

**추천 의견**: 3안 중 어느 걸 메인으로 권하는지, 이유 3줄

### 2. 목차 — 8부 40꼭지
프롤로그: 제목
제1부: 제목
  1장. ~ 5장.
제2부: ~ 제8부
에필로그: 제목

### 3. 프롤로그 (1,500~2,000자)
감성적·구체적 장면으로 시작. 독자가 첫 페이지에서 책을 덮지 않게.

### 4. 꼭지 1 (1,500~2,000자)
제1부 제1장. 훅→사례→메시지→액션

### 5. 꼭지 2 (1,500~2,000자)
제1부 제2장. 동일 구조

### 6. 꼭지 3 (1,500~2,000자)
제1부 제3장.

### 7. 꼭지 4 (1,500~2,000자)
제1부 제4장.

### 8. 마무리 메시지
작가님께 보내는 편지 2~3문장.
"나머지 36꼭지는 T2 30일 코칭에서 황준연 대표와 함께 완성합니다." 한 줄.

## 필수 규칙
- 각 꼭지는 반드시 **1,500자 이상**
- 작가의 설문 답변에서 **구체 키워드·장면**을 계속 인용
- 대필이 아니라 "작가의 목소리를 꺼내주는" 톤
- 이모지 금지, 존대말 "~습니다" 유지
- 프롤로그와 4꼭지는 **실제 책의 한 페이지처럼** 몰입감 있게
"""


# ─── 세션 상태 ─────────────────────────────
if "pkg_input_text" not in st.session_state:
    st.session_state.pkg_input_text = ""
if "pkg_author_name" not in st.session_state:
    st.session_state.pkg_author_name = ""
if "pkg_author_email" not in st.session_state:
    st.session_state.pkg_author_email = ""
if "pkg_result" not in st.session_state:
    st.session_state.pkg_result = ""
if "pkg_generating" not in st.session_state:
    st.session_state.pkg_generating = False


# ─── 입력 영역 ─────────────────────────────
st.markdown("### 1단계. 설문지 준비")

upload_tab, paste_tab = st.tabs(["📎 파일 업로드", "📋 텍스트 붙여넣기"])

with upload_tab:
    uploaded = st.file_uploader(
        f"설문지 파일 ({', '.join(SUPPORTED_EXTS)})",
        type=[e.lstrip(".") for e in SUPPORTED_EXTS],
        help="버셀 /survey에서 받은 기획안 PDF도 가능합니다.",
    )
    if uploaded is not None:
        try:
            text = extract_text(uploaded.name, uploaded.read())
            st.session_state.pkg_input_text = text
            st.success(f"✅ 추출 완료 · {len(text):,}자")
            with st.expander("추출된 내용 미리보기"):
                st.text(text[:1500] + ("..." if len(text) > 1500 else ""))
        except Exception as e:
            st.error(f"파일 읽기 실패: {e}")

with paste_tab:
    pasted = st.text_area(
        "설문지 내용을 여기 붙여넣으세요",
        height=240,
        placeholder="작가 정보, 14~100문항 답변, 핵심 메시지, 장면 등 자유롭게…",
        value=st.session_state.pkg_input_text if st.session_state.pkg_input_text else "",
        key="paste_area",
    )
    if pasted.strip() and pasted != st.session_state.pkg_input_text:
        st.session_state.pkg_input_text = pasted

st.markdown("### 2단계. 작가 정보")
col1, col2 = st.columns(2)
with col1:
    st.session_state.pkg_author_name = st.text_input(
        "작가 이름 *",
        value=st.session_state.pkg_author_name,
        max_chars=50,
    )
with col2:
    st.session_state.pkg_author_email = st.text_input(
        "이메일 (선택)",
        value=st.session_state.pkg_author_email,
        max_chars=120,
    )

can_start = (
    bool(st.session_state.pkg_input_text.strip())
    and len(st.session_state.pkg_input_text.strip()) >= 80
    and bool(st.session_state.pkg_author_name.strip())
)

if not can_start:
    if not st.session_state.pkg_input_text.strip():
        st.info("설문지를 업로드하거나 붙여넣어 주세요.")
    elif len(st.session_state.pkg_input_text.strip()) < 80:
        st.warning("설문지 내용이 너무 짧습니다. 최소 80자 이상 필요합니다.")
    elif not st.session_state.pkg_author_name.strip():
        st.warning("작가 이름을 입력해 주세요.")

# ─── 생성 버튼 ─────────────────────────────
st.markdown("### 3단계. AI가 한번에 생성")

if st.button(
    "🚀 제목·목차·프롤로그·꼭지 4편 한번에 받기",
    type="primary",
    disabled=not can_start or st.session_state.pkg_generating,
    use_container_width=True,
):
    st.session_state.pkg_generating = True
    st.session_state.pkg_result = ""

    if not ANTHROPIC_API_KEY:
        st.error("ANTHROPIC_API_KEY가 설정되지 않았습니다.")
        st.session_state.pkg_generating = False
    else:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        user_prompt = f"""아래는 '{st.session_state.pkg_author_name.strip()}' 작가님이 작성한 설문지입니다.
이 설문지를 분석하여 제목 3안 + 40꼭지 목차 + 프롤로그 + 꼭지 1~4편(총 5꼭지)을 생성해 주세요.

---

{st.session_state.pkg_input_text.strip()}

---

위 설문 내용을 바탕으로, 시스템 프롬프트의 8단계 순서를 지켜 작성해 주세요.
각 꼭지는 반드시 1,500자 이상이어야 하며, 작가님의 설문 답변에서 구체 키워드와 장면을 적극 인용해야 합니다.
"""

        placeholder = st.empty()
        full_text = ""

        try:
            with client.messages.stream(
                model=MODEL_NAME,
                max_tokens=MAX_TOKENS_LONG * 2,  # 충분한 분량 (8,192)
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            ) as stream:
                for chunk in stream.text_stream:
                    full_text += chunk
                    # 2000자마다 화면 갱신 (부하 경감)
                    if len(full_text) % 300 < len(chunk):
                        placeholder.markdown(full_text + " ▌")

            placeholder.markdown(full_text)
            st.session_state.pkg_result = full_text
            st.success(f"✅ 생성 완료 · 총 {len(full_text):,}자")

        except anthropic.APIError as e:
            st.error(f"Claude API 오류: {e}")
        except Exception as e:
            st.error(f"예상치 못한 오류: {e}")
        finally:
            st.session_state.pkg_generating = False

# ─── 결과 표시 + 다운로드 + 업셀 ─────────────
if st.session_state.pkg_result and not st.session_state.pkg_generating:
    st.markdown("---")
    st.markdown("### 📖 생성 결과")
    st.markdown(st.session_state.pkg_result)

    col_a, col_b = st.columns(2)
    with col_a:
        st.download_button(
            "📥 마크다운(.md) 다운로드",
            data=st.session_state.pkg_result.encode("utf-8"),
            file_name=f"{st.session_state.pkg_author_name.strip()}_작가님_5꼭지.md",
            mime="text/markdown",
            use_container_width=True,
        )
    with col_b:
        st.download_button(
            "📄 텍스트(.txt) 다운로드",
            data=st.session_state.pkg_result.encode("utf-8"),
            file_name=f"{st.session_state.pkg_author_name.strip()}_작가님_5꼭지.txt",
            mime="text/plain",
            use_container_width=True,
        )

    # ─── 업셀 배너 ─────────────────────────────
    st.markdown("---")
    st.markdown(
        """
<div style="
    padding: 28px;
    border-radius: 16px;
    background: linear-gradient(135deg, #2D5016 0%, #1a3009 100%);
    color: #F5EFE4;
    text-align: center;
    border: 2px solid #D4AF37;
">
  <div style="color:#D4AF37; font-size:11px; letter-spacing:0.3em; text-transform:uppercase; font-weight:bold;">
    NEXT STEP
  </div>
  <h2 style="color:#fff; margin:12px 0 8px 0; font-size:26px;">
    나머지 <span style="color:#D4AF37;">36꼭지</span>는 T2 30일 코칭에서 완성합니다
  </h2>
  <p style="color:rgba(245,239,228,0.85); font-size:15px; line-height:1.7; margin:10px 0 18px 0;">
    황준연 대표가 매일 한 꼭지씩 피드백하며 당신의 책 한 권을 30일 안에 완성합니다.<br/>
    이미 받은 5꼭지는 T2 진도 1~5일차로 <b style="color:#D4AF37;">자동 흡수</b>되어 손실 없이 이어집니다.
  </p>
  <div style="color:#D4AF37; font-size:13px; margin-bottom:6px;">
    프리미엄 집필 · 30일 · 29만 원
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
<div style="text-align:center; margin-top: 18px;">
  <a href="https://expert-workbook.vercel.app/payment?plan=t2_standard" target="_blank"
     style="
       display:inline-block;
       padding: 14px 36px;
       background: linear-gradient(135deg, #D4AF37 0%, #F3D992 50%, #D4AF37 100%);
       color:#000;
       font-weight:900;
       border-radius:12px;
       text-decoration:none;
       font-size:16px;
     ">
    💳 T2 30일 코칭 바로 결제하기 (29만원) →
  </a>
  <div style="margin-top:10px;">
    <a href="https://expert-workbook.vercel.app/vibe#t1-cta" target="_blank"
       style="
         font-size:12px;
         color:#888;
         text-decoration:underline;
         text-decoration-color:rgba(212,175,55,0.3);
       ">
      먼저 전체 7티어 가격표 보기 →
    </a>
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        "<p style='text-align:center; color:#888; font-size:12px; margin-top:14px;'>"
        "※ 이 페이지는 맛보기(5꼭지) 체험용입니다. 전체 40꼭지 + 피드백은 T2에서 제공됩니다."
        "</p>",
        unsafe_allow_html=True,
    )


# ─── 하단 네비게이션 ─────────────────────────
st.markdown("---")
st.caption(
    "다른 모드: "
    "[메인 코칭(대화형)](/) · "
    "[투고하기](/투고하기) · "
    "[투고현황](/투고현황)"
)
