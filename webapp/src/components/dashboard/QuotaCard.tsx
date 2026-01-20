"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Video } from "lucide-react"

interface QuotaCardProps {
  type: "chatbot" | "consultation"
  used: number
  total: number
}

export function QuotaCard({ type, used, total }: QuotaCardProps) {
  const remaining = total - used
  const percentage = (used / total) * 100
  
  const config = {
    chatbot: {
      icon: MessageSquare,
      title: "AI 챗봇",
      subtitle: "주간 사용량",
      color: "blue",
    },
    consultation: {
      icon: Video,
      title: "1:1 컨설팅",
      subtitle: "6주 프로그램",
      color: "purple",
    },
  }

  const { icon: Icon, title, subtitle, color } = config[type]
  
  const getStatusColor = () => {
    if (percentage >= 90) return "destructive"
    if (percentage >= 70) return "warning"
    return "success"
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <Badge variant={getStatusColor()}>
          {remaining}회 남음
        </Badge>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">{used}</span>
        <span className="text-gray-500 dark:text-gray-400 mb-1">/ {total}회</span>
      </div>

      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-600 transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  )
}
