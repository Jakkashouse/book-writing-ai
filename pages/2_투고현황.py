"""
📊 투고 현황 관리자 대시보드

접근: /투고현황
비밀번호: Streamlit Secrets의 ADMIN_PASSWORD
데이터: 구글시트 '투고_원고접수' 탭 (pages/1_투고하기.py가 쌓는 것)

의존성: streamlit, gspread 만 사용 (pandas 불필요 — 이전 배포 문제 회피)
"""
from __future__ import annotations

import csv
import io
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
            "Streamlit Secrets에 `[gcp_service_account]` 섹션이 있는지 확인해주세요. "
            "(GCP 서비스 계정 세팅 가이드: 프로젝트 루트의 "
            "GCP서비스계정_세팅가이드_20260421.md 참조)"
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
    """'2026-04-21 13:34' 형식 파싱. 실패 시 None."""
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


records, err = load_submissions()

if err:
    st.warning(err)
    st.stop()

if not records:
    st.info("🌱 아직 투고가 없어요. 첫 작가님을 기다리는 중입니다.")
    st.stop()

# ─── KPI 계산 ─────────────────────────────────
total = len(records)
now = datetime.now()
week_ago = now - timedelta(days=7)

parsed_records = []
for r in records:
    dt = parse_datetime(str(r.get("접수시간", "")))
    parsed_records.append({**r, "_dt": dt})

recent_week = [r for r in parsed_records if r["_dt"] and r["_dt"] >= week_ago]

scores = [to_int(r.get("점수", 0)) for r in records]
scores = [s for s in scores if s > 0]
avg_score = sum(scores) / len(scores) if scores else 0

grade_counts = Counter(r.get("등급", "") for r in records if r.get("등급"))
category_counts = Counter(
    r.get("주제 카테고리", "") for r in records if r.get("주제 카테고리")
)

# ─── KPI 카드 ────────────────────────────────
st.markdown("### 📈 현황 요약")

c1, c2, c3, c4 = st.columns(4)
c1.metric("전체 투고", f"{total:,}건")
c2.metric("최근 7일", f"{len(recent_week):,}건")
c3.metric("평균 점수", f"{avg_score:.1f}" if scores else "-")
c4.metric("S등급", f"{grade_counts.get('S', 0):,}건")

st.divider()

# ─── 분포 차트 ────────────────────────────────
col_a, col_b = st.columns(2)

with col_a:
    st.markdown("#### 등급별 분포")
    grade_dict = {g: grade_counts.get(g, 0) for g in ["S", "A", "B", "C"]}
    if sum(grade_dict.values()) > 0:
        st.bar_chart(grade_dict, use_container_width=True)
    else:
        st.caption("등급 데이터 없음")

with col_b:
    st.markdown("#### 주제 카테고리 분포 (상위 8)")
    top_cats = dict(category_counts.most_common(8))
    if top_cats:
        st.bar_chart(top_cats, use_container_width=True)
    else:
        st.caption("카테고리 데이터 없음")

# ─── 주간 추이 ────────────────────────────────
dated_records = [r for r in parsed_records if r["_dt"]]
if dated_records:
    st.markdown("#### 주간 투고량 (최근 8주)")
    weekly_counts: dict[str, int] = {}
    for r in dated_records:
        dt = r["_dt"]
        # 주의 시작(월요일) 기준
        week_start = dt - timedelta(days=dt.weekday())
        key = week_start.strftime("%Y-%m-%d")
        weekly_counts[key] = weekly_counts.get(key, 0) + 1

    # 최근 8주
    sorted_weeks = sorted(weekly_counts.items())[-8:]
    weekly_dict = dict(sorted_weeks)
    if weekly_dict:
        st.bar_chart(weekly_dict, use_container_width=True)

st.divider()

# ─── 필터 + 테이블 ───────────────────────────
st.markdown("### 🔍 투고 목록")

f1, f2, f3 = st.columns(3)
with f1:
    available_grades = sorted({r.get("등급", "") for r in records if r.get("등급")})
    grade_filter = st.multiselect("등급 필터", options=available_grades)
with f2:
    available_cats = sorted(
        {r.get("주제 카테고리", "") for r in records if r.get("주제 카테고리")}
    )
    cat_filter = st.multiselect("카테고리 필터", options=available_cats)
with f3:
    min_score = st.slider("최소 점수", 0, 100, 0, step=5)

# 필터 적용
filtered = records
if grade_filter:
    filtered = [r for r in filtered if r.get("등급") in grade_filter]
if cat_filter:
    filtered = [r for r in filtered if r.get("주제 카테고리") in cat_filter]
if min_score > 0:
    filtered = [r for r in filtered if to_int(r.get("점수", 0)) >= min_score]

# 표시 컬럼 선택
display_cols = [
    "접수시간", "작가명", "등급", "점수", "주제 카테고리",
    "SNS 팔로워", "SNS 등급", "저자 구매 의향",
    "글자수", "이메일", "연락처", "상담 희망", "직업·경력",
]
display_records = [
    {k: r.get(k, "") for k in display_cols if k in r}
    for r in filtered
]

st.caption(f"필터 결과: **{len(filtered):,}건** / 전체 {total:,}건")

if display_records:
    st.dataframe(
        display_records, use_container_width=True, hide_index=True,
    )
else:
    st.info("필터 조건에 맞는 투고가 없습니다.")

# ─── CSV 내보내기 ────────────────────────────
if filtered:
    buf = io.StringIO()
    all_keys: list[str] = []
    for r in filtered:
        for k in r.keys():
            if k not in all_keys:
                all_keys.append(k)
    writer = csv.DictWriter(buf, fieldnames=all_keys)
    writer.writeheader()
    writer.writerows(filtered)
    csv_data = buf.getvalue().encode("utf-8-sig")

    st.download_button(
        "📥 CSV 다운로드 (필터 적용 결과)",
        csv_data,
        file_name=f"투고현황_{now.strftime('%Y%m%d_%H%M')}.csv",
        mime="text/csv",
    )
