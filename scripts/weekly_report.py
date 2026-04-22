"""
주간 투고 리포트 — 매주 월요일 KST 오전 9시 대표에게 자동 발송.

집계 대상: 지난 월요일 00:00 ~ 지난 일요일 23:59 (지난 한 주)
내용:
  - 총 건수 / 평균 점수 / S·A·B·C 분포
  - 🔥 VIP 리스트 (S급 또는 자가구매 100부+)
  - ⏳ 미예약 리드 TOP 5 (가장 최근 S/A 중 상담 예약 없음)

실행: python scripts/weekly_report.py
"""
from __future__ import annotations

import sys
from collections import Counter
from datetime import datetime, timedelta

from scripts._common import (
    DEFAULT_ADMIN,
    get_env,
    load_records,
    parse_copies,
    parse_dt,
    send_email,
)


def build_report() -> str:
    records, _ws, _hmap = load_records()
    now = datetime.now()

    # 지난 주 월~일
    today_wd = now.weekday()  # 월=0
    this_monday = now - timedelta(days=today_wd)
    last_monday = this_monday - timedelta(days=7)
    last_sunday_end = this_monday - timedelta(seconds=1)

    last_week = []
    for r in records:
        dt = parse_dt(str(r.get("접수시간", "")))
        if dt and last_monday <= dt <= last_sunday_end:
            last_week.append({**r, "_dt": dt, "_copies": parse_copies(r.get("저자 구매 의향", ""))})

    total = len(last_week)

    scores = []
    for r in last_week:
        try:
            scores.append(int(str(r.get("점수", 0)).strip() or 0))
        except (ValueError, TypeError):
            pass
    avg = (sum(scores) / len(scores)) if scores else 0

    grade_counts = Counter(r.get("등급", "") for r in last_week if r.get("등급"))

    # VIP = S등급 OR 자가구매 100부+
    vips = sorted(
        [r for r in last_week if r.get("등급") == "S" or r["_copies"] >= 100],
        key=lambda r: (
            0 if r.get("등급") == "S" else 1,
            -r["_copies"],
            -int(str(r.get("점수", 0)) or 0),
        ),
    )

    # 미예약 S/A
    pending_sa = [
        r for r in last_week
        if r.get("등급") in ("S", "A") and not str(r.get("상담 예약", "")).strip()
    ]
    pending_sa = sorted(
        pending_sa, key=lambda r: (r["_dt"] or datetime.min), reverse=True
    )[:5]

    period_str = (
        f"{last_monday.strftime('%m/%d')} ~ "
        f"{last_sunday_end.strftime('%m/%d')}"
    )

    lines = [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"  📊 작가의집 주간 투고 리포트",
        f"  {period_str}",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        f"총 {total}건 · 평균 {avg:.1f}점",
        "",
        "[등급 분포]",
        f"  🔥 S: {grade_counts.get('S', 0)}건",
        f"  ⭐ A: {grade_counts.get('A', 0)}건",
        f"  📘 B: {grade_counts.get('B', 0)}건",
        f"  🌱 C: {grade_counts.get('C', 0)}건",
        "",
    ]

    if vips:
        lines.append(f"[🔥 VIP 리스트 — {len(vips)}명]")
        for r in vips[:10]:
            lines.append(
                f"  · {r.get('작가명', '무명')} "
                f"({r.get('등급', '-')}등급 {r.get('점수', '-')}점, "
                f"자가구매 {r.get('저자 구매 의향', '-')}) "
                f"— {r.get('이메일', '-')}"
            )
        lines.append("")

    if pending_sa:
        lines.append("[⏳ 미예약 S/A 리드 — 이번 주 우선 연락 대상]")
        for r in pending_sa:
            dt_str = r["_dt"].strftime("%m/%d") if r["_dt"] else "-"
            lines.append(
                f"  · {dt_str} {r.get('작가명', '무명')} "
                f"({r.get('등급', '-')}등급 {r.get('점수', '-')}점) "
                f"— {r.get('이메일', '-')} · {r.get('연락처', '-')}"
            )
        lines.append("")

    lines.append("─── 대시보드: /투고현황 ───")
    return "\n".join(lines)


def main() -> int:
    body = build_report()
    to = get_env("ADMIN_EMAIL", DEFAULT_ADMIN)
    subject = f"[주간리포트] 작가의집 투고 현황 — {datetime.now().strftime('%m/%d')}"

    ok = send_email(to=to, subject=subject, text=body)
    if ok:
        print(f"[OK] 주간 리포트 발송 → {to}")
        return 0
    print("[ERROR] 주간 리포트 발송 실패")
    return 1


if __name__ == "__main__":
    sys.exit(main())
