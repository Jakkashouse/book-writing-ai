import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-bg-warm to-bg-cream pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-50">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-primary/8 to-transparent animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-text-dark mb-8 leading-tight animate-fade-in-up">
              29년 못 쓴 사람도
              <span className="block text-accent mt-4">2달 만에 출간했습니다</span>
            </h1>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary mb-12 animate-fade-in-up animation-delay-200">
              <p className="text-xl text-text-medium leading-relaxed">
                박○○님 (45세): "27년째 책쓰기 포기 → 코칭 받고 3주 만에 초고 완성 → 2달 만에 출간"
              </p>
              <p className="text-accent font-bold text-2xl mt-6">당신도 됩니다. 지금 증명합니다.</p>
            </div>

            <Link
              href="#apply"
              className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              6주 만에 책 완성하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Data Shock Section */}
      <section className="bg-white py-20 border-t border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            데이터가 증명합니다
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-warm rounded-2xl p-8 text-center">
              <div className="font-serif text-5xl font-black text-primary-dark mb-2">99%</div>
              <p className="text-text-light">출간률 (딱 1명 제외)</p>
            </div>
            <div className="bg-bg-warm rounded-2xl p-8 text-center">
              <div className="font-serif text-5xl font-black text-primary-dark mb-2">100%</div>
              <p className="text-text-light">출판사 계약률</p>
            </div>
            <div className="bg-bg-warm rounded-2xl p-8 text-center">
              <div className="font-serif text-5xl font-black text-primary-dark mb-2">1,200만원</div>
              <p className="text-text-light">1년 만에 연 수익<br /><small className="text-sm">(누구나 가능)</small></p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-br from-primary-light to-bg-warm border-4 border-primary rounded-3xl p-12 text-center">
            <h3 className="font-serif text-3xl font-black text-accent mb-8">
              6주 동안 뭘 받는데요?
            </h3>
            <p className="text-2xl text-text-dark">
              원칙: <span className="text-accent font-black">"이거 하나만 받아도 본전"</span>
            </p>
          </div>
        </div>
      </section>

      {/* 6-Week Curriculum Preview */}
      <section className="bg-bg-cream py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            6주 커리큘럼
          </h2>

          <div className="space-y-6">
            {/* Week 1 */}
            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-primary hover:shadow-xl transition-shadow">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                1주차: 제목이 전부였습니다
              </h3>
              <p className="text-text-medium mb-4">
                출판사가 바로 계약하는 제목 공식 10가지 + 1일 만에 완성하는 40꼭지 목차 시스템
              </p>
              <div className="inline-block bg-accent text-white px-6 py-2 rounded-full text-sm font-bold">
                가치: 160만원 상당
              </div>
            </div>

            {/* Week 2 */}
            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-primary hover:shadow-xl transition-shadow">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                2주차: AI 80% + 나 20% 시스템
              </h3>
              <p className="text-text-medium mb-4">
                글쓰기 5+5 시스템 + AI 프롬프트 7종으로 3시간을 30분으로 단축
              </p>
              <div className="inline-block bg-accent text-white px-6 py-2 rounded-full text-sm font-bold">
                가치: 220만원 상당
              </div>
            </div>

            {/* Week 3 */}
            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-primary hover:shadow-xl transition-shadow">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                3주차: 5분 만에 계약서 받는 기획서
              </h3>
              <p className="text-text-medium mb-4">
                출판사 계약률 30%의 비밀 + 500만원 손해 방지하는 계약서 체크리스트
              </p>
              <div className="inline-block bg-accent text-white px-6 py-2 rounded-full text-sm font-bold">
                가치: 230만원 상당
              </div>
            </div>

            {/* Week 4-6 Preview */}
            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-primary hover:shadow-xl transition-shadow">
              <h3 className="font-serif text-2xl font-bold text-text-dark mb-4">
                4-6주차: 출간 전 베스트셀러 + 1인 출판사
              </h3>
              <p className="text-text-medium mb-4">
                출간 전 마케팅 + 웨비나 시스템 + 1인 출판사 독립 + 정부지원금 4,500만원
              </p>
              <div className="inline-block bg-accent text-white px-6 py-2 rounded-full text-sm font-bold">
                가치: 측정 불가
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/program"
              className="inline-block bg-white text-primary-dark border-4 border-primary px-10 py-3 rounded-full text-lg font-bold hover:shadow-lg transition-all"
            >
              전체 커리큘럼 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            실제 후기 (증거)
          </h2>

          <div className="space-y-6">
            <div className="bg-text-dark text-white rounded-3xl p-10 text-center">
              <p className="font-serif text-2xl mb-4 leading-relaxed">
                "6주 → 계약, 3개월 → 강의 8건, 6개월 → 4,200만원"
              </p>
              <p className="text-primary font-bold">- 김○○님 (30대, 2024.07)</p>
            </div>

            <div className="bg-text-dark text-white rounded-3xl p-10 text-center">
              <p className="font-serif text-2xl mb-4 leading-relaxed">
                "5년 못 쓰다가 4주 만에 완성"
              </p>
              <p className="text-primary font-bold">- 이○○님 (40대, 2024.08)</p>
            </div>

            <div className="bg-text-dark text-white rounded-3xl p-10 text-center">
              <p className="font-serif text-2xl mb-4 leading-relaxed">
                "첫 회에서 1.65억. 10배 벌었어요"
              </p>
              <p className="text-primary font-bold">- 최○○님 (40대, 2024.09)</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-bg-cream py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            걱정되시나요?
          </h2>

          <div className="space-y-6">
            <div className="bg-bg-warm rounded-2xl p-8">
              <p className="text-xl font-bold text-text-dark mb-4">😰 "글 못 써요"</p>
              <p className="text-text-medium leading-relaxed">
                <span className="text-accent font-bold">70대도 30분 만에 주제 3개 찾았습니다.</span><br />
                5+5 시스템으로 말하듯 쓰면 됩니다. AI가 80% 자동으로 써줍니다.<br />
                완성률 <span className="text-accent font-bold">87%</span>가 증명합니다.
              </p>
            </div>

            <div className="bg-bg-warm rounded-2xl p-8">
              <p className="text-xl font-bold text-text-dark mb-4">😰 "시간 없어요"</p>
              <p className="text-text-medium leading-relaxed">
                <span className="text-accent font-bold">주 5시간 (하루 1시간)만 투자하세요.</span><br />
                강의 2시간 (출퇴근 중 청취) + 과제 3시간 (주말)<br />
                6주면 초고 완성됩니다.
              </p>
            </div>

            <div className="bg-bg-warm rounded-2xl p-8">
              <p className="text-xl font-bold text-text-dark mb-4">😰 "회수 가능한가요?"</p>
              <p className="text-text-medium leading-relaxed">
                <span className="text-accent font-bold">평균 6개월 회수</span><br />
                강의, 컨설팅으로 1년 만에 연 1,200만원 수익 누구나 가능합니다.<br />
                수강생 73%가 강의로 전환했습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-text-dark to-[#1a1816] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12">
            6개월 후, 당신의 모습은?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 rounded-3xl p-10">
              <h3 className="text-primary text-2xl font-bold mb-6">✅ 신청하면</h3>
              <p className="text-lg leading-relaxed">
                ☕ 내 책 읽는 사람 목격<br />
                📧 강의 제안 (50만원)<br />
                👶 "엄마/아빠 작가야"<br />
                💰 월 평균 230만원
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl p-10">
              <h3 className="text-gray-400 text-2xl font-bold mb-6">❌ 안 하면</h3>
              <p className="text-lg leading-relaxed text-gray-400">
                😔 "언젠가는..."<br />
                📱 남의 책 부러워함<br />
                💸 월급만<br />
                😭 "그때 할걸..."
              </p>
            </div>
          </div>

          <p className="text-primary text-3xl font-black mb-8">🔥 7자리 남음</p>

          <Link
            href="#apply"
            id="apply"
            className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mb-4"
          >
            1,299만원 신청하기 →
          </Link>

          <p className="text-text-light">⏰ 마감 시 1,999만원</p>

          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="font-serif text-3xl font-bold mb-6">
              "1년 후 후회 vs 지금 도전"
            </p>
            <p className="text-xl text-primary">👉 선택은 당신의 몫입니다 👈</p>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, currentColor 0%, transparent 50%);
        }
      `}</style>
    </div>
  );
}
