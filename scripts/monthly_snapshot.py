"""
월간 시트 스냅샷 — 매월 1일 KST 오전 2시에 구글시트 전체를 CSV로 변환해
대표 이메일로 첨부 발송 (백업 목적).

실행: python scripts/monthly_snapshot.py
"""
from __future__ import annotations

import csv
import io
import sys
from datetime import datetime

from scripts._common import (
    DEFAULT_ADMIN,
    attach_csv,
    get_env,
    load_records,
    send_email,
)


def build_csv(records: list[dict]) -> str:
    if not records:
        return "접수시간,작가명\n"
    keys: list[str] = []
    for r in records:
        for k in r.keys():
            if k not in keys:
                keys.append(k)
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=keys)
    writer.writeheader()
    writer.writerows(records)
    return buf.getvalue()


def main() -> int:
    records, _ws, _hmap = load_records()
    now = datetime.now()
    month_str = now.strftime("%Y%m")

    csv_content = build_csv(records)
    csv_filename = f"투고현황_스냅샷_{month_str}.csv"

    body = f"""작가의집 투고 시트 월간 스냅샷입니다.

- 생성 시각: {now.strftime('%Y-%m-%d %H:%M')}
- 전체 레코드: {len(records):,}건
- 첨부: {csv_filename}

CSV를 로컬/Drive에 백업해두시고, 시트에 사고 생겨도
최소 이 스냅샷 기준으로 복구 가능합니다.
"""

    to = get_env("ADMIN_EMAIL", DEFAULT_ADMIN)
    ok = send_email(
        to=to,
        subject=f"[월간 백업] 작가의집 투고 현황 스냅샷 — {month_str}",
        text=body,
        attachments=[attach_csv(csv_filename, csv_content)],
    )
    if ok:
        print(f"[OK] 월간 스냅샷 발송 → {to} ({len(records)}건)")
        return 0
    print("[ERROR] 월간 스냅샷 발송 실패")
    return 1


if __name__ == "__main__":
    sys.exit(main())
