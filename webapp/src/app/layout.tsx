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

const siteUrl = "https://expert-workbook.vercel.app";
const siteName = "작가의 집";
const defaultTitle = "작가의 집 — 당신의 서사가 마스터피스가 되는 곳";
const defaultDescription =
  "출간률 99%, 계약률 100%. 6주 만에 책을 완성하고 1년 만에 1,200만원 수익을 만드는 작가의 집의 책쓰기 코칭·자서전 챌린지·CEO 브랜딩 프로그램.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | 작가의 집",
  },
  description: defaultDescription,
  keywords: [
    "작가의 집",
    "책쓰기 코칭",
    "6주 책쓰기",
    "자서전",
    "CEO 브랜딩",
    "1인 출판",
    "AI 책쓰기",
    "출간 코칭",
    "황준연",
  ],
  authors: [{ name: "황준연" }],
  creator: "주식회사 작가의 집",
  publisher: "주식회사 작가의 집",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "주식회사 작가의 집",
    alternateName: "작가의 집",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    email: "huang1234@naver.com",
    telephone: "+82-70-4070-0755",
    address: {
      "@type": "PostalAddress",
      streetAddress: "광양9길 27, 202호",
      addressLocality: "제주시",
      addressRegion: "제주특별자치도",
      addressCountry: "KR",
    },
    founder: { "@type": "Person", name: "황준연" },
  };

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
