"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Download,
  Star,
  BarChart3,
  FileText
} from "lucide-react"

interface Feedback {
  id: string
  assignmentId: string
  assignmentTitle: string
  submittedAt: string
  score: number
  maxScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  metrics: {
    clarity: number
    structure: number
    creativity: number
    grammar: number
    engagement: number
  }
}

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: "1",
    assignmentId: "1",
    assignmentTitle: "책 주제 및 타겟 독자 정의",
    submittedAt: "2026-01-15",
    score: 95,
    maxScore: 100,
    strengths: [
      "주제가 명확하고 구체적으로 정의되어 있습니다",
      "타겟 독자층의 니즈를 정확히 파악하고 있습니다",
      "독자에게 제공할 가치가 분명하게 제시되어 있습니다",
    ],
    improvements: [
      "경쟁 도서와의 차별점을 더 부각시킬 수 있습니다",
      "타겟 독자의 구체적인 페르소나를 추가하면 좋겠습니다",
    ],
    detailedFeedback: "전반적으로 매우 우수한 과제입니다. 책의 주제와 방향성이 명확하며, 타겟 독자에 대한 이해도가 높습니다. 다만, 시장에 있는 유사 도서들과의 차별점을 더 구체적으로 제시한다면 더욱 설득력 있는 기획이 될 것입니다. 또한 타겟 독자를 연령, 직업, 관심사 등으로 구체화한 페르소나를 만들어보세요.",
    metrics: {
      clarity: 95,
      structure: 90,
      creativity: 88,
      grammar: 98,
      engagement: 92,
    }
  },
  {
    id: "2",
    assignmentId: "2",
    assignmentTitle: "제목 및 부제목 작성",
    submittedAt: "2026-01-22",
    score: 88,
    maxScore: 100,
    strengths: [
      "다양한 제목 공식을 효과적으로 활용했습니다",
      "각 제목의 장단점 분석이 논리적입니다",
      "독자의 관심을 끌 수 있는 창의적인 제목들입니다",
    ],
    improvements: [
      "일부 제목이 너무 길어 기억하기 어려울 수 있습니다",
      "부제목과 제목의 조화를 더 고려해보세요",
      "SEO 측면도 함께 고려하면 좋겠습니다",
    ],
    detailedFeedback: "제목 공식을 잘 활용하여 다양한 후보를 제시했습니다. 특히 '숫자 활용'과 'How to' 공식을 사용한 제목들이 효과적입니다. 다만 일부 제목이 15자를 넘어가는데, 기억하기 쉬운 제목을 위해서는 10-12자 내외로 조정하는 것이 좋습니다. 또한 온라인 서점 검색을 고려한 키워드 선정도 중요합니다.",
    metrics: {
      clarity: 85,
      structure: 88,
      creativity: 92,
      grammar: 95,
      engagement: 88,
    }
  }
]

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK_FEEDBACKS)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (feedbacks.length > 0) {
      setSelectedFeedback(feedbacks[0])
    }
  }, [])

  const downloadPDF = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/pdf`, {
        method: "GET",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `feedback-${feedbackId}.pdf`
        a.click()
      } else {
        alert("PDF 다운로드에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to download PDF:", error)
      alert("오류가 발생했습니다.")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "우수"
    if (score >= 80) return "양호"
    if (score >= 70) return "보통"
    return "노력 필요"
  }

  const avgScore = feedbacks.reduce((sum, f) => sum + (f.score / f.maxScore) * 100, 0) / feedbacks.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">피드백 확인</h1>
          <p className="text-gray-600">AI 분석 결과와 개선 제안을 확인하세요</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                피드백 받은 과제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbacks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                평균 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                {Math.round(avgScore)}점
              </div>
              <p className="text-sm text-gray-600 mt-1">{getScoreLabel(avgScore)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                개선 추세
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-2xl font-bold text-green-600">
                <TrendingUp className="h-6 w-6 mr-2" />
                상승
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">피드백 목록</h2>
            {feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className={`cursor-pointer transition-all ${
                  selectedFeedback?.id === feedback.id
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">
                      {new Date(feedback.submittedAt).toLocaleDateString("ko-KR")}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className={`font-bold ${getScoreColor((feedback.score / feedback.maxScore) * 100)}`}>
                        {feedback.score}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base line-clamp-2">
                    {feedback.assignmentTitle}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Detailed Feedback */}
          {selectedFeedback && (
            <div className="lg:col-span-2 space-y-6">
              {/* Score Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedFeedback.assignmentTitle}</CardTitle>
                      <CardDescription>
                        제출일: {new Date(selectedFeedback.submittedAt).toLocaleDateString("ko-KR")}
                      </CardDescription>
                    </div>
                    <Button onClick={() => downloadPDF(selectedFeedback.id)} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PDF 다운로드
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor((selectedFeedback.score / selectedFeedback.maxScore) * 100)}`}>
                      {selectedFeedback.score}
                    </div>
                    <div className="text-gray-600 mb-2">/ {selectedFeedback.maxScore}점</div>
                    <Badge variant="success" className="text-base">
                      {getScoreLabel((selectedFeedback.score / selectedFeedback.maxScore) * 100)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    세부 평가 항목
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedFeedback.metrics).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        clarity: "명확성",
                        structure: "구조",
                        creativity: "창의성",
                        grammar: "문법",
                        engagement: "몰입도",
                      }
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">{labels[key]}</span>
                            <span className={`font-bold ${getScoreColor(value)}`}>{value}점</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-900">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    잘한 점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedFeedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start text-green-900">
                        <span className="mr-2">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-900">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    개선할 점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedFeedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start text-amber-900">
                        <span className="mr-2">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Detailed Feedback */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    상세 피드백
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-900 leading-relaxed whitespace-pre-line">
                    {selectedFeedback.detailedFeedback}
                  </p>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>다음 단계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      피드백을 반영하여 수정하기
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      다음 과제 시작하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
