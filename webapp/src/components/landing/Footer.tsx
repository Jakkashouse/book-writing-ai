import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-text-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-serif mb-4">6주 책쓰기</h3>
            <p className="text-text-light text-sm">
              29년 못 쓴 사람도<br />
              2달 만에 출간합니다
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">페이지</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-text-light hover:text-white transition-colors">
                홈
              </Link>
              <Link href="/program" className="text-text-light hover:text-white transition-colors">
                프로그램
              </Link>
              <Link href="/pricing" className="text-text-light hover:text-white transition-colors">
                가격
              </Link>
              <Link href="/about" className="text-text-light hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">문의</h4>
            <div className="flex flex-col gap-2 text-sm text-text-light">
              <p>이메일: contact@example.com</p>
              <p>전화: 010-XXXX-XXXX</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">소셜</h4>
            <div className="flex gap-4">
              <a href="#" className="text-text-light hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className="text-text-light hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-text-light">
          <p>&copy; 2026 6주 책쓰기. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
