#!/usr/bin/env python3
"""
책쓰기 자동화 스크립트 - 초간단 버전

사용법:
    python book_automation.py analyze-consultation consultation.txt
    python book_automation.py analyze-style writer_text.txt
    python book_automation.py write-draft --title "1장 제목" --message "핵심 메시지"
    python book_automation.py feedback draft.txt
"""

import os
import sys
from pathlib import Path
from anthropic import Anthropic
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 키 확인
API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    print("❌ 오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.")
    print("📝 .env 파일을 만들고 다음을 추가하세요:")
    print("   ANTHROPIC_API_KEY=sk-ant-xxx...")
    sys.exit(1)

# Claude 클라이언트 생성
client = Anthropic(api_key=API_KEY)


def load_prompt(prompt_file):
    """프롬프트 파일 로드"""
    prompt_path = Path("prompts") / prompt_file
    if not prompt_path.exists():
        print(f"❌ 프롬프트 파일을 찾을 수 없습니다: {prompt_path}")
        sys.exit(1)

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()


def load_file(file_path):
    """텍스트 파일 로드"""
    path = Path(file_path)
    if not path.exists():
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def save_result(content, output_file):
    """결과를 파일로 저장"""
    output_path = Path("output") / output_file

    # output 폴더 생성
    output_path.parent.mkdir(exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ 결과 저장: {output_path}")


def call_claude(system_prompt, user_message):
    """Claude API 호출"""
    print("🤖 Claude AI 작업 중...")

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",  # 최신 모델
            max_tokens=8000,
            temperature=0.7,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        return message.content[0].text

    except Exception as e:
        print(f"❌ API 호출 오류: {e}")
        sys.exit(1)


# ========================================
# 기능 1: 컨설팅지 분석
# ========================================
def analyze_consultation(consultation_file):
    """컨설팅지 분석 → 3가지 주제 + 목차 40개 생성"""
    print("📚 컨설팅지 분석 시작...")

    # 프롬프트 로드
    system_prompt = load_prompt("28-consultation-analyzer.md")

    # 컨설팅지 로드
    consultation_text = load_file(consultation_file)

    # 사용자 메시지 구성
    user_message = f"""
다음은 작가님의 컨설팅지 내용입니다:

{consultation_text}

위 내용을 바탕으로 3가지 책 주제를 제안해주세요.
"""

    # AI 호출
    result = call_claude(system_prompt, user_message)

    # 결과 저장
    save_result(result, f"consultation_analysis_{Path(consultation_file).stem}.md")

    print("✨ 분석 완료!")
    print(result[:500] + "...")  # 일부만 출력


# ========================================
# 기능 2: 필체 분석
# ========================================
def analyze_style(writer_text_file):
    """작가 필체 분석"""
    print("📝 필체 분석 시작...")

    # 프롬프트 로드
    system_prompt = load_prompt("29-writing-style-analyzer.md")

    # 작가 텍스트 로드
    writer_text = load_file(writer_text_file)

    # 사용자 메시지 구성
    user_message = f"""
다음 텍스트를 분석해주세요:

{writer_text}
"""

    # AI 호출
    result = call_claude(system_prompt, user_message)

    # 결과 저장
    save_result(result, f"style_analysis_{Path(writer_text_file).stem}.md")

    print("✨ 분석 완료!")
    print(result[:500] + "...")


# ========================================
# 기능 3: 초안 작성
# ========================================
def write_draft(style_file, title, message, keywords=""):
    """작가 스타일 반영 초안 작성"""
    print("✍️ 초안 작성 시작...")

    # 프롬프트 로드
    system_prompt = load_prompt("30-draft-with-style.md")

    # 필체 분석 결과 로드
    style_analysis = load_file(style_file)

    # 사용자 메시지 구성
    user_message = f"""
작가 필체 분석 결과:
{style_analysis}

---

장 정보:
- 제목: {title}
- 핵심 메시지: {message}
- 목표 분량: 4,000자
{f"- 키워드: {keywords}" if keywords else ""}

위 정보를 바탕으로 초안을 작성해주세요.
"""

    # AI 호출
    result = call_claude(system_prompt, user_message)

    # 파일명 생성 (제목에서 특수문자 제거)
    safe_title = "".join(c for c in title if c.isalnum() or c in (" ", "_")).strip()
    safe_title = safe_title.replace(" ", "_")

    # 결과 저장
    save_result(result, f"draft_{safe_title}.md")

    print("✨ 초안 작성 완료!")
    print(result[:500] + "...")


# ========================================
# 기능 4: 피드백 생성
# ========================================
def generate_feedback(draft_file, chapter_title=""):
    """초안 피드백 생성"""
    print("💬 피드백 생성 시작...")

    # 프롬프트 로드
    system_prompt = load_prompt("31-draft-feedback.md")

    # 초안 로드
    draft_content = load_file(draft_file)

    # 사용자 메시지 구성
    user_message = f"""
{f"장 제목: {chapter_title}" if chapter_title else ""}

작가 초안:

{draft_content}

위 초안을 검토하고 피드백을 제공해주세요.
"""

    # AI 호출
    result = call_claude(system_prompt, user_message)

    # 결과 저장
    save_result(result, f"feedback_{Path(draft_file).stem}.md")

    print("✨ 피드백 생성 완료!")
    print(result[:500] + "...")


# ========================================
# 메인 함수
# ========================================
def main():
    if len(sys.argv) < 2:
        print("📚 책쓰기 자동화 스크립트")
        print("\n사용법:")
        print("  python book_automation.py analyze-consultation <파일>")
        print("  python book_automation.py analyze-style <파일>")
        print(
            '  python book_automation.py write-draft <스타일파일> --title "제목" --message "메시지"'
        )
        print("  python book_automation.py feedback <초안파일> [--title 제목]")
        print("\n예시:")
        print("  python book_automation.py analyze-consultation consultation.txt")
        print("  python book_automation.py analyze-style writer_sample.txt")
        print(
            '  python book_automation.py write-draft style.md --title "1장" --message "핵심"'
        )
        print("  python book_automation.py feedback draft.txt")
        sys.exit(1)

    command = sys.argv[1]

    if command == "analyze-consultation":
        if len(sys.argv) < 3:
            print("❌ 사용법: python book_automation.py analyze-consultation <파일>")
            sys.exit(1)
        analyze_consultation(sys.argv[2])

    elif command == "analyze-style":
        if len(sys.argv) < 3:
            print("❌ 사용법: python book_automation.py analyze-style <파일>")
            sys.exit(1)
        analyze_style(sys.argv[2])

    elif command == "write-draft":
        if len(sys.argv) < 7:
            print("❌ 사용법: python book_automation.py write-draft <스타일파일> --title 제목 --message 메시지")
            sys.exit(1)

        style_file = sys.argv[2]
        title = ""
        message = ""
        keywords = ""

        i = 3
        while i < len(sys.argv):
            if sys.argv[i] == "--title" and i + 1 < len(sys.argv):
                title = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--message" and i + 1 < len(sys.argv):
                message = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--keywords" and i + 1 < len(sys.argv):
                keywords = sys.argv[i + 1]
                i += 2
            else:
                i += 1

        if not title or not message:
            print("❌ --title 과 --message 는 필수입니다")
            sys.exit(1)

        write_draft(style_file, title, message, keywords)

    elif command == "feedback":
        if len(sys.argv) < 3:
            print("❌ 사용법: python book_automation.py feedback <초안파일> [--title 제목]")
            sys.exit(1)

        draft_file = sys.argv[2]
        chapter_title = ""

        if "--title" in sys.argv:
            title_idx = sys.argv.index("--title")
            if title_idx + 1 < len(sys.argv):
                chapter_title = sys.argv[title_idx + 1]

        generate_feedback(draft_file, chapter_title)

    else:
        print(f"❌ 알 수 없는 명령어: {command}")
        print("사용 가능한 명령어: analyze-consultation, analyze-style, write-draft, feedback")
        sys.exit(1)


if __name__ == "__main__":
    main()
