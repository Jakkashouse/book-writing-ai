"""Make Webhook 연결 테스트 — 실제 발행 전 한 번만 실행"""
import os
import sys

import requests
from dotenv import load_dotenv


def main() -> int:
    load_dotenv()
    url = os.getenv("MAKE_WEBHOOK_URL")
    if not url or "xxxxxxxx" in url:
        print("ERROR: MAKE_WEBHOOK_URL 미설정", file=sys.stderr)
        return 1

    payload = {
        "topic": "[테스트] Make 연결 확인",
        "channel": "instagram",
        "caption": "이건 테스트 메시지입니다. Buffer 큐에 들어오면 즉시 삭제하세요.",
        "hashtags": ["#테스트"],
        "scheduled_at": None,
        "source_book": "(테스트)",
    }
    resp = requests.post(url, json=payload, timeout=15)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")
    return 0 if resp.ok else 2


if __name__ == "__main__":
    sys.exit(main())
