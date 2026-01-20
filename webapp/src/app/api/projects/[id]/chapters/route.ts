import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id]/chapters - 챕터 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ chapters })
  } catch (error) {
    console.error("Failed to fetch chapters:", error)
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/chapters - 챕터 생성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, order, content } = body

    const chapter = await prisma.chapter.create({
      data: {
        projectId: params.id,
        title,
        order: order || 0,
        content: content || "",
        wordCount: 0,
        status: "DRAFT",
      },
    })

    return NextResponse.json(chapter, { status: 201 })
  } catch (error) {
    console.error("Failed to create chapter:", error)
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    )
  }
}
