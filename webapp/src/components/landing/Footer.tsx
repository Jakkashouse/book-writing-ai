import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-text-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-serif mb-4">작가의 집</h3>
            <p className="text-text-light text-sm leading-relaxed">
              당신의 서사가<br />
              마스터피스가 되는 곳
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">페이지</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-text-light hover:text-white transition-colors">홈</Link>
              <Link href="/program" className="text-text-light hover:text-white transition-colors">프로그램</Link>
              <Link href="/pricing" className="text-text-light hover:text-white transition-colors">가격</Link>
              <Link href="/about" className="text-text-light hover:text-white transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">문의</h4>
            <div className="flex flex-col gap-2 text-sm text-text-light">
              <p>
                <a href="mailto:huang1234@naver.com" className="hover:text-white transition-colors">
                  huang1234@naver.com
                </a>
              </p>
              <p>
                <a href="tel:+8270-4070-0755" className="hover:text-white transition-colors">
                  070-4070-0755
                </a>
                <span className="block text-xs mt-1">(평일 10:00~18:00)</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">사업자 정보</h4>
            <div className="flex flex-col gap-1 text-xs text-text-light leading-relaxed">
              <p>주식회사 작가의 집</p>
              <p>대표 황준연</p>
              <p>제주특별자치도 제주시</p>
              <p>광양9길 27, 202호</p>
              <p>사업자 577-28-00969</p>
              <p className="mt-1">통신판매업 신고면제<br />(전자상거래법 시행령 제15조)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-text-light">
          <p>&copy; 2026 주식회사 작가의 집. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
