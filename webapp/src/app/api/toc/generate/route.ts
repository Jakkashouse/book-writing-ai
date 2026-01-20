import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/toc/generate - AI로 목차 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, title, description, genre } = body

    const prompt = `당신은 전문 출판 기획자입니다. 다음 정보를 바탕으로 5부 구조의 목차를 생성해주세요.

책 제목: ${title || "정보 없음"}
책 설명: ${description || "정보 없음"}
장르: ${genre || "정보 없음"}

5부 구조로 목차를 작성하되, 각 부는 다음과 같은 역할을 해야 합니다:
- 1부: 독자의 관심을 끌고 문제를 제시
- 2부: 본격적인 내용 전개와 핵심 메시지 전달
- 3부: 더 깊은 통찰과 구체적인 방법론
- 4부: 실제 적용 방법과 사례 제시
- 5부: 요약과 독자에게 전하는 메시지

각 부는 다음 형식으로 작성해주세요:

부 제목: (간결하고 매력적인 제목)
설명: (이 부분에서 다룰 내용 2-3문장으로 설명)

총 5개의 부를 생성해주세요.`

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    const generatedText = content.type === "text" ? content.text : ""

    // 생성된 목차 파싱
    const tocItems = generatedText
      .split(/\n(?=부 제목:)/)
      .filter(block => block.trim())
      .map((block, index) => {
        const titleMatch = block.match(/부 제목:\s*(.+)/)
        const descMatch = block.match(/설명:\s*(.+(?:\n.+)*)/)

        return {
          id: `generated-${index}`,
          order: index,
          title: titleMatch ? titleMatch[1].trim() : `${index + 1}부`,
          subtitle: "",
          content: descMatch ? descMatch[1].trim() : "",
        }
      })

    return NextResponse.json({ toc: tocItems })
  } catch (error) {
    console.error("Failed to generate TOC:", error)
    return NextResponse.json(
      { error: "Failed to generate TOC" },
      { status: 500 }
    )
  }
}
