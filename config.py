"""
작가의집 책쓰기 코칭 웹앱 - 설정
"""
import os
import streamlit as st

# ─── Anthropic API ────────────────────────────
# 1순위: .streamlit/secrets.toml, 2순위: 환경변수
try:
    ANTHROPIC_API_KEY = st.secrets["ANTHROPIC_API_KEY"]
except Exception:
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

MODEL_NAME = "claude-sonnet-4-20250514"
MAX_TOKENS = 2048
MAX_TOKENS_LONG = 4096  # 산출물 생성 시

# ─── 앱 기본 설정 ─────────────────────────────
APP_TITLE = "작가의집 AI 책쓰기 코치"
APP_ICON = "📚"
COACH_AVATAR = "📚"
USER_AVATAR = "✍️"

# ─── 코칭 과정 ────────────────────────────────
TOTAL_PHASES = 4
PHASE_NAMES = {1: "발견", 2: "구조화", 3: "집필", 4: "마무리"}
PHASE_ICONS = {1: "🔍", 2: "🏗️", 3: "✍️", 4: "🎯"}
PHASE_DESCRIPTIONS = {
    1: "전문성, 핵심 메시지, 타깃 독자 파악",
    2: "하위 주제, 사례 정리 → 목차 자동 생성",
    3: "챕터별 가이드 질문 → 초안 생성",
    4: "서문, 출판기획서, 투고 전략",
}

# ─── 원클릭 액션 버튼 ─────────────────────────
ACTION_BUTTONS = {
    "summarize": {"label": "📝 요약", "prompt": "지금까지 대화 내용을 핵심만 간결하게 요약해주세요."},
    "expand": {"label": "📖 확장", "prompt": "마지막 응답 내용을 더 구체적이고 상세하게 확장해주세요."},
    "tone_formal": {"label": "🎩 격식체", "prompt": "마지막 응답을 격식체(존댓말, 문어체)로 다시 작성해주세요."},
    "tone_casual": {"label": "💬 대화체", "prompt": "마지막 응답을 친근한 대화체로 다시 작성해주세요."},
    "regenerate": {"label": "🔄 재생성", "prompt": "마지막 질문에 대해 다른 관점에서 새롭게 답변해주세요."},
}

# ─── 마일스톤 ──────────────────────────────────
MILESTONES = {
    "first_message": {"label": "첫 대화 시작!", "icon": "🎉"},
    "phase1_done": {"label": "1단계 완료 - 책 컨셉 확정!", "icon": "🔍"},
    "phase2_done": {"label": "2단계 완료 - 목차 완성!", "icon": "🏗️"},
    "phase3_done": {"label": "3단계 완료 - 초고 작성!", "icon": "✍️"},
    "phase4_done": {"label": "4단계 완료 - 출판 준비 끝!", "icon": "🎯"},
    "messages_10": {"label": "대화 10회 돌파!", "icon": "💬"},
    "messages_30": {"label": "대화 30회 돌파!", "icon": "🔥"},
    "messages_50": {"label": "대화 50회 - 열정 작가!", "icon": "⭐"},
}

# ─── 데이터 저장 ──────────────────────────────
DATA_DIR = "data"
SAVE_FILENAME = "session_data.json"
