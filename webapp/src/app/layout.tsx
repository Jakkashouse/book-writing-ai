import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "29년 못 쓴 사람도 2달 만에 출간 | 6주 책쓰기 완성 프로그램",
  description: "출간률 99%, 계약률 100%. 6주 만에 책 완성하고 1년 만에 1,200만원 수익 창출. AI 프롬프트 27종과 1:1 컨설팅으로 당신도 작가가 됩니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
