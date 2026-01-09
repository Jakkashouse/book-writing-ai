"""
간단한 사용 예시 - Claude Code에서 바로 실행 가능
"""

# 이 파일은 Claude Code 인터페이스에서 직접 사용할 수 있습니다.
# 프롬프트 파일을 읽어서 Claude API로 요청하는 간단한 예시입니다.

import os
from pathlib import Path

# 프롬프트 파일 읽기 함수
def read_prompt(filename):
    """프롬프트 파일을 읽어옵니다."""
    prompt_dir = Path("prompts")
    prompt_path = prompt_dir / filename
    
    if not prompt_path.exists():
        return f"파일을 찾을 수 없습니다: {prompt_path}"
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()

# 예시: 제목/목차 개발 프롬프트 읽기
if __name__ == "__main__":
    print("프롬프트 파일 읽기 예시\n")
    
    # 사용 가능한 프롬프트 목록
    prompts_dir = Path("prompts")
    if prompts_dir.exists():
        print("사용 가능한 프롬프트 파일:")
        for file in sorted(prompts_dir.glob("*.md")):
            print(f"  - {file.name}")
    
    print("\n" + "="*50)
    print("제목/목차 개발 프롬프트 (일부)")
    print("="*50)
    
    prompt = read_prompt("01-title-outline.md")
    print(prompt[:500] + "...")  # 처음 500자만 출력
    
    print("\n" + "="*50)
    print("사용 방법:")
    print("="*50)
    print("""
1. Claude Code에서 이 파일을 열어주세요
2. 프롬프트 파일을 읽어서 Claude에게 전달하세요
3. 예시:
   
   prompt = read_prompt("01-title-outline.md")
   
   # Claude에게 요청
   # (Claude Code 인터페이스에서 직접 대화하듯 사용)
   """)




