"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Save,
  Sparkles,
  CheckCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from "lucide-react"

interface Chapter {
  id: string
  order: number
  title: string
  content: string
  wordCount: number
  status: "DRAFT" | "REVIEWING" | "COMPLETED"
}

interface TocItem {
  id: string
  title: string
}

export default function DraftWritingPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "">("")
  const [wordCount, setWordCount] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchProject()
    fetchToc()
    fetchChapters()
  }, [projectId])

  useEffect(() => {
    if (chapters.length > 0 && currentChapterIndex < chapters.length) {
      setContent(chapters[currentChapterIndex].content || "")
    }
  }, [currentChapterIndex, chapters])

  useEffect(() => {
    const count = content.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(count)
  }, [content])

  useEffect(() => {
    if (content && chapters.length > 0) {
      const timer = setTimeout(() => {
        autoSave()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [content])

  useEffect(() => {
    calculateProgress()
  }, [chapters])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
    }
  }

  const fetchToc = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/toc`)
      if (response.ok) {
        const data = await response.json()
        setTocItems(data.toc || [])
      }
    } catch (error) {
      console.error("Failed to fetch TOC:", error)
    }
  }

  const fetchChapters = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/chapters`)
      if (response.ok) {
        const data = await response.json()
        if (data.chapters && data.chapters.length > 0) {
          setChapters(data.chapters)
        } else {
          initializeChaptersFromToc()
        }
      } else {
        initializeChaptersFromToc()
      }
    } catch (error) {
      console.error("Failed to fetch chapters:", error)
      initializeChaptersFromToc()
    } finally {
      setLoading(false)
    }
  }

  const initializeChaptersFromToc = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/toc`)
      if (response.ok) {
        const data = await response.json()
        if (data.toc && data.toc.length > 0) {
          const newChapters: Chapter[] = data.toc.map((item: TocItem, index: number) => ({
            id: `temp-${index}`,
            order: index,
            title: item.title,
            content: "",
            wordCount: 0,
            status: "DRAFT" as const,
          }))
          setChapters(newChapters)
        }
      }
    } catch (error) {
      console.error("Failed to initialize chapters:", error)
    }
  }

  const calculateProgress = () => {
    if (chapters.length === 0) {
      setProgress(0)
      return
    }

    const completedChapters = chapters.filter(
      ch => ch.status === "COMPLETED" || (ch.content && ch.wordCount > 500)
    ).length

    setProgress((completedChapters / chapters.length) * 100)
  }

  const autoSave = async () => {
    if (!content) return

    setAutoSaveStatus("saving")
    try {
      const currentChapter = chapters[currentChapterIndex]
      const response = await fetch(`/api/projects/${projectId}/chapters/${currentChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          wordCount,
        }),
      })

      if (response.ok) {
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus(""), 2000)

        // Update local state
        const updatedChapters = [...chapters]
        updatedChapters[currentChapterIndex] = {
          ...updatedChapters[currentChapterIndex],
          content,
          wordCount,
        }
        setChapters(updatedChapters)
      }
    } catch (error) {
      console.error("Auto save failed:", error)
    }
  }

  const generateWithAI = async () => {
    setAiGenerating(true)
    try {
      const currentChapter = chapters[currentChapterIndex]
      const response = await fetch("/api/draft/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          chapterId: currentChapter.id,
          chapterTitle: currentChapter.title,
          projectTitle: project?.title,
          genre: project?.genre,
          previousContent: currentChapterIndex > 0 ? chapters[currentChapterIndex - 1].content : "",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        alert("AI 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to generate draft:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setAiGenerating(false)
    }
  }

  const saveAndNext = async () => {
    setSaving(true)
    try {
      const currentChapter = chapters[currentChapterIndex]
      await fetch(`/api/projects/${projectId}/chapters/${currentChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          wordCount,
          status: wordCount > 500 ? "COMPLETED" : "DRAFT",
        }),
      })

      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1)
      } else {
        router.push(`/projects/${projectId}`)
      }
    } catch (error) {
      console.error("Failed to save chapter:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const goToPrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const currentChapter = chapters[currentChapterIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Sidebar - Chapter List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">챕터 목록</CardTitle>
                <CardDescription>
                  {chapters.filter(ch => ch.status === "COMPLETED").length} / {chapters.length} 완료
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        index === currentChapterIndex
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-white border-2 border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setCurrentChapterIndex(index)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">
                          {index + 1}부
                        </span>
                        {chapter.status === "COMPLETED" || chapter.wordCount > 500 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : chapter.content ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chapter.wordCount} 단어
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">전체 진도</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge>{currentChapterIndex + 1}부</Badge>
                      <CardTitle>{currentChapter?.title}</CardTitle>
                    </div>
                    {project?.title && (
                      <CardDescription>{project.title}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {autoSaveStatus && (
                      <Badge variant={autoSaveStatus === "saved" ? "success" : "secondary"}>
                        {autoSaveStatus === "saved" ? "저장됨" : "저장 중..."}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      onClick={generateWithAI}
                      disabled={aiGenerating}
                    >
                      {aiGenerating ? (
                        "생성 중..."
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI 도움받기
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">단어 수</p>
                      <p className="text-2xl font-bold">{wordCount}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">현재 챕터</p>
                      <p className="text-2xl font-bold">
                        {currentChapterIndex + 1}/{chapters.length}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">진도율</p>
                      <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="여기에 내용을 작성하세요... AI 도움받기 버튼을 눌러 자동으로 초안을 생성할 수 있습니다."
                  rows={20}
                  className="font-serif text-base leading-relaxed resize-none"
                />
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-900 text-base">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  글쓰기 팁
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>독자가 쉽게 이해할 수 있도록 명확하게 작성하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>구체적인 예시와 사례를 활용하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>한 문단은 하나의 주제만 다루세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>내용이 자동으로 저장되니 자유롭게 작성하세요</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentChapterIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                이전 챕터
              </Button>

              <Button
                onClick={saveAndNext}
                disabled={saving}
              >
                {saving ? (
                  "저장 중..."
                ) : currentChapterIndex === chapters.length - 1 ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장하고 완료
                  </>
                ) : (
                  <>
                    저장하고 다음
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
