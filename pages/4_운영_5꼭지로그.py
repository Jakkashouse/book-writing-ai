"""
📊 운영자: 5꼭지 자동화 통합 로그
=====================================
한 화면에서 5꼭지 체험 전체 흐름을 체크.

집계 데이터:
  ① 사용 기록 (바이브_5꼭지_사용기록)  — 누가 언제 생성 시도
  ② 결과 저장 (바이브_5꼭지_결과)       — 생성된 본문 메타
  ③ 이메일 발송 (바이브_5꼭지_이메일발송) — Resend 발송 성공/실패

KPI:
  - 총 생성 건수 / 24h 신규 / 7d 신규
  - 이메일 발송 성공률
  - 실패 케이스 원인 분포

비밀번호: Streamlit Secrets의 ADMIN_PASSWORD (투고현황과 공용)
"""
from __future__ import annotations

import csv
import io
from collections import Counter
from datetime import datetime, timedelta

import streamlit as st

from coaching.context_manager import _get_spreadsheet, _get_or_create_worksheet

# ─── 시트 정의 (3_설문지로바로시작.py 와 동기) ─────
USAGE_SHEET = "바이브_5꼭지_사용기록"
USAGE_HEADERS = ["email", "email_normalized", "name", "at", "source"]

RESULT_SHEET = "바이브_5꼭지_결과"
RESULT_HEADERS = ["email_normalized", "name", "at", "source", "char_count", "result"]

EMAIL_SHEET = "바이브_5꼭지_이메일발송"
EMAIL_HEADERS = ["email_normalized", "name", "at", "status", "provider_id", "error", "char_count"]

st.set_page_config(
    page_title="5꼭지 자동화 로그 | 작가의집 운영",
    page_icon="📊",
    layout="wide",
)

st.title("📊 5꼭지 자동화 통합 로그")
st.caption("설문지로 바로 시작 흐름 · 생성/저장/발송 한눈에")

# ─── 비밀번호 게이트 ──────────────────────────
try:
    admin_password = st.secrets.get("ADMIN_PASSWORD", "")
except Exception:
    admin_password = ""

if not admin_password:
    st.error(
        "⚠️ ADMIN_PASSWORD가 Secrets에 설정되지 않았습니다.\n\n"
        "Streamlit Cloud → Settings → Secrets에 아래 줄을 추가하세요:\n\n"
        '`ADMIN_PASSWORD = "원하는_비밀번호"`'
    )
    st.stop()

if not st.session_state.get("admin_authed"):
    pwd = st.text_input("관리자 비밀번호", type="password", key="admin_log_pwd")
    col_a, _ = st.columns([1, 5])
    with col_a:
        if st.button("로그인", type="primary", key="admin_log_login"):
            if pwd == admin_password:
                st.session_state["admin_authed"] = True
                st.rerun()
            else:
                st.error("비밀번호가 일치하지 않습니다.")
    st.stop()

# ─── 상단 툴바 ────────────────────────────────
col_refresh, col_logout = st.columns([5, 1])
with col_refresh:
    if st.button("🔄 새로고침", key="admin_log_refresh"):
        st.cache_data.clear()
        st.rerun()
with col_logout:
    if st.button("🚪 로그아웃", key="admin_log_logout"):
        st.session_state.pop("admin_authed", None)
        st.rerun()


# ─── 데이터 로드 ──────────────────────────────
@st.cache_data(ttl=60)
def _load_rows(sheet_title: str, headers: list[str]) -> list[dict]:
    try:
        ss = _get_spreadsheet()
        if ss is None:
            return []
        ws = _get_or_create_worksheet(ss, sheet_title, headers)
        if ws is None:
            return []
        return ws.get_all_records()
    except Exception as e:
        st.warning(f"[{sheet_title}] 로드 실패: {e}")
        return []


usage_rows = _load_rows(USAGE_SHEET, USAGE_HEADERS)
result_rows = _load_rows(RESULT_SHEET, RESULT_HEADERS)
email_rows = _load_rows(EMAIL_SHEET, EMAIL_HEADERS)


def _parse_at(s: str) -> datetime | None:
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None


now = datetime.now()
T_24H = now - timedelta(hours=24)
T_7D = now - timedelta(days=7)


def _within(records: list[dict], cutoff: datetime) -> int:
    cnt = 0
    for r in records:
        at = _parse_at(r.get("at", ""))
        if at and at >= cutoff:
            cnt += 1
    return cnt


# ─── KPI 박스 ─────────────────────────────────
total_uses = len(usage_rows)
total_results = len(result_rows)
total_emails = len(email_rows)
emails_ok = sum(1 for r in email_rows if r.get("status") == "success")
email_rate = (emails_ok / total_emails * 100) if total_emails else 0

uses_24h = _within(usage_rows, T_24H)
uses_7d = _within(usage_rows, T_7D)
emails_24h = _within(email_rows, T_24H)

st.markdown("### 핵심 지표")
c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    st.metric("총 생성", f"{total_uses:,}")
with c2:
    st.metric("24h 신규", f"{uses_24h:,}", help="최근 24시간 사용 기록")
with c3:
    st.metric("7d 신규", f"{uses_7d:,}", help="최근 7일 사용 기록")
with c4:
    st.metric("결과 저장", f"{total_results:,}", help="시트에 저장된 결과 본문 건수")
with c5:
    st.metric(
        "이메일 성공률",
        f"{email_rate:.0f}%",
        delta=f"{emails_ok}/{total_emails}" if total_emails else "0/0",
        help="Resend 발송 성공 비율",
    )

st.divider()

# ─── 탭 ──────────────────────────────────────
tab_recent, tab_email, tab_results, tab_usage = st.tabs([
    "🆕 최근 24시간",
    "📧 이메일 발송 로그",
    "💾 결과 저장 이력",
    "👤 사용 기록 전체",
])

with tab_recent:
    st.subheader("최근 24시간 흐름")

    # 사용 + 발송을 합쳐서 타임라인
    timeline = []
    for r in usage_rows:
        at = _parse_at(r.get("at", ""))
        if at and at >= T_24H:
            timeline.append({
                "at": at,
                "type": "🆕 생성",
                "email": r.get("email_normalized") or r.get("email", ""),
                "name": r.get("name", ""),
                "detail": r.get("source", "streamlit_5chapters"),
            })
    for r in email_rows:
        at = _parse_at(r.get("at", ""))
        if at and at >= T_24H:
            status_icon = "✅ 발송" if r.get("status") == "success" else "❌ 실패"
            detail = r.get("provider_id", "") if r.get("status") == "success" else (r.get("error", "") or "")[:80]
            timeline.append({
                "at": at,
                "type": status_icon,
                "email": r.get("email_normalized", ""),
                "name": r.get("name", ""),
                "detail": detail,
            })
    timeline.sort(key=lambda x: x["at"], reverse=True)

    if not timeline:
        st.info("최근 24시간 내 활동 없음.")
    else:
        for item in timeline[:50]:
            ts = item["at"].strftime("%m-%d %H:%M")
            st.markdown(
                f"<div style='padding:6px 0; border-bottom:1px solid #eee;'>"
                f"<code>{ts}</code> &nbsp; <b>{item['type']}</b> &nbsp; "
                f"<span style='color:#2D5016;'>{item['name']}</span> "
                f"<span style='color:#888;'>&lt;{item['email']}&gt;</span><br/>"
                f"<span style='color:#666; font-size:13px;'>↳ {item['detail']}</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

with tab_email:
    st.subheader("이메일 발송 로그")
    if not email_rows:
        st.info("아직 발송된 이메일이 없습니다.")
    else:
        only_fail = st.checkbox("❌ 실패만 보기", value=False, key="filter_fail")
        rows_view = list(reversed(email_rows))  # 최신순
        if only_fail:
            rows_view = [r for r in rows_view if r.get("status") != "success"]

        # 실패 원인 분포
        fail_rows = [r for r in email_rows if r.get("status") != "success"]
        if fail_rows:
            with st.expander(f"⚠️ 실패 원인 분포 ({len(fail_rows)}건)"):
                err_groups: Counter = Counter()
                for r in fail_rows:
                    err = (r.get("error", "") or "")[:60] or "원인 미상"
                    err_groups[err] += 1
                for err, cnt in err_groups.most_common(10):
                    st.markdown(f"- **{cnt}건**: `{err}`")

        st.markdown(f"**{len(rows_view)}건** 표시")
        for r in rows_view[:200]:
            at = r.get("at", "")[:16].replace("T", " ")
            status = r.get("status", "")
            icon = "✅" if status == "success" else "❌"
            line = (
                f"<div style='padding:6px 0; border-bottom:1px solid #eee;'>"
                f"<code>{at}</code> &nbsp; {icon} &nbsp; "
                f"<b>{r.get('name', '')}</b> "
                f"<span style='color:#888;'>&lt;{r.get('email_normalized', '')}&gt;</span> "
                f"<span style='color:#666;'>· {int(r.get('char_count', 0) or 0):,}자</span>"
            )
            if status == "success" and r.get("provider_id"):
                line += f"<br/><span style='color:#999; font-size:12px;'>↳ id: {r.get('provider_id')}</span>"
            elif r.get("error"):
                line += f"<br/><span style='color:#c44; font-size:12px;'>↳ {r.get('error', '')[:140]}</span>"
            line += "</div>"
            st.markdown(line, unsafe_allow_html=True)

        # CSV 다운로드
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(EMAIL_HEADERS)
        for r in email_rows:
            w.writerow([r.get(h, "") for h in EMAIL_HEADERS])
        st.download_button(
            "📥 이메일 발송 로그 CSV",
            data=buf.getvalue().encode("utf-8-sig"),
            file_name=f"이메일발송로그_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
        )

with tab_results:
    st.subheader("결과 저장 이력 (본문 메타)")
    if not result_rows:
        st.info("저장된 결과가 없습니다.")
    else:
        rows_view = list(reversed(result_rows))[:200]
        st.markdown(f"**{len(result_rows)}건** 저장됨 (최근 200건 표시)")
        for r in rows_view:
            at = r.get("at", "")[:16].replace("T", " ")
            char_count = int(r.get("char_count", 0) or 0)
            st.markdown(
                f"<div style='padding:6px 0; border-bottom:1px solid #eee;'>"
                f"<code>{at}</code> &nbsp; "
                f"<b>{r.get('name', '')}</b> "
                f"<span style='color:#888;'>&lt;{r.get('email_normalized', '')}&gt;</span> "
                f"&nbsp; <span style='color:#2D5016; font-weight:bold;'>{char_count:,}자</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

with tab_usage:
    st.subheader("사용 기록 전체")
    if not usage_rows:
        st.info("사용 기록이 없습니다.")
    else:
        # 이메일별 사용 횟수
        by_email: Counter = Counter()
        for r in usage_rows:
            e = r.get("email_normalized") or r.get("email", "")
            if e:
                by_email[e] += 1
        with st.expander("👥 이메일별 사용 횟수 TOP 20"):
            for em, cnt in by_email.most_common(20):
                st.markdown(f"- **{cnt}회** · `{em}`")

        rows_view = list(reversed(usage_rows))[:200]
        st.markdown(f"**{len(usage_rows)}건** 누적 (최근 200건 표시)")
        for r in rows_view:
            at = r.get("at", "")[:16].replace("T", " ")
            st.markdown(
                f"<div style='padding:6px 0; border-bottom:1px solid #eee;'>"
                f"<code>{at}</code> &nbsp; "
                f"<b>{r.get('name', '')}</b> "
                f"<span style='color:#888;'>&lt;{r.get('email_normalized', '')}&gt;</span> "
                f"<span style='color:#666;'>· {r.get('source', '')}</span>"
                f"</div>",
                unsafe_allow_html=True,
            )
