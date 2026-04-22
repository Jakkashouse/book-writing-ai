"""
📊 투고 현황 관리자 대시보드 (v2)

접근: /투고현황
비밀번호: Streamlit Secrets의 ADMIN_PASSWORD
데이터: 구글시트 '투고_원고접수' 탭 (pages/1_투고하기.py가 쌓는 것)

v2 개선점 (2026-04-22):
- 사이드바 필터 (본문은 결과만 집중)
- 등급별 색 배지 (🔥 S / ⭐ A / 📘 B / 🌱 C)
- 최근 7일 "긴급/VIP" 카드로 별도 상단 노출
- 자가구매 100부+ 필터
- 원고 미리보기 expander (첫 500자)
- 후속 발송 상태 한눈에 (3일/7일)

의존성: streamlit + gspread 만. pandas 불필요.
"""
from __future__ import annotations

import csv
import io
import re
from collections import Counter
from datetime import datetime, timedelta

import streamlit as st

from coaching.context_manager import _get_spreadsheet

st.set_page_config(
    page_title="투고 현황 | 작가의집",
    page_icon="📊",
    layout="wide",
)

st.title("📊 투고 현황 대시보드")

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
    pwd = st.text_input("관리자 비밀번호", type="password")
    col_a, col_b = st.columns([1, 5])
    with col_a:
        if st.button("로그인", type="primary"):
            if pwd == admin_password:
                st.session_state["admin_authed"] = True
                st.rerun()
            else:
                st.error("비밀번호가 일치하지 않습니다.")
    st.stop()

# ─── 상단 툴바 ────────────────────────────────
col_refresh, col_logout = st.columns([5, 1])
with col_refresh:
    if st.button("🔄 새로고침"):
        st.cache_data.clear()
        st.rerun()
with col_logout:
    if st.button("🚪 로그아웃"):
        st.session_state.pop("admin_authed", None)
        st.rerun()


# ─── 데이터 로드 ──────────────────────────────
@st.cache_data(ttl=60)
def load_submissions() -> tuple[list[dict], str | None]:
    """(records, error_message)를 반환. 에러 있으면 records는 빈 리스트."""
    sp = _get_spreadsheet()
    if sp is None:
        return [], (
            "구글시트에 연결할 수 없습니다. "
            "Streamlit Secrets에 `[gcp_service_account]` 섹션이 있는지 확인해주세요."
        )
    try:
        ws = sp.worksheet("투고_원고접수")
    except Exception:
        return [], (
            "시트에 '투고_원고접수' 탭이 아직 없습니다. "
            "첫 투고가 제출되면 자동 생성됩니다."
        )
    try:
        records = ws.get_all_records()
    except Exception as e:
        return [], f"시트 읽기 실패: {e}"
    return records, None


def parse_datetime(s: str) -> datetime | None:
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(s.strip(), fmt)
        except (ValueError, AttributeError):
            continue
    return None


def to_int(val) -> int:
    try:
        return int(str(val).replace(",", "").strip())
    except (ValueError, TypeError):
        return 0


def parse_copies(label: str) -> int:
    """'200부' → 200, '300부 이상' → 300."""
    if not label:
        return 0
    m = re.search(r"(\d+)", str(label))
    return int(m.group(1)) if m else 0


GRADE_BADGES = {
    "S": "🔥 S",
    "A": "⭐ A",
    "B": "📘 B",
    "C": "🌱 C",
}


def badge(grade: str) -> str:
    return GRADE_BADGES.get(grade, grade or "-")


records, err = load_submissions()

if err:
    st.warning(err)
    st.stop()

if not records:
    st.info("🌱 아직 투고가 없어요. 첫 작가님을 기다리는 중입니다.")
    st.stop()

# 파싱 & 증강
now = datetime.now()
week_ago = now - timedelta(days=7)

enriched: list[dict] = []
for r in records:
    dt = parse_datetime(str(r.get("접수시간", "")))
    copies = parse_copies(str(r.get("저자 구매 의향", "")))
    enriched.append({
        **r,
        "_dt": dt,
        "_copies": copies,
        "_grade": str(r.get("등급", "")),
        "_score": to_int(r.get("점수", 0)),
    })

# ─── 사이드바 필터 ───────────────────────────
st.sidebar.markdown("## 🔍 필터")

grades_present = sorted({r["_grade"] for r in enriched if r["_grade"]})
f_grade = st.sidebar.multiselect("등급", options=grades_present)

cats_present = sorted({
    r.get("주제 카테고리", "") for r in enriched if r.get("주제 카테고리")
})
f_cat = st.sidebar.multiselect("주제 카테고리", options=cats_present)

f_min_score = st.sidebar.slider("최소 점수", 0, 100, 0, step=5)

st.sidebar.markdown("### 📚 자가구매 필터")
purchase_mode = st.sidebar.radio(
    "자가구매 약정",
    ["전체", "100부 이상", "200부 이상"],
    index=0,
    label_visibility="collapsed",
)

f_only_pending = st.sidebar.checkbox(
    "🔴 상담 미예약만 보기",
    value=False,
    help="'상담 예약' 컬럼이 빈 건만 필터 — 아직 연락 안 된 작가 발견용",
)

# 필터 적용
filtered = enriched
if f_grade:
    filtered = [r for r in filtered if r["_grade"] in f_grade]
if f_cat:
    filtered = [r for r in filtered if r.get("주제 카테고리") in f_cat]
if f_min_score > 0:
    filtered = [r for r in filtered if r["_score"] >= f_min_score]
if purchase_mode == "100부 이상":
    filtered = [r for r in filtered if r["_copies"] >= 100]
elif purchase_mode == "200부 이상":
    filtered = [r for r in filtered if r["_copies"] >= 200]
if f_only_pending:
    filtered = [r for r in filtered if not str(r.get("상담 예약", "")).strip()]

# ─── KPI 카드 ────────────────────────────────
total = len(enriched)
recent_week_all = [r for r in enriched if r["_dt"] and r["_dt"] >= week_ago]

scores = [r["_score"] for r in enriched if r["_score"] > 0]
avg_score = sum(scores) / len(scores) if scores else 0

grade_counts = Counter(r["_grade"] for r in enriched if r["_grade"])

st.markdown("### 📈 현황 요약")
c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("전체 투고", f"{total:,}건")
c2.metric("최근 7일", f"{len(recent_week_all):,}건")
c3.metric("평균 점수", f"{avg_score:.1f}" if scores else "-")
c4.metric("🔥 S등급", f"{grade_counts.get('S', 0):,}건")
vip_count = sum(1 for r in enriched if r["_copies"] >= 100)
c5.metric("📚 자가구매 100+", f"{vip_count:,}건")

st.divider()

# ─── 🔥 긴급/VIP 알림 (최근 7일) ─────────────
vip_recent = sorted(
    [r for r in recent_week_all if r["_grade"] == "S" or r["_copies"] >= 100],
    key=lambda r: (r["_dt"] or datetime.min),
    reverse=True,
)[:10]

if vip_recent:
    st.markdown("### 🔥 우선 응대 대상 (최근 7일)")
    st.caption("S등급 또는 자가구매 100부+ 약정 작가 — 이 카드부터 확인하세요.")

    for r in vip_recent:
        grade = r["_grade"]
        copies = r["_copies"]
        score = r["_score"]
        author = r.get("작가명", "무명")
        category = r.get("주제 카테고리", "-")
        email = r.get("이메일", "")
        phone = r.get("연락처", "")
        dt_str = r["_dt"].strftime("%m/%d %H:%M") if r["_dt"] else "-"
        consulted = str(r.get("상담 예약", "")).strip()

        # 긴급도 배너 톤 결정
        if grade == "S" and copies >= 200:
            tag = "🔥🔥 S급 VIP · 200부+"
            tone = ":red"
        elif grade == "S" and copies >= 100:
            tag = "🔥 S급 · 100부+"
            tone = ":red"
        elif grade == "S":
            tag = "🔥 S급 긴급"
            tone = ":orange"
        elif copies >= 200:
            tag = "📚 자가구매 200부+"
            tone = ":orange"
        else:
            tag = "📚 자가구매 100부+"
            tone = ":blue"

        status = "✅ 상담 예약됨" if consulted else "⏳ 미예약"

        with st.container(border=True):
            colL, colR = st.columns([3, 1])
            with colL:
                st.markdown(
                    f"**{tone}[{tag}]** · **{author}** ({score}점) · "
                    f"_{category}_ · 🕐 {dt_str}"
                )
                st.caption(
                    f"📧 {email} · 📞 {phone} · "
                    f"자가구매: **{r.get('저자 구매 의향', '-')}** · {status}"
                )
            with colR:
                pitch = str(r.get("원고 미리보기", ""))[:80]
                if pitch:
                    st.caption(f"📄 {pitch}…")

    st.divider()

# ─── 분포 차트 ────────────────────────────────
col_a, col_b = st.columns(2)

with col_a:
    st.markdown("#### 등급별 분포")
    grade_dict = {
        GRADE_BADGES.get(g, g): grade_counts.get(g, 0)
        for g in ["S", "A", "B", "C"]
    }
    if sum(grade_dict.values()) > 0:
        st.bar_chart(grade_dict, use_container_width=True)
    else:
        st.caption("등급 데이터 없음")

with col_b:
    st.markdown("#### 주제 카테고리 분포 (상위 8)")
    category_counts = Counter(
        r.get("주제 카테고리", "") for r in enriched if r.get("주제 카테고리")
    )
    top_cats = dict(category_counts.most_common(8))
    if top_cats:
        st.bar_chart(top_cats, use_container_width=True)
    else:
        st.caption("카테고리 데이터 없음")

# ─── 주간 추이 ────────────────────────────────
dated_records = [r for r in enriched if r["_dt"]]
if dated_records:
    st.markdown("#### 주간 투고량 (최근 8주)")
    weekly_counts: dict[str, int] = {}
    for r in dated_records:
        dt = r["_dt"]
        week_start = dt - timedelta(days=dt.weekday())
        key = week_start.strftime("%Y-%m-%d")
        weekly_counts[key] = weekly_counts.get(key, 0) + 1
    sorted_weeks = sorted(weekly_counts.items())[-8:]
    weekly_dict = dict(sorted_weeks)
    if weekly_dict:
        st.bar_chart(weekly_dict, use_container_width=True)

st.divider()

# ─── 필터 결과 테이블 ────────────────────────
st.markdown(f"### 📋 전체 투고 목록 (필터 결과: **{len(filtered):,}건** / 전체 {total:,}건)")

# 정렬: 최신순
filtered_sorted = sorted(
    filtered, key=lambda r: (r["_dt"] or datetime.min), reverse=True
)

# 간단 표 (배지 포함 등급)
if filtered_sorted:
    display_rows = []
    for r in filtered_sorted:
        display_rows.append({
            "접수": r["_dt"].strftime("%m/%d %H:%M") if r["_dt"] else "-",
            "작가": r.get("작가명", ""),
            "등급": badge(r["_grade"]),
            "점수": r["_score"],
            "카테고리": r.get("주제 카테고리", ""),
            "SNS": r.get("SNS 팔로워", 0),
            "자가구매": r.get("저자 구매 의향", ""),
            "상담희망": r.get("상담 희망", ""),
            "이메일": r.get("이메일", ""),
            "연락처": r.get("연락처", ""),
            "글자수": r.get("글자수", 0),
            "상담예약": "✅" if str(r.get("상담 예약", "")).strip() else "",
            "3일후속": "✅" if str(r.get("3일 후속 발송", "")).strip() else "",
            "7일후속": "✅" if str(r.get("7일 후속 발송", "")).strip() else "",
        })
    st.dataframe(
        display_rows,
        use_container_width=True,
        hide_index=True,
        column_config={
            "점수": st.column_config.NumberColumn(format="%d점"),
            "SNS": st.column_config.NumberColumn(format="%d명"),
            "글자수": st.column_config.NumberColumn(format="%d자"),
        },
    )

    # 원고 미리보기 expander (상위 20건)
    st.markdown("#### 📄 원고 미리보기 (상위 20건)")
    st.caption("펼치면 원고 첫 500자와 AI 분석 결과가 보입니다.")
    for r in filtered_sorted[:20]:
        title = (
            f"{badge(r['_grade'])} · {r.get('작가명', '무명')} · "
            f"{r['_score']}점 · {r.get('주제 카테고리', '-')}"
        )
        if r["_dt"]:
            title = f"{r['_dt'].strftime('%m/%d %H:%M')} · " + title

        with st.expander(title):
            colL, colR = st.columns([2, 1])
            with colL:
                st.markdown("**📄 원고 첫 500자**")
                preview = r.get("원고 미리보기", "") or "(미리보기 없음 — 기존 접수분)"
                st.text(preview)
                st.markdown("**📌 제목 후보**")
                st.caption(r.get("제목 후보", "-"))
                st.markdown("**💬 작가 메모**")
                st.caption(r.get("메모", "-") or "(없음)")
            with colR:
                st.markdown("**📞 연락**")
                st.caption(f"📧 {r.get('이메일', '-')}")
                st.caption(f"📞 {r.get('연락처', '-')}")
                st.markdown("**💼 저자 정보**")
                st.caption(f"직업: {r.get('직업·경력', '-')}")
                st.caption(f"SNS: {r.get('SNS 팔로워', 0)}명 ({r.get('SNS 등급', '-')})")
                st.caption(f"자가구매: **{r.get('저자 구매 의향', '-')}**")
                st.markdown("**📋 상담 희망**")
                st.caption(r.get("상담 희망", "-"))
                st.markdown("**🔔 발송 상태**")
                reply = r.get("작가 회신 발송", "-") or "-"
                f3 = r.get("3일 후속 발송", "") or "미발송"
                f7 = r.get("7일 후속 발송", "") or "미발송"
                booked = r.get("상담 예약", "") or "미예약"
                st.caption(f"회신: {reply} · 3일: {f3}")
                st.caption(f"7일: {f7} · 상담: {booked}")

else:
    st.info("필터 조건에 맞는 투고가 없습니다. 사이드바 필터를 완화해 보세요.")

# ─── CSV 내보내기 ────────────────────────────
if filtered_sorted:
    buf = io.StringIO()
    # 원본 레코드에서 내부 필드(_dt 등) 제거
    all_keys: list[str] = []
    export_rows = []
    for r in filtered_sorted:
        clean = {k: v for k, v in r.items() if not k.startswith("_")}
        for k in clean.keys():
            if k not in all_keys:
                all_keys.append(k)
        export_rows.append(clean)
    writer = csv.DictWriter(buf, fieldnames=all_keys)
    writer.writeheader()
    writer.writerows(export_rows)
    csv_data = buf.getvalue().encode("utf-8-sig")

    st.download_button(
        "📥 CSV 다운로드 (필터 적용 결과)",
        csv_data,
        file_name=f"투고현황_{now.strftime('%Y%m%d_%H%M')}.csv",
        mime="text/csv",
    )
