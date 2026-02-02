"""
Claude API 클라이언트
"""
import anthropic
from config import ANTHROPIC_API_KEY, MODEL_NAME, MAX_TOKENS


def get_client() -> anthropic.Anthropic:
    """Anthropic 클라이언트 생성"""
    if not ANTHROPIC_API_KEY:
        raise ValueError(
            "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.\n"
            "터미널에서 다음 명령어를 실행하세요:\n"
            "  set ANTHROPIC_API_KEY=your-api-key-here"
        )
    return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def generate_response(system_prompt: str, messages: list):
    """Claude API 호출 (비스트리밍)"""
    client = get_client()
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text
