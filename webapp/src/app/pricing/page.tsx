import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '가격 안내 — 6주 책쓰기 프로그램 패키지',
  description:
    '작가의 집 6주 책쓰기 프로그램 가격·구성·환불 안내. 1년 후 1,200만원 수익으로 회수 가능.',
  alternates: { canonical: '/pricing' },
};

const tiers = [
  {
    step: 1,
    name: '무료 콘텐츠',
    price: '무료',
    priceNum: '',
    description: '책쓰기에 관심 있는 누구나',
    features: [
      '유튜브 / 블로그 콘텐츠',
      '무료 웨비나 참석',
      '뉴스레터 구독',
      '커뮤니티 접근',
    ],
    cta: '무료로 시작하기',
    href: '#apply',
    style: 'basic',
  },
  {
    step: 2,
    name: '전자책 / 워크북',
    price: '29,000원',
    priceNum: '29,000',
    description: '혼자서 시작해보고 싶은 분',
    features: [
      '책쓰기 셀프 가이드 전자책',
      '40꼭지 워크시트',
      'AI 프롬프트 기본 5종',
      '셀프 체크리스트',
    ],
    cta: '구매하기',
    href: '#apply',
    style: 'basic',
  },
  {
    step: 3,
    name: '온라인 클래스',
    price: '39만원',
    priceNum: '390,000',
    description: '체계적으로 배우고 싶은 분',
    features: [
      '6주 온라인 커리큘럼 (영상)',
      'AI 프롬프트 15종',
      '템플릿 & 가이드 전체',
      '커뮤니티 질문 무제한',
      '수료증 발급',
    ],
    cta: '수강 신청',
    href: '#apply',
    style: 'basic',
  },
  {
    step: 4,
    name: '그룹 코칭',
    price: '99만원',
    priceNum: '990,000',
    description: '피드백과 동기부여가 필요한 분',
    features: [
      '온라인 클래스 전체 포함',
      '6주 그룹 코칭 (주 1회 라이브)',
      'AI 프롬프트 27종',
      '과제 피드백 매주 제공',
      '동기 네트워킹',
    ],
    cta: '코칭 신청',
    href: '#apply',
    style: 'popular',
    badge: '인기',
  },
  {
    step: 5,
    name: '1:1 코칭',
    price: '330만원',
    priceNum: '3,300,000',
    description: '맞춤형 밀착 관리를 원하는 분',
    features: [
      '그룹 코칭 전체 포함',
      '1:1 멘토링 6회 (주 1회)',
      '원고 심층 피드백',
      '출판사 50곳 연결 명단',
      '출판 기획서 작성 지원',
      '4개월 AS',
    ],
    cta: '1:1 코칭 신청',
    href: '#apply',
    style: 'highlight',
  },
  {
    step: 6,
    name: '출판 패키지',
    price: '770만원',
    priceNum: '7,700,000',
    description: '출판사 계약까지 함께 가고 싶은 분',
    features: [
      '1:1 코칭 전체 포함',
      '출판사 연결 + 계약 협상 대행',
      '원고 편집 / 교정 / 교열',
      '표지 디자인 컨설팅',
      '마케팅 자료 제작 (보도자료 등)',
      '10개월에 10억 번 비결이 담긴 비즈니스 PT',
      '연매출 100억 사업가에게 배운 웨비나 비법 및 AI 활용법',
      '6개월 AS',
    ],
    cta: '출판 패키지 신청',
    href: '#apply',
    style: 'highlight',
  },
  {
    step: 7,
    name: '수익화 패키지',
    price: '1,200만원',
    priceNum: '12,000,000',
    description: '책으로 사업을 만들고 싶은 분',
    features: [
      '출판 패키지 전체 포함',
      '1인 출판사 설립 가이드',
      '웨비나 / 강연 시스템 구축',
      '온라인 코칭 사업 설계',
      '마케팅 퍼널 구축 지원',
      '평생 멤버십 + 12개월 AS',
    ],
    cta: '수익화 패키지 신청',
    href: '#apply',
    style: 'premium',
    badge: '추천',
  },
];

function TierCard({ tier }: { tier: typeof tiers[number] }) {
  const isPremium = tier.style === 'premium';
  const isHighlight = tier.style === 'highlight';
  const isPopular = tier.style === 'popular';

  const borderClass = isPremium
    ? 'border-4 border-accent shadow-2xl scale-[1.02]'
    : isHighlight
    ? 'border-2 border-primary shadow-lg'
    : isPopular
    ? 'border-2 border-primary shadow-lg'
    : 'border border-gray-200';

  const btnClass = isPremium
    ? 'bg-gradient-to-r from-accent to-[#c0392b] text-white hover:shadow-xl'
    : isHighlight || isPopular
    ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg'
    : 'bg-white text-primary-dark border-2 border-primary hover:shadow-lg';

  return (
    <div className={`bg-white rounded-2xl p-8 flex flex-col relative ${borderClass} transition-all`}>
      {tier.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white ${
            isPremium ? 'bg-accent' : 'bg-primary'
          }`}
        >
          {tier.badge}
        </span>
      )}

      <div className="text-center mb-6">
        <p className="text-sm font-bold text-text-light mb-1">STEP {tier.step}</p>
        <h3 className="font-serif text-xl font-bold text-text-dark mb-2">{tier.name}</h3>
        <p className="font-serif text-3xl font-black text-primary-dark mb-1">{tier.price}</p>
        <p className="text-sm text-text-light">{tier.description}</p>
      </div>

      <ul className="space-y-2 mb-8 flex-1">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start text-sm">
            <span className="text-success mr-2 mt-0.5">✓</span>
            <span className="text-text-medium">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={tier.href}
        className={`block text-center px-6 py-3 rounded-full font-bold transition-all ${btnClass}`}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bg-warm to-bg-cream pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-dark mb-6">
            7단계 상품 사다리
          </h1>
          <p className="text-xl text-text-medium max-w-3xl mx-auto">
            무료부터 수익화까지, 당신의 단계에 맞는 옵션을 선택하세요
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="bg-gradient-to-b from-bg-cream to-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1 mb-12 overflow-x-auto pb-4">
            {tiers.map((t, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    t.style === 'premium'
                      ? 'bg-accent text-white'
                      : t.style === 'highlight' || t.style === 'popular'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-text-dark'
                  }`}
                >
                  {t.step}
                </div>
                {i < tiers.length - 1 && (
                  <div className="w-6 h-0.5 bg-gray-300 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Top Row: Steps 1-4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tiers.slice(0, 4).map((tier) => (
              <TierCard key={tier.step} tier={tier} />
            ))}
          </div>

          {/* Bottom Row: Steps 5-7 (larger cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.slice(4).map((tier) => (
              <TierCard key={tier.step} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section for Top Tier */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-bg-warm rounded-3xl p-10">
            <h2 className="font-serif text-3xl font-bold text-center mb-8">
              수익화 패키지, 얼마나 빨리 회수할 수 있을까?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-2xl p-6 shadow">
                <p className="text-4xl font-black text-primary-dark mb-2">12개월</p>
                <p className="text-text-medium">월 1명 코칭 시</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow">
                <p className="text-4xl font-black text-primary-dark mb-2">6개월</p>
                <p className="text-text-medium">월 2명 코칭 시</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow">
                <p className="text-4xl font-black text-accent mb-2">3개월</p>
                <p className="text-text-medium">월 4명 코칭 시</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-bg-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">단계별 비교</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow">
              <thead>
                <tr className="border-b-2 border-text-dark">
                  <th className="py-4 px-3 text-left font-bold text-sm">포함 항목</th>
                  <th className="py-4 px-2 text-center font-bold text-xs">무료</th>
                  <th className="py-4 px-2 text-center font-bold text-xs">전자책</th>
                  <th className="py-4 px-2 text-center font-bold text-xs">클래스</th>
                  <th className="py-4 px-2 text-center font-bold text-xs bg-primary-light">그룹</th>
                  <th className="py-4 px-2 text-center font-bold text-xs">1:1</th>
                  <th className="py-4 px-2 text-center font-bold text-xs">출판</th>
                  <th className="py-4 px-2 text-center font-bold text-xs bg-accent/10">수익화</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { label: '콘텐츠 / 뉴스레터', vals: [1, 1, 1, 1, 1, 1, 1] },
                  { label: '전자책 / 워크시트', vals: [0, 1, 1, 1, 1, 1, 1] },
                  { label: '온라인 커리큘럼 (영상)', vals: [0, 0, 1, 1, 1, 1, 1] },
                  { label: 'AI 프롬프트', vals: [0, '5종', '15종', '27종', '27종', '27종', '27종'] },
                  { label: '그룹 코칭 (주 1회)', vals: [0, 0, 0, 1, 1, 1, 1] },
                  { label: '1:1 멘토링', vals: [0, 0, 0, 0, '6회', '6회+', '6회+'] },
                  { label: '출판사 연결 / 계약', vals: [0, 0, 0, 0, '명단', '대행', '대행'] },
                  { label: '원고 편집 / 교정', vals: [0, 0, 0, 0, 0, 1, 1] },
                  { label: '마케팅 자료 제작', vals: [0, 0, 0, 0, 0, 1, 1] },
                  { label: '사업 설계 / 웨비나', vals: [0, 0, 0, 0, 0, 0, 1] },
                  { label: '평생 멤버십', vals: [0, 0, 0, 0, 0, 0, 1] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-3 text-text-dark">{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td
                        key={j}
                        className={`py-3 px-2 text-center ${
                          j === 3 ? 'bg-primary-light' : j === 6 ? 'bg-accent/5' : ''
                        }`}
                      >
                        {v === 1 ? (
                          <span className="text-success font-bold">✓</span>
                        ) : v === 0 ? (
                          <span className="text-gray-300">-</span>
                        ) : (
                          <span className="font-bold text-text-dark">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Refund Guarantee */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-success text-white rounded-3xl p-10 text-center">
            <h3 className="font-serif text-3xl font-black mb-4">100% 환불 보장</h3>
            <p className="text-lg leading-relaxed">
              1주차 과제 제출 후 3일 이내 신청 시 100% 환불<br />
              사유를 묻지 않습니다 · 3영업일 이내 환불
            </p>
            <p className="font-black text-2xl mt-4">위험 0%</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-text-dark to-[#1a1816] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            어디서부터 시작할지 모르겠다면?
          </h2>
          <p className="text-xl text-text-light mb-8">
            무료 웨비나에 먼저 참석해보세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center" id="apply">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              무료 웨비나 신청 →
            </Link>
            <Link
              href="/"
              className="inline-block bg-white/10 text-white border-2 border-white/30 px-10 py-4 rounded-full text-lg font-bold hover:bg-white/20 transition-all"
            >
              1:1 상담 예약 →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
