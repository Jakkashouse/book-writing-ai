#!/usr/bin/env python3
"""메타 리드 CSV → 스티비 주소록 CSV 변환.

메타는 12개 컬럼(제출된 날짜·소스·양식·채널·단계·소유자·레이블·
전화번호·보조 전화번호·WhatsApp 번호 포함)으로 내보내는데,
스티비 주소록에 정의되지 않은 필드가 섞여 있으면 파일 전체를
"잘못된 파일"로 거부합니다. 필요한 컬럼만 남겨 두 벌로 저장합니다.

사용법:
    python meta_to_stibee.py "C:/Users/JUN/Downloads/leads (5).csv"
"""

import csv
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

OUT_DIR = Path(r"C:\Users\JUN\Downloads")

EMAIL_COL = "이메일 주소"
NAME_COL = "이름"
PHONE_COL = "전화번호"


def clean_text(s: str) -> str:
    """맥에서 입력한 이름은 NFD(분해형 한글)로 들어옵니다.

    화면에는 '이은정'으로 똑같이 보이지만 내부는 낱자로 쪼개져 있어
    스티비가 파일 전체를 거부합니다. NFC로 합치고 제어문자를 털어냅니다.
    """
    if not s:
        return ""
    s = unicodedata.normalize("NFC", s)
    s = "".join(c for c in s if unicodedata.category(c)[0] != "C")
    return s.strip()


def normalize_phone(raw: str) -> str:
    """어떤 표기로 들어오든 010-1234-5678로. 복구 불가한 값은 빈 문자열.

    메타 리드는 국가번호 표기가 섞여 들어옵니다:
    +821048xxxxxx / 01048xxxxxx / +1010419xxxxx(오입력) / 1048xxxxxx(0 누락)
    """
    if not raw:
        return ""
    digits = re.sub(r"[^0-9]", "", raw)

    # 국가번호 벗기기 — 82(한국), 그리고 +1이 잘못 붙은 케이스
    if digits.startswith("82"):
        digits = "0" + digits[2:]
    elif digits.startswith("1010") and len(digits) == 12:
        digits = digits[1:]  # +1 오입력
    # 앞자리 0 누락 (10xxxxxxxx)
    if len(digits) == 10 and digits.startswith("10"):
        digits = "0" + digits
    # 0이 두 번 붙은 케이스 (0010xxxxxxxx)
    if digits.startswith("00"):
        digits = digits[1:]

    # 엑셀이 지수 표기로 뭉갠 값(8.21048E+12 등)은 자릿수가 모자랍니다
    if len(digits) == 11 and digits.startswith("01"):
        return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
    if len(digits) == 10 and digits.startswith("01"):
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    return digits


def convert(src: Path) -> dict:
    with src.open(encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))

    if not rows:
        raise SystemExit(f"빈 파일입니다: {src}")

    header = rows[0]
    for col in (EMAIL_COL, NAME_COL):
        if col not in header:
            raise SystemExit(
                f"'{col}' 컬럼이 없습니다. 메타 리드 CSV가 맞는지 확인해주세요.\n"
                f"실제 헤더: {' | '.join(header)}"
            )

    ei = header.index(EMAIL_COL)
    ni = header.index(NAME_COL)
    pi = header.index(PHONE_COL) if PHONE_COL in header else -1

    records = []
    seen = set()
    stats = {"total": len(rows) - 1, "no_email": 0, "dup": 0, "broken_phone": 0}

    for row in rows[1:]:
        if len(row) <= max(ei, ni):
            stats["no_email"] += 1
            continue

        email = clean_text(row[ei]).lower()
        if not email or "@" not in email:
            stats["no_email"] += 1
            continue
        if email in seen:
            stats["dup"] += 1
            continue
        seen.add(email)

        raw_phone = row[pi].strip() if 0 <= pi < len(row) else ""
        phone = normalize_phone(raw_phone)
        if raw_phone and not phone:
            stats["broken_phone"] += 1

        records.append([email, clean_text(row[ni]), phone])

    # 같은 날 여러 번 변환해도 앞선 결과를 덮어쓰지 않도록 원본 이름을 물립니다
    stamp = date.today().strftime("%Y%m%d")
    tag = re.sub(r"[^0-9A-Za-z가-힣]+", "", src.stem) or "leads"
    basic = OUT_DIR / f"스티비_업로드_{tag}_{stamp}.csv"
    withphone = OUT_DIR / f"스티비_업로드_{tag}_전화포함_{stamp}.csv"

    with basic.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([EMAIL_COL, NAME_COL])
        w.writerows([r[:2] for r in records])

    with withphone.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([EMAIL_COL, NAME_COL, PHONE_COL])
        w.writerows(records)

    stats["final"] = len(records)
    stats["with_phone"] = sum(1 for r in records if r[2])
    stats["basic"] = basic
    stats["withphone"] = withphone
    return stats


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    src = Path(sys.argv[1])
    if not src.exists():
        raise SystemExit(f"파일을 찾을 수 없습니다: {src}")

    s = convert(src)

    print(f"원본 {s['total']}건")
    print(f"  이메일 없음·무효 제외: {s['no_email']}건")
    print(f"  중복 이메일 제외: {s['dup']}건")
    print(f"  최종: {s['final']}건 (전화번호 있는 건 {s['with_phone']}건)")
    if s["broken_phone"]:
        print(
            f"  ⚠️ 복구 불가한 전화번호 {s['broken_phone']}건 — "
            f"엑셀로 열었다 저장한 파일일 수 있습니다"
        )
    print()
    print(f"1. {s['basic']}")
    print("   → 컬럼 2개. 스티비에 바로 업로드")
    print(f"2. {s['withphone']}")
    print("   → 컬럼 3개. 주소록에 '전화번호' 사용자 정의 필드를 먼저 만들어야 통과")


if __name__ == "__main__":
    main()
