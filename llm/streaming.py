"""
스트리밍 응답 처리
- Anthropic API 스트리밍을 st.write_stream 호환 제너레이터로 변환
"""
from llm.client import get_client
from config import MODEL_NAME, MAX_TOKENS, MAX_TOKENS_LONG


def stream_response(system_prompt: str, messages: list, long_output: bool = False):
    """스트리밍 응답 제너레이터

    중요: Anthropic 스트림 객체를 직접 st.write_stream에 전달하면
    JSON이 출력되는 버그가 있음. 반드시 이 래퍼를 통해 순수 문자열만 yield.
    """
    client = get_client()
    max_tokens = MAX_TOKENS_LONG if long_output else MAX_TOKENS

    with client.messages.stream(
        model=MODEL_NAME,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text


def stream_action_response(system_prompt: str, action_prompt: str, messages: list):
    """원클릭 액션용 스트리밍 (이전 대화 컨텍스트 + 액션 프롬프트)"""
    # 기존 대화에 액션 요청을 추가
    action_messages = messages + [{"role": "user", "content": action_prompt}]

    client = get_client()

    with client.messages.stream(
        model=MODEL_NAME,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=action_messages,
    ) as stream:
        for text in stream.text_stream:
            yield text
