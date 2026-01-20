"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, FileText, MessageSquare, User } from "lucide-react"

const NAV_ITEMS = [
  {
    name: "홈",
    href: "/",
    icon: Home,
  },
  {
    name: "대시보드",
    href: "/dashboard",
    icon: BookOpen,
  },
  {
    name: "과제",
    href: "/assignments",
    icon: FileText,
  },
  {
    name: "피드백",
    href: "/feedback",
    icon: MessageSquare,
  },
]

export default function Navigation() {
  const pathname = usePathname()

  // 랜딩 페이지에서는 네비게이션 숨김
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">책쓰기 AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <User className="h-4 w-4" />
              <span>내 정보</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
