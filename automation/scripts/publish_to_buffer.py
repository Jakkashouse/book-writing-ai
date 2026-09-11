"""
publish_to_buffer.py — 클로드 sns-publisher가 호출하는 발행 스크립트

용도: content-creator가 생성한 콘텐츠를 Make Webhook에 POST하면
      Make가 Buffer 큐에 자동 업로드 + Notion 백업까지 처리

사용:
    python automation/scripts/publish_to_buffer.py \
        --topic "독서모임 리더 가이드 출간" \
        --channel instagram \
        --caption-file outputs/2026-05-18-독서모임/instagram.txt \
        --hashtags-file outputs/2026-05-18-독서모임/hashtags.txt \
        --scheduled-at "2026-05-19T09:00:00+09:00" \
        --source-book "독서모임 리더 완전가이드"

환경변수 (.env 또는 OS env):
    MAKE_WEBHOOK_URL   필수
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


def load_text(path: str | None) -> str:
    if not path:
        return ""
    return Path(path).read_text(encoding="utf-8").strip()


def parse_hashtags(path: str | None) -> list[str]:
    raw = load_text(path)
    if not raw:
        return []
    tokens = raw.replace(",", " ").split()
    return [t if t.startswith("#") else f"#{t}" for t in tokens if t]


def main() -> int:
    load_dotenv()
    webhook_url = os.getenv("MAKE_WEBHOOK_URL")
    if not webhook_url or "xxxxxxxx" in webhook_url:
        print("ERROR: MAKE_WEBHOOK_URL 미설정 — .env 확인", file=sys.stderr)
        return 1

    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", required=True)
    parser.add_argument("--channel", required=True,
                        choices=["instagram", "twitter", "linkedin", "facebook"])
    parser.add_argument("--caption-file", required=True)
    parser.add_argument("--hashtags-file")
    parser.add_argument("--scheduled-at", help="ISO8601, 생략시 Buffer 기본 큐")
    parser.add_argument("--image-url")
    parser.add_argument("--source-book", default="")
    args = parser.parse_args()

    payload = {
        "topic": args.topic,
        "channel": args.channel,
        "caption": load_text(args.caption_file),
        "hashtags": parse_hashtags(args.hashtags_file),
        "scheduled_at": args.scheduled_at,
        "image_url": args.image_url,
        "source_book": args.source_book,
    }

    resp = requests.post(webhook_url, json=payload, timeout=15)
    if not resp.ok:
        print(f"FAIL: {resp.status_code} {resp.text}", file=sys.stderr)
        return 2

    print(f"OK: {resp.text}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
