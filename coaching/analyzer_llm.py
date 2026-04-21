"""
Claude API로 원고의 문장력·구성·차별성을 심층 평가.
규칙 기반(analyzer.py)이 '양적 지표'라면 이건 '질적 평가'.
실패해도 예외를 올리지 않고 빈 dict 반환 — 상위 호출부가 리포트에서 섹션을 빼버리면 됨.
"""
from __future__ import annotations

import json
import re

SYSTEM_PROMPT = """당신은 작가의집 출판사의 25년차 편집장입니다.
투고된 원고를 읽고 아래 JSON 스키마로만 평가를 내보냅니다. 설명·인사말·마크다운 금지.

{
  "sentence_score": 0-20 사이 정수 (문장력·가독성·어휘력),
  "structure_score": 0-20 사이 정수 (구성·논리전개·독자 설득력),
  "differentiation_score": 0-10 사이 정수 (유사 도서 대비 차별성),
  "market_potential": "HIGH|MEDIUM|LOW",
  "killer_line": "원고에서 뽑은 가장 인상적인 문장 하나 (50자 내외, 그대로 인용)",
  "one_line_pitch": "이 책을 한 문장으로 소개한다면 (30-60자)",
  "who_should_read": "이 책을 꼭 읽어야 할 독자 한 줄 (구체적 프로필)",
  "edit_priorities": ["편집 단계에서 가장 먼저 손봐야 할 것 3개, 짧게"],
  "honest_concerns": "편집장으로서 솔직하게 걱정되는 점 1-2문장",
  "publishing_recommendation": "기획출판|협업출판|자비출판|재고"
}

반드시 유효한 JSON 하나만 출력하세요. 스키마 외의 키는 추가하지 마세요."""


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

    user_prompt = (
        f"아래는 투고된 원고의 앞부분 약 {len(snippet):,}자입니다.\n"
        f"(전체 원고 길이: {len(content):,}자)\n\n"
        f"---\n{snippet}\n---\n\n"
        "위 스키마 JSON으로만 평가해주세요."
    )

    try:
        client = get_client()
        resp = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = resp.content[0].text.strip()
    except Exception:
        return {}

    # JSON 블록 추출 (모델이 ```json 블록으로 감싸거나 앞뒤에 설명 붙이는 경우 대비)
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
    """이메일 리포트에 삽입할 텍스트 블록. 빈 dict면 섹션 자체 생략."""
    if not llm:
        return "\n[LLM 심층 평가] 미수행 (API 실패 또는 원고 짧음)\n"

    edits = llm.get("edit_priorities") or []
    edits_txt = "\n".join(f"    {i+1}. {e}" for i, e in enumerate(edits[:3])) or "    (없음)"

    return f"""
[LLM 심층 평가 — 25년차 편집장 관점]
- 문장력:      {llm.get('sentence_score', '-')}/20
- 구성·논리:   {llm.get('structure_score', '-')}/20
- 차별성:      {llm.get('differentiation_score', '-')}/10
- 시장 잠재력: {llm.get('market_potential', '-')}
- 출판 추천:   {llm.get('publishing_recommendation', '-')}

💬 한 줄 소개: {llm.get('one_line_pitch', '-')}
🎯 핵심 독자:  {llm.get('who_should_read', '-')}
✨ 킬러 문장:  "{llm.get('killer_line', '-')}"

🔧 편집 우선순위:
{edits_txt}

⚠️ 편집장의 솔직한 우려:
  {llm.get('honest_concerns', '-')}
"""
