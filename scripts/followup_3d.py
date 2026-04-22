"""
접수 후 3일 경과 + 상담 미예약 + 3일 후속 미발송 → 상담 리마인더 자동 발송.

실행:
  python scripts/followup_3d.py

GitHub Actions에서는 매일 KST 10 AM (UTC 01:00)에 실행.
시트 컬럼 '3일 후속 발송'에 타임스탬프를 기록해 중복 방지.
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta

from scripts._common import (
    CAL_URL,
    load_records,
    mark_sent,
    parse_copies,
    parse_dt,
    send_email,
)

FROM_AUTHOR = None  # RESEND_FROM 환경변수 재사용

DAYS_MIN = 3
DAYS_MAX = 7  # 너무 오래된 건(이미 7일 후속 넘긴 것)은 skip

TEMPLATE_SA = """{author} 작가님, 안녕하세요. 작가의집입니다.

사흘 전 올려주신 원고, 고마웠습니다.
혹시 상담 일정이 부담되셨다면 한 가지만 말씀드릴게요 —
작가님 원고는 대표가 **우선 검토 대상**으로 체크해둔 원고입니다.

15분이면 충분합니다. 강권이나 판매가 아니라,
원고에 맞는 길이 무엇인지 같이 지도 펴보는 시간이에요.

👉 대표 직접 상담 예약하기:
    {cal}

편하신 날짜에 잡아주시고, 어려우시면 이 메일에 답장만 주셔도 됩니다.
— 작가의집 (대표 황준연)
"""

TEMPLATE_B = """{author} 작가님,

사흘 전 원고 잘 읽었습니다.
작가님 원고는 "조금만 방향 다듬으면 충분히 책이 된다"는 판단이었어요.

혹시 어떻게 해야 할지 막막하시면, 무료 상담 한 번 편하게 받아보세요.
대표가 원고를 다시 읽고 방향만 같이 정리해드립니다.

👉 15분 무료 상담: {cal}

부담스러우시면 답장만 주셔도 됩니다. 읽고 짧게라도 회신드릴게요.
— 작가의집
"""

TEMPLATE_C = """{author} 작가님,

사흘 전 보내주신 원고, 고마웠습니다.
이번에는 출간 제안을 드리지 못했지만, 원고에서 반짝이던 대목이 있었어요.

부담 없이 받아보실 수 있는 것 두 가지만 소개할게요:
1) 100질문 PDF — 책 쓰기 전 정리해야 할 100가지
   스티비 구독하시면 바로 보내드려요: https://stib.ee/cD9N
2) 무료 5일 부트캠프 — 주제/독자 재정의
   https://jagabook.co.kr/bootcamp

다음에 더 단단해진 원고로 다시 만났으면 좋겠습니다.
— 작가의집
"""


def cta_body(grade: str, author: str) -> str:
    if grade in ("S", "A"):
        return TEMPLATE_SA.format(author=author, cal=CAL_URL)
    if grade == "B":
        return TEMPLATE_B.format(author=author, cal=CAL_URL)
    return TEMPLATE_C.format(author=author)


def main() -> int:
    records, ws, hmap = load_records()
    col_3d = hmap.get("3일 후속 발송")
    if not col_3d:
        print("[FATAL] 시트에 '3일 후속 발송' 컬럼이 없습니다.")
        return 2

    now = datetime.now()
    min_dt = now - timedelta(days=DAYS_MAX)
    max_dt = now - timedelta(days=DAYS_MIN)

    sent = 0
    skipped = 0
    failed = 0

    for idx, r in enumerate(records, start=2):  # row 2부터 데이터
        dt = parse_dt(str(r.get("접수시간", "")))
        if not dt:
            skipped += 1
            continue
        if not (min_dt <= dt <= max_dt):
            skipped += 1
            continue
        if str(r.get("3일 후속 발송", "")).strip():
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

        # 긴급도에 따라 subject 다르게
        if grade == "S" and copies >= 100:
            subj = f"[작가의집] {author} 작가님, 상담 일정만 잡아주세요 (S급 우선)"
        elif grade in ("S", "A"):
            subj = f"[작가의집] {author} 작가님, 사흘 지났는데 잘 계세요?"
        elif grade == "B":
            subj = f"[작가의집] {author} 작가님, 방향 같이 잡아볼까요?"
        else:
            subj = f"[작가의집] {author} 작가님께 드리는 두 가지 선물"

        body = cta_body(grade, author)

        ok = send_email(
            to=email,
            subject=subj,
            text=body,
            from_email=FROM_AUTHOR,
            reply_to="joyfuljun4@gmail.com",
        )
        if ok:
            mark_sent(ws, idx, col_3d)
            sent += 1
            print(f"[OK] 3일 후속 → {author} ({grade}등급 · {copies}부)")
        else:
            failed += 1

    print(f"\n요약: 발송 {sent} · 스킵 {skipped} · 실패 {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
