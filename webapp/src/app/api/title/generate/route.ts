import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/title/generate - AI로 제목 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, formulas, description, genre, keywords } = body

    const prompt = `당신은 전문 출판 기획자입니다. 다음 정보를 바탕으로 매력적인 책 제목을 생성해주세요.

책 설명: ${description || "정보 없음"}
장르: ${genre || "정보 없음"}
키워드: ${Array.isArray(keywords) ? keywords.join(", ") : keywords || "정보 없음"}

다음 제목 공식들을 각각 활용하여 제목을 만들어주세요:
${formulas.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")}

각 공식마다 하나씩, 총 ${formulas.length}개의 제목을 생성해주세요.
각 제목은 다음 형식으로 작성해주세요:

[공식명]: 제목
부제목: (선택사항)

제목은 10-15자 내외로, 기억하기 쉽고 검색이 잘 되도록 작성해주세요.`

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

    // 생성된 제목 파싱
    const titles = generatedText
      .split("\n\n")
      .filter(block => block.trim())
      .map(block => {
        const lines = block.split("\n")
        const titleLine = lines.find(l => l.includes(":"))
        const subtitleLine = lines.find(l => l.includes("부제목:"))

        if (titleLine) {
          const [formula, ...titleParts] = titleLine.split(":")
          return {
            formula: formula.trim().replace(/^\[|\]$/g, ""),
            title: titleParts.join(":").trim(),
            subtitle: subtitleLine ? subtitleLine.replace("부제목:", "").trim() : undefined,
          }
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error("Failed to generate titles:", error)
    return NextResponse.json(
      { error: "Failed to generate titles" },
      { status: 500 }
    )
  }
}
