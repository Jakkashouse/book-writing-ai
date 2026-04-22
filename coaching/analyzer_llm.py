"""
Claude API로 원고의 문장력·구성·차별성·주제·독자·강점을 심층 평가.
규칙 기반(analyzer.py)이 '양적 지표'라면 이건 '질적 평가 + 의미 이해'.
실패해도 예외를 올리지 않고 빈 dict 반환.

2026-04-22: 장르별 프롬프트 분기 추가 (에세이/자기계발·실용/전문서).
가벼운 텍스트 휴리스틱으로 장르 감지 → 해당 장르에 특화된 추가 지침을
기본 프롬프트에 덧붙임. 감지 실패시 범용 평가.
"""
from __future__ import annotations

import json
import re

BASE_PROMPT = """당신은 작가의집 출판사의 대표이자 7년차 책쓰기 코치입니다.
투고된 원고를 읽고 아래 JSON 스키마로만 평가를 내보냅니다. 설명·인사말·마크다운 금지.

{
  "sentence_score": 0-20 사이 정수 (문장력·가독성·어휘력),
  "structure_score": 0-20 사이 정수 (구성·논리전개·독자 설득력),
  "differentiation_score": 0-10 사이 정수 (유사 도서 대비 차별성),
  "market_potential": "HIGH|MEDIUM|LOW",
  "book_category": "이 책의 주제·분야를 한 줄로 (예: 'ADHD 당사자의 AI 기반 자기경영 에세이', '50대 이직자를 위한 커리어 전환 실용서', '워킹맘의 육아 번아웃 극복기'). 고정 카테고리 아닌 자유 텍스트 — 원고 의미를 그대로 반영할 것.",
  "detected_genre": "essay|howto|expert|general (원고의 주된 장르)",
  "killer_line": "원고에서 뽑은 가장 인상적인 문장 하나 (50자 내외, 그대로 인용)",
  "one_line_pitch": "이 책을 한 문장으로 소개한다면 (30-60자)",
  "who_should_read": "이 책을 꼭 읽어야 할 독자 한 줄 (구체적 프로필)",
  "reader_pains": ["이 책이 해결해주는 독자의 구체적 고통 3가지. 원고 파편 인용 말고 편집장 시선으로 정제된 문장"],
  "strengths": ["이 원고가 빛나는 강점 3가지. 작가가 읽으면 자신감 얻을 문장"],
  "title_suggestions": ["작가가 고민해볼 제목 후보 3개. 원고의 핵심 메시지를 담은 것, 30자 이내"],
  "edit_priorities": ["편집 단계에서 가장 먼저 손봐야 할 것 3개, 짧게"],
  "honest_concerns": "편집장으로서 솔직하게 걱정되는 점 1-2문장",
  "publishing_recommendation": "기획출판|협업출판|자비출판|재고"
}

모든 배열 필드(reader_pains, strengths, title_suggestions, edit_priorities)는 정확히 3개 원소로.
반드시 유효한 JSON 하나만 출력하세요. 스키마 외의 키는 추가하지 마세요."""


# ─── 장르별 보조 지침 ────────────────────────────
GENRE_GUIDANCE = {
    "essay": """
[장르 추가 지침 — 에세이]
- 문장력 평가 시: 개성·리듬·호흡을 가장 중요하게 볼 것. 정보 전달력이 아니라 '작가의 목소리'.
- 구성 점수: 사건 배치·시간 흐름·감정의 리듬이 독자를 끌고 가는가.
- 차별성: 소재가 진부해도 작가만의 시선이 있으면 고점. 소재 신선도만 보지 말 것.
- 독자 고통: '내 얘기 같다' 체감되는 구체성 있는 순간으로.
- 편집 우선순위: 뻔한 결론·과도한 설명·교훈 과잉 경계.
""",
    "howto": """
[장르 추가 지침 — 자기계발/실용서]
- 문장력 평가 시: 쉽게 읽히는가, 실행 가능한 문장인가를 최우선.
- 구성 점수: 문제→원리→방법→실천의 흐름이 단계적으로 설계됐는가.
- 차별성: 같은 주제의 타 저서 대비 '누구에게 왜 이 사람 책인가'.
- 독자 고통: 추상적 불안이 아니라 즉시 적용 가능한 문제로 구체화.
- 편집 우선순위: 사례 부족·실행 단계 모호·저자 권위 근거 약함을 먼저 짚을 것.
- market_potential 판단: 실용서는 '저자의 입증된 성과'가 있으면 HIGH로 올려도 됨.
""",
    "expert": """
[장르 추가 지침 — 전문서/직업서]
- 문장력 평가 시: 전문성과 가독성의 균형. 너무 쉬우면 깊이 부족, 너무 어려우면 대중성 제로.
- 구성 점수: 대상 독자(초보/중급/전문가) 레벨이 일관된가.
- 차별성: 동일 분야 책 대비 저자의 경력·관점·사례가 어떤 희소성을 주는가.
- 편집 우선순위: 용어 설명 부족·사례 부족·'저자만 아는 것' 부족을 먼저 짚을 것.
- market_potential: 타깃 독자가 좁아도 구매력 높으면 HIGH 가능.
""",
    "general": "",
}


def _detect_genre(text: str) -> str:
    """가벼운 휴리스틱으로 주된 장르 감지 → essay / howto / expert / general."""
    sample = text[:8000]

    first_person = len(re.findall(r"(나는|내가|저는|제가|우리는)", sample))
    howto_markers = len(re.findall(
        r"(\d+가지|\d+단계|\d+\.\s|스텝|STEP|첫째|둘째|셋째|하는 법|하려면|따라하면)",
        sample,
    ))
    expert_markers = len(re.findall(
        r"(연구에 따르면|논문|저자는|\d+년간|임상|진단|분석 결과|통계적으로|사례 연구)",
        sample,
    ))
    story_markers = len(re.findall(
        r"(어느 날|그때|그 순간|기억한다|돌아보면|되었다|했다)",
        sample,
    ))

    # 1인칭 비율
    fp_ratio = first_person / max(len(sample) / 500, 1)

    if howto_markers >= 15:
        return "howto"
    if expert_markers >= 8:
        return "expert"
    if fp_ratio >= 1.5 or story_markers >= 20:
        return "essay"
    return "general"


def _build_system_prompt(genre: str) -> str:
    """장르 감지 결과에 따라 추가 지침을 덧붙인 시스템 프롬프트."""
    extra = GENRE_GUIDANCE.get(genre, "")
    return BASE_PROMPT + ("\n" + extra if extra else "")


# 역호환 — 외부에서 SYSTEM_PROMPT를 import하는 코드가 있을 수 있어 유지.
SYSTEM_PROMPT = BASE_PROMPT


def analyze_llm(content: str, max_chars: int = 15_000) -> dict:
    """원고의 앞부분 max_chars만 Claude에게 보내 심층 평가.

    성공: 위 스키마의 dict 반환
    실패: 빈 dict {} 반환 (호출부에서 섹션 생략)
    """
    try:
        from llm.client import get_client
        from config import MODEL_NAME
    except Exception:
        return {}

    snippet = content[:max_chars]
    if len(snippet.strip()) < 500:
        return {}

    detected_genre = _detect_genre(content)
    system_prompt = _build_system_prompt(detected_genre)

    user_prompt = (
        f"아래는 투고된 원고의 앞부분 약 {len(snippet):,}자입니다.\n"
        f"(전체 원고 길이: {len(content):,}자)\n"
        f"[휴리스틱 감지 장르 힌트: {detected_genre}]\n\n"
        f"---\n{snippet}\n---\n\n"
        "위 스키마 JSON으로만 평가해주세요. "
        "특히 book_category는 고정된 3분류(돈/건강/관계)에 억지로 맞추지 말고 "
        "원고가 실제로 무엇에 관한 책인지 자유롭게 한 줄로 표현하세요. "
        "장르 힌트는 참고만 — 실제 원고를 보고 detected_genre를 최종 판단하세요."
    )

    try:
        client = get_client()
        resp = client.messages.create(
            model=MODEL_NAME,
            max_tokens=2500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = resp.content[0].text.strip()
    except Exception:
        return {}

    # JSON 블록 추출
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return {}
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return {}

    # 필수 키 sanity check
    required = {"sentence_score", "structure_score", "killer_line", "one_line_pitch"}
    if not required.issubset(data.keys()):
        return {}
    return data


def format_llm_section(llm: dict) -> str:
    """심층 평가 세부 섹션 — 점수·편집 우선순위·우려·출판 추천.

    주제·독자·강점·고통·킬러문장·제목제안은 analyzer.build_email_report의
    상단 [2] 섹션에서 별도 렌더링하므로 여기서는 중복 배제.
    """
    if not llm:
        return "\n[LLM 심층 평가] 미수행 (API 실패 또는 원고 짧음)\n"

    edits = llm.get("edit_priorities") or []
    edits_txt = (
        "\n".join(f"    {i+1}. {e}" for i, e in enumerate(edits[:3])) or "    (없음)"
    )

    return f"""
[심층 평가 — 7년차 책쓰기 코치·출판사 대표 관점]
- 문장력:      {llm.get('sentence_score', '-')}/20
- 구성·논리:   {llm.get('structure_score', '-')}/20
- 차별성:      {llm.get('differentiation_score', '-')}/10
- 시장 잠재력: {llm.get('market_potential', '-')}
- 출판 추천:   {llm.get('publishing_recommendation', '-')}

🔧 편집 우선순위:
{edits_txt}

⚠️ 편집장의 솔직한 우려:
  {llm.get('honest_concerns', '-')}
"""
