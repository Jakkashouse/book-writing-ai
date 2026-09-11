#!/usr/bin/env python3
"""메타 리드 CSV → 문자 발송용 CSV (이름, 전화번호).

문자 발송 시스템은 번호 하나만 형식이 어긋나도 파일 전체를 거부하는
경우가 많습니다. 그래서 정상 번호만 발송용에 담고, 살릴 수 없는 번호는
따로 빼서 눈으로 확인하실 수 있게 남깁니다.

사용법:
    python meta_to_sms.py "C:/Users/JUN/Downloads/leads (7).csv"
"""

import csv
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

OUT_DIR = Path(r"C:\Users\JUN\Downloads")

NAME_COL = "이름"
PHONE_COL = "전화번호"
ALT_PHONE_COL = "보조 전화번호"

VALID = re.compile(r"01[016789]-\d{3,4}-\d{4}")


def clean_text(s: str) -> str:
    """맥에서 입력한 이름은 NFD(분해형 한글)로 들어옵니다. NFC로 합칩니다."""
    if not s:
        return ""
    s = unicodedata.normalize("NFC", s)
    s = "".join(c for c in s if unicodedata.category(c)[0] != "C")
    return s.strip()


def normalize_phone(raw: str) -> str:
    """어떤 표기로 들어오든 010-1234-5678로. 못 살리면 빈 문자열."""
    if not raw:
        return ""
    digits = re.sub(r"[^0-9]", "", raw)

    # 국가번호 벗기기 — 82(한국), +1 오입력
    if digits.startswith("82"):
        digits = "0" + digits[2:]
    elif digits.startswith("1010") and len(digits) == 12:
        digits = digits[1:]
    # 앞자리 0 누락
    if len(digits) == 10 and digits.startswith("10"):
        digits = "0" + digits
    # 0이 두 번
    while digits.startswith("00"):
        digits = digits[1:]

    if len(digits) == 11 and digits.startswith("01"):
        out = f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
    elif len(digits) == 10 and digits.startswith("01"):
        out = f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    else:
        return ""

    return out if VALID.fullmatch(out) else ""


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    src = Path(sys.argv[1])
    if not src.exists():
        raise SystemExit(f"파일을 찾을 수 없습니다: {src}")

    with src.open(encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))
    if not rows:
        raise SystemExit("빈 파일입니다.")

    header = rows[0]
    if NAME_COL not in header or PHONE_COL not in header:
        raise SystemExit(
            f"필요한 컬럼이 없습니다.\n실제 헤더: {' | '.join(header)}"
        )

    ni = header.index(NAME_COL)
    pi = header.index(PHONE_COL)
    ai = header.index(ALT_PHONE_COL) if ALT_PHONE_COL in header else -1

    good, bad = [], []
    seen = set()
    dup = 0

    for row in rows[1:]:
        if len(row) <= max(ni, pi):
            continue
        name = clean_text(row[ni])
        raw = row[pi].strip()
        phone = normalize_phone(raw)

        # 주 번호가 안 되면 보조 번호로 한 번 더
        if not phone and 0 <= ai < len(row):
            phone = normalize_phone(row[ai].strip())

        if not phone:
            if raw:
                bad.append([name, raw])
            continue
        if phone in seen:
            dup += 1
            continue
        seen.add(phone)
        good.append([name, phone])

    stamp = date.today().strftime("%Y%m%d")
    tag = re.sub(r"[^0-9A-Za-z가-힣]+", "", src.stem) or "leads"
    out = OUT_DIR / f"문자발송_{tag}_{stamp}.csv"

    with out.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([NAME_COL, PHONE_COL])
        w.writerows(good)

    print(f"원본 {len(rows) - 1}건")
    print(f"  중복 번호 제외: {dup}건")
    print(f"  살릴 수 없는 번호: {len(bad)}건")
    print(f"  발송 가능: {len(good)}건")
    print()
    print(f"발송용: {out}")

    if bad:
        badf = OUT_DIR / f"문자발송_{tag}_확인필요_{stamp}.csv"
        with badf.open("w", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f)
            w.writerow([NAME_COL, "원본값"])
            w.writerows(bad)
        print(f"확인필요: {badf}")
        print("  → 엑셀로 열었다 저장한 파일이면 뒷자리가 소실된 것이라 복구 불가입니다")


if __name__ == "__main__":
    main()
