"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate?: string
  completed: boolean
  priority?: "high" | "medium" | "low"
}

interface NextTasksCardProps {
  tasks: Task[]
}

export function NextTasksCard({ tasks }: NextTasksCardProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "warning"
      default: return "info"
    }
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">다음 할 일</h3>
        <Badge variant="outline">{tasks.filter(t => !t.completed).length}개 남음</Badge>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-center py-4 text-gray-500">모든 작업을 완료했습니다!</p>
        )}
        {tasks.map((task) => {
          const daysUntil = getDaysUntilDue(task.dueDate)
          return (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={task.completed ? "line-through text-gray-500" : "font-medium"}>{task.title}</p>
                {task.dueDate && !task.completed && daysUntil !== null && daysUntil <= 3 && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <Clock className="w-3 h-3" />
                    <span>D-{daysUntil}</span>
                  </div>
                )}
              </div>
              {task.priority && !task.completed && (
                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}