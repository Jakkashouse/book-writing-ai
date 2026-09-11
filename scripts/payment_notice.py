#!/usr/bin/env python3
"""결제 확인 문자·이메일 문안 생성 — 이름과 금액만 넣으면 됩니다.

문자는 특수기호 하나 때문에 발송 전체가 실패합니다(2026-08-11 사고).
그래서 이 스크립트는 사람이 조심하는 대신 **코드가 기호를 지웁니다**.
한글·숫자·영문·쉼표·마침표·괄호·하이픈만 남기고 전부 바꿔치웁니다.

이메일은 기호를 써도 되므로 문안이 따로 있습니다.

사용법
    python payment_notice.py --name 홍길동 --amount 100000
    python payment_notice.py --csv "C:/Users/JUN/Downloads/결제대조_미발송_20260814.csv"
    python payment_notice.py --csv "미발송.csv" --check-only
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

OUT_DIR = Path(r"C:\Users\JUN\Downloads")

CALENDLY = "https://calendly.com/joyful4/goodbook"

# ─── 룰10: 문자 본문 허용 문자 ─────────────────────
# 한글·숫자·영문·쉼표·마침표·괄호·하이픈·공백·줄바꿈만 허용합니다.
SMS_ALLOWED = re.compile(r"[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9,.()\-\s]")

# 지우기 전에 뜻을 살려 바꿔주는 것들
SMS_REPLACEMENTS = [
    # 문자 이모티콘은 통째로 지웁니다. 괄호만 남으면 더 어색합니다.
    (":)", ""),
    (":-)", ""),
    (":(", ""),
    (":-(", ""),
    ("^^", ""),
    ("^_^", ""),
    ("ㅠㅠ", ""),
    ("ㅜㅜ", ""),
    ("1:1", "1대1"),
    ("1：1", "1대1"),
    ("···", ","),
    ("…", "."),
    ("·", ","),
    ("•", ","),
    ("‧", ","),
    ("・", ","),
    ("—", " "),
    ("–", " "),
    ("―", " "),
    ("~", " 부터 "),
    ("∼", " 부터 "),
    ("→", " "),
    ("⇒", " "),
    ("←", " "),
    ("※", ""),
    ("★", ""),
    ("☆", ""),
    ("■", ""),
    ("□", ""),
    ("▶", ""),
    ("◆", ""),
    ("“", ""),
    ("”", ""),
    ("‘", ""),
    ("’", ""),
    ("\"", ""),
    ("'", ""),
    ("《", "("),
    ("》", ")"),
    ("「", "("),
    ("」", ")"),
    ("『", "("),
    ("』", ")"),
    ("〈", "("),
    ("〉", ")"),
    ("【", "("),
    ("】", ")"),
    ("[", "("),
    ("]", ")"),
    ("｜", " "),
    ("|", " "),
    ("/", " "),
    ("+", " 플러스 "),
    ("&", " 그리고 "),
    ("%", "퍼센트"),
    ("₩", "원"),
    ("￦", "원"),
    ("!", "."),
    ("?", "."),
    ("！", "."),
    ("？", "."),
    ("：", " "),
    (":", " "),
    ("；", " "),
    (";", " "),
    ("_", " "),
    ("*", ""),
    ("#", ""),
    ("@", " "),
    ("=", " "),
    ("<", "("),
    (">", ")"),
]


def strip_emoji(s: str) -> str:
    """이모지·기호 그림문자를 통째로 걷어냅니다."""
    out = []
    for ch in s:
        cat = unicodedata.category(ch)
        # So=기타 기호, Sk=수식 기호, Cf=서식 제어(변이 선택자 포함)
        if cat in ("So", "Sk", "Cf", "Cs"):
            continue
        cp = ord(ch)
        if 0x1F000 <= cp <= 0x1FAFF or 0x2600 <= cp <= 0x27BF or 0xFE00 <= cp <= 0xFE0F:
            continue
        out.append(ch)
    return "".join(out)


# URL은 손대면 안 됩니다. 링크가 깨지면 상담 예약 자체가 막힙니다.
# 그래서 필터를 돌리기 전에 잠시 빼두었다가, 끝나고 제자리에 돌려놓습니다.
URL_RE = re.compile(r"https?://[^\s]+")


def sanitize_sms(text: str) -> str:
    """문자 본문을 발송 가능한 형태로 만듭니다. 룰10 강제 적용.

    URL만은 예외입니다. 통신사 문자에서 링크는 정상 발송되며,
    콜론과 슬래시를 지우면 링크가 죽어 안내 자체가 무의미해집니다.
    """
    s = unicodedata.normalize("NFC", text or "")

    urls: list[str] = []

    def _stash(m: re.Match) -> str:
        urls.append(m.group(0))
        # 필터가 건드리지 않는 순수 영문·숫자 자리표
        return f"URLSLOT{len(urls) - 1}XX"

    s = URL_RE.sub(_stash, s)

    for a, b in SMS_REPLACEMENTS:
        s = s.replace(a, b)
    s = strip_emoji(s)
    s = SMS_ALLOWED.sub(" ", s)
    # 공백 정리 — 줄바꿈은 살리고 가로 공백만 줄입니다.
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r" *\n *", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = s.strip()

    for i, u in enumerate(urls):
        s = s.replace(f"URLSLOT{i}XX", u)
    return s


def check_sms(text: str) -> list[str]:
    """남아 있는 금지 문자를 찾아 돌려줍니다. 비어 있으면 안전합니다.

    URL 안의 콜론·슬래시는 정상이므로 검사에서 뺍니다.
    """
    stripped = URL_RE.sub(" ", text or "")
    return sorted(set(SMS_ALLOWED.findall(stripped)))


def sms_bytes(text: str) -> int:
    """EUC-KR 기준 바이트. 90바이트를 넘으면 LMS로 나갑니다."""
    try:
        return len(text.encode("euc-kr", errors="replace"))
    except Exception:
        return len(text.encode("utf-8"))


def clean_name(s: str) -> str:
    s = unicodedata.normalize("NFC", str(s or "")).strip()
    s = re.sub(r"\s+", " ", s)
    return re.sub(r"(님|씨)$", "", s).strip()


def parse_amount(s) -> int:
    d = re.sub(r"[^0-9]", "", str(s or ""))
    return int(d) if d else 0


# ─── 문안 ─────────────────────────────────────────

def build_sms(name: str, amount: int) -> str:
    won = f"{amount:,}원"
    raw = f"""{name}님, 작가의집입니다.

{won} 결제가 정상 확인되었습니다.
감사합니다.

상담 일정은 아래 링크에서 편하신 시간으로 직접 잡아 주시면 됩니다.
{CALENDLY}

원고나 목차가 있으시면 미리 보내 주세요.
읽고 준비해서 들어가겠습니다.

작가의집"""
    return sanitize_sms(raw)


def build_email(name: str, amount: int) -> tuple[str, str]:
    won = f"{amount:,}원"
    subject = f"[작가의집] {name}님, 결제가 확인되었습니다"
    body = f"""{name}님, 안녕하세요.
작가의집입니다.

{won} 결제가 정상적으로 확인되었습니다. 감사합니다.

■ 다음 단계

1) 상담 일정 잡기
   아래 링크에서 편하신 시간을 직접 선택해 주세요.
   {CALENDLY}

2) 미리 보내주시면 좋은 것 (선택)
   - 지금까지 쓰신 원고 (분량 상관없습니다)
   - 생각하고 계신 목차나 주제 메모
   - "이런 사람이 읽었으면 좋겠다" 싶은 독자상

   미리 주시면 읽고 준비해서 상담에 들어가겠습니다.
   아무것도 없으셔도 괜찮습니다. 그 상태에서 같이 시작하면 됩니다.

■ 상담에서 다루는 것

   - 지금 원고·주제가 시장에서 어디쯤 있는지
   - 어떤 독자에게 어떻게 팔릴 책인지
   - 출간까지 실제로 무엇을 언제 해야 하는지

궁금하신 점은 이 메일에 그대로 답장 주셔도 됩니다.

감사합니다.

작가의집
{CALENDLY}
"""
    return subject, body


def emit(name: str, amount: int) -> dict:
    sms = build_sms(name, amount)
    subject, body = build_email(name, amount)
    return {
        "name": name,
        "amount": amount,
        "sms": sms,
        "sms_bytes": sms_bytes(sms),
        "sms_bad": check_sms(sms),
        "email_subject": subject,
        "email_body": body,
    }


def read_csv_rows(path: Path) -> list[list[str]]:
    for enc in ("utf-8-sig", "cp949", "euc-kr", "utf-8"):
        try:
            with path.open(encoding=enc, newline="") as f:
                rows = list(csv.reader(f))
            if rows:
                return rows
        except (UnicodeDecodeError, LookupError):
            continue
    raise SystemExit(f"파일을 읽지 못했습니다: {path}")


def main() -> None:
    ap = argparse.ArgumentParser(description="결제 확인 문자·이메일 문안 생성")
    ap.add_argument("--name", help="받는 분 이름")
    ap.add_argument("--amount", type=int, default=100000, help="결제 금액 (기본 100000)")
    ap.add_argument("--csv", help="여러 명 한 번에 — 이름/금액 컬럼이 있는 CSV")
    ap.add_argument("--check-only", action="store_true", help="금지 기호 검사만")
    ap.add_argument("--text", help="임의 문장의 기호만 정리해서 출력")
    args = ap.parse_args()

    # 임의 문장 정리 모드 — 다른 문자 발송에도 쓸 수 있게 열어둡니다.
    if args.text:
        cleaned = sanitize_sms(args.text)
        bad = check_sms(cleaned)
        print("[정리 후]")
        print(cleaned)
        print()
        print(f"바이트: {sms_bytes(cleaned)} ({'SMS' if sms_bytes(cleaned) <= 90 else 'LMS'})")
        print(f"금지문자: {'없음' if not bad else ' '.join(bad)}")
        return

    people: list[tuple[str, int]] = []

    if args.csv:
        p = Path(args.csv)
        if not p.exists():
            raise SystemExit(f"파일을 찾을 수 없습니다: {p}")
        rows = read_csv_rows(p)
        header = [re.sub(r"\s+", "", h or "") for h in rows[0]]

        def col(cands: list[str]) -> int:
            for c in cands:
                if c in header:
                    return header.index(c)
            for i, h in enumerate(header):
                for c in cands:
                    if c in h:
                        return i
            return -1

        ni = col(["이름", "고객명", "결제자", "성명"])
        ai = col(["금액", "결제금액", "승인금액"])
        if ni < 0:
            raise SystemExit(f"이름 컬럼이 없습니다. 헤더: {' | '.join(rows[0])}")
        for row in rows[1:]:
            if ni >= len(row):
                continue
            nm = clean_name(row[ni])
            if not nm:
                continue
            amt = parse_amount(row[ai]) if 0 <= ai < len(row) else args.amount
            people.append((nm, amt or args.amount))
    elif args.name:
        people.append((clean_name(args.name), args.amount))
    else:
        raise SystemExit("--name 또는 --csv 중 하나가 필요합니다.")

    if not people:
        raise SystemExit("대상자가 없습니다.")

    results = [emit(n, a) for n, a in people]

    # 안전 검사 — 하나라도 금지 문자가 남으면 크게 알립니다.
    unsafe = [r for r in results if r["sms_bad"]]
    if unsafe:
        print("[위험] 문자 본문에 금지 문자가 남았습니다. 발송하지 마세요.", file=sys.stderr)
        for r in unsafe:
            print(f"  {r['name']}: {' '.join(r['sms_bad'])}", file=sys.stderr)
    else:
        print(f"[안전] {len(results)}건 모두 문자 발송 가능한 문자만 남았습니다.")

    if args.check_only:
        return

    stamp = date.today().strftime("%Y%m%d")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1) 문자 발송용 CSV — 발송 시스템에 그대로 올리는 파일
    sms_csv = OUT_DIR / f"결제확인_문자_{stamp}.csv"
    with sms_csv.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["이름", "메시지"])
        for r in results:
            w.writerow([r["name"], r["sms"]])

    # 2) 눈으로 보고 복사하시는 문서
    lines = [
        f"# 결제 확인 안내 문안 — {date.today().strftime('%Y-%m-%d')}",
        "",
        f"대상 {len(results)}명. 문자는 특수기호가 모두 제거된 상태입니다.",
        "",
        "---",
        "",
    ]
    for r in results:
        kind = "SMS" if r["sms_bytes"] <= 90 else "LMS"
        lines += [
            f"## {r['name']}님 ({r['amount']:,}원)",
            "",
            f"### 문자 ({kind}, {r['sms_bytes']}바이트)",
            "",
            "```",
            r["sms"],
            "```",
            "",
            "### 이메일",
            "",
            f"**제목** {r['email_subject']}",
            "",
            "```",
            r["email_body"].rstrip(),
            "```",
            "",
            "---",
            "",
        ]
    out_md = OUT_DIR / f"결제확인_문안_{stamp}.md"
    out_md.write_text("\n".join(lines), encoding="utf-8")

    print(f"대상 {len(results)}명")
    for r in results:
        kind = "SMS" if r["sms_bytes"] <= 90 else "LMS"
        print(f"  {r['name']} {r['amount']:,}원 — {kind} {r['sms_bytes']}바이트")
    print()
    print(f"문자 발송용: {sms_csv}")
    print(f"문안 전문  : {out_md}")


if __name__ == "__main__":
    main()
