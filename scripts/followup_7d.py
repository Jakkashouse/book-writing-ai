"""
접수 후 7일 경과 + 상담 미예약 + 7일 후속 미발송 → 최종 리드마그넷 발송.

등급별 차이:
  S/A → 대표의 마지막 개인적 제안
  B/C → 100질문 PDF + 스티비 구독 (장기 nurture로 전환)

실행:
  python scripts/followup_7d.py
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta

from scripts._common import (
    CAL_URL,
    STIBEE_URL,
    load_records,
    mark_sent,
    parse_copies,
    parse_dt,
    send_email,
)

DAYS_MIN = 7
DAYS_MAX = 14

TEMPLATE_SA = """{author} 작가님, 작가의집입니다.

지난주에 원고 보내주신 지 일주일 지났네요.
바쁘신 거 잘 압니다. 저도 서두르진 않을게요.

다만 한 번만 더 말씀드리면 —
작가님 원고는 제가 직접 체크해둔 "우선 회신 원고"입니다.
30분만 주시면 출간 방향(기획/협업/자체) 중 어디가 맞는지
제가 원고 보면서 바로 말씀드릴 수 있어요.

👉 {cal}

이 메일이 마지막 안내입니다. 다음부터는 제가 먼저 연락드리지 않고,
작가님이 생각나실 때 편하게 답장 주시면 됩니다.

— 작가의집 대표 황준연
"""

TEMPLATE_BC = """{author} 작가님,

지난주 보내주신 원고, 다시 한 번 잘 읽었습니다.
바로 출간까지는 거리가 있더라도, 글을 계속 이어가시길 응원합니다.

이번 메일이 마지막 안내예요. 대신 가져가실 수 있는 두 가지만 남겨둘게요.

1) 📘 **100질문 PDF** — 책 쓰기 전 스스로 답해봐야 할 100가지
   스티비 구독하시면 바로 보내드립니다:
   {stibee}

2) 🌱 **무료 5일 부트캠프** — 주제·독자·포지셔닝 다시 잡기
   https://jagabook.co.kr/bootcamp

다음에 더 단단해진 원고로 다시 만났으면 좋겠습니다.
— 작가의집
"""


def cta_body(grade: str, author: str) -> str:
    if grade in ("S", "A"):
        return TEMPLATE_SA.format(author=author, cal=CAL_URL)
    return TEMPLATE_BC.format(author=author, stibee=STIBEE_URL)


def main() -> int:
    records, ws, hmap = load_records()
    col_7d = hmap.get("7일 후속 발송")
    if not col_7d:
        print("[FATAL] 시트에 '7일 후속 발송' 컬럼이 없습니다.")
        return 2

    now = datetime.now()
    min_dt = now - timedelta(days=DAYS_MAX)
    max_dt = now - timedelta(days=DAYS_MIN)

    sent = 0
    skipped = 0
    failed = 0

    for idx, r in enumerate(records, start=2):
        dt = parse_dt(str(r.get("접수시간", "")))
        if not dt:
            skipped += 1
            continue
        if not (min_dt <= dt <= max_dt):
            skipped += 1
            continue
        if str(r.get("7일 후속 발송", "")).strip():
            skipped += 1
            continue
        if str(r.get("상담 예약", "")).strip():
            skipped += 1
            continue

        email = (r.get("이메일") or "").strip()
        if not email or "@" not in email:
            skipped += 1
            continue

        author = str(r.get("작가명") or "작가").strip() or "작가"
        grade = str(r.get("등급") or "").strip()
        copies = parse_copies(r.get("저자 구매 의향", ""))

        if grade in ("S", "A"):
            subj = f"[작가의집] {author} 작가님께 드리는 마지막 제안"
        else:
            subj = f"[작가의집] {author} 작가님께 드리는 두 가지 선물"

        body = cta_body(grade, author)

        ok = send_email(
            to=email,
            subject=subj,
            text=body,
            reply_to="joyfuljun4@gmail.com",
        )
        if ok:
            mark_sent(ws, idx, col_7d)
            sent += 1
            print(f"[OK] 7일 후속 → {author} ({grade}등급 · {copies}부)")
        else:
            failed += 1

    print(f"\n요약: 발송 {sent} · 스킵 {skipped} · 실패 {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
