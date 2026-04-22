"""
cron 자동화 공용 헬퍼 — GitHub Actions와 로컬 모두에서 동작.

Streamlit Secrets를 쓰지 않고 **환경변수**에서 자격증명을 읽는다:
  - RESEND_API_KEY          : Resend API 키
  - ADMIN_EMAIL             : 관리자 수신 이메일 (기본 joyfuljun4@gmail.com)
  - RESEND_FROM             : 발신 주소 (기본 onboarding@resend.dev)
  - RESEND_FROM_AUTHOR      : 작가 회신 발신 주소 (없으면 RESEND_FROM 재사용)
  - GCP_SERVICE_ACCOUNT     : 구글 서비스 계정 JSON 전체 (문자열)
  - GSHEET_URL              : 구글시트 URL

시트 탭: '투고_원고접수'
"""
from __future__ import annotations

import base64
import json
import os
import re
import sys
from datetime import datetime
from typing import Any

SHEET_TAB = "투고_원고접수"
DEFAULT_ADMIN = "joyfuljun4@gmail.com"
DEFAULT_FROM = "onboarding@resend.dev"

CAL_URL = "https://calendly.com/joyful4/goodbook"
STIBEE_URL = "https://stib.ee/cD9N"


def get_env(name: str, default: str = "") -> str:
    val = os.environ.get(name, default)
    return val if val is not None else default


def require_env(name: str) -> str:
    val = os.environ.get(name, "")
    if not val:
        print(f"[FATAL] 환경변수 {name} 누락 — 중단합니다.", file=sys.stderr)
        sys.exit(2)
    return val


def parse_copies(label: str) -> int:
    """'200부' → 200, '300부 이상' → 300, '없음' → 0."""
    if not label:
        return 0
    m = re.search(r"(\d+)", str(label))
    return int(m.group(1)) if m else 0


def parse_dt(s: str) -> datetime | None:
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(str(s).strip(), fmt)
        except (ValueError, AttributeError):
            continue
    return None


# ─── 구글시트 ─────────────────────────────────

def open_worksheet():
    """환경변수에서 서비스 계정 JSON을 읽어 '투고_원고접수' 탭 반환."""
    import gspread
    from google.oauth2.service_account import Credentials

    raw = require_env("GCP_SERVICE_ACCOUNT")
    gsheet_url = require_env("GSHEET_URL")
    info = json.loads(raw)

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_info(info, scopes=scopes)
    gc = gspread.authorize(creds)
    sp = gc.open_by_url(gsheet_url)
    return sp.worksheet(SHEET_TAB)


def load_records() -> tuple[list[dict], Any, dict]:
    """(records, worksheet, header_to_col) — col은 1-based gspread 인덱스."""
    ws = open_worksheet()
    headers = ws.row_values(1)
    header_to_col = {h: i + 1 for i, h in enumerate(headers)}
    records = ws.get_all_records()
    return records, ws, header_to_col


def mark_sent(ws, row_num: int, col_num: int, value: str = "") -> None:
    """gspread cell을 업데이트. row_num/col_num은 1-based (header가 row=1).
    records의 idx=0이면 실제 sheet row=2.
    """
    stamp = value or datetime.now().strftime("%Y-%m-%d %H:%M")
    try:
        ws.update_cell(row_num, col_num, stamp)
    except Exception as e:
        print(f"[WARN] 시트 마킹 실패 row={row_num} col={col_num}: {e}")


# ─── Resend 이메일 ─────────────────────────────

def send_email(
    to: str | list[str],
    subject: str,
    text: str,
    from_email: str | None = None,
    reply_to: str | None = None,
    attachments: list[dict] | None = None,
) -> bool:
    """Resend API로 발송. 실패시 False."""
    try:
        import resend
    except ImportError:
        print("[FATAL] resend 패키지 없음 — pip install resend")
        return False

    try:
        api_key = require_env("RESEND_API_KEY")
        resend.api_key = api_key
        sender = from_email or get_env("RESEND_FROM", DEFAULT_FROM)

        to_list = [to] if isinstance(to, str) else list(to)
        params = {
            "from": sender,
            "to": to_list,
            "subject": subject,
            "text": text,
        }
        if reply_to:
            params["reply_to"] = reply_to
        if attachments:
            params["attachments"] = attachments

        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[ERROR] 메일 발송 실패: {e}")
        return False


def attach_csv(filename: str, content: str) -> dict:
    return {
        "filename": filename,
        "content": base64.b64encode(content.encode("utf-8-sig")).decode("ascii"),
    }
