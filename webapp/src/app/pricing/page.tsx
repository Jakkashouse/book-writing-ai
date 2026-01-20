import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bg-warm to-bg-cream pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-dark mb-6">
            가격 안내
          </h1>
          <p className="text-xl text-text-medium max-w-3xl mx-auto">
            6주 프로그램부터 수료 후 구독 플랜까지<br />
            당신에게 맞는 옵션을 선택하세요
          </p>
        </div>
      </section>

      {/* Main Package - Recommended */}
      <section className="bg-gradient-to-b from-bg-cream to-primary-light py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border-4 border-accent rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-8">
              <span className="inline-block bg-accent text-white px-8 py-3 rounded-full text-xl font-black mb-6">
                🔥 추천: 수익화 패키지
              </span>
              <p className="text-2xl text-gray-400 line-through mb-2">1,499만원</p>
              <p className="font-serif text-6xl font-black text-primary-dark mb-4">1,299만원</p>
              <p className="text-accent text-2xl font-bold">200만원 할인</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">6주 완성 커리큘럼 전체 (1~6주차)</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">AI 프롬프트 27종</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">템플릿 & 가이드 전체</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">1:1 멘토링 3회</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">평생 멤버십</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">6개월 AS</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">출판사 연결 (50곳+)</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">웨비나 시스템 전체</span>
              </li>
              <li className="flex items-start">
                <span className="text-success font-black mr-3 text-2xl">✓</span>
                <span className="text-lg text-text-medium">1인 출판사 설립 가이드</span>
              </li>
            </ul>

            <div className="bg-bg-warm rounded-2xl p-6 mb-8">
              <h4 className="text-xl font-bold text-accent mb-4">💰 수익화 패키지 회수 계산</h4>
              <p className="text-text-dark leading-relaxed">
                수강 후 책쓰기 코칭으로 전환 시:<br />
                • <strong>1달에 1명씩 코칭</strong> → 1년 만에 원금 회수<br />
                • <strong>1달에 2명씩 코칭</strong> → 6개월 만에 원금 회수<br />
                • <strong>1달에 4명씩 코칭</strong> → 3개월 만에 원금 회수
              </p>
            </div>

            <div className="text-center bg-primary-light rounded-2xl p-6 mb-8">
              <p className="text-text-medium mb-2">12개월 할부</p>
              <p className="font-serif text-4xl font-black text-primary-dark">월 108만원</p>
              <p className="text-text-light text-sm mt-2">하루 36,000원 (조금 괜찮은 저녁 한 끼 값)</p>
            </div>

            <div className="text-center">
              <Link
                href="#apply"
                className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mb-6"
              >
                1,299만원 신청하기 →
              </Link>
            </div>

            <div className="bg-success text-white rounded-2xl p-8 text-center">
              <h3 className="font-serif text-3xl font-black mb-4">🎁 100% 환불 보장</h3>
              <p className="text-lg leading-relaxed">
                1주차 후 100% 환불<br />
                1주차 과제 제출 / 3일 이내 신청 / 사유 안 물음 / 3영업일 이체
              </p>
              <p className="font-black text-2xl mt-4">위험 0%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Packages */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">다른 패키지</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Package 1 */}
            <div className="bg-bg-warm border-2 border-primary rounded-3xl p-10">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                원고만 완성 패키지
              </h3>
              <p className="font-serif text-5xl font-black text-primary-dark mb-6">259만원</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">1~3주차 커리큘럼</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">AI 프롬프트 7종</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">기본 템플릿 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">3개월 AS</span>
                </li>
              </ul>

              <p className="text-text-light italic mb-6">
                이런 분께 추천:<br />
                일단 원고만 완성하고 싶으신 분
              </p>

              <Link
                href="#apply"
                className="block text-center bg-white text-primary-dark border-4 border-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                신청하기
              </Link>
            </div>

            {/* Package 2 */}
            <div className="bg-bg-warm border-2 border-primary rounded-3xl p-10">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                1:1 코칭 2회 추가
              </h3>
              <p className="font-serif text-5xl font-black text-primary-dark mb-6">359만원</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">원고 완성 패키지 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium font-bold">1:1 코칭 2회</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">출판사 50곳 명단</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">4개월 AS</span>
                </li>
              </ul>

              <p className="text-text-light italic mb-6">
                이런 분께 추천:<br />
                전문가 피드백이 필요하신 분
              </p>

              <Link
                href="#apply"
                className="block text-center bg-white text-primary-dark border-4 border-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                신청하기
              </Link>
            </div>

            {/* Package 3 */}
            <div className="bg-bg-warm border-2 border-primary rounded-3xl p-10">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                출판 코칭 패키지
              </h3>
              <p className="font-serif text-5xl font-black text-primary-dark mb-6">699만원</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">1~4주차 커리큘럼 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">기획서 + 계약 전략</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">출판사 연결 + 협상</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">5개월 AS</span>
                </li>
              </ul>

              <p className="text-text-light italic mb-6">
                이런 분께 추천:<br />
                출판사 계약까지 원하시는 분
              </p>

              <Link
                href="#apply"
                className="block text-center bg-white text-primary-dark border-4 border-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                신청하기
              </Link>
            </div>

            {/* Package 4 */}
            <div className="bg-bg-warm border-2 border-primary rounded-3xl p-10">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                1:1 코칭 2회 추가
              </h3>
              <p className="font-serif text-5xl font-black text-primary-dark mb-6">799만원</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">출판 코칭 패키지 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium font-bold">1:1 코칭 2회 추가</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">전 과정 멘토링</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✅</span>
                  <span className="text-text-medium">6개월 AS</span>
                </li>
              </ul>

              <p className="text-text-light italic mb-6">
                이런 분께 추천:<br />
                밀착 관리를 원하시는 분
              </p>

              <Link
                href="#apply"
                className="block text-center bg-white text-primary-dark border-4 border-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                신청하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="bg-bg-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-4">
            수료 후 구독 플랜
          </h2>
          <p className="text-center text-text-medium mb-12">
            6주 프로그램 수료 후 지속적인 성장을 위한 구독 서비스
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">FREE</h3>
              <p className="font-serif text-4xl font-black text-text-dark mb-6">
                무료
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">커뮤니티 접근</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">월간 뉴스레터</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">기본 템플릿 업데이트</span>
                </li>
              </ul>

              <button className="w-full bg-gray-200 text-text-dark px-8 py-3 rounded-full font-bold">
                현재 플랜
              </button>
            </div>

            {/* PRO Plan */}
            <div className="bg-white rounded-3xl p-8 border-4 border-primary shadow-xl transform scale-105">
              <div className="text-center mb-4">
                <span className="inline-block bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                  인기
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">PRO</h3>
              <p className="font-serif text-4xl font-black text-primary-dark mb-2">
                99,000원
              </p>
              <p className="text-text-light text-sm mb-6">/월</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">FREE 플랜 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">월 1회 그룹 코칭</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">신규 템플릿 우선 제공</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">AI 프롬프트 월간 업데이트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">이메일 Q&A 지원</span>
                </li>
              </ul>

              <Link
                href="#apply"
                className="block text-center bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                시작하기
              </Link>
            </div>

            {/* PREMIUM Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-accent">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">PREMIUM</h3>
              <p className="font-serif text-4xl font-black text-accent mb-2">
                299,000원
              </p>
              <p className="text-text-light text-sm mb-6">/월</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">PRO 플랜 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium font-bold">월 1회 1:1 코칭</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">출판사 연결 우선 지원</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">마케팅 자료 맞춤 제작</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span className="text-text-medium">전화 상담 무제한</span>
                </li>
              </ul>

              <Link
                href="#apply"
                className="block text-center bg-accent text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">플랜 비교</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-text-dark">
                  <th className="py-4 px-4 text-left font-bold">기능</th>
                  <th className="py-4 px-4 text-center font-bold">FREE</th>
                  <th className="py-4 px-4 text-center font-bold bg-primary-light">PRO</th>
                  <th className="py-4 px-4 text-center font-bold">PREMIUM</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">커뮤니티 접근</td>
                  <td className="py-4 px-4 text-center">✓</td>
                  <td className="py-4 px-4 text-center bg-primary-light">✓</td>
                  <td className="py-4 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">월간 뉴스레터</td>
                  <td className="py-4 px-4 text-center">✓</td>
                  <td className="py-4 px-4 text-center bg-primary-light">✓</td>
                  <td className="py-4 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">그룹 코칭</td>
                  <td className="py-4 px-4 text-center text-gray-300">-</td>
                  <td className="py-4 px-4 text-center bg-primary-light font-bold">월 1회</td>
                  <td className="py-4 px-4 text-center font-bold">월 1회</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">1:1 코칭</td>
                  <td className="py-4 px-4 text-center text-gray-300">-</td>
                  <td className="py-4 px-4 text-center bg-primary-light text-gray-300">-</td>
                  <td className="py-4 px-4 text-center font-bold text-accent">월 1회</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">AI 프롬프트 업데이트</td>
                  <td className="py-4 px-4 text-center text-gray-300">-</td>
                  <td className="py-4 px-4 text-center bg-primary-light">✓</td>
                  <td className="py-4 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4">출판사 연결</td>
                  <td className="py-4 px-4 text-center text-gray-300">-</td>
                  <td className="py-4 px-4 text-center bg-primary-light text-gray-300">-</td>
                  <td className="py-4 px-4 text-center font-bold text-accent">우선 지원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-text-dark to-[#1a1816] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            지금 시작하세요
          </h2>
          <p className="text-xl text-text-light mb-12">
            6주 후, 당신은 출판 작가가 됩니다
          </p>

          <Link
            href="#apply"
            id="apply"
            className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            신청하기 →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
