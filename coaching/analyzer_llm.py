"""
Claude API로 원고의 문장력·구성·차별성·주제·독자·강점을 심층 평가.
규칙 기반(analyzer.py)이 '양적 지표'라면 이건 '질적 평가 + 의미 이해'.
실패해도 예외를 올리지 않고 빈 dict 반환.

2026-04-22: 장르별 프롬프트 분기 추가 (에세이/자기계발·실용/전문서).
가벼운 텍스트 휴리스틱으로 장르 감지 → 해당 장르에 특화된 추가 지침을
기본 프롬프트에 덧붙임. 감지 실패시 범용 평가.

2026-04-22 (v2): 소설/픽션 장르 추가. 대사·화행동사로 감지하고
논픽션 스키마(reader_pains 등)를 픽션 문맥으로 재해석하는 지침 덧붙임.
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
  "detected_genre": "essay|howto|expert|fiction|general (원고의 주된 장르)",
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
    "fiction": """
[장르 추가 지침 — 소설/픽션]
※ 이 원고는 소설입니다. 논픽션 평가 기준(저자 권위·독자 고통 해결·실용성)을 적용하지 말고 픽션 기준으로만 판단하세요.
- 문장력: 묘사의 구체성·대사의 생동감·장면 전환 리듬·시점 일관성을 최우선. 정보 전달 아님.
- 구성 점수: 서사 구조(발단·전개·위기·절정·결말)·장면 배치·복선과 회수·훅의 강도.
- 차별성: 동일 서브장르(로맨스/스릴러/SF/가정소설/성장소설 등) 대비 서사·캐릭터·설정의 신선도.
- book_category: "1990년대 가족사 대하소설", "직장인 심리 스릴러", "여성서사 성장소설" 식으로 소설 서브장르 형식으로 표현.
- reader_pains 필드는 픽션에 부적합 → **"이 소설이 독자에게 주는 감정/공명/대리만족 3가지"로 재해석해서 채우세요.** (예: "엄마와 화해를 미뤄온 40대의 눈물 포인트", "번아웃 직장인의 대리복수 카타르시스")
- who_should_read: "이 소설을 사랑할 독자" 프로필 (예: "정유정·손원평을 즐겨 읽는 30-40대 여성").
- strengths: 서사 훅·캐릭터 매력·설정의 독창성·문체 중 빛나는 3가지.
- killer_line: 인상적인 대사나 묘사 한 줄.
- title_suggestions: 소설 제목은 상징적·감각적이어야 함. 실용서 제목처럼 "X하는 법" 형식 금지.
- edit_priorities: 도입부 훅 약함·시점 흔들림·대사 평면화·설정 설명 과다·클리셰 등에서 3개.
- market_potential: 서브장르 시장성 + 웹소설·웹툰 원작화 가능성 있으면 HIGH 가능.
- publishing_recommendation: 소설은 대부분 "기획출판" 또는 "재고". 자비/협업은 거의 선택지 아님.
- honest_concerns: 소설 시장(초판 1500부 주류) 현실·동일 서브장르 경쟁·독자 픽업 포인트 관점에서.
""",
    "general": "",
}


def _detect_genre(text: str) -> str:
    """가벼운 휴리스틱으로 주된 장르 감지 → fiction / essay / howto / expert / general.

    순서: howto/expert(강마커) → fiction(대사·화행) → essay(1인칭·서사) → general.
    소설은 에세이와 서사 마커가 겹치므로 대사·화행동사 유무로 먼저 분리.
    """
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

    # 소설 판별용: 대사 따옴표 블록 + 화행 동사
    dialogue_blocks = len(re.findall(r'[""].{2,80}?[""]', sample))
    if dialogue_blocks == 0:
        # 일반 쌍따옴표/작은따옴표만 쓴 원고 대응
        dialogue_blocks = len(re.findall(r'"[^"\n]{2,80}"', sample))
    speech_verbs = len(re.findall(
        r"(말했다|물었다|대답했다|외쳤다|속삭였다|중얼거렸다|소리쳤다|"
        r"말한다|묻는다|대답한다|외친다|속삭인다|"
        r"라고 말|라고 묻|라고 답|라고 외|고 말했|고 물었)",
        sample,
    ))
    third_person = len(re.findall(r"(그녀는|그녀가|그녀의|그는|그가|그의)", sample))

    # 1인칭 비율
    fp_ratio = first_person / max(len(sample) / 500, 1)

    if howto_markers >= 15:
        return "howto"
    if expert_markers >= 8:
        return "expert"
    # 소설: 대사 블록이 많거나 화행동사가 뚜렷하거나 3인칭+서사가 강함
    if dialogue_blocks >= 6 or speech_verbs >= 8 or (third_person >= 15 and story_markers >= 15):
        return "fiction"
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
