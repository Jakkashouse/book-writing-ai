"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"

const STEPS = [
  { id: 1, title: "기본 정보", description: "프로젝트 기본 정보 입력" },
  { id: 2, title: "제목 생성", description: "AI로 제목 생성" },
  { id: 3, title: "목차 작성", description: "5부 구조 목차 작성" },
  { id: 4, title: "초안 작성", description: "챕터별 초안 작성" },
  { id: 5, title: "교정", description: "AI 교정 및 피드백" },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    genre: "",
    targetAudience: "",
    keywords: "",
  })

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = async () => {
    if (currentStep === 1) {
      await createProject()
    } else if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const createProject = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/projects/${data.id}/title`)
      } else {
        alert("프로젝트 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">새 프로젝트 만들기</h1>
          <p className="text-gray-600 mb-6">단계별로 진행하여 책을 완성하세요</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{STEPS[currentStep - 1].title}</span>
              <span className="text-gray-600">
                {currentStep}/{STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index < currentStep - 1 ? "opacity-100" : index === currentStep - 1 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index < currentStep - 1
                      ? "bg-green-500 text-white"
                      : index === currentStep - 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStep - 1 ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className="text-xs text-center hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">프로젝트 제목 (임시)</Label>
                  <Input
                    id="title"
                    placeholder="예: 나의 첫 소설"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    다음 단계에서 AI가 더 나은 제목을 제안해드립니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">간단한 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="이 책은 어떤 내용인가요?"
                    rows={4}
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">장르</Label>
                  <Select
                    value={projectData.genre}
                    onValueChange={(value) => setProjectData({ ...projectData, genre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="장르를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="소설">소설</SelectItem>
                      <SelectItem value="에세이">에세이</SelectItem>
                      <SelectItem value="자기계발">자기계발</SelectItem>
                      <SelectItem value="비즈니스">비즈니스</SelectItem>
                      <SelectItem value="기술">기술</SelectItem>
                      <SelectItem value="자서전">자서전</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">타겟 독자</Label>
                  <Input
                    id="targetAudience"
                    placeholder="예: 20-30대 직장인"
                    value={projectData.targetAudience}
                    onChange={(e) => setProjectData({ ...projectData, targetAudience: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
                  <Input
                    id="keywords"
                    placeholder="예: 성장, 도전, 극복"
                    value={projectData.keywords}
                    onChange={(e) => setProjectData({ ...projectData, keywords: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  기본 정보 입력이 완료되었습니다.
                </p>
                <p className="text-gray-600">
                  다음 단계에서 AI가 매력적인 제목을 생성해드립니다.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  목차 작성 페이지로 이동합니다.
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  초안 작성 페이지로 이동합니다.
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  교정 및 피드백 페이지로 이동합니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            이전
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading || (currentStep === 1 && !projectData.title)}
          >
            {loading ? (
              "처리 중..."
            ) : currentStep === 1 ? (
              <>
                프로젝트 생성
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : currentStep === STEPS.length ? (
              "완료"
            ) : (
              <>
                다음
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
