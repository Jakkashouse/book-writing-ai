import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id]/toc - 목차 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const toc = await prisma.tableOfContents.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ toc })
  } catch (error) {
    console.error("Failed to fetch TOC:", error)
    return NextResponse.json(
      { error: "Failed to fetch TOC" },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]/toc - 목차 저장 (전체 교체)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { toc } = body

    // 기존 목차 삭제
    await prisma.tableOfContents.deleteMany({
      where: { projectId: params.id },
    })

    // 새 목차 생성
    const createdToc = await Promise.all(
      toc.map((item: any, index: number) =>
        prisma.tableOfContents.create({
          data: {
            projectId: params.id,
            order: index,
            title: item.title,
            subtitle: item.subtitle || null,
            content: item.content || null,
          },
        })
      )
    )

    // 프로젝트 상태 업데이트
    await prisma.bookProject.update({
      where: { id: params.id },
      data: { status: "OUTLINING" },
    })

    return NextResponse.json({ toc: createdToc })
  } catch (error) {
    console.error("Failed to save TOC:", error)
    return NextResponse.json(
      { error: "Failed to save TOC" },
      { status: 500 }
    )
  }
}
