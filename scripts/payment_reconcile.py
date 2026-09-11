#!/usr/bin/env python3
"""결제자 명단 대조 — 결제선생 결제내역과 이미 안내한 명단을 맞춰봅니다.

결제선생·카톡방·지메일 세 군데를 눈으로 대조하시던 일을 대신합니다.
기준은 언제나 **결제선생 결제내역**입니다. 돈이 들어온 사실이 진실이고,
안내를 보냈는지는 그 뒤의 일이기 때문입니다.

입력
    결제내역 CSV : 결제선생에서 내려받은 파일 (필수)
    발송이력      : 이미 안내한 사람 명단 (선택)
                    - CSV 파일이거나
                    - 이름을 줄바꿈으로 나열한 .txt 이거나
                    - --sent "홍길동,김철수" 처럼 직접 적어도 됩니다

출력 (Downloads)
    결제대조_미발송_YYYYMMDD.csv   ← 아직 안내를 못 받은 분들
    결제대조_리포트_YYYYMMDD.md    ← 눈으로 보시는 요약

사용법
    python payment_reconcile.py "C:/Users/JUN/Downloads/결제내역.csv"
    python payment_reconcile.py "결제내역.csv" --sent-file "발송이력.csv"
    python payment_reconcile.py "결제내역.csv" --sent "홍길동,김철수"
    python payment_reconcile.py "결제내역.csv" --days 30
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path

OUT_DIR = Path(r"C:\Users\JUN\Downloads")

# 결제선생 CSV의 컬럼명은 내보내기 설정에 따라 달라집니다.
# 그래서 후보를 여러 개 두고 있는 것을 찾아 씁니다.
NAME_CANDIDATES = ["이름", "고객명", "결제자", "구매자", "성명", "주문자", "입금자명", "성함"]
AMOUNT_CANDIDATES = ["금액", "결제금액", "결제 금액", "승인금액", "주문금액", "총액", "합계"]
PHONE_CANDIDATES = ["전화번호", "휴대폰", "연락처", "휴대폰번호", "핸드폰", "전화"]
DATE_CANDIDATES = ["결제일", "결제일시", "승인일시", "주문일시", "등록일", "일시", "날짜", "결제일자"]
EMAIL_CANDIDATES = ["이메일", "메일", "email", "E-mail", "이메일주소"]
STATUS_CANDIDATES = ["상태", "결제상태", "승인상태", "결제 상태"]

# 취소·환불된 건은 안내 대상이 아닙니다.
CANCELLED_WORDS = ["취소", "환불", "실패", "거절", "부분취소", "결제취소"]


def clean_text(s: str) -> str:
    """맥에서 넘어온 이름은 자모가 분리돼 있습니다. 붙여서 비교합니다."""
    if not s:
        return ""
    s = unicodedata.normalize("NFC", str(s))
    s = "".join(c for c in s if unicodedata.category(c)[0] != "C")
    return s.strip()


def name_key(s: str) -> str:
    """비교용 열쇠 — 공백·호칭을 떼고 봅니다.

    '홍길동 님', '홍 길동', '홍길동님'을 모두 같은 사람으로 봅니다.
    """
    s = clean_text(s)
    s = re.sub(r"\s+", "", s)
    s = re.sub(r"(님|씨|대표|작가|선생님|사장님|목사님|원장님)$", "", s)
    return s


def phone_key(s: str) -> str:
    """번호는 숫자만 남겨 뒷 8자리로 봅니다. 표기가 제각각이기 때문입니다."""
    d = re.sub(r"[^0-9]", "", str(s or ""))
    return d[-8:] if len(d) >= 8 else ""


def parse_amount(s: str) -> int:
    """'100,000원' → 100000. 못 읽으면 0."""
    d = re.sub(r"[^0-9]", "", str(s or ""))
    return int(d) if d else 0


def parse_date(s: str) -> datetime | None:
    raw = clean_text(s)
    if not raw:
        return None
    raw = raw.replace("오전", "").replace("오후", "").strip()
    fmts = [
        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d",
        "%Y/%m/%d %H:%M:%S", "%Y/%m/%d %H:%M", "%Y/%m/%d",
        "%Y.%m.%d %H:%M:%S", "%Y.%m.%d %H:%M", "%Y.%m.%d",
        "%y-%m-%d", "%y/%m/%d",
    ]
    for f in fmts:
        try:
            return datetime.strptime(raw, f)
        except ValueError:
            continue
    m = re.search(r"(20\d{2})[-./](\d{1,2})[-./](\d{1,2})", raw)
    if m:
        try:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    return None


def find_col(header: list[str], candidates: list[str]) -> int:
    """헤더에서 후보 이름을 찾습니다. 정확히 같은 것 먼저, 그다음 포함."""
    norm = [re.sub(r"\s+", "", h or "").lower() for h in header]
    for c in candidates:
        c2 = re.sub(r"\s+", "", c).lower()
        if c2 in norm:
            return norm.index(c2)
    for i, h in enumerate(norm):
        for c in candidates:
            c2 = re.sub(r"\s+", "", c).lower()
            if c2 and c2 in h:
                return i
    return -1


def read_csv_rows(path: Path) -> list[list[str]]:
    """인코딩이 뭐든 일단 읽습니다. 한국 시스템은 cp949가 많습니다."""
    for enc in ("utf-8-sig", "cp949", "euc-kr", "utf-8"):
        try:
            with path.open(encoding=enc, newline="") as f:
                sample = f.read(4096)
                f.seek(0)
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=",\t;")
                    rows = list(csv.reader(f, dialect))
                except csv.Error:
                    rows = list(csv.reader(f))
            if rows:
                return rows
        except (UnicodeDecodeError, LookupError):
            continue
    raise SystemExit(f"파일을 읽지 못했습니다: {path}")


def load_sent_names(sent_file: str | None, sent_inline: str | None) -> set[str]:
    """이미 안내한 사람 명단을 모읍니다. 이름과 번호 둘 다 열쇠로 씁니다."""
    keys: set[str] = set()

    if sent_inline:
        for part in re.split(r"[,\n;]", sent_inline):
            k = name_key(part)
            if k:
                keys.add(k)

    if sent_file:
        p = Path(sent_file)
        if not p.exists():
            print(f"[주의] 발송이력 파일이 없습니다: {p}", file=sys.stderr)
            return keys

        if p.suffix.lower() in (".txt", ".md"):
            for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
                k = name_key(line)
                if k:
                    keys.add(k)
            return keys

        rows = read_csv_rows(p)
        if not rows:
            return keys
        header = rows[0]
        ni = find_col(header, NAME_CANDIDATES)
        pi = find_col(header, PHONE_CANDIDATES)
        # 헤더가 없이 이름만 있는 파일일 수도 있습니다.
        if ni < 0 and pi < 0:
            for row in rows:
                for cell in row:
                    k = name_key(cell)
                    if k:
                        keys.add(k)
            return keys
        for row in rows[1:]:
            if ni >= 0 and ni < len(row):
                k = name_key(row[ni])
                if k:
                    keys.add(k)
            if pi >= 0 and pi < len(row):
                k = phone_key(row[pi])
                if k:
                    keys.add("P:" + k)
    return keys


def main() -> None:
    ap = argparse.ArgumentParser(add_help=True, description="결제자 명단 대조")
    ap.add_argument("payments", help="결제선생 결제내역 CSV 경로")
    ap.add_argument("--sent-file", default=None, help="이미 안내한 명단 파일(csv/txt)")
    ap.add_argument("--sent", default=None, help='직접 입력: "홍길동,김철수"')
    ap.add_argument("--days", type=int, default=0, help="최근 N일만 대상 (0=전체)")
    ap.add_argument("--min-amount", type=int, default=0, help="이 금액 이상만 (예: 100000)")
    args = ap.parse_args()

    src = Path(args.payments)
    if not src.exists():
        raise SystemExit(f"결제내역 파일을 찾을 수 없습니다: {src}")

    rows = read_csv_rows(src)
    if len(rows) < 2:
        raise SystemExit("결제내역이 비어 있습니다.")

    header = rows[0]
    ni = find_col(header, NAME_CANDIDATES)
    ai = find_col(header, AMOUNT_CANDIDATES)
    pi = find_col(header, PHONE_CANDIDATES)
    di = find_col(header, DATE_CANDIDATES)
    ei = find_col(header, EMAIL_CANDIDATES)
    si = find_col(header, STATUS_CANDIDATES)

    if ni < 0:
        raise SystemExit(
            "이름 컬럼을 찾지 못했습니다.\n"
            f"실제 헤더: {' | '.join(header)}\n"
            "→ 헤더 행이 첫 줄이 맞는지 확인해 주세요."
        )

    sent_keys = load_sent_names(args.sent_file, args.sent)

    cutoff = None
    if args.days > 0:
        cutoff = datetime.now() - timedelta(days=args.days)

    pending: list[dict] = []
    already: list[dict] = []
    skipped_cancel = 0
    skipped_old = 0
    skipped_small = 0
    seen_rows: set[tuple] = set()
    dup = 0

    for row in rows[1:]:
        if ni >= len(row):
            continue
        name = clean_text(row[ni])
        if not name:
            continue

        status = clean_text(row[si]) if 0 <= si < len(row) else ""
        if any(w in status for w in CANCELLED_WORDS):
            skipped_cancel += 1
            continue

        amount = parse_amount(row[ai]) if 0 <= ai < len(row) else 0
        if args.min_amount and amount < args.min_amount:
            skipped_small += 1
            continue

        paid_at = parse_date(row[di]) if 0 <= di < len(row) else None
        if cutoff and paid_at and paid_at < cutoff:
            skipped_old += 1
            continue

        phone = clean_text(row[pi]) if 0 <= pi < len(row) else ""
        email = clean_text(row[ei]) if 0 <= ei < len(row) else ""

        nk = name_key(name)
        pk = phone_key(phone)

        # 같은 사람이 같은 금액으로 두 줄 잡힌 경우 한 번만 봅니다.
        sig = (nk, pk, amount)
        if sig in seen_rows:
            dup += 1
            continue
        seen_rows.add(sig)

        rec = {
            "이름": name,
            "금액": amount,
            "전화번호": phone,
            "이메일": email,
            "결제일": paid_at.strftime("%Y-%m-%d") if paid_at else "",
        }

        is_sent = nk in sent_keys or (pk and ("P:" + pk) in sent_keys)
        (already if is_sent else pending).append(rec)

    stamp = date.today().strftime("%Y%m%d")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    out_csv = OUT_DIR / f"결제대조_미발송_{stamp}.csv"
    with out_csv.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["이름", "금액", "전화번호", "이메일", "결제일"])
        for r in pending:
            w.writerow([r["이름"], r["금액"], r["전화번호"], r["이메일"], r["결제일"]])

    total_amount = sum(r["금액"] for r in pending)
    lines = [
        f"# 결제 대조 리포트 — {date.today().strftime('%Y-%m-%d')}",
        "",
        f"- 결제내역 원본: `{src.name}`",
        f"- 전체 결제 건수: {len(rows) - 1}건",
        f"- 대조 대상: {len(pending) + len(already)}건",
        f"- **안내 필요: {len(pending)}건 (합계 {total_amount:,}원)**",
        f"- 안내 완료: {len(already)}건",
        "",
    ]
    filt = []
    if skipped_cancel:
        filt.append(f"취소·환불 제외 {skipped_cancel}건")
    if skipped_old:
        filt.append(f"기간 밖 제외 {skipped_old}건")
    if skipped_small:
        filt.append(f"최소금액 미만 제외 {skipped_small}건")
    if dup:
        filt.append(f"중복 제외 {dup}건")
    if filt:
        lines += ["## 제외 내역", "", "- " + "\n- ".join(filt), ""]

    if pending:
        lines += [
            "## 안내를 보내야 하는 분",
            "",
            "| 이름 | 금액 | 연락처 | 이메일 | 결제일 |",
            "|---|---:|---|---|---|",
        ]
        for r in sorted(pending, key=lambda x: x["결제일"]):
            lines.append(
                f"| {r['이름']} | {r['금액']:,}원 | {r['전화번호'] or '-'} "
                f"| {r['이메일'] or '-'} | {r['결제일'] or '-'} |"
            )
        lines += [
            "",
            "### 다음 할 일",
            "",
            "위 명단을 그대로 `/결제확인`에 넘기시면 문자·이메일 문안이 만들어집니다.",
            "",
        ]
    else:
        lines += ["## 안내를 보내야 하는 분", "", "없습니다. 전원 안내가 끝났습니다.", ""]

    if already:
        lines += [f"## 안내 완료 ({len(already)}명)", ""]
        lines.append(", ".join(r["이름"] for r in already))
        lines.append("")

    if not sent_keys:
        lines += [
            "## 주의",
            "",
            "발송이력을 넘기지 않으셔서 **전원을 미발송으로 처리**했습니다.",
            "이미 보내신 분이 있다면 `--sent-file` 또는 `--sent`로 알려 주세요.",
            "",
        ]

    out_md = OUT_DIR / f"결제대조_리포트_{stamp}.md"
    out_md.write_text("\n".join(lines), encoding="utf-8")

    print(f"전체 결제 {len(rows) - 1}건")
    print(f"  안내 완료: {len(already)}건")
    print(f"  안내 필요: {len(pending)}건 (합계 {total_amount:,}원)")
    print()
    print(f"미발송 명단: {out_csv}")
    print(f"리포트    : {out_md}")


if __name__ == "__main__":
    main()
