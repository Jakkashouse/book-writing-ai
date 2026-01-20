'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-accent">
            6주 책쓰기
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-text-dark hover:text-accent transition-colors">
              홈
            </Link>
            <Link href="/program" className="text-text-dark hover:text-accent transition-colors">
              프로그램
            </Link>
            <Link href="/pricing" className="text-text-dark hover:text-accent transition-colors">
              가격
            </Link>
            <Link href="/about" className="text-text-dark hover:text-accent transition-colors">
              About
            </Link>
            <Link
              href="#apply"
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition-all"
            >
              신청하기
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-dark"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col gap-4 mt-4 pb-4">
            <Link href="/" className="text-text-dark hover:text-accent transition-colors">
              홈
            </Link>
            <Link href="/program" className="text-text-dark hover:text-accent transition-colors">
              프로그램
            </Link>
            <Link href="/pricing" className="text-text-dark hover:text-accent transition-colors">
              가격
            </Link>
            <Link href="/about" className="text-text-dark hover:text-accent transition-colors">
              About
            </Link>
            <Link
              href="#apply"
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-bold text-center hover:shadow-lg transition-all"
            >
              신청하기
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
