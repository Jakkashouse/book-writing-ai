#!/usr/bin/env python3
"""메시지 1개 → 채널별 3버전 (단톡방·문자·이메일).

같은 공지를 세 군데에 올릴 때마다 손으로 고쳐 쓰던 일을 대신합니다.
문자만 특수기호를 지우고, 단톡방과 이메일은 원문을 살립니다.
룰10은 문자에만 해당하기 때문입니다.

사용법
    python channel_split.py --file "C:/Users/JUN/Downloads/공지.md"
    python channel_split.py --text "오늘 저녁 9시 라이브 합니다"
    python channel_split.py --file "공지.md" --title "8월 라이브"
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path

# 문자 정제는 payment_notice의 것을 그대로 씁니다. 규칙이 두 벌이면 어긋납니다.
sys.path.insert(0, str(Path(__file__).parent))
from payment_notice import sanitize_sms, check_sms, sms_bytes  # noqa: E402

OUT_DIR = Path(r"C:\Users\JUN\Downloads")


def strip_md(s: str) -> str:
    """마크다운 표식을 걷어냅니다. 카톡·문자에는 별표가 그대로 보입니다."""
    s = re.sub(r"^#{1,6}\s*", "", s, flags=re.M)      # 제목
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)             # 굵게
    s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"\1", s)  # 기울임
    s = re.sub(r"`(.+?)`", r"\1", s)                   # 코드
    s = re.sub(r"^\s*[-*+]\s+", "", s, flags=re.M)     # 불릿
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)         # 인용
    s = re.sub(r"^\s*-{3,}\s*$", "", s, flags=re.M)    # 구분선
    s = re.sub(r"\[(.+?)\]\((.+?)\)", r"\1 \2", s)     # 링크
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def build_kakao(text: str) -> str:
    """단톡방용 — 기호는 살리되 마크다운만 걷어냅니다."""
    return strip_md(text)


def build_sms(text: str) -> str:
    """문자용 — 룰10 강제. URL은 살아남습니다."""
    return sanitize_sms(strip_md(text))


def build_email(text: str) -> str:
    """이메일용 — 원문 그대로. 기호 제한 없습니다."""
    return text.strip()


def main() -> None:
    ap = argparse.ArgumentParser(description="메시지를 채널별 3버전으로 변환")
    ap.add_argument("--file", help="원문 파일 (.md/.txt)")
    ap.add_argument("--text", help="원문을 직접 입력")
    ap.add_argument("--title", default="", help="파일명에 쓸 제목")
    args = ap.parse_args()

    if args.file:
        p = Path(args.file)
        if not p.exists():
            raise SystemExit(f"파일을 찾을 수 없습니다: {p}")
        raw = p.read_text(encoding="utf-8", errors="ignore")
        default_title = p.stem
    elif args.text:
        raw = args.text
        default_title = "메시지"
    else:
        raise SystemExit("--file 또는 --text 중 하나가 필요합니다.")

    if not raw.strip():
        raise SystemExit("원문이 비어 있습니다.")

    kakao = build_kakao(raw)
    sms = build_sms(raw)
    email = build_email(raw)

    bad = check_sms(sms)
    nbytes = sms_bytes(sms)
    kind = "SMS" if nbytes <= 90 else "LMS"

    if bad:
        print("[위험] 문자 본문에 금지 문자가 남았습니다. 발송하지 마세요.", file=sys.stderr)
        print("  " + " ".join(bad), file=sys.stderr)
    else:
        print("[안전] 문자 본문에 금지 문자가 없습니다.")

    if nbytes > 2000:
        print(f"[주의] {nbytes}바이트입니다. LMS 한도(약 2,000바이트)를 넘습니다. 줄이셔야 합니다.")

    title = re.sub(r"[^0-9A-Za-z가-힣_]+", "_", args.title or default_title).strip("_")
    stamp = date.today().strftime("%Y%m%d")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    lines = [
        f"# 채널별 발송 메시지 — {title}",
        "",
        f"작성일 {date.today().strftime('%Y-%m-%d')}",
        "",
        "---",
        "",
        "## 1. 단톡방 (카카오톡)",
        "",
        "기호를 그대로 쓰셔도 됩니다. 마크다운 표식만 제거했습니다.",
        "",
        "```",
        kakao,
        "```",
        "",
        "---",
        "",
        f"## 2. 문자 ({kind}, {nbytes}바이트)",
        "",
        "특수기호가 제거된 상태입니다. 이대로 발송하십시오.",
        "" if not bad else f"**[위험] 금지문자 남음: {' '.join(bad)} — 발송 금지**",
        "",
        "```",
        sms,
        "```",
        "",
        "---",
        "",
        "## 3. 이메일 (스티비)",
        "",
        "기호 제한이 없습니다. 원문 그대로입니다.",
        "",
        "```",
        email,
        "```",
        "",
        "---",
        "",
        "## 발송 전 체크",
        "",
        "- [ ] 문자에 `[안전]`이 떴는가",
        "- [ ] 링크가 살아 있는가 (문자에서 특히)",
        "- [ ] 날짜·시간이 세 버전 모두 같은가",
        "- [ ] 수료증 관련 내용이 없는가",
        "- [ ] 단톡방은 공지 등록까지 했는가",
        "",
    ]

    out = OUT_DIR / f"채널메시지_{title}_{stamp}.md"
    out.write_text("\n".join(lines), encoding="utf-8")

    print(f"문자: {kind} {nbytes}바이트")
    print(f"파일: {out}")


if __name__ == "__main__":
    main()
