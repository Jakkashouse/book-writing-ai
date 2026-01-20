"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, CheckCircle, Clock, Upload, FileText, AlertCircle } from "lucide-react"

interface Assignment {
  id: string
  week: number
  title: string
  description: string
  deadline: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "GRADED"
  maxScore: number
  score?: number
  submittedAt?: string
}

interface Submission {
  id: string
  assignmentId: string
  content: string
  attachments?: string[]
  submittedAt: string
  feedback?: string
  score?: number
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    week: 1,
    title: "책 주제 및 타겟 독자 정의",
    description: "당신이 쓰고자 하는 책의 주제와 타겟 독자를 명확히 정의하세요. 왜 이 주제를 선택했는지, 어떤 독자에게 어떤 가치를 제공할 것인지 설명하세요.",
    deadline: "2026-01-17",
    status: "SUBMITTED",
    maxScore: 100,
    score: 95,
  },
  {
    id: "2",
    week: 2,
    title: "제목 및 부제목 작성",
    description: "10가지 제목 공식을 활용하여 최소 5개의 제목 후보를 작성하고, 각 제목의 장단점을 분석하세요.",
    deadline: "2026-01-24",
    status: "IN_PROGRESS",
    maxScore: 100,
  },
  {
    id: "3",
    week: 3,
    title: "5부 구조 목차 작성",
    description: "5부 구조로 전체 목차를 작성하세요. 각 부의 주제와 핵심 메시지를 명확히 하고, 전체적인 흐름이 자연스러운지 확인하세요.",
    deadline: "2026-01-31",
    status: "NOT_STARTED",
    maxScore: 100,
  },
  {
    id: "4",
    week: 4,
    title: "1부 초안 작성",
    description: "1부의 초안을 작성하세요 (최소 2,000단어). 독자의 관심을 끌고 문제를 제시하는 데 초점을 맞추세요.",
    deadline: "2026-02-07",
    status: "NOT_STARTED",
    maxScore: 100,
  },
  {
    id: "5",
    week: 5,
    title: "2-3부 초안 작성",
    description: "2부와 3부의 초안을 작성하세요 (각 최소 2,000단어). 핵심 메시지를 명확히 전달하고 구체적인 방법론을 제시하세요.",
    deadline: "2026-02-14",
    status: "NOT_STARTED",
    maxScore: 100,
  },
]

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionContent, setSubmissionContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getStatusConfig = (status: Assignment["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return { label: "제출 완료", variant: "success" as const, icon: CheckCircle }
      case "GRADED":
        return { label: "채점 완료", variant: "default" as const, icon: CheckCircle }
      case "IN_PROGRESS":
        return { label: "진행 중", variant: "warning" as const, icon: Clock }
      default:
        return { label: "시작 전", variant: "secondary" as const, icon: AlertCircle }
    }
  }

  const isOverdue = (deadline: string, status: Assignment["status"]) => {
    if (status === "SUBMITTED" || status === "GRADED") return false
    return new Date(deadline) < new Date()
  }

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionContent) {
      alert("내용을 입력해주세요.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          content: submissionContent,
        }),
      })

      if (response.ok) {
        // Update local state
        setAssignments(assignments.map(a =>
          a.id === selectedAssignment.id
            ? { ...a, status: "SUBMITTED", submittedAt: new Date().toISOString() }
            : a
        ))
        setDialogOpen(false)
        setSubmissionContent("")
        alert("과제가 제출되었습니다!")
      } else {
        alert("제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to submit assignment:", error)
      alert("오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.status === "SUBMITTED" || a.status === "GRADED").length,
    inProgress: assignments.filter(a => a.status === "IN_PROGRESS").length,
    avgScore: assignments.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) /
              assignments.filter(a => a.score).length || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">과제 제출</h1>
          <p className="text-gray-600">주차별 과제를 완료하고 피드백을 받으세요</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                전체 과제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                제출 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                진행 중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                평균 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.avgScore > 0 ? Math.round(stats.avgScore) : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const statusConfig = getStatusConfig(assignment.status)
            const StatusIcon = statusConfig.icon
            const overdue = isOverdue(assignment.deadline, assignment.status)

            return (
              <Card key={assignment.id} className={overdue ? "border-red-300" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{assignment.week}주차</Badge>
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {overdue && (
                          <Badge variant="destructive">마감 지남</Badge>
                        )}
                        {assignment.score && (
                          <Badge variant="success">
                            {assignment.score}점
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                      <CardDescription className="text-base">
                        {assignment.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        마감: {new Date(assignment.deadline).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    {assignment.submittedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          제출: {new Date(assignment.submittedAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>배점: {assignment.maxScore}점</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-3">
                    {assignment.status === "NOT_STARTED" || assignment.status === "IN_PROGRESS" ? (
                      <Dialog open={dialogOpen && selectedAssignment?.id === assignment.id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setDialogOpen(true)
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            과제 제출
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{assignment.title}</DialogTitle>
                            <DialogDescription>
                              {assignment.week}주차 과제를 제출하세요
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="content">제출 내용</Label>
                              <Textarea
                                id="content"
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                                placeholder="과제 내용을 작성하세요..."
                                rows={12}
                              />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">과제 요구사항</h4>
                              <p className="text-sm text-blue-800">{assignment.description}</p>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialogOpen(false)
                                setSubmissionContent("")
                              }}
                            >
                              취소
                            </Button>
                            <Button
                              onClick={handleSubmit}
                              disabled={submitting || !submissionContent}
                            >
                              {submitting ? "제출 중..." : "제출하기"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="outline">
                        제출 내역 확인
                      </Button>
                    )}

                    {assignment.status === "GRADED" && (
                      <Button variant="outline">
                        피드백 확인
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">과제 제출 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-purple-900">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>매주 새로운 과제가 공개됩니다</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>과제는 마감일 이전에 제출해야 합니다</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>AI가 자동으로 분석하여 피드백을 제공합니다</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>피드백을 참고하여 글을 개선해보세요</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
