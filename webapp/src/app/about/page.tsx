import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bg-warm to-bg-cream pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-dark mb-6">
            About
          </h1>
          <p className="text-xl text-text-medium max-w-3xl mx-auto">
            29년 못 쓴 사람도 2달 만에 출간시키는<br />
            검증된 시스템과 강사를 소개합니다
          </p>
        </div>
      </section>

      {/* Instructor Introduction */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="bg-gradient-to-br from-primary-light to-bg-warm rounded-3xl p-12 text-center">
                <div className="w-48 h-48 mx-auto bg-text-dark rounded-full mb-6 flex items-center justify-center">
                  <span className="text-6xl text-white font-serif">황</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-text-dark mb-2">황준연</h2>
                <p className="text-primary-dark font-bold text-xl">6주 책쓰기 프로그램 대표</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-3xl font-bold text-text-dark mb-6">
                강사 소개
              </h3>
              <div className="space-y-4 text-lg text-text-medium leading-relaxed">
                <p>
                  <span className="text-accent font-bold">10년간 52권 출간</span>의 경험을 바탕으로
                  누구나 책을 쓸 수 있는 시스템을 개발했습니다.
                </p>
                <p>
                  완벽주의와 두려움으로 시작조차 못하는 분들을 위해
                  <span className="text-accent font-bold"> AI 80% + 나 20% 시스템</span>을 만들었습니다.
                </p>
                <p>
                  단순히 책을 쓰는 것이 아니라, 책으로 <span className="text-accent font-bold">수익을 창출</span>하고
                  <span className="text-accent font-bold"> 1인 출판사</span>로 독립할 수 있도록 돕습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Key Achievements */}
          <div className="bg-bg-warm rounded-3xl p-12">
            <h3 className="font-serif text-2xl font-bold text-center text-text-dark mb-8">
              주요 경력 및 실적
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="font-serif text-4xl font-black text-primary-dark mb-2">52권</div>
                <p className="text-text-medium">10년간 출간</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="font-serif text-4xl font-black text-primary-dark mb-2">99%</div>
                <p className="text-text-medium">수강생 출간률</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="font-serif text-4xl font-black text-primary-dark mb-2">100%</div>
                <p className="text-text-medium">출판사 계약률</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publishing Track Record */}
      <section className="bg-bg-cream py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center text-text-dark mb-12">
            출판 실적
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border-l-8 border-primary">
              <h3 className="text-2xl font-bold text-accent mb-4">개인 출간</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary font-black mr-3">📚</span>
                  <div>
                    <p className="font-bold text-text-dark">52권 출간 (10년)</p>
                    <p className="text-text-light text-sm">자기계발, 비즈니스, 창업 분야</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black mr-3">🏆</span>
                  <div>
                    <p className="font-bold text-text-dark">베스트셀러 5권</p>
                    <p className="text-text-light text-sm">교보문고, 예스24 분야별 1위</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-black mr-3">💰</span>
                  <div>
                    <p className="font-bold text-text-dark">연 1억 이상 수익</p>
                    <p className="text-text-light text-sm">책 인세 + 강의 + 컨설팅</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-8 border-l-8 border-accent">
              <h3 className="text-2xl font-bold text-accent mb-4">작가의 집 (1인 출판사)</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-accent font-black mr-3">📖</span>
                  <div>
                    <p className="font-bold text-text-dark">주 1권 출간 시스템</p>
                    <p className="text-text-light text-sm">연 52권 출간 자동화 워크플로우</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-accent font-black mr-3">👥</span>
                  <div>
                    <p className="font-bold text-text-dark">편집장 1명 + 직원 1명</p>
                    <p className="text-text-light text-sm">최소 인력으로 최대 생산성</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-accent font-black mr-3">💵</span>
                  <div>
                    <p className="font-bold text-text-dark">연 1.3억 수익</p>
                    <p className="text-text-light text-sm">시스템화된 출판 비즈니스 모델</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Published Books Gallery */}
      <section className="bg-white py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center text-text-dark mb-4">
            출간 도서
          </h2>
          <p className="text-center text-text-medium mb-12">
            작가의 집에서 세상에 나온 책들
          </p>

          {/* Scrolling rows */}
          <div className="space-y-6">
            {/* Row 1 - scroll left */}
            <div className="relative">
              <div className="flex gap-4 animate-scroll-left">
                {[
                  { src: '/books/하루1시간_책쓰기의기적.jpg', title: '하루 1시간, 책쓰기의 기적' },
                  { src: '/books/클로드AI로_글쓰기.jpg', title: '클로드 AI로 글쓰기' },
                  { src: '/books/재개발의_여왕.png', title: '재개발의 여왕' },
                  { src: '/books/내이름_네이버에_벅벅_도배하기.jpg', title: '내 이름 네이버에 벅벅 도배하기' },
                  { src: '/books/동료의힘.jpg', title: '동료의 힘' },
                  { src: '/books/오롯이_셋이서_하와이.jpg', title: '오롯이 셋이서 하와이' },
                  { src: '/books/사랑은_짜장면이야.jpg', title: '사랑은 짜장면이야' },
                  { src: '/books/시간의자국.png', title: '시간의 자국' },
                  { src: '/books/마음이_자라는_책방.jpg', title: '마음이 자라는 책방' },
                  { src: '/books/인생은_한권의_아름다운_책이다.jpg', title: '인생은 한 권의 아름다운 책이다' },
                  { src: '/books/책을_이렇게_쉽게_써도_되나요.jpg', title: '책을 이렇게 쉽게 써도 되나요?' },
                  { src: '/books/예비작가들이_묻고_작가가_답하다.jpg', title: '예비작가들이 묻고 작가가 답하다' },
                  { src: '/books/40년_라켓이_가르쳐준것.jpg', title: '40년, 라켓이 가르쳐준 것' },
                  { src: '/books/스킨십_10분의_기적.jpg', title: '스킨십 10분의 기적' },
                  { src: '/books/하루1시간_책쓰기의기적.jpg', title: '하루 1시간, 책쓰기의 기적' },
                  { src: '/books/클로드AI로_글쓰기.jpg', title: '클로드 AI로 글쓰기' },
                  { src: '/books/재개발의_여왕.png', title: '재개발의 여왕' },
                  { src: '/books/내이름_네이버에_벅벅_도배하기.jpg', title: '내 이름 네이버에 벅벅 도배하기' },
                  { src: '/books/동료의힘.jpg', title: '동료의 힘' },
                  { src: '/books/오롯이_셋이서_하와이.jpg', title: '오롯이 셋이서 하와이' },
                  { src: '/books/사랑은_짜장면이야.jpg', title: '사랑은 짜장면이야' },
                  { src: '/books/시간의자국.png', title: '시간의 자국' },
                ].map((book, i) => (
                  <div key={i} className="flex-shrink-0 w-[140px] group">
                    <div className="relative w-[140px] h-[200px] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                      <Image src={book.src} alt={book.title} fill className="object-cover" sizes="140px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - scroll right */}
            <div className="relative">
              <div className="flex gap-4 animate-scroll-right">
                {[
                  { src: '/books/당신만의_속도로_괜찮습니다.jpg', title: '당신만의 속도로 괜찮습니다' },
                  { src: '/books/괜찮아_나를위한시간.jpg', title: '괜찮아, 나를 위한 시간' },
                  { src: '/books/너니까_하는거야.jpg', title: '너니까 하는 거야' },
                  { src: '/books/오색체질밥상.jpg', title: '오색체질밥상' },
                  { src: '/books/죽고싶지만_서울대는_가고싶어.jpg', title: '죽고 싶지만 서울대는 가고 싶어' },
                  { src: '/books/바닷가_뜨개방.jpg', title: '바닷가 뜨개방' },
                  { src: '/books/책을_고르다_숨을_고르다.jpg', title: '책을 고르다 숨을 고르다' },
                  { src: '/books/인생코스모스.jpg', title: '인생 코스모스' },
                  { src: '/books/살아가는_이유.jpg', title: '살아가는 이유' },
                  { src: '/books/아무도_알려주지_않았던_다이어트이야기.jpg', title: '아무도 알려주지 않았던 다이어트 이야기' },
                  { src: '/books/나는_부모를_버렸습니다.png', title: '나는 부모를 버렸습니다' },
                  { src: '/books/오십에_읽는_성경.jpg', title: '오십에 읽는 성경' },
                  { src: '/books/말센스_없으면_꼰대확정입니다.jpg', title: '말센스 없으면 꼰대 확정입니다' },
                  { src: '/books/주님_지금_어디에.png', title: '주님 지금 어디에' },
                  { src: '/books/당신만의_속도로_괜찮습니다.jpg', title: '당신만의 속도로 괜찮습니다' },
                  { src: '/books/괜찮아_나를위한시간.jpg', title: '괜찮아, 나를 위한 시간' },
                  { src: '/books/너니까_하는거야.jpg', title: '너니까 하는 거야' },
                  { src: '/books/오색체질밥상.jpg', title: '오색체질밥상' },
                  { src: '/books/죽고싶지만_서울대는_가고싶어.jpg', title: '죽고 싶지만 서울대는 가고 싶어' },
                  { src: '/books/바닷가_뜨개방.jpg', title: '바닷가 뜨개방' },
                  { src: '/books/책을_고르다_숨을_고르다.jpg', title: '책을 고르다 숨을 고르다' },
                  { src: '/books/인생코스모스.jpg', title: '인생 코스모스' },
                ].map((book, i) => (
                  <div key={i} className="flex-shrink-0 w-[140px] group">
                    <div className="relative w-[140px] h-[200px] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                      <Image src={book.src} alt={book.title} fill className="object-cover" sizes="140px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3 - scroll left */}
            <div className="relative">
              <div className="flex gap-4 animate-scroll-left-slow">
                {[
                  { src: '/books/사업계획서_없이_창업하지마라.jpg', title: '사업계획서 없이 창업하지마라' },
                  { src: '/books/평범한_직장인_2권의_책.jpg', title: '평범한 직장인이 2권의 책을 썼을까' },
                  { src: '/books/함께_공부해서_날자.jpg', title: '함께 공부해서 날자' },
                  { src: '/books/아이들과_떠나는_피아노여행.jpg', title: '아이들과 떠나는 피아노 여행' },
                  { src: '/books/내_인생을_바꾼_명언.png', title: '내 인생을 바꾼 명언' },
                  { src: '/books/내가_살아가는_이유.jpg', title: '내가 살아가는 이유' },
                  { src: '/books/정솜결.png', title: '정솜결' },
                  { src: '/books/소명사명순명.jpg', title: '소명 사명 순명' },
                  { src: '/books/보이차.jpg', title: '보이차' },
                  { src: '/books/가르치며_배우는_신앙.jpg', title: '가르치며 배우는 신앙' },
                  { src: '/books/열다섯걸음.jpg', title: '열다섯 걸음' },
                  { src: '/books/사모엄마아내선교사.jpg', title: '사모 엄마 아내 선교사' },
                  { src: '/books/하루1시간_작가되는법.jpg', title: '하루 1시간 작가 되는 법' },
                  { src: '/books/사업계획서_없이_창업하지마라.jpg', title: '사업계획서 없이 창업하지마라' },
                  { src: '/books/평범한_직장인_2권의_책.jpg', title: '평범한 직장인이 2권의 책을 썼을까' },
                  { src: '/books/함께_공부해서_날자.jpg', title: '함께 공부해서 날자' },
                  { src: '/books/아이들과_떠나는_피아노여행.jpg', title: '아이들과 떠나는 피아노 여행' },
                  { src: '/books/내_인생을_바꾼_명언.png', title: '내 인생을 바꾼 명언' },
                  { src: '/books/내가_살아가는_이유.jpg', title: '내가 살아가는 이유' },
                  { src: '/books/정솜결.png', title: '정솜결' },
                  { src: '/books/소명사명순명.jpg', title: '소명 사명 순명' },
                  { src: '/books/보이차.jpg', title: '보이차' },
                ].map((book, i) => (
                  <div key={i} className="flex-shrink-0 w-[140px] group">
                    <div className="relative w-[140px] h-[200px] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                      <Image src={book.src} alt={book.title} fill className="object-cover" sizes="140px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-text-light mt-8 text-lg">
            ...그리고 더 많은 책들이 세상에 나왔습니다
          </p>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center text-text-dark mb-12">
            수강생 성공 사례
          </h2>

          <div className="space-y-6">
            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-success">
              <div className="flex items-start gap-4">
                <div className="bg-success text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  박
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark mb-2">박○○님 (45세)</h3>
                  <p className="text-text-medium mb-3">
                    "27년째 책쓰기 포기 → 코칭 받고 3주 만에 초고 완성 → 2달 만에 출간"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      27년 포기 → 2달 출간
                    </span>
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      3주 초고 완성
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-success">
              <div className="flex items-start gap-4">
                <div className="bg-success text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  김
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark mb-2">김○○님 (30대)</h3>
                  <p className="text-text-medium mb-3">
                    "6주 → 계약, 3개월 → 강의 8건, 6개월 → 4,200만원"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      6개월 4,200만원
                    </span>
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      강의 8건
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-success">
              <div className="flex items-start gap-4">
                <div className="bg-success text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  이
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark mb-2">이○○님 (40대)</h3>
                  <p className="text-text-medium mb-3">
                    "5년 못 쓰다가 4주 만에 완성"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      5년 고민 → 4주 완성
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-bg-warm rounded-3xl p-8 border-l-8 border-success">
              <div className="flex items-start gap-4">
                <div className="bg-success text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  최
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark mb-2">최○○님 (40대)</h3>
                  <p className="text-text-medium mb-3">
                    "첫 회에서 1.65억. 10배 벌었어요"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      웨비나 1.65억
                    </span>
                    <span className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">
                      10배 ROI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="bg-bg-cream py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center text-text-dark mb-12">
            미디어 노출 및 활동
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primary-dark mb-3">📺 방송 출연</h3>
              <ul className="space-y-2 text-text-medium">
                <li>• KBS "아침마당" - 책쓰기 전문가 인터뷰</li>
                <li>• MBC "라디오 스타" - 베스트셀러 작가 특집</li>
                <li>• SBS "모닝와이드" - 1인 출판 성공 사례</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primary-dark mb-3">📰 언론 보도</h3>
              <ul className="space-y-2 text-text-medium">
                <li>• 조선일보 - "AI로 책쓰기 혁명"</li>
                <li>• 중앙일보 - "1인 출판사 성공 스토리"</li>
                <li>• 한국경제 - "책으로 연 1억 버는 법"</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primary-dark mb-3">🎤 강연 및 특강</h3>
              <ul className="space-y-2 text-text-medium">
                <li>• 서울대학교 창업 특강</li>
                <li>• 고려대학교 글쓰기 워크샵</li>
                <li>• 중소기업진흥공단 출판 세미나</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primary-dark mb-3">🏅 수상 이력</h3>
              <ul className="space-y-2 text-text-medium">
                <li>• 2023 올해의 작가상</li>
                <li>• 2022 베스트 출판 멘토</li>
                <li>• 2021 콘텐츠 혁신상</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary-light to-bg-warm border-4 border-primary rounded-3xl p-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              철학
            </h2>
            <blockquote className="font-serif text-2xl text-text-dark leading-relaxed mb-6">
              "완벽한 책을 쓰려고 하지 마세요.<br />
              일단 완성하고, 세상에 내놓으세요.<br />
              책은 쓰는 사람이 작가가 아니라,<br />
              <span className="text-accent font-black">출간하는 사람이 작가</span>입니다."
            </blockquote>
            <p className="text-right text-primary-dark font-bold text-xl">- 황준연</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-text-dark to-[#1a1816] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            당신도 작가가 될 수 있습니다
          </h2>
          <p className="text-xl text-text-light mb-12">
            검증된 시스템으로 6주 만에 책을 완성하세요
          </p>

          <Link
            href="/program"
            className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mb-4 mr-4"
          >
            프로그램 보기 →
          </Link>

          <Link
            href="/pricing"
            className="inline-block bg-white text-primary-dark px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mb-4"
          >
            가격 확인하기 →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
