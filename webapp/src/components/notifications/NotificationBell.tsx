"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Notification {
  id: string
  type: "ASSIGNMENT_DUE" | "CRISIS_ALERT" | "MILESTONE" | "CONSULTATION_REMINDER" | "SYSTEM"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

interface NotificationBellProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationBell({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    const icons = {
      ASSIGNMENT_DUE: "📝",
      CRISIS_ALERT: "⚠️",
      MILESTONE: "🎉",
      CONSULTATION_REMINDER: "📞",
      SYSTEM: "ℹ️"
    }
    return icons[type as keyof typeof icons] || "📌"
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">알림</h3>
              {unreadCount > 0 && (
                <button onClick={onMarkAllAsRead} className="text-sm text-blue-600 hover:underline">
                  모두 읽음 표시
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">새로운 알림이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => onMarkAsRead(notification.id)}
                    className={"p-3 rounded-lg cursor-pointer transition-colors " + (notification.isRead ? "bg-gray-50 dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900")}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="info" className="ml-2">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}