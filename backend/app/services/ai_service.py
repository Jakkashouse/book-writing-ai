"""
AI 서비스 - Claude API 통합
"""
import json
from pathlib import Path
from anthropic import Anthropic
from ..core.config import settings


class AIService:
    """Claude AI 서비스"""

    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.prompts_dir = Path(__file__).parent.parent.parent.parent / "prompts"

    def _load_prompt(self, prompt_file: str) -> str:
        """프롬프트 파일 로드"""
        prompt_path = self.prompts_dir / prompt_file
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()

    def _call_claude(
        self, system_prompt: str, user_message: str, temperature: float = 0.7
    ) -> str:
        """Claude API 호출"""
        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8000,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return message.content[0].text

    # ========================================
    # 1. 컨설팅지 분석
    # ========================================
    def analyze_consultation(self, consultation_text: str) -> dict:
        """
        컨설팅지 분석 → 3가지 주제 + 목차 40개 생성

        Returns:
            {
                "writer_analysis": {...},
                "topics": [
                    {
                        "number": 1,
                        "title": "...",
                        "subtitle": "...",
                        "outline": [...],
                        "reasons": [...],
                        "market_analysis": {...}
                    },
                    ...
                ]
            }
        """
        system_prompt = self._load_prompt("28-consultation-analyzer.md")

        user_message = f"""
다음은 작가님의 컨설팅지 내용입니다:

{consultation_text}

위 내용을 바탕으로 3가지 책 주제를 제안해주세요.
"""

        result = self._call_claude(system_prompt, user_message)

        # 결과 파싱 (간단하게)
        return {"raw_result": result, "analysis_complete": True}

    # ========================================
    # 2. 필체 분석
    # ========================================
    def analyze_writing_style(self, writer_text: str) -> dict:
        """
        작가 필체 분석

        Returns:
            {
                "avg_sentence_length": 28,
                "common_endings": ["~어요", "~죠"],
                "vocabulary_level": "일상적",
                "tone": "따뜻한",
                "full_analysis": "..."
            }
        """
        system_prompt = self._load_prompt("29-writing-style-analyzer.md")

        user_message = f"""
다음 텍스트를 분석해주세요:

{writer_text}
"""

        result = self._call_claude(system_prompt, user_message)

        return {"full_analysis": result, "analyzed": True}

    # ========================================
    # 3. 초안 작성
    # ========================================
    def write_draft(
        self,
        writing_style_analysis: str,
        chapter_title: str,
        core_message: str,
        keywords: str = "",
    ) -> str:
        """
        작가 스타일 반영 초안 작성

        Returns:
            str: 4,000자 초안
        """
        system_prompt = self._load_prompt("30-draft-with-style.md")

        user_message = f"""
작가 필체 분석 결과:
{writing_style_analysis}

---

장 정보:
- 제목: {chapter_title}
- 핵심 메시지: {core_message}
- 목표 분량: 4,000자
{f"- 키워드: {keywords}" if keywords else ""}

위 정보를 바탕으로 초안을 작성해주세요.
"""

        result = self._call_claude(system_prompt, user_message)
        return result

    # ========================================
    # 4. 피드백 생성
    # ========================================
    def generate_feedback(self, draft_content: str, chapter_title: str = "") -> dict:
        """
        초안 피드백 생성

        Returns:
            {
                "strengths": [...],
                "improvements": [...],
                "score": 75,
                "full_feedback": "..."
            }
        """
        system_prompt = self._load_prompt("31-draft-feedback.md")

        user_message = f"""
{f"장 제목: {chapter_title}" if chapter_title else ""}

작가 초안:

{draft_content}

위 초안을 검토하고 피드백을 제공해주세요.
"""

        result = self._call_claude(system_prompt, user_message)

        return {"full_feedback": result, "score": 75}  # 점수는 파싱 필요


# 싱글톤 인스턴스
ai_service = AIService()
