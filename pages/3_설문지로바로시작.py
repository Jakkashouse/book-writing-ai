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

import json
import re
from datetime import datetime, timedelta
from pathlib import Path

import streamlit as st
import anthropic

from config import ANTHROPIC_API_KEY, MODEL_NAME, MAX_TOKENS_LONG
from coaching.file_reader import extract_text, is_supported, SUPPORTED_EXTS
from coaching.context_manager import _get_spreadsheet, _get_or_create_worksheet

# ─── 남용 방지 설정 ──────────────────────────
# Google Sheets에 영속 저장 — 컨테이너 재시작에도 기록 유지
# 실패 시 ./data/*.jsonl 로 폴백 (둘 중 하나라도 있으면 차단 작동)
USAGE_LIMIT_PER_EMAIL = 2         # 이메일당 총 허용 횟수 (평생)
USAGE_LIMIT_PER_DAY = 1            # 이메일당 하루 허용 횟수
USAGE_COOLDOWN_HOURS = 24          # 쿨다운 시간
ADMIN_BYPASS_EMAIL_SUFFIX = "@booksmith.kr"  # 대표님 이메일은 무제한

USAGE_SHEET_TITLE = "바이브_5꼭지_사용기록"
USAGE_SHEET_HEADERS = ["email", "email_normalized", "name", "at", "source"]

# 결과 본문 영구 저장 (생성 중단/페이지 새로고침 시에도 손실 X)
RESULT_SHEET_TITLE = "바이브_5꼭지_결과"
RESULT_SHEET_HEADERS = ["email_normalized", "name", "at", "source", "char_count", "result"]
RESULT_CELL_LIMIT = 49000  # GSheet 셀당 5만자 한계 안전 마진

DATA_DIR = Path("./data")
DATA_DIR.mkdir(parents=True, exist_ok=True)
USAGE_LOG_FILE = DATA_DIR / "vibe_draft_usage.jsonl"  # 폴백용
RESULT_LOG_FILE = DATA_DIR / "vibe_draft_results.jsonl"  # 결과 폴백


def _normalize_email(email: str) -> str:
    """이메일 소문자 · 앞뒤 공백 제거 · 점·+ alias 정규화 (gmail 기준)."""
    e = (email or "").strip().lower()
    if "@" not in e:
        return e
    local, domain = e.rsplit("@", 1)
    # gmail alias 우회 방지: + 뒤 제거, 점 제거
    if domain in {"gmail.com", "googlemail.com"}:
        local = local.split("+", 1)[0].replace(".", "")
    return f"{local}@{domain}"


@st.cache_resource(ttl=60)
def _get_usage_worksheet():
    """사용 기록 시트 워크시트 (60초 캐시)."""
    try:
        ss = _get_spreadsheet()
        if ss is None:
            return None
        return _get_or_create_worksheet(ss, USAGE_SHEET_TITLE, USAGE_SHEET_HEADERS)
    except Exception:
        return None


@st.cache_resource(ttl=60)
def _get_result_worksheet():
    """결과 본문 영구 저장 시트 (60초 캐시)."""
    try:
        ss = _get_spreadsheet()
        if ss is None:
            return None
        return _get_or_create_worksheet(ss, RESULT_SHEET_TITLE, RESULT_SHEET_HEADERS)
    except Exception:
        return None


def _save_result(email: str, name: str, result_text: str) -> None:
    """결과 본문을 시트 + 파일에 이중 저장."""
    norm = _normalize_email(email)
    ts = datetime.now().isoformat()
    char_count = len(result_text)
    # 셀 한계 안전 마진 — 넘으면 잘림(파일 폴백에는 풀버전 저장)
    cell_text = result_text if char_count <= RESULT_CELL_LIMIT else result_text[:RESULT_CELL_LIMIT]
    row = [norm, name, ts, "streamlit_5chapters", str(char_count), cell_text]

    ws = _get_result_worksheet()
    if ws is not None:
        try:
            ws.append_row(row, value_input_option="USER_ENTERED")
        except Exception:
            pass

    # 파일 폴백 (시트 실패 대비 풀버전 보존)
    try:
        with RESULT_LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "email": norm,
                "name": name,
                "at": ts,
                "char_count": char_count,
                "result": result_text,
            }, ensure_ascii=False) + "\n")
    except Exception:
        pass

    _get_result_worksheet.clear()


def _load_latest_result(email: str) -> dict:
    """같은 이메일의 가장 최근 결과 1건 반환 (없으면 빈 dict)."""
    if not email or "@" not in email:
        return {}
    norm = _normalize_email(email)

    # 1순위: Sheets
    ws = _get_result_worksheet()
    if ws is not None:
        try:
            rows = ws.get_all_records()
            mine = [r for r in rows if r.get("email_normalized") == norm]
            if mine:
                mine.sort(key=lambda r: r.get("at", ""), reverse=True)
                latest = mine[0]
                return {
                    "at": latest.get("at", ""),
                    "char_count": int(latest.get("char_count", 0) or 0),
                    "result": latest.get("result", ""),
                }
        except Exception:
            pass

    # 2순위: 파일 폴백 (풀버전)
    if not RESULT_LOG_FILE.exists():
        return {}
    try:
        latest = None
        with RESULT_LOG_FILE.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if rec.get("email") != norm:
                    continue
                if latest is None or rec.get("at", "") > latest.get("at", ""):
                    latest = rec
        if latest:
            return {
                "at": latest.get("at", ""),
                "char_count": latest.get("char_count", 0),
                "result": latest.get("result", ""),
            }
    except Exception:
        pass
    return {}


def _load_usage_records() -> list[dict]:
    """
    사용 기록 전체 로드.
    1순위: Google Sheets (영구)
    2순위: 로컬 JSONL 파일 (시트 미연결 시 폴백)
    """
    # 1) Google Sheets
    ws = _get_usage_worksheet()
    if ws is not None:
        try:
            rows = ws.get_all_records()  # [{header: value}, ...]
            return [
                {
                    "email": r.get("email_normalized") or _normalize_email(r.get("email", "")),
                    "name": r.get("name", ""),
                    "at": r.get("at", ""),
                }
                for r in rows
            ]
        except Exception:
            pass  # 폴백으로 떨어짐

    # 2) 파일 폴백
    if not USAGE_LOG_FILE.exists():
        return []
    records = []
    try:
        with USAGE_LOG_FILE.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    return records


def _record_usage(email: str, name: str) -> None:
    """
    사용 기록 저장 — Google Sheets 우선, 실패 시 파일.
    둘 다 시도 (이중 저장으로 안전성 확보).
    """
    norm = _normalize_email(email)
    ts = datetime.now().isoformat()
    row = [email.strip(), norm, name, ts, "streamlit_5chapters"]

    # Google Sheets 기록
    ws = _get_usage_worksheet()
    if ws is not None:
        try:
            ws.append_row(row, value_input_option="USER_ENTERED")
        except Exception:
            pass

    # 파일에도 백업
    try:
        with USAGE_LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "email": norm,
                "name": name,
                "at": ts,
            }, ensure_ascii=False) + "\n")
    except Exception:
        pass

    # 캐시 무효화 (다음 조회에서 신규 데이터 반영)
    _get_usage_worksheet.clear()


def _check_usage_limit(email: str) -> tuple[bool, str]:
    """
    사용 가능 여부와 메시지 반환.
    반환: (사용 가능?, 안내 메시지)
    """
    norm = _normalize_email(email)

    # 관리자 무제한 통과
    if norm.endswith(ADMIN_BYPASS_EMAIL_SUFFIX):
        return True, ""

    records = _load_usage_records()
    my_records = [r for r in records if r.get("email") == norm]

    if not my_records:
        return True, ""

    # 총 횟수 초과
    if len(my_records) >= USAGE_LIMIT_PER_EMAIL:
        return False, (
            f"⚠️ 같은 이메일로는 총 **{USAGE_LIMIT_PER_EMAIL}회**까지만 체험 가능합니다. "
            f"나머지 꼭지와 전체 40꼭지 완성은 **T2 30일 코칭(29만원)**에서 제공됩니다."
        )

    # 24시간 내 중복 차단
    now = datetime.now()
    for r in my_records:
        try:
            at = datetime.fromisoformat(r.get("at", ""))
        except Exception:
            continue
        if (now - at) < timedelta(hours=USAGE_COOLDOWN_HOURS):
            remaining = USAGE_COOLDOWN_HOURS - int((now - at).total_seconds() / 3600)
            return False, (
                f"⏱ 같은 이메일은 **{USAGE_COOLDOWN_HOURS}시간에 {USAGE_LIMIT_PER_DAY}회**만 사용 가능합니다. "
                f"약 **{max(remaining, 1)}시간 후** 다시 이용하실 수 있습니다.\n\n"
                f"기다리지 않고 바로 시작하시려면 **T2 30일 코칭**으로 진행해 주세요."
            )

    return True, ""

# ─── 페이지 설정 ─────────────────────────────
st.set_page_config(
    page_title="설문지로 바로 시작 | 작가의집",
    page_icon="📋",
    layout="centered",
)

# 공용 CSS 로드 (모바일 반응형 포함)
_css_file = Path(__file__).resolve().parent.parent / "assets" / "style.css"
if _css_file.exists():
    st.markdown(
        f"<style>{_css_file.read_text(encoding='utf-8')}</style>",
        unsafe_allow_html=True,
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
if "pkg_qp_consumed" not in st.session_state:
    st.session_state.pkg_qp_consumed = False

# ─── URL 쿼리 파라미터 prefill (expert-workbook 통합용) ──────
# 사용 예: /설문지로바로시작?name=홍길동&email=hong@example.com&source=survey
# 또는 짧은 텍스트 설문: &survey=<URL인코딩된 답변 텍스트>
if not st.session_state.pkg_qp_consumed:
    import urllib.parse as _urlp
    _qp = st.query_params
    _qp_name = _qp.get("name", "")
    _qp_email = _qp.get("email", "")
    _qp_survey = _qp.get("survey", "") or _qp.get("survey_text", "")
    if _qp_name and not st.session_state.pkg_author_name:
        st.session_state.pkg_author_name = _qp_name.strip()[:50]
    if _qp_email and not st.session_state.pkg_author_email:
        st.session_state.pkg_author_email = _qp_email.strip()[:120]
    if _qp_survey and not st.session_state.pkg_input_text:
        try:
            decoded = _urlp.unquote(_qp_survey)
            if len(decoded) >= 80:
                st.session_state.pkg_input_text = decoded
        except Exception:
            pass
    st.session_state.pkg_qp_consumed = True
    # 진입 출처 트래킹용 (선택)
    _qp_source = _qp.get("source", "")
    if _qp_source:
        st.session_state.pkg_source = _qp_source


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
        "이메일 *",
        value=st.session_state.pkg_author_email,
        max_chars=120,
        help="체험 이력 관리용 · 같은 이메일로는 24시간 내 1회 가능",
    )


def _is_valid_email(e: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", e.strip()))


email_valid = _is_valid_email(st.session_state.pkg_author_email)

# 이메일 기반 사용 제한 체크
limit_ok, limit_msg = (True, "")
if email_valid:
    limit_ok, limit_msg = _check_usage_limit(st.session_state.pkg_author_email)

# ─── 이전 결과 자동 복원 안내 ─────────────
# 같은 이메일로 결과가 있으면 "다시 보기" 버튼 노출 (생성 중복 차단과 별개)
_norm_email_now = _normalize_email(st.session_state.pkg_author_email) if email_valid else ""
if email_valid and not st.session_state.pkg_result:
    # 이메일 변경 시 캐시 갱신
    if st.session_state.get("pkg_latest_checked_email") != _norm_email_now:
        st.session_state.pkg_latest_cache = _load_latest_result(st.session_state.pkg_author_email)
        st.session_state.pkg_latest_checked_email = _norm_email_now
    _latest = st.session_state.get("pkg_latest_cache", {}) or {}
    if _latest.get("result"):
        _at = _latest.get("at", "")[:16].replace("T", " ")
        st.success(
            f"📂 같은 이메일로 저장된 결과가 있습니다 (생성 시각: {_at} · {_latest.get('char_count', 0):,}자). "
            f"새로 생성하지 않고 이전 결과를 다시 보시려면 아래 버튼을 눌러주세요."
        )
        if st.button("📖 이전 결과 다시 보기", key="restore_latest_btn"):
            st.session_state.pkg_result = _latest.get("result", "")
            st.rerun()

can_start = (
    bool(st.session_state.pkg_input_text.strip())
    and len(st.session_state.pkg_input_text.strip()) >= 80
    and bool(st.session_state.pkg_author_name.strip())
    and email_valid
    and limit_ok
)

if not can_start:
    if not st.session_state.pkg_input_text.strip():
        st.info("설문지를 업로드하거나 붙여넣어 주세요.")
    elif len(st.session_state.pkg_input_text.strip()) < 80:
        st.warning("설문지 내용이 너무 짧습니다. 최소 80자 이상 필요합니다.")
    elif not st.session_state.pkg_author_name.strip():
        st.warning("작가 이름을 입력해 주세요.")
    elif not email_valid:
        st.warning("올바른 이메일을 입력해 주세요.")
    elif not limit_ok:
        st.error(limit_msg)
        # 차단된 경우에도 T2 결제 CTA 노출
        st.markdown(
            """
<div style="text-align:center; margin-top:12px;">
  <a href="https://expert-workbook.vercel.app/payment?plan=t2_standard" target="_blank"
     style="
       display:inline-block;
       padding: 12px 28px;
       background: linear-gradient(135deg, #D4AF37 0%, #F3D992 50%, #D4AF37 100%);
       color:#000;
       font-weight:900;
       border-radius:10px;
       text-decoration:none;
       font-size:15px;
     ">
    💳 T2 30일 코칭 바로 시작하기 (29만원) →
  </a>
</div>
            """,
            unsafe_allow_html=True,
        )

# ─── 생성 버튼 ─────────────────────────────
st.markdown("### 3단계. AI가 한번에 생성")

def _detect_stage(text: str) -> str:
    """스트리밍 중인 텍스트에서 현재 진행 중인 ### 헤더 단계 감지."""
    matches = re.findall(r"###\s*(\d+)\.\s*([^\n]+)", text)
    if not matches:
        return "분석·구상 중"
    n, title = matches[-1]
    return f"{n}. {title.strip()}"


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

        # ─── 진행 안내 패널 ──────────────────────────
        status_info = st.empty()
        status_info.info(
            "⏱ **약 60~90초 소요됩니다.** 생성 중에는 창을 닫거나 새로고침하지 마세요.\n\n"
            "📑 **생성 순서**: 제목 3안 → 목차 40꼭지 → 프롤로그 → 꼭지 1~4 → 마무리\n\n"
            "💾 완료된 결과는 자동 저장되어 같은 이메일로 언제든 다시 보실 수 있습니다."
        )
        progress_bar = st.progress(0.0, text="준비 중…")
        char_status = st.empty()
        placeholder = st.empty()
        full_text = ""
        TARGET_CHARS = 25000  # 5꼭지 평균 목표

        try:
            with client.messages.stream(
                model=MODEL_NAME,
                max_tokens=MAX_TOKENS_LONG * 2,  # 충분한 분량 (8,192)
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            ) as stream:
                for chunk in stream.text_stream:
                    full_text += chunk
                    # 300자마다 화면 갱신 (부하 경감)
                    if len(full_text) % 300 < len(chunk):
                        cur_len = len(full_text)
                        stage = _detect_stage(full_text)
                        pct = min(cur_len / TARGET_CHARS, 0.98)
                        progress_bar.progress(pct, text=f"✍️ 단계: {stage} · {cur_len:,}자")
                        placeholder.markdown(full_text + " ▌")

            placeholder.markdown(full_text)
            progress_bar.progress(1.0, text=f"✅ 완료 · {len(full_text):,}자")
            status_info.empty()
            char_status.empty()
            st.session_state.pkg_result = full_text
            # 사용 기록 저장 (남용 방지)
            _record_usage(
                st.session_state.pkg_author_email,
                st.session_state.pkg_author_name,
            )
            # 결과 본문 영구 저장 (중단/새로고침 대비)
            _save_result(
                st.session_state.pkg_author_email,
                st.session_state.pkg_author_name,
                full_text,
            )
            st.success(f"✅ 생성 완료 · 총 {len(full_text):,}자 · 결과는 같은 이메일로 언제든 다시 보실 수 있습니다.")

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
<div class="upsell-card" style="
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
