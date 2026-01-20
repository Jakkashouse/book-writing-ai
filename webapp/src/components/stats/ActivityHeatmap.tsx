"use client"

import { Card } from "@/components/ui/card"

interface ActivityData {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data: ActivityData[]
  weeks?: number
}

export function ActivityHeatmap({ data, weeks = 6 }: ActivityHeatmapProps) {
  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count <= 2) return 'bg-green-200 dark:bg-green-900'
    if (count <= 5) return 'bg-green-400 dark:bg-green-700'
    if (count <= 10) return 'bg-green-600 dark:bg-green-500'
    return 'bg-green-800 dark:bg-green-300'
  }

  const days = ['일', '월', '화', '수', '목', '금', '토']
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-4">활동 히트맵</h3>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (weeks * 7 - i - 1))
            const dateStr = date.toISOString().split('T')[0]
            const activity = data.find(d => d.date === dateStr)
            const count = activity?.count || 0
            
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {i % 7 === 0 && <span className="text-xs text-gray-500 h-4">{days[date.getDay()]}</span>}
                <div className={'w-3 h-3 rounded-sm ' + getColorIntensity(count)} title={dateStr + ': ' + count + '개 활동'} />
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>활동 적음</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={'w-3 h-3 rounded-sm ' + getColorIntensity(i * 3)} />
          ))}
        </div>
        <span>활동 많음</span>
      </div>
    </Card>
  )
}