import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '6주 책쓰기 프로그램 — 1주차부터 6주차까지',
  description:
    '제목·목차·AI 5+5 시스템·기획서·출간 전 마케팅·1인 출판까지. 작가의 집 6주 커리큘럼 전체.',
  alternates: { canonical: '/program' },
};

export default function ProgramPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-bg-warm to-bg-cream pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-dark mb-6">
            6주 책쓰기 완성 프로그램
          </h1>
          <p className="text-xl text-text-medium max-w-3xl mx-auto">
            주차별 상세 커리큘럼과 제공 내용을 확인하세요.<br />
            AI 프롬프트 27종, 1:1 컨설팅 2회, 평생 멤버십까지.
          </p>
        </div>
      </section>

      {/* Week 1 */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              1주차: "27년 실패한 사람들의 공통점 - 제목이 전부였습니다"
            </h2>

            {/* Item 1 */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">
                출판사가 바로 계약하는 제목 공식 10가지
              </h3>
              <p className="text-text-medium italic mb-6">
                "3년 묵힌 원고, 제목과 목차만 바꿨는데 당일 계약 - 출판사 편집장이 인정한 제목의 힘"
              </p>

              <div className="bg-bg-warm rounded-xl p-6 mb-6">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b-2 border-text-dark">
                      <th className="py-3 font-bold">Before</th>
                      <th className="py-3 font-bold">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 text-gray-400">
                        "배달 성공법"<br />관심 0%
                      </td>
                      <td className="py-4 text-primary-dark font-bold">
                        "마흔, 폭풍성장으로<br />부의 추월차선에 타라"<br />계약 제안 3곳
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">제목 공식 10가지 워드 템플릿 (복붙만 하면 됨)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">오늘 저녁 30분 만에 제목 10개 자동 생성 엑셀 시트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">내일 출판사에 보낼 1페이지 기획서 템플릿 (PDF)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">실제 합격 제목 50개 사례집 (분야별 분류)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">제목 자가 진단 체크리스트 (5분 완성)</span>
                </li>
              </ul>

              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 출판 컨설팅 1회 50만원 상당
              </span>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">
                1일 만에 완성하는 40꼭지 목차 시스템
              </h3>
              <p className="text-text-medium italic mb-6">
                "목차 없는 원고 합격률 0.1% vs 목차 있는 기획서 30% - 300배 차이의 비밀"
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">Why-What-How-Do-Future 5부 구조 템플릿 (워드/엑셀)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">1일 만에 40꼭지 자동 생성 엑셀 시스템 (공식 내장)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">"전문가구나" 느끼게 하는 목차 작성 가이드 (20p)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">실제 합격 목차 10개 샘플 (분야별)</span>
                </li>
              </ul>

              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 기획서 컨설팅 1회 80만원 상당
              </span>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">
                30분 만에 주제 3개 - '책 DNA' 찾기
              </h3>
              <p className="text-text-medium italic mb-6">
                "70대도 30분 만에 찾았습니다 - 당신 안에 책 10권이 잠들어 있습니다"
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">3가지 질문 → 주제 자동 추출 워크시트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">현재 하는 일 = 책 주제 매핑 테이블</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">87%가 1시간 내 완료하는 '책 DNA' 발굴 가이드</span>
                </li>
              </ul>

              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 주제 컨설팅 1회 30만원 상당
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Week 2-6 (Similar structure, abbreviated for space) */}
      <section className="bg-bg-cream py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-12">

          {/* Week 2 */}
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              2주차: "완벽주의가 책쓰기를 망칩니다 - AI 80% + 나 20% 시스템"
            </h2>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">글쓰기 5+5 시스템</h3>
              <p className="text-text-medium italic mb-6">
                "'육아는 힘들다'(3줄) → '밤 9시 퇴근해서 잠든 아이만 보시나요?'(1,500자)"
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">40꼭지 4주 완성 템플릿</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">말하듯 쓰면 전문가처럼 보이는 5+5 공식 워크시트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">92%가 한 달 내 초고 완성하는 글쓰기 시스템</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 글쓰기 코칭 1회 70만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">AI 프롬프트 7종</h3>
              <p className="text-text-medium italic mb-6">
                "하루 만에 30,000자 완성 - AI 초고 80% + 나 탈고 20%로 완벽주의 탈출"
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">AI 프롬프트 7종 전체 (복붙만 하면 됨)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">각 프롬프트별 사용 가이드 (동영상)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">AI 초고 → 탈고 체크리스트</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: AI 글쓰기 컨설팅 1회 100만원 상당
              </span>
            </div>
          </div>

          {/* Week 3 */}
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              3주차: "원고만 보내면 3개월 후 거절됩니다"
            </h2>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">5분 만에 계약서 받는 기획서</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">타겟+시장+차별점+목차 기획서 템플릿 (워드)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">"왜 지금?" 한 문장 공식</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">실제 합격 기획서 5건 (PDF)</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 출판 기획서 컨설팅 1회 80만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">계약서 체크리스트</h3>
              <p className="text-text-medium italic mb-6">
                "전자책 권리 몰랐음. 3년간 500만원 못 받음 - 5분 체크가 평생 지킵니다"
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">계약서 체크리스트 (5분 완성)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">계약 전 질문 7가지 스크립트</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 출판 계약 컨설팅 1회 100만원 상당
              </span>
            </div>
          </div>

          {/* Week 4 */}
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              4주차: "출간 후 홍보하면 이미 늦습니다"
            </h2>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">출간 '전'에 베스트셀러 만들기</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">출간 전 30일 마케팅 타임라인</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">지인 50명 동원 스크립트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">SNS 확산 템플릿 (인스타/블로그)</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 출간 마케팅 컨설팅 1회 150만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">책 → 강의 → 컨설팅 파이프라인</h3>
              <p className="text-text-medium mb-4">
                강의 20회 × 30만원 + 컨설팅 5건 × 100만원 = 연 1,100만원
              </p>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 비즈니스 모델 컨설팅 1회 150만원 상당
              </span>
            </div>
          </div>

          {/* Week 5 */}
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              5주차: "한 번 쓰고 끝내면 손해입니다"
            </h2>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">콘텐츠 재활용 7단계</h3>
              <p className="text-text-medium italic mb-6">
                "한 번 쓰면 7번 써먹는다 - 책 1권 = 블로그 40개 + 유튜브 40개"
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">콘텐츠 재활용 7단계 가이드</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">플랫폼별 변환 템플릿</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 콘텐츠 마케팅 컨설팅 1회 100만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">웨비나 1회 = 3,000만원</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">웨비나 스크립트 (90분, 복붙 가능)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">PPT 62페이지 (복붙 가능)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">랜딩페이지 (HTML/CSS)</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 웨비나 컨설팅 1회 500만원 상당
              </span>
            </div>
          </div>

          {/* Week 6 */}
          <div className="bg-bg-warm rounded-3xl p-12 border-l-8 border-primary">
            <h2 className="font-serif text-3xl font-bold text-text-dark mb-8">
              6주차: "1인 출판사 독립 시스템"
            </h2>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">실제 원가 공개</h3>
              <p className="text-text-medium mb-4">
                인쇄 200만원 + ISBN 무료 + 디자인 100만원 = 300만원
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">1인 출판사 설립 가이드 (A-Z)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">인쇄소/디자이너 추천 리스트</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 1인 출판사 컨설팅 1회 300만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-accent mb-4">정부지원금 4,500만원</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">전체 가이드 (50p)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">합격 사업계획서 샘플</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 사업계획서 컨설팅 1회 300만원 상당
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-accent mb-4">작가의 집 시스템 (1년 52권)</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">업무 자동화 시스템 (Notion 템플릿)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium font-bold">AI 프롬프트 27종 전체</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success font-black mr-3 text-xl">✓</span>
                  <span className="text-text-medium">주 1권 출간 워크플로우</span>
                </li>
              </ul>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full font-bold">
                가치: 시스템 구축 컨설팅 1회 500만원 상당
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Total Value */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary-light to-bg-warm border-4 border-primary rounded-3xl p-12 text-center">
            <h3 className="font-serif text-3xl font-black text-accent mb-8">
              전체 가치 환산
            </h3>
            <div className="text-left space-y-3 mb-8 text-lg">
              <p>• 1주차: 제목 공식 + 목차 시스템 + 주제 발굴 = <strong>160만원</strong></p>
              <p>• 2주차: 글쓰기 5+5 + AI 프롬프트 7종 = <strong>220만원</strong></p>
              <p>• 3주차: 기획서 + 계약서 체크리스트 = <strong>230만원</strong></p>
              <p>• 4주차: 출간 전 마케팅 + 수익 파이프라인 = <strong>500만원</strong></p>
              <p>• 5주차: 재활용 7단계 + 웨비나 = <strong>850만원</strong></p>
              <p>• 6주차: 1인 출판사 + 1년 1억 시스템 = <strong>측정 불가</strong></p>
            </div>
            <p className="text-4xl font-black text-primary-dark mb-4">
              총 가치: 5,460만원 이상
            </p>
            <p className="text-2xl">
              실제 가격: <span className="text-accent font-black">1,299만원</span>
            </p>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              가격 상세 보기 →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
