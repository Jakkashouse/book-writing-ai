'use client'

import { useState } from 'react'

export interface QuestionnaireData {
  sns: {
    instagram: { followers: string; frequency: string; likes: string; comments: string }
    youtube: { subscribers: string; frequency: string; likes: string; comments: string }
    blog: { visitors: string; frequency: string }
    other: { platform: string; followers: string; frequency: string }
  }
  networks: Array<{ name: string; totalSize: string; expectedBuyers: string }>
  networkTotal: string
  authorPurchase: {
    totalBooks: string
    distribution: string
    gifts: string
    lectures: string
    reviewers: string
    otherPurpose: string
    otherBooks: string
  }
  previousWork: {
    title: string
    totalSales: string
    repeatBuyerPercent: string
    repeatBuyerCount: string
  }
  marketing: {
    snsFrequency: string
    bookTalks: string
    webinars: string
    videos: string
    mediaInterview: boolean
    other: string
  }
  schedule: {
    manuscriptYear: string
    manuscriptMonth: string
    completionPercent: string
    publishYear: string
    publishMonth: string
  }
  endorsements: Array<{ name: string; title: string; status: string }>
  contractPreference: string
}

export function getEmptyQuestionnaire(): QuestionnaireData {
  return {
    sns: {
      instagram: { followers: '', frequency: '', likes: '', comments: '' },
      youtube: { subscribers: '', frequency: '', likes: '', comments: '' },
      blog: { visitors: '', frequency: '' },
      other: { platform: '', followers: '', frequency: '' },
    },
    networks: [
      { name: '', totalSize: '', expectedBuyers: '' },
      { name: '', totalSize: '', expectedBuyers: '' },
      { name: '', totalSize: '', expectedBuyers: '' },
    ],
    networkTotal: '',
    authorPurchase: {
      totalBooks: '',
      distribution: '',
      gifts: '',
      lectures: '',
      reviewers: '',
      otherPurpose: '',
      otherBooks: '',
    },
    previousWork: {
      title: '',
      totalSales: '',
      repeatBuyerPercent: '',
      repeatBuyerCount: '',
    },
    marketing: {
      snsFrequency: '',
      bookTalks: '',
      webinars: '',
      videos: '',
      mediaInterview: false,
      other: '',
    },
    schedule: {
      manuscriptYear: '',
      manuscriptMonth: '',
      completionPercent: '',
      publishYear: '',
      publishMonth: '',
    },
    endorsements: [
      { name: '', title: '', status: '확정' },
      { name: '', title: '', status: '확정' },
    ],
    contractPreference: '',
  }
}

export function questionnaireToText(data: QuestionnaireData): string {
  const lines: string[] = []
  lines.push('# 작가 질문지 응답\n')

  lines.push('## 1. SNS/온라인 채널 현황')
  const { sns } = data
  if (sns.instagram.followers || sns.instagram.frequency) {
    lines.push(`- 인스타그램: ${sns.instagram.followers}명, 주 ${sns.instagram.frequency}회, 좋아요 ${sns.instagram.likes}개/댓글 ${sns.instagram.comments}개`)
  }
  if (sns.youtube.subscribers || sns.youtube.frequency) {
    lines.push(`- 유튜브: ${sns.youtube.subscribers}명, 주 ${sns.youtube.frequency}회, 좋아요 ${sns.youtube.likes}개/댓글 ${sns.youtube.comments}개`)
  }
  if (sns.blog.visitors || sns.blog.frequency) {
    lines.push(`- 블로그: 월 방문자 ${sns.blog.visitors}명, 주 ${sns.blog.frequency}회`)
  }
  if (sns.other.platform) {
    lines.push(`- ${sns.other.platform}: ${sns.other.followers}명, 주 ${sns.other.frequency}회`)
  }

  lines.push('\n## 2. 네트워크 및 구매 예상 인원')
  data.networks.filter(n => n.name).forEach(n => {
    lines.push(`- ${n.name}: 전체 ${n.totalSize}명, 구매 예상 ${n.expectedBuyers}명`)
  })
  if (data.networkTotal) lines.push(`- 합계: 약 ${data.networkTotal}명`)

  lines.push('\n## 3. 저자 구매 계획')
  const ap = data.authorPurchase
  if (ap.totalBooks) lines.push(`- 희망 구매 부수: ${ap.totalBooks}권`)
  if (ap.distribution) lines.push(`  - 소모임/단체 배포: ${ap.distribution}권`)
  if (ap.gifts) lines.push(`  - 지인 선물: ${ap.gifts}권`)
  if (ap.lectures) lines.push(`  - 강연/세미나 교재: ${ap.lectures}권`)
  if (ap.reviewers) lines.push(`  - 서평단 배포: ${ap.reviewers}권`)
  if (ap.otherBooks) lines.push(`  - 기타(${ap.otherPurpose}): ${ap.otherBooks}권`)

  const pw = data.previousWork
  if (pw.title) {
    lines.push(`\n- 전작: 『${pw.title}』, 판매 약 ${pw.totalSales}권`)
    lines.push(`  - 전작 독자 중 신간 구매 예상: ${pw.repeatBuyerPercent}% (${pw.repeatBuyerCount}명)`)
  }

  lines.push('\n## 4. 출간 후 마케팅 및 일정')
  const mk = data.marketing
  if (mk.snsFrequency) lines.push(`- SNS 홍보: 주 ${mk.snsFrequency}회`)
  if (mk.bookTalks) lines.push(`- 북토크/강연: ${mk.bookTalks}회 예정`)
  if (mk.webinars) lines.push(`- 온라인 강의/웨비나: ${mk.webinars}회 예정`)
  if (mk.videos) lines.push(`- 유튜브/숏폼 영상: ${mk.videos}개 예정`)
  if (mk.mediaInterview) lines.push(`- 언론 기고/인터뷰: 예정`)
  if (mk.other) lines.push(`- 기타: ${mk.other}`)

  const sc = data.schedule
  if (sc.manuscriptYear) lines.push(`\n- 원고 완성 시기: ${sc.manuscriptYear}년 ${sc.manuscriptMonth}월 (현재 완성도 ${sc.completionPercent}%)`)
  if (sc.publishYear) lines.push(`- 출간 희망 시기: ${sc.publishYear}년 ${sc.publishMonth}월`)

  const endorsements = data.endorsements.filter(e => e.name)
  if (endorsements.length > 0) {
    lines.push('\n- 추천사:')
    endorsements.forEach(e => lines.push(`  - ${e.name} (${e.title}) — ${e.status}`))
  }

  if (data.contractPreference) {
    lines.push(`\n## 5. 원하시는 계약 조건\n${data.contractPreference}`)
  }

  return lines.join('\n')
}

interface Props {
  data: QuestionnaireData
  onChange: (data: QuestionnaireData) => void
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm'
const smallInputClass = 'px-2 py-1.5 rounded-lg border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-center'

export default function QuestionnaireForm({ data, onChange }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sns: true,
    network: false,
    purchase: false,
    marketing: false,
    contract: false,
  })

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const update = (updater: (d: QuestionnaireData) => void) => {
    const next = JSON.parse(JSON.stringify(data)) as QuestionnaireData
    updater(next)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* Section 1: SNS */}
      <section className="border border-surface-border rounded-xl overflow-hidden">
        <button onClick={() => toggle('sns')} className="w-full flex items-center justify-between px-5 py-3 bg-accent hover:bg-accent-dark transition-colors text-left">
          <span className="font-semibold text-primary text-sm">1. SNS/온라인 채널 현황</span>
          <span className="text-primary">{expanded.sns ? '▲' : '▼'}</span>
        </button>
        {expanded.sns && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-text-muted">운영 중인 채널만 작성하세요. 없으면 비워두셔도 됩니다.</p>

            {/* Instagram */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">인스타그램</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-xs text-text-muted">팔로워</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.instagram.followers} onChange={e => update(d => { d.sns.instagram.followers = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">활동 빈도</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-muted">주</span>
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.instagram.frequency} onChange={e => update(d => { d.sns.instagram.frequency = e.target.value })} />
                    <span className="text-xs text-text-muted">회</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">평균 좋아요</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.instagram.likes} onChange={e => update(d => { d.sns.instagram.likes = e.target.value })} />
                    <span className="text-xs text-text-muted">개</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">평균 댓글</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.instagram.comments} onChange={e => update(d => { d.sns.instagram.comments = e.target.value })} />
                    <span className="text-xs text-text-muted">개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">유튜브</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-xs text-text-muted">구독자</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.youtube.subscribers} onChange={e => update(d => { d.sns.youtube.subscribers = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">활동 빈도</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-muted">주</span>
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.youtube.frequency} onChange={e => update(d => { d.sns.youtube.frequency = e.target.value })} />
                    <span className="text-xs text-text-muted">회</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">평균 좋아요</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.youtube.likes} onChange={e => update(d => { d.sns.youtube.likes = e.target.value })} />
                    <span className="text-xs text-text-muted">개</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">평균 댓글</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.youtube.comments} onChange={e => update(d => { d.sns.youtube.comments = e.target.value })} />
                    <span className="text-xs text-text-muted">개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">블로그</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-text-muted">월 방문자</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.blog.visitors} onChange={e => update(d => { d.sns.blog.visitors = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">활동 빈도</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-muted">주</span>
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.blog.frequency} onChange={e => update(d => { d.sns.blog.frequency = e.target.value })} />
                    <span className="text-xs text-text-muted">회</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">기타 채널</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-text-muted">플랫폼명</span>
                  <input className={inputClass} placeholder="예: 틱톡, 카페" value={data.sns.other.platform} onChange={e => update(d => { d.sns.other.platform = e.target.value })} />
                </div>
                <div>
                  <span className="text-xs text-text-muted">팔로워</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.other.followers} onChange={e => update(d => { d.sns.other.followers = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">활동 빈도</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-muted">주</span>
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.sns.other.frequency} onChange={e => update(d => { d.sns.other.frequency = e.target.value })} />
                    <span className="text-xs text-text-muted">회</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Network */}
      <section className="border border-surface-border rounded-xl overflow-hidden">
        <button onClick={() => toggle('network')} className="w-full flex items-center justify-between px-5 py-3 bg-accent hover:bg-accent-dark transition-colors text-left">
          <span className="font-semibold text-primary text-sm">2. 네트워크 및 구매 예상 인원</span>
          <span className="text-primary">{expanded.network ? '▲' : '▼'}</span>
        </button>
        {expanded.network && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-muted">&quot;이 책이 나오면 살 것 같은 사람&quot; 기준으로 솔직하게 적어주세요.</p>
            {data.networks.map((net, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-text-muted">단체/모임/직장</span>
                  <input className={inputClass} placeholder="예: 독서모임" value={net.name} onChange={e => update(d => { d.networks[i].name = e.target.value })} />
                </div>
                <div>
                  <span className="text-xs text-text-muted">전체 규모</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={net.totalSize} onChange={e => update(d => { d.networks[i].totalSize = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">구매 예상</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={net.expectedBuyers} onChange={e => update(d => { d.networks[i].expectedBuyers = e.target.value })} />
                    <span className="text-xs text-text-muted">명</span>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => update(d => { d.networks.push({ name: '', totalSize: '', expectedBuyers: '' }) })}
              className="text-xs text-primary hover:underline"
            >
              + 네트워크 추가
            </button>
            <div>
              <span className="text-xs text-text-muted">전체 네트워크 예상 구매 인원 합계</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm">약</span>
                <input className={smallInputClass + ' w-24'} placeholder="0" value={data.networkTotal} onChange={e => update(d => { d.networkTotal = e.target.value })} />
                <span className="text-sm">명</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Author Purchase */}
      <section className="border border-surface-border rounded-xl overflow-hidden">
        <button onClick={() => toggle('purchase')} className="w-full flex items-center justify-between px-5 py-3 bg-accent hover:bg-accent-dark transition-colors text-left">
          <span className="font-semibold text-primary text-sm">3. 저자 구매 계획 및 전작 판매</span>
          <span className="text-primary">{expanded.purchase ? '▲' : '▼'}</span>
        </button>
        {expanded.purchase && (
          <div className="p-4 space-y-4">
            <div>
              <span className="text-sm font-medium text-text">희망 구매 부수</span>
              <div className="flex items-center gap-1 mt-1">
                <input className={smallInputClass + ' w-24'} placeholder="0" value={data.authorPurchase.totalBooks} onChange={e => update(d => { d.authorPurchase.totalBooks = e.target.value })} />
                <span className="text-sm">권</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: '소모임/단체 배포', key: 'distribution' as const },
                { label: '지인 선물', key: 'gifts' as const },
                { label: '강연/세미나 교재', key: 'lectures' as const },
                { label: '서평단 배포', key: 'reviewers' as const },
              ].map(item => (
                <div key={item.key}>
                  <span className="text-xs text-text-muted">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.authorPurchase[item.key]} onChange={e => update(d => { d.authorPurchase[item.key] = e.target.value })} />
                    <span className="text-xs text-text-muted">권</span>
                  </div>
                </div>
              ))}
              <div>
                <span className="text-xs text-text-muted">기타 용도</span>
                <input className={inputClass} placeholder="용도" value={data.authorPurchase.otherPurpose} onChange={e => update(d => { d.authorPurchase.otherPurpose = e.target.value })} />
              </div>
              <div>
                <span className="text-xs text-text-muted">기타 수량</span>
                <div className="flex items-center gap-1">
                  <input className={smallInputClass + ' w-full'} placeholder="0" value={data.authorPurchase.otherBooks} onChange={e => update(d => { d.authorPurchase.otherBooks = e.target.value })} />
                  <span className="text-xs text-text-muted">권</span>
                </div>
              </div>
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-sm font-medium text-text mb-2">전작이 있는 경우 (선택)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <span className="text-xs text-text-muted">전작 제목</span>
                  <input className={inputClass} placeholder="예: 나의 첫 번째 책" value={data.previousWork.title} onChange={e => update(d => { d.previousWork.title = e.target.value })} />
                </div>
                <div>
                  <span className="text-xs text-text-muted">총 판매 부수</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">약</span>
                    <input className={smallInputClass + ' w-full'} placeholder="0" value={data.previousWork.totalSales} onChange={e => update(d => { d.previousWork.totalSales = e.target.value })} />
                    <span className="text-xs text-text-muted">권</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">전작 독자 중 신간 구매 예상</span>
                  <div className="flex items-center gap-1">
                    <input className={smallInputClass + ' w-16'} placeholder="0" value={data.previousWork.repeatBuyerPercent} onChange={e => update(d => { d.previousWork.repeatBuyerPercent = e.target.value })} />
                    <span className="text-xs">%</span>
                    <input className={smallInputClass + ' w-16'} placeholder="0" value={data.previousWork.repeatBuyerCount} onChange={e => update(d => { d.previousWork.repeatBuyerCount = e.target.value })} />
                    <span className="text-xs">명</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Marketing & Schedule */}
      <section className="border border-surface-border rounded-xl overflow-hidden">
        <button onClick={() => toggle('marketing')} className="w-full flex items-center justify-between px-5 py-3 bg-accent hover:bg-accent-dark transition-colors text-left">
          <span className="font-semibold text-primary text-sm">4. 마케팅 계획 및 출판 일정</span>
          <span className="text-primary">{expanded.marketing ? '▲' : '▼'}</span>
        </button>
        {expanded.marketing && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-text-muted">해당하는 항목만 작성해주세요.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-text-muted">SNS 홍보</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">주</span>
                  <input className={smallInputClass + ' w-full'} placeholder="0" value={data.marketing.snsFrequency} onChange={e => update(d => { d.marketing.snsFrequency = e.target.value })} />
                  <span className="text-xs">회</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-text-muted">북토크/강연</span>
                <div className="flex items-center gap-1">
                  <input className={smallInputClass + ' w-full'} placeholder="0" value={data.marketing.bookTalks} onChange={e => update(d => { d.marketing.bookTalks = e.target.value })} />
                  <span className="text-xs">회</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-text-muted">웨비나/온라인 강의</span>
                <div className="flex items-center gap-1">
                  <input className={smallInputClass + ' w-full'} placeholder="0" value={data.marketing.webinars} onChange={e => update(d => { d.marketing.webinars = e.target.value })} />
                  <span className="text-xs">회</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-text-muted">유튜브/숏폼 영상</span>
                <div className="flex items-center gap-1">
                  <input className={smallInputClass + ' w-full'} placeholder="0" value={data.marketing.videos} onChange={e => update(d => { d.marketing.videos = e.target.value })} />
                  <span className="text-xs">개</span>
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.marketing.mediaInterview}
                    onChange={e => update(d => { d.marketing.mediaInterview = e.target.checked })}
                    className="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary"
                  />
                  언론 기고/인터뷰
                </label>
              </div>
              <div>
                <span className="text-xs text-text-muted">기타</span>
                <input className={inputClass} placeholder="기타 마케팅" value={data.marketing.other} onChange={e => update(d => { d.marketing.other = e.target.value })} />
              </div>
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-sm font-medium text-text mb-2">출판 일정</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-text-muted">원고 완성 시기</span>
                  <div className="flex items-center gap-1 mt-1">
                    <input className={smallInputClass + ' w-16'} placeholder="2026" value={data.schedule.manuscriptYear} onChange={e => update(d => { d.schedule.manuscriptYear = e.target.value })} />
                    <span className="text-xs">년</span>
                    <input className={smallInputClass + ' w-12'} placeholder="6" value={data.schedule.manuscriptMonth} onChange={e => update(d => { d.schedule.manuscriptMonth = e.target.value })} />
                    <span className="text-xs">월</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-text-muted">현재 완성도</span>
                    <input className={smallInputClass + ' w-14'} placeholder="80" value={data.schedule.completionPercent} onChange={e => update(d => { d.schedule.completionPercent = e.target.value })} />
                    <span className="text-xs">%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-text-muted">출간 희망 시기</span>
                  <div className="flex items-center gap-1 mt-1">
                    <input className={smallInputClass + ' w-16'} placeholder="2026" value={data.schedule.publishYear} onChange={e => update(d => { d.schedule.publishYear = e.target.value })} />
                    <span className="text-xs">년</span>
                    <input className={smallInputClass + ' w-12'} placeholder="9" value={data.schedule.publishMonth} onChange={e => update(d => { d.schedule.publishMonth = e.target.value })} />
                    <span className="text-xs">월</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-sm font-medium text-text mb-2">추천사 (선택)</p>
              {data.endorsements.map((end, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <span className="text-xs text-text-muted">추천자 성함</span>
                    <input className={inputClass} placeholder="홍길동" value={end.name} onChange={e => update(d => { d.endorsements[i].name = e.target.value })} />
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">소속/직함</span>
                    <input className={inputClass} placeholder="OO대 교수" value={end.title} onChange={e => update(d => { d.endorsements[i].title = e.target.value })} />
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">섭외 상태</span>
                    <select className={inputClass} value={end.status} onChange={e => update(d => { d.endorsements[i].status = e.target.value })}>
                      <option value="확정">확정</option>
                      <option value="진행중">진행중</option>
                      <option value="예정">예정</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 5: Contract Preference */}
      <section className="border border-surface-border rounded-xl overflow-hidden">
        <button onClick={() => toggle('contract')} className="w-full flex items-center justify-between px-5 py-3 bg-accent hover:bg-accent-dark transition-colors text-left">
          <span className="font-semibold text-primary text-sm">5. 원하시는 계약 조건 (선택)</span>
          <span className="text-primary">{expanded.contract ? '▲' : '▼'}</span>
        </button>
        {expanded.contract && (
          <div className="p-4">
            <p className="text-xs text-text-muted mb-2">인세, 선인세 등 원하시는 조건을 자유롭게 적어주세요.</p>
            <textarea
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="예: 인세율 12% 희망, 선인세 50만원 등"
              value={data.contractPreference}
              onChange={e => update(d => { d.contractPreference = e.target.value })}
            />
          </div>
        )}
      </section>
    </div>
  )
}
