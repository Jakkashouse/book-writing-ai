import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/draft/generate - AI로 초안 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, chapterId, chapterTitle, projectTitle, genre, previousContent } = body

    const prompt = `당신은 전문 작가입니다. 다음 정보를 바탕으로 챕터 초안을 작성해주세요.

책 제목: ${projectTitle || "정보 없음"}
장르: ${genre || "정보 없음"}
현재 챕터: ${chapterTitle}
${previousContent ? `\n이전 챕터 내용:\n${previousContent.substring(0, 500)}...\n` : ""}

다음 지침을 따라 초안을 작성해주세요:
1. 이 챕터의 주제에 맞는 내용을 작성하세요
2. 독자가 쉽게 이해할 수 있도록 명확하게 쓰세요
3. 구체적인 예시와 사례를 포함하세요
4. 자연스러운 흐름으로 작성하세요
5. 최소 500단어 이상 작성하세요

초안만 작성하고, 설명이나 주석은 포함하지 마세요.`

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    const generatedContent = content.type === "text" ? content.text : ""

    return NextResponse.json({ content: generatedContent })
  } catch (error) {
    console.error("Failed to generate draft:", error)
    return NextResponse.json(
      { error: "Failed to generate draft" },
      { status: 500 }
    )
  }
}
