"""
작가의집 투고 원고 분석 모듈 (Streamlit 재사용 가능)

원본: /analyze_manuscript_general.py (대화형 스크립트)
여기서는 input() 제거, 순수 함수만 노출.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import TypedDict


# ────────────────────────────────────────────
# 사전 (원본 스크립트에서 그대로 가져옴)
# ────────────────────────────────────────────

MARKET_KEYWORDS: dict[str, list[str]] = {
    "돈/재테크/사업": [
        "돈", "재테크", "투자", "부동산", "주식", "경제", "자산", "수입", "매출", "수익",
        "부자", "월급", "퇴사", "창업", "사업", "프리랜서", "N잡", "부업", "파이프라인",
        "경제적 자유", "파이어", "FIRE", "연봉", "절약", "저축", "펀드", "코인", "비트코인",
        "성공", "성과", "목표", "달성", "전략", "마케팅", "브랜딩", "1인 기업", "스타트업",
        "코칭", "컨설팅", "온라인 수익", "디지털 노마드", "자동화", "패시브 인컴",
    ],
    "건강/웰빙/다이어트": [
        "건강", "다이어트", "운동", "헬스", "요가", "필라테스", "명상", "수면", "잠",
        "식단", "영양", "비타민", "단백질", "체중", "살", "몸", "체력", "에너지",
        "스트레스", "번아웃", "힐링", "치유", "회복", "면역", "장", "피부", "노화",
        "정신건강", "심리", "우울", "불안", "감정", "마음", "멘탈", "자존감",
        "웰빙", "라이프스타일", "루틴", "습관", "미라클 모닝",
    ],
    "인간관계/소통/육아": [
        "관계", "소통", "대화", "커뮤니케이션", "연애", "결혼", "부부", "이혼", "가족",
        "육아", "아이", "자녀", "부모", "엄마", "아빠", "양육", "교육", "훈육",
        "친구", "우정", "직장", "상사", "동료", "갈등", "화해", "용서", "공감",
        "리더십", "팀", "조직", "협업", "설득", "협상", "인맥", "네트워킹",
        "사랑", "이별", "싱글", "비혼", "독립", "경계", "거절", "자기주장",
    ],
}

TRENDING_TOPICS: list[str] = [
    "AI", "인공지능", "챗GPT", "GPT", "클로드", "프롬프트",
    "퇴사", "N잡", "디지털 노마드", "1인 기업",
    "50대", "중년", "인생 2막", "은퇴",
    "MZ", "Z세대", "밀레니얼",
    "제주", "이주", "귀농", "귀촌",
    "미니멀", "미니멀리즘", "정리",
    "에세이", "브런치", "글쓰기",
    "SNS", "인스타", "유튜브", "블로그", "틱톡",
]

SNS_TIERS: dict[str, int] = {
    "S": 100_000,
    "A": 30_000,
    "B": 10_000,
    "C": 3_000,
    "D": 0,
}


# ────────────────────────────────────────────
# 분석 함수
# ────────────────────────────────────────────

def analyze_text(content: str) -> dict:
    total_chars = len(content)
    chars_no_space = len(re.sub(r"\s", "", content))
    total_lines = content.count("\n") + 1
    paragraphs = len(re.findall(r"\n\s*\n", content)) + 1

    chapters_h1 = re.findall(r"^# .+", content, re.MULTILINE)
    chapters_h2 = re.findall(r"^## .+", content, re.MULTILINE)
    chapters_h3 = re.findall(r"^### .+", content, re.MULTILINE)

    placeholders = re.findall(
        r"\[.*?\]|TODO|FIXME|TBD|작성예정|미완성|여기에|추가예정", content
    )

    return {
        "total_chars": total_chars,
        "chars_no_space": chars_no_space,
        "total_lines": total_lines,
        "paragraphs": paragraphs,
        "chapters_h1": chapters_h1,
        "chapters_h2": chapters_h2,
        "chapters_h3": chapters_h3,
        "pages_b6": chars_no_space // 450,
        "pages_a5": chars_no_space // 500,
        "pages_46": chars_no_space // 550,
        "placeholders": placeholders,
    }


def analyze_market_fit(content: str) -> dict:
    results = {}
    for category, keywords in MARKET_KEYWORDS.items():
        matches = {}
        for kw in keywords:
            count = len(re.findall(re.escape(kw), content, re.IGNORECASE))
            if count > 0:
                matches[kw] = count
        total = sum(matches.values())
        results[category] = {
            "total_mentions": total,
            "top_keywords": sorted(matches.items(), key=lambda x: -x[1])[:10],
            "unique_keywords": len(matches),
        }

    trending = {}
    for kw in TRENDING_TOPICS:
        count = len(re.findall(re.escape(kw), content, re.IGNORECASE))
        if count > 0:
            trending[kw] = count

    sorted_cats = sorted(results.items(), key=lambda x: -x[1]["total_mentions"])
    primary_category = (
        sorted_cats[0][0] if sorted_cats[0][1]["total_mentions"] > 0 else "기타"
    )

    return {
        "categories": results,
        "primary_category": primary_category,
        "trending_matches": trending,
        "sorted_categories": sorted_cats,
    }


def get_sns_tier(followers: int) -> str:
    for tier, threshold in sorted(SNS_TIERS.items(), key=lambda x: -x[1]):
        if followers >= threshold:
            return tier
    return "D"


def extract_reader_pains(content: str, top_k: int = 3) -> list[str]:
    """원고에서 '독자 고통' 후보 문장 추출 — 규칙 기반 간이 추출."""
    pain_keywords = [
        "힘들", "어렵", "고민", "문제", "막막", "답답", "불안", "우울",
        "실패", "걱정", "스트레스", "지쳐", "포기", "좌절", "후회",
    ]
    sentences = re.split(r"(?<=[.!?다요])\s+", content)
    hits = []
    for s in sentences:
        s_stripped = s.strip()
        if 15 <= len(s_stripped) <= 120:
            score = sum(1 for kw in pain_keywords if kw in s_stripped)
            if score > 0:
                hits.append((score, s_stripped))
    hits.sort(key=lambda x: -x[0])
    return [s for _, s in hits[:top_k]]


def infer_target_reader(content: str, market_data: dict) -> str:
    """원고 본문 + 카테고리 기반 타겟 독자 추정 (간이)."""
    reader_hints = re.findall(
        r"(30대|40대|50대|20대|직장인|주부|엄마|아빠|초보|워킹맘|자영업자|프리랜서|퇴사|은퇴|MZ|중년)",
        content,
    )
    if reader_hints:
        from collections import Counter
        top = Counter(reader_hints).most_common(3)
        return " / ".join(k for k, _ in top) + f" (→ {market_data['primary_category']})"
    return f"{market_data['primary_category']} 관심층 (원고 내 구체적 묘사 부족)"


def calculate_scores(
    text_stats: dict, market_data: dict, author_info: dict,
    llm: dict | None = None,
) -> dict:
    """시장성 40점을 3축으로 재분배: 주제매칭 15 + 트렌드 10 + LLM잠재력 15.

    LLM이 HIGH/MEDIUM/LOW를 안 주면(LLM 실패 시) 규칙 기반만으로도 최대 25점
    채울 수 있게 설계 — LLM 유무에 따라 과도한 편차 없음.
    """
    # 1a. 규칙 기반 시장성: 3주제 매칭 (max 15)
    market_score = 0
    primary = market_data["primary_category"]
    primary_mentions = market_data["sorted_categories"][0][1]["total_mentions"]
    if primary != "기타":
        market_score += 8
    if primary_mentions > 50:
        market_score += 7
    elif primary_mentions > 20:
        market_score += 4

    # 1b. 트렌드 키워드 (max 10)
    trending_count = len(market_data["trending_matches"])
    market_score += min(trending_count * 2, 10)

    # 1c. LLM 시장 잠재력 (max 15) — 원고 의미 이해 기반
    llm_potential = {"HIGH": 15, "MEDIUM": 9, "LOW": 3}
    if llm:
        market_score += llm_potential.get(
            str(llm.get("market_potential", "")).upper(), 0
        )
    # LLM 실패시 규칙 기반만으로도 완성도 우선 — 25/40

    market_score = min(market_score, 40)

    # 2. 저자 전문성 (30) — 경력 + 자격
    expertise_score = 0
    expertise = author_info.get("expertise_years", 0)
    if expertise >= 10:
        expertise_score += 15
    elif expertise >= 5:
        expertise_score += 10
    elif expertise >= 3:
        expertise_score += 7
    elif expertise >= 1:
        expertise_score += 3
    credentials = author_info.get("credentials", [])
    expertise_score += min(len(credentials) * 5, 15)

    # 3. SNS (20)
    total_followers = author_info.get("total_followers", 0)
    tier = get_sns_tier(total_followers)
    tier_scores = {"S": 20, "A": 15, "B": 10, "C": 5, "D": 2}
    sns_score = tier_scores.get(tier, 0)

    # 4. 원고 완성도 (10)
    completion_score = 0
    chars = text_stats["chars_no_space"]
    if chars >= 80_000:
        completion_score += 5
    elif chars >= 40_000:
        completion_score += 3
    elif chars >= 10_000:
        completion_score += 2
    if len(text_stats["chapters_h2"]) >= 5:
        completion_score += 3
    if len(text_stats["placeholders"]) == 0:
        completion_score += 2

    total = market_score + expertise_score + sns_score + completion_score
    return {
        "total": min(total, 100),
        "market": market_score,
        "expertise": expertise_score,
        "sns": sns_score,
        "completion": completion_score,
        "sns_tier": tier,
    }


def classify_submission(scores: dict) -> tuple[str, str, str]:
    total = scores["total"]
    if total >= 75:
        return "S", "기획출판 선발 추천", "대표 직접 검토 → 기획출판 역제안"
    if total >= 55:
        return "A", "수제자 과정 선발 추천", "대표 연락 → 수제자/VIP 과정 초대"
    if total >= 35:
        return "B", "베이직 그룹 추천", "자동 안내 → 베이직 그룹(150만원) 업셀"
    return "C", "추가 학습 권장", "자동 안내 → 온라인 과정 재수강 또는 1:1 피드백"


# ────────────────────────────────────────────
# 리포트 (이메일/시트 본문용 — 짧은 버전)
# ────────────────────────────────────────────

def build_email_report(
    text_stats: dict,
    market_data: dict,
    scores: dict,
    classification: tuple[str, str, str],
    author_info: dict,
    ai_target: str,
    ai_pains: list[str],
    llm: dict | None = None,
) -> str:
    grade, label, action = classification
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    llm = llm or {}

    # ─── [2] AI가 파악한 책 — LLM 우선, 없으면 규칙 기반 폴백 ───
    book_category = llm.get("book_category") or market_data["primary_category"]
    pitch = llm.get("one_line_pitch") or "(LLM 분석 없음)"
    who = llm.get("who_should_read") or ai_target
    killer = llm.get("killer_line") or "(추출 안 됨)"

    pains = llm.get("reader_pains") or ai_pains or []
    pains_block = (
        "\n".join(f"  - {p}" for p in pains[:3]) if pains else "  - (추출 실패)"
    )

    strengths = llm.get("strengths") or []
    strengths_block = (
        "\n".join(f"  - {s}" for s in strengths[:3]) if strengths else "  - (LLM 분석 없음)"
    )

    titles = llm.get("title_suggestions") or []
    titles_block = (
        "\n".join(f"  {i+1}. {t}" for i, t in enumerate(titles[:3]))
        if titles else "  (LLM 분석 없음)"
    )

    # LLM 심층 섹션 (점수·편집 우선순위·우려)
    llm_section = ""
    if llm:
        try:
            from coaching.analyzer_llm import format_llm_section
            llm_section = format_llm_section(llm)
        except Exception:
            llm_section = ""

    trending = ", ".join(market_data["trending_matches"].keys()) or "(매칭 없음)"

    return f"""━━━━━━━━━━━━━━━━━━━━━━━
  📮 투고 접수 + AI 분석
━━━━━━━━━━━━━━━━━━━━━━━
접수 시각: {now}

[1] 작가가 제출한 정보
- 이름: {author_info.get('name', '-')}
- 이메일: {author_info.get('email', '-')}
- 연락처: {author_info.get('phone', '-')}
- 직업/경력: {author_info.get('profession', '-')}
- 제목 후보: {author_info.get('title_candidate', '-')}
- SNS 총 팔로워: {author_info.get('total_followers', 0):,}명 (등급 {scores['sns_tier']})
- 저자 구매 의향: {author_info.get('author_purchase', '-')}
- 상담 희망: {author_info.get('consult_topics', '-')}
- 메모: {author_info.get('memo', '-')}

[2] AI가 원고에서 파악한 책
💡 한 줄 소개: {pitch}
📖 주제·분야: {book_category}
🎯 핵심 독자: {who}
✨ 킬러 문장: "{killer}"

💭 이 책이 해결하는 독자의 고통:
{pains_block}

🌟 이 원고가 빛나는 강점:
{strengths_block}

📚 제안 제목 후보:
{titles_block}

[3] 원고 기본 정보
- 글자수: {text_stats['chars_no_space']:,}자 (공백제외)
- 예상 페이지: B6 {text_stats['pages_b6']}p / A5 {text_stats['pages_a5']}p
- 목차: H1 {len(text_stats['chapters_h1'])}개 / H2 {len(text_stats['chapters_h2'])}개
- 미완성 표식: {len(text_stats['placeholders'])}개

[4] 종합 점수 (100점 만점)
- 시장성:   {scores['market']:2d}/40  (3주제매칭 15 + 트렌드 10 + LLM잠재력 15)
- 전문성:   {scores['expertise']:2d}/30
- SNS:      {scores['sns']:2d}/20
- 완성도:   {scores['completion']:2d}/10
─────────────────────
- 합계:     {scores['total']:2d}/100

[5] 등급: {grade}  ({label})
   → {action}
{llm_section}
[참고] 규칙 기반 키워드 (LLM과 다를 수 있음 — 참고용)
- 키워드 카테고리: {market_data['primary_category']}
- 트렌드 키워드: {trending}
━━━━━━━━━━━━━━━━━━━━━━━
"""


def run_full_analysis(content: str, author_info: dict, use_llm: bool = True) -> dict:
    """투고 페이지에서 한 방에 호출하는 올인원 함수.

    use_llm=True면 Claude API로 심층 평가도 붙임 (실패시 규칙 기반만 나감).
    """
    text_stats = analyze_text(content)
    market_data = analyze_market_fit(content)
    ai_target = infer_target_reader(content, market_data)
    ai_pains = extract_reader_pains(content)

    # LLM 먼저 — 점수 계산에 market_potential 반영되도록
    llm = {}
    if use_llm:
        try:
            from coaching.analyzer_llm import analyze_llm
            llm = analyze_llm(content)
        except Exception:
            llm = {}

    scores = calculate_scores(text_stats, market_data, author_info, llm=llm)
    classification = classify_submission(scores)

    email_body = build_email_report(
        text_stats, market_data, scores, classification,
        author_info, ai_target, ai_pains, llm,
    )
    return {
        "text_stats": text_stats,
        "market_data": market_data,
        "scores": scores,
        "classification": classification,
        "ai_target": ai_target,
        "ai_pains": ai_pains,
        "llm": llm,
        "email_body": email_body,
    }
