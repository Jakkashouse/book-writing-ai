"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Video } from "lucide-react"

interface TimeSlot {
  time: string
  available: boolean
}

interface ConsultationCalendarProps {
  availableSlots: { [date: string]: TimeSlot[] }
  onBookConsultation: (date: string, time: string) => Promise<void>
  bookedConsultations: Array<{ date: string; time: string; meetingLink?: string }>
  remainingSlots: number
  totalSlots: number
}

export function ConsultationCalendar({
  availableSlots,
  onBookConsultation,
  bookedConsultations,
  remainingSlots,
  totalSlots
}: ConsultationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isBooking, setIsBooking] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || remainingSlots <= 0) return
    
    setIsBooking(true)
    try {
      await onBookConsultation(selectedDate, selectedTime)
      setSelectedDate("")
      setSelectedTime("")
    } catch (error) {
      console.error("Failed to book consultation:", error)
    } finally {
      setIsBooking(false)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-xl">1:1 컨설팅 예약</h3>
        <Badge variant={remainingSlots > 0 ? "success" : "destructive"}>
          {remainingSlots}/{totalSlots}회 남음
        </Badge>
      </div>

      {bookedConsultations.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Video className="w-4 h-4" />
            예약된 컨설팅
          </h4>
          {bookedConsultations.map((consultation, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-t border-blue-200 dark:border-blue-700">
              <div>
                <p className="font-medium">{consultation.date} {consultation.time}</p>
                {consultation.meetingLink && (
                  <a href={consultation.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    화상회의 참여
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="font-semibold">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h4>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            
            const dateStr = day.toISOString().split('T')[0]
            const hasSlots = availableSlots[dateStr] && availableSlots[dateStr].some(s => s.available)
            const isSelected = selectedDate === dateStr
            
            return (
              <button
                key={i}
                onClick={() => hasSlots && setSelectedDate(dateStr)}
                disabled={!hasSlots}
                className={"p-2 text-center rounded-lg transition-colors " + (isSelected ? "bg-blue-600 text-white" : hasSlots ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-700")}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && availableSlots[selectedDate] && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">시간 선택</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots[selectedDate].map((slot, i) => (
              <button
                key={i}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={"p-2 text-sm rounded border transition-colors " + (selectedTime === slot.time ? "bg-blue-600 text-white border-blue-600" : slot.available ? "border-gray-300 hover:border-blue-600" : "border-gray-200 text-gray-300")}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <Button onClick={handleBook} disabled={isBooking || remainingSlots <= 0} className="w-full">
          {isBooking ? "예약 중..." : "컨설팅 예약하기"}
        </Button>
      )}
    </Card>
  )
}