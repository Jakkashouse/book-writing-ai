import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id]/chapters/[chapterId] - 챕터 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await params

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    })

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("Failed to fetch chapter:", error)
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]/chapters/[chapterId] - 챕터 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await params
    const body = await request.json()
    const { content, wordCount, status } = body

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (wordCount !== undefined) updateData.wordCount = wordCount
    if (status !== undefined) updateData.status = status

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("Failed to update chapter:", error)
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/chapters/[chapterId] - 챕터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id, chapterId } = await params

    await prisma.chapter.delete({
      where: { id: chapterId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete chapter:", error)
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    )
  }
}
