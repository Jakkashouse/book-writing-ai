"""
Claude API를 사용한 책쓰기 AI 코칭 시스템
황준연(작가의집)의 프롬프트를 활용하는 예시 코드
"""

import anthropic
import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일에서 환경변수 로드
load_dotenv()

# API 키 설정 (환경변수 또는 직접 입력)
# 1. .env 파일에 ANTHROPIC_API_KEY=your-key 입력 (권장)
# 2. 환경변수로 설정: $env:ANTHROPIC_API_KEY="your-key" (PowerShell)
# 3. 코드에서 직접: api_key = "your-api-key-here"

def load_prompt(prompt_file: str) -> str:
    """프롬프트 파일을 읽어옵니다."""
    prompt_path = Path(__file__).parent / "prompts" / prompt_file
    if not prompt_path.exists():
        raise FileNotFoundError(f"프롬프트 파일을 찾을 수 없습니다: {prompt_path}")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()

def create_client(api_key: str = None) -> anthropic.Anthropic:
    """Claude API 클라이언트를 생성합니다."""
    if api_key is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if api_key is None:
        raise ValueError(
            "API 키가 설정되지 않았습니다. "
            "환경변수 ANTHROPIC_API_KEY를 설정하거나 "
            "create_client(api_key='your-key')로 전달하세요."
        )
    
    return anthropic.Anthropic(api_key=api_key)

def generate_title_outline(
    client: anthropic.Anthropic,
    topic: str,
    target_reader: str = None,
    genre: str = None
) -> str:
    """제목/목차 개발 AI를 사용합니다."""
    system_prompt = load_prompt("01-title-outline.md")
    
    user_message = f"책을 쓰고 싶습니다.\n"
    user_message += f"주제: {topic}\n"
    
    if target_reader:
        user_message += f"타겟 독자: {target_reader}\n"
    if genre:
        user_message += f"장르: {genre}\n"
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    
    return message.content[0].text

def generate_draft(
    client: anthropic.Anthropic,
    chapter_title: str,
    core_message: str,
    details: str = None
) -> str:
    """초안 작성 AI를 사용합니다."""
    system_prompt = load_prompt("02-draft-writing.md")
    
    user_message = f"'{chapter_title}' 챕터의 초안을 작성하고 싶습니다.\n"
    user_message += f"핵심 메시지: {core_message}\n"
    
    if details:
        user_message += f"\n추가 정보:\n{details}\n"
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    
    return message.content[0].text

def proofread_text(
    client: anthropic.Anthropic,
    text: str,
    level: int = 2
) -> str:
    """글 검토 AI를 사용합니다."""
    system_prompt = load_prompt("03-proofreading.md")
    
    user_message = f"Level {level}로 검토해주세요.\n\n{text}"
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    
    return message.content[0].text

# 사용 예시
if __name__ == "__main__":
    # API 키를 환경변수로 설정하거나 직접 입력
    # export ANTHROPIC_API_KEY="your-key-here" (Linux/Mac)
    # set ANTHROPIC_API_KEY=your-key-here (Windows)
    
    try:
        client = create_client()
        
        # 예시 1: 제목/목차 개발
        print("=" * 50)
        print("제목/목차 개발 예시")
        print("=" * 50)
        result = generate_title_outline(
            client=client,
            topic="기질이 다른 두 아이를 키우며 배운 것들",
            target_reader="둘 이상 자녀를 키우는 부모",
            genre="육아서"
        )
        print(result)
        
        # 예시 2: 초안 작성
        # print("\n" + "=" * 50)
        # print("초안 작성 예시")
        # print("=" * 50)
        # result = generate_draft(
        #     client=client,
        #     chapter_title="1장. 완벽하지 않아도 괜찮습니다",
        #     core_message="엄마도 실수할 수 있다는 것",
        #     details="큰아이가 유치원에 처음 갔을 때의 경험을 중심으로"
        # )
        # print(result)
        
        # 예시 3: 글 검토
        # print("\n" + "=" * 50)
        # print("글 검토 예시")
        # print("=" * 50)
        # sample_text = """
        # 엄마는 항상 완벽해야 한다고 생각했어요.
        # 하지만 아이를 키우면서 배운 것은 완벽한 엄마는 없다는 것이었습니다.
        # """
        # result = proofread_text(client=client, text=sample_text, level=2)
        # print(result)
        
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")
        print("\n사용 방법:")
        print("1. Claude API 키를 발급받으세요: https://console.anthropic.com/")
        print("2. 환경변수로 설정: export ANTHROPIC_API_KEY='your-key'")
        print("3. 또는 코드에서 직접 설정: client = create_client(api_key='your-key')")




