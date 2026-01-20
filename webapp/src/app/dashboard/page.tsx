"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Plus, FileText, Edit3, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface Project {
  id: string
  title: string
  status: string
  progress: number
  createdAt: string
  updatedAt: string
  genre?: string
}

const statusConfig = {
  PLANNING: { label: "기획 중", color: "bg-blue-500", variant: "default" as const },
  OUTLINING: { label: "목차 작성", color: "bg-purple-500", variant: "secondary" as const },
  WRITING: { label: "집필 중", color: "bg-yellow-500", variant: "warning" as const },
  EDITING: { label: "편집 중", color: "bg-orange-500", variant: "warning" as const },
  COMPLETED: { label: "완료", color: "bg-green-500", variant: "success" as const },
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    totalWords: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      PLANNING: 10,
      OUTLINING: 30,
      WRITING: 60,
      EDITING: 85,
      COMPLETED: 100,
    }
    return progressMap[status] || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로젝트</h1>
          <p className="text-gray-600">책 쓰기 여정을 시작하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                전체 프로젝트
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                진행 중
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                완료
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                총 단어 수
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/projects/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">새 프로젝트</h3>
                    <p className="text-sm text-gray-600">책 쓰기 시작하기</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/assignments">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">과제 제출</h3>
                    <p className="text-sm text-gray-600">주차별 과제 확인</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/feedback">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Edit3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">피드백 확인</h3>
                    <p className="text-sm text-gray-600">AI 분석 결과</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내 프로젝트</h2>
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 프로젝트
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 프로젝트가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 책 쓰기 프로젝트를 시작해보세요
                </p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    프로젝트 만들기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {project.title || "제목 없음"}
                        </CardTitle>
                        <Badge variant={statusConfig[project.status as keyof typeof statusConfig]?.variant}>
                          {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                        </Badge>
                      </div>
                      {project.genre && (
                        <CardDescription className="text-sm">
                          {project.genre}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">진행률</span>
                            <span className="font-semibold">
                              {project.progress || calculateProgress(project.status)}%
                            </span>
                          </div>
                          <Progress
                            value={project.progress || calculateProgress(project.status)}
                            className="h-2"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          최근 수정: {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
