"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ChevronRight, Save, RefreshCw, Check } from "lucide-react"

const TITLE_FORMULAS = [
  {
    id: 1,
    name: "How to 공식",
    description: "실용적인 가이드 제목",
    example: "How to 30일 만에 소설 쓰기",
    prompt: "독자에게 실용적인 해결책을 제시하는 'How to' 형식의 제목"
  },
  {
    id: 2,
    name: "숫자 활용",
    description: "구체적인 숫자로 신뢰도 향상",
    example: "7가지 습관으로 완성하는 글쓰기",
    prompt: "구체적인 숫자를 활용하여 명확성을 높인 제목"
  },
  {
    id: 3,
    name: "질문형",
    description: "독자의 호기심 자극",
    example: "당신은 왜 글을 쓰지 못하는가?",
    prompt: "독자에게 직접 질문을 던지는 형식의 제목"
  },
  {
    id: 4,
    name: "Before/After",
    description: "변화와 성장 강조",
    example: "평범한 글쟁이에서 베스트셀러 작가로",
    prompt: "변화 전후를 대비하여 성장을 강조하는 제목"
  },
  {
    id: 5,
    name: "비밀/공개",
    description: "독점 정보 암시",
    example: "출판사가 말하지 않는 책쓰기의 비밀",
    prompt: "독점적이거나 숨겨진 정보를 암시하는 제목"
  },
  {
    id: 6,
    name: "시간 제한",
    description: "긴급성 부여",
    example: "100일 안에 책 한 권 완성하기",
    prompt: "구체적인 시간 제한을 두어 긴급성을 부여하는 제목"
  },
  {
    id: 7,
    name: "대상 명시",
    description: "타겟 독자 직접 지정",
    example: "직장인을 위한 퇴근 후 글쓰기",
    prompt: "특정 대상을 명시하여 타겟팅하는 제목"
  },
  {
    id: 8,
    name: "역설/반전",
    description: "의외성으로 주목도 향상",
    example: "게으른 사람만이 책을 완성한다",
    prompt: "역설적이거나 반전이 있는 제목"
  },
  {
    id: 9,
    name: "스토리텔링",
    description: "개인적 경험 강조",
    example: "무명 작가의 베스트셀러 도전기",
    prompt: "개인적인 스토리나 여정을 담은 제목"
  },
  {
    id: 10,
    name: "권위/전문성",
    description: "전문성 어필",
    example: "20년 편집자가 알려주는 글쓰기의 모든 것",
    prompt: "전문성이나 권위를 강조하는 제목"
  }
]

export default function TitleGenerationPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [selectedFormulas, setSelectedFormulas] = useState<number[]>([])
  const [generatedTitles, setGeneratedTitles] = useState<{ formula: string; title: string; subtitle?: string }[]>([])
  const [selectedTitle, setSelectedTitle] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        setCustomTitle(data.title || "")
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
    }
  }

  const toggleFormula = (formulaId: number) => {
    setSelectedFormulas((prev) =>
      prev.includes(formulaId)
        ? prev.filter((id) => id !== formulaId)
        : [...prev, formulaId]
    )
  }

  const generateTitles = async () => {
    if (selectedFormulas.length === 0) {
      alert("최소 1개의 공식을 선택해주세요.")
      return
    }

    setLoading(true)
    try {
      const formulas = selectedFormulas.map(id =>
        TITLE_FORMULAS.find(f => f.id === id)
      )

      const response = await fetch("/api/title/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          formulas: formulas.map(f => f?.prompt),
          description: project?.description,
          genre: project?.genre,
          keywords: project?.keywords,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedTitles(data.titles)
      } else {
        alert("제목 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to generate titles:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const saveTitle = async () => {
    const finalTitle = selectedTitle || customTitle
    if (!finalTitle) {
      alert("제목을 선택하거나 입력해주세요.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finalTitle }),
      })

      if (response.ok) {
        router.push(`/projects/${projectId}/toc`)
      } else {
        alert("저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to save title:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">제목 생성</h1>
          <p className="text-gray-600">AI가 매력적인 제목을 만들어드립니다</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Formula Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>제목 공식 선택</CardTitle>
                <CardDescription>
                  원하는 공식을 선택하세요 (복수 선택 가능)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TITLE_FORMULAS.map((formula) => (
                    <div
                      key={formula.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFormulas.includes(formula.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleFormula(formula.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{formula.name}</h3>
                        {selectedFormulas.includes(formula.id) && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                      <p className="text-xs text-gray-500 italic">예: {formula.example}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={generateTitles}
                    disabled={loading || selectedFormulas.length === 0}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI 제목 생성
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Titles */}
            {generatedTitles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>생성된 제목</CardTitle>
                  <CardDescription>마음에 드는 제목을 선택하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedTitles.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTitle === item.title
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedTitle(item.title)
                          setCustomTitle("")
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className="mb-2" variant="secondary">
                              {item.formula}
                            </Badge>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            {item.subtitle && (
                              <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>
                            )}
                          </div>
                          {selectedTitle === item.title && (
                            <Check className="h-5 w-5 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Custom Title & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>직접 입력</CardTitle>
                <CardDescription>원하는 제목을 직접 작성하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="제목을 입력하세요"
                      value={customTitle}
                      onChange={(e) => {
                        setCustomTitle(e.target.value)
                        setSelectedTitle("")
                      }}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">선택된 제목</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded min-h-[60px]">
                      {selectedTitle || customTitle || "제목을 선택하거나 입력해주세요"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>제목 작성 팁</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>구체적인 혜택을 명시하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>타겟 독자를 분명히 하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>숫자나 시간을 활용하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>호기심을 자극하세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>간결하고 명확하게 작성하세요</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={saveTitle}
                disabled={saving || (!selectedTitle && !customTitle)}
                className="w-full"
              >
                {saving ? (
                  "저장 중..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장하고 다음 단계로
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                나중에 계속하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
