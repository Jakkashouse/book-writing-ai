import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/projects - 프로젝트 목록 조회
export async function GET(request: NextRequest) {
  try {
    // TODO: 실제 환경에서는 세션에서 userId를 가져와야 합니다
    const userId = "temp-user-id"

    const projects = await prisma.bookProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        chapters: {
          select: {
            wordCount: true,
            status: true,
          },
        },
      },
    })

    // 통계 계산
    const stats = {
      total: projects.length,
      inProgress: projects.filter(p =>
        p.status === "WRITING" || p.status === "OUTLINING"
      ).length,
      completed: projects.filter(p => p.status === "COMPLETED").length,
      totalWords: projects.reduce((sum, p) =>
        sum + p.chapters.reduce((chSum, ch) => chSum + ch.wordCount, 0), 0
      ),
    }

    // 진행률 계산
    const projectsWithProgress = projects.map(project => {
      const progressMap: Record<string, number> = {
        PLANNING: 10,
        OUTLINING: 30,
        WRITING: 60,
        EDITING: 85,
        COMPLETED: 100,
      }
      return {
        ...project,
        progress: progressMap[project.status] || 0,
      }
    })

    return NextResponse.json({
      projects: projectsWithProgress,
      stats,
    })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST /api/projects - 새 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, genre, targetAudience, keywords } = body

    // TODO: 실제 환경에서는 세션에서 userId를 가져와야 합니다
    const userId = "temp-user-id"

    const project = await prisma.bookProject.create({
      data: {
        userId,
        title: title || "제목 없음",
        description,
        genre,
        targetAudience,
        keywords: keywords ? keywords.split(",").map((k: string) => k.trim()) : [],
        status: "PLANNING",
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
