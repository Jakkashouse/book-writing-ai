"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Plus, Trash2, ChevronRight, Save, Sparkles, Lightbulb } from "lucide-react"

interface TocItem {
  id: string
  order: number
  title: string
  subtitle?: string
  content?: string
}

const DEFAULT_STRUCTURE = [
  { part: 1, title: "1부: 도입", description: "독자의 관심을 끌고 문제를 제시합니다" },
  { part: 2, title: "2부: 전개", description: "본격적인 내용 전개와 핵심 메시지 전달" },
  { part: 3, title: "3부: 심화", description: "더 깊은 통찰과 구체적인 방법론" },
  { part: 4, title: "4부: 적용", description: "실제 적용 방법과 사례 제시" },
  { part: 5, title: "5부: 마무리", description: "요약과 독자에게 전하는 메시지" },
]

export default function TableOfContentsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "">("")

  useEffect(() => {
    fetchProject()
    fetchToc()
  }, [projectId])

  useEffect(() => {
    if (tocItems.length > 0) {
      const timer = setTimeout(() => {
        autoSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [tocItems])

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
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/toc`)
      if (response.ok) {
        const data = await response.json()
        if (data.toc && data.toc.length > 0) {
          setTocItems(data.toc)
        } else {
          initializeDefaultStructure()
        }
      } else {
        initializeDefaultStructure()
      }
    } catch (error) {
      console.error("Failed to fetch TOC:", error)
      initializeDefaultStructure()
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultStructure = () => {
    const defaultItems: TocItem[] = DEFAULT_STRUCTURE.map((part, index) => ({
      id: `temp-${index}`,
      order: index,
      title: part.title,
      subtitle: "",
      content: part.description,
    }))
    setTocItems(defaultItems)
  }

  const autoSave = async () => {
    setAutoSaveStatus("saving")
    try {
      const response = await fetch(`/api/projects/${projectId}/toc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toc: tocItems }),
      })

      if (response.ok) {
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus(""), 2000)
      }
    } catch (error) {
      console.error("Auto save failed:", error)
    }
  }

  const addItem = (afterIndex: number) => {
    const newItem: TocItem = {
      id: `temp-${Date.now()}`,
      order: afterIndex + 1,
      title: "",
      subtitle: "",
      content: "",
    }

    const updatedItems = [...tocItems]
    updatedItems.splice(afterIndex + 1, 0, newItem)

    // 순서 재조정
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index,
    }))

    setTocItems(reorderedItems)
  }

  const removeItem = (index: number) => {
    const updatedItems = tocItems.filter((_, i) => i !== index)
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      order: i,
    }))
    setTocItems(reorderedItems)
  }

  const updateItem = (index: number, field: keyof TocItem, value: string) => {
    const updatedItems = [...tocItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setTocItems(updatedItems)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const items = [...tocItems]
    const draggedItem = items[draggedIndex]
    items.splice(draggedIndex, 1)
    items.splice(index, 0, draggedItem)

    const reorderedItems = items.map((item, i) => ({
      ...item,
      order: i,
    }))

    setTocItems(reorderedItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const generateWithAI = async () => {
    setAiGenerating(true)
    try {
      const response = await fetch("/api/toc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: project?.title,
          description: project?.description,
          genre: project?.genre,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTocItems(data.toc)
      } else {
        alert("AI 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to generate TOC:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setAiGenerating(false)
    }
  }

  const saveAndContinue = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/toc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toc: tocItems }),
      })

      if (response.ok) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "WRITING" }),
        })
        router.push(`/projects/${projectId}/draft`)
      } else {
        alert("저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to save TOC:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">목차 작성</h1>
              <p className="text-gray-600">5부 구조로 책의 전체 흐름을 구성하세요</p>
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

          {project?.title && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-gray-600">프로젝트</p>
                <p className="font-semibold text-lg">{project.title}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* TOC Items */}
        <div className="space-y-4 mb-8">
          {tocItems.map((item, index) => (
            <Card
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`${
                draggedIndex === index ? "opacity-50" : ""
              } transition-opacity`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Drag Handle */}
                  <div className="flex items-start pt-2 cursor-move">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge>{index + 1}부</Badge>
                      <Input
                        placeholder="부 제목 (예: 1부: 도입)"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        className="flex-1 text-lg font-semibold"
                      />
                    </div>

                    <Input
                      placeholder="부제목 (선택사항)"
                      value={item.subtitle || ""}
                      onChange={(e) => updateItem(index, "subtitle", e.target.value)}
                    />

                    <Textarea
                      placeholder="이 부분에서 다룰 내용을 간략히 설명하세요..."
                      value={item.content || ""}
                      onChange={(e) => updateItem(index, "content", e.target.value)}
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addItem(index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        아래에 추가
                      </Button>
                      {tocItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Lightbulb className="h-5 w-5 mr-2" />
              목차 작성 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>각 부는 명확한 목적과 메시지를 가져야 합니다</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>1부는 독자의 관심을 끌고, 5부는 강렬한 마무리를 제공합니다</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>전체적인 흐름이 자연스럽게 이어지도록 구성하세요</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>드래그 앤 드롭으로 순서를 변경할 수 있습니다</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            나중에 계속하기
          </Button>

          <Button
            onClick={saveAndContinue}
            disabled={saving || tocItems.some(item => !item.title)}
          >
            {saving ? (
              "저장 중..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장하고 초안 작성하기
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
