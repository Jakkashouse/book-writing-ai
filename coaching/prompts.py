"""
시스템 프롬프트 관리
"""
from coaching.phases import PHASE_QUESTIONS


def build_system_prompt(phase: int, step: int, user_data: dict) -> str:
    """현재 상태에 맞는 시스템 프롬프트 생성"""
    phase_info = PHASE_QUESTIONS.get(phase, PHASE_QUESTIONS[1])
    user_summary = _format_user_data(user_data)
    questions_text = "\n".join(
        f"  {i+1}. {q}" for i, q in enumerate(phase_info["questions"])
    )

    prompt = f"""당신은 '작가의집 출판사'의 전문 책쓰기 코치입니다.

## 역할
- 예비 저자가 6주 안에 출판 가능한 원고를 완성하도록 안내합니다.
- 대화를 통해 저자의 전문성과 경험을 끌어내는 것이 핵심입니다.
- 절대 대신 써주지 않고, 질문을 통해 저자 스스로 답을 찾도록 유도합니다.
- 다만, 저자의 답변을 정리하거나 구조화해서 보여주는 것은 적극적으로 합니다.

## 현재 상태
- Phase: {phase}/4 ({phase_info['name']})
- Phase 목표: {phase_info['goal']}
- 이 Phase의 산출물: {phase_info['output']}
- 현재 질문 진행: {step}번째 대화

## 이 Phase에서 다뤄야 할 핵심 질문들
{questions_text}

## 지금까지 파악된 저자 정보
{user_summary if user_summary else "(아직 파악된 정보 없음)"}

## 대화 규칙
1. 한 번에 하나의 질문만 합니다. 여러 질문을 동시에 하지 마세요.
2. 저자의 답변을 먼저 간단히 요약/정리한 뒤 다음 질문으로 넘어갑니다.
3. 따뜻하지만 전문적인 톤을 유지합니다. 과도한 칭찬은 삼가되, 격려는 자연스럽게 합니다.
4. 저자가 막혀할 때는 구체적인 예시를 들어 도와줍니다.
5. 충분한 정보가 모이면 중간 정리를 해줍니다.
6. 한국어로 대화합니다.
7. 응답은 간결하게, 300자 이내로 합니다. (정리/산출물 제외)

## Phase 전환 기준
- 이 Phase의 핵심 질문들을 충분히 다뤘다고 판단되면, 응답 맨 끝에 정확히 [PHASE_COMPLETE]를 추가하세요.
- 이때 중간 산출물도 함께 정리해주세요.
- 산출물 정리 요청: {phase_info['summary_instruction']}

## 중요
- [PHASE_COMPLETE] 태그는 오직 해당 Phase의 핵심 질문을 모두 다뤘을 때만 사용하세요.
- 저자가 "다음 단계", "넘어가자" 등의 표현을 하면 현재까지 파악된 내용을 정리한 뒤 [PHASE_COMPLETE]를 추가하세요.
"""
    return prompt


def build_action_prompt(action_type: str, last_response: str) -> str:
    """원클릭 액션용 프롬프트"""
    prompts = {
        "summarize": f"다음 내용을 핵심만 간결하게 3~5줄로 요약해주세요:\n\n{last_response}",
        "expand": f"다음 내용을 더 구체적이고 상세하게 확장해주세요. 예시와 설명을 추가합니다:\n\n{last_response}",
        "tone_formal": f"다음 내용을 격식체(존댓말, 문어체)로 다시 작성해주세요:\n\n{last_response}",
        "tone_casual": f"다음 내용을 친근한 대화체로 다시 작성해주세요:\n\n{last_response}",
        "regenerate": "이전 질문에 대해 완전히 다른 관점에서 새롭게 답변해주세요.",
    }
    return prompts.get(action_type, last_response)


def _format_user_data(user_data: dict) -> str:
    """사용자 데이터를 읽기 좋은 형태로 정리"""
    if not user_data:
        return ""

    lines = []
    field_labels = {
        "name": "이름",
        "expertise": "전문 분야",
        "core_message": "핵심 메시지",
        "target_audience": "타깃 독자",
        "reader_benefit": "독자가 얻을 변화",
        "book_title": "책 제목 (잠정)",
        "sub_topics": "하위 주제",
        "table_of_contents": "목차",
        "current_chapter": "현재 집필 중인 챕터",
    }

    for key, label in field_labels.items():
        value = user_data.get(key)
        if value:
            lines.append(f"- {label}: {value}")

    chapters = user_data.get("chapters", {})
    if chapters:
        lines.append("- 챕터별 진행:")
        for ch_name, ch_status in chapters.items():
            lines.append(f"  - {ch_name}: {ch_status}")

    return "\n".join(lines)


def build_summary_prompt(phase: int, user_data: dict) -> str:
    """Phase 종료 시 산출물 생성용 프롬프트"""
    phase_info = PHASE_QUESTIONS.get(phase, PHASE_QUESTIONS[1])
    user_summary = _format_user_data(user_data)

    return f"""지금까지의 대화를 바탕으로 {phase}단계({phase_info['name']})의 산출물을 작성해주세요.

## 파악된 저자 정보
{user_summary}

## 산출물 요구사항
{phase_info['summary_instruction']}

## 형식
- 마크다운 형식으로 깔끔하게 정리해주세요.
- 제목, 소제목, 불릿 포인트를 활용해주세요.
- 표가 필요하면 마크다운 표를 사용하세요.
"""
