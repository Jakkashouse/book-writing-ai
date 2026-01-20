"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ProgressCardProps {
  week: number
  progress: number
  wordCount: number
  assignmentsDone: number
  assignmentsTotal: number
  isCurrentWeek?: boolean
}

export function ProgressCard({
  week,
  progress,
  wordCount,
  assignmentsDone,
  assignmentsTotal,
  isCurrentWeek = false,
}: ProgressCardProps) {
  return (
    <Card className={isCurrentWeek ? "p-4 border-blue-500 border-2" : "p-4"}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">
          {week}주차
          {isCurrentWeek && (
            <Badge variant="info" className="ml-2">
              진행중
            </Badge>
          )}
        </h3>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>

      <Progress value={progress} className="mb-4" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">작성 단어 수</p>
          <p className="font-semibold text-lg">{wordCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">과제 완료</p>
          <p className="font-semibold text-lg">
            {assignmentsDone}/{assignmentsTotal}
          </p>
        </div>
      </div>
    </Card>
  )
}
