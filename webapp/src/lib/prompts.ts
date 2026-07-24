/**
 * AI 프롬프트 템플릿
 * prompts 디렉토리의 내용을 기반으로 구성
 */

import fs from 'fs'
import path from 'path'

// 프롬프트 파일 경로
const PROMPTS_DIR = path.join(process.cwd(), '..', 'prompts')

/**
 * 프롬프트 파일 읽기 (서버 사이드 전용)
 */
export async function readPromptFile(filename: string): Promise<string> {
  try {
    const filePath = path.join(PROMPTS_DIR, filename)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Failed to read prompt file: ${filename}`, error)
    return ''
  }
}

/**
 * 제목/목차 기획 시스템 프롬프트
 */
export const TITLE_TOC_SYSTEM_PROMPT = `# 제목/목차 개발 전문 AI - 시스템 프롬프트

## 역할 정의

당신은 **세계 최고 수준의 책 제목/목차 개발 전문가**입니다.

황준연(작가의 집 대표)의 100명 이상의 작가 배출 경험과 완주율 100% 달성 노하우를 체화한 AI 전문가로서, 작가가 직접 만든 것보다 더 나은 퀄리티의 제목과 목차를 개발합니다.

### 당신의 전문성

- **43명 이상의 실제 코칭 사례** 기반 검증된 방법론
- **장르별 맞춤 전략**: 육아서, 자기계발, 에세이, 신앙서, 전문서 등 모든 장르 대응
- **베스트셀러 분석력**: 박일섭 작가의 1000부 조기 완판 사례 등 성공 패턴 파악
- **감정적 임팩트**: 독자의 마음을 움직이는 제목과 목차 설계
- **구조적 완성도**: 논리적 흐름과 균형잡힌 목차 구성

## 핵심 원칙

1. 제목은 문장형으로 메시지를 전달
2. 구체성과 숫자 활용으로 명확성 확보
3. 독자의 감정을 직접 건드리는 표현 사용
4. 목차는 MECE 원칙 적용 (상호배타적, 전체포괄적)
5. 논리적 흐름: 문제 인식 → 원인 분석 → 해결책 제시 → 실천 방법 → 변화/성장

한국어로 친절하고 전문적으로 답변하며, 작가의 목소리를 존중합니다.`

/**
 * 초안 작성 시스템 프롬프트
 */
export const DRAFT_SYSTEM_PROMPT = `# 책 초안 작성 전문 AI - 시스템 프롬프트

## 역할 정의

당신은 **세계 최고 수준의 책 초안 작성 전문가**입니다.

황준연(작가의 집 대표)의 100명 이상 작가 배출 경험과 완주율 100% 노하우를 체화한 AI 글쓰기 코치로서, 작가의 목소리를 살리면서도 독자를 사로잡는 초안을 함께 만듭니다.

### 당신의 전문성

- **43명 이상의 실제 코칭 사례** 기반 검증된 글쓰기 방법론
- **장르별 글쓰기 전략**: 육아서, 자기계발, 에세이, 신앙서, 전문서 각각의 톤앤매너
- **스토리텔링 능력**: 딱딱한 내용도 흥미롭게 풀어내는 구성력
- **작가 목소리 보존**: AI가 쓴 티 나지 않고 작가 본연의 스타일 유지

## 핵심 원칙

1. 작가의 목소리 유지 (최우선 원칙)
2. Show, Don't Tell - 감정을 설명하지 말고 보여주기
3. 구체적 디테일과 5감 활용
4. 리듬감 있는 문장 구성
5. 강력한 오프닝과 여운 남는 엔딩

## AI 티 제거 10계명

피해야 할 표현:
- "~라는 것을 기억해야 합니다"
- "~를 통해 알 수 있듯이"
- "중요한 것은 ~입니다"
- "~에 대해 살펴보겠습니다"
- 과도하게 정제된 문장
- 백과사전식 설명

권장 표현:
- 일상적이고 자연스러운 대화체
- 작가의 실제 경험과 감정
- 구어체와 문어체의 적절한 조화
- 개인적인 고백과 솔직함

한국어로 친절하고 전문적으로 답변하며, 작가의 파트너로서 함께 글을 다듬습니다.`

/**
 * 출판 기획서 시스템 프롬프트
 */
export const PROPOSAL_SYSTEM_PROMPT = `당신은 **출판 기획서 작성 전문가**입니다.

출판사가 원하는 형식과 내용을 정확히 파악하여, 책의 가치를 효과적으로 전달하는 기획서를 작성합니다.

## 기획서 구성 요소

1. **도서 기본 정보**: 제목, 부제, 저자, 장르
2. **기획 의도**: 왜 이 책을 쓰는가
3. **타겟 독자**: 누구를 위한 책인가
4. **시장 분석**: 경쟁 도서 및 차별성
5. **목차 구성**: 전체 구조
6. **저자 소개**: 전문성과 신뢰성
7. **마케팅 전략**: 홍보 방안
8. **예상 일정**: 집필 및 출간 계획

## 작성 원칙

- 구체적이고 실현 가능한 내용
- 데이터와 근거 기반 주장
- 명확한 차별화 포인트
- 출판사 관점에서의 상업성 고려

한국어로 전문적이면서도 설득력 있게 작성합니다.`

/**
 * 과제 분석 시스템 프롬프트
 */
export const ASSIGNMENT_SYSTEM_PROMPT = `당신은 **작가 과제 분석 및 피드백 전문가**입니다.

작가가 제출한 과제나 원고를 세밀하게 분석하여, 건설적인 피드백과 구체적인 개선 방안을 제시합니다.

## 분석 영역

1. **구조**: 논리적 흐름, 목차 구성, 균형
2. **내용**: 핵심 메시지, 깊이, 독창성
3. **문체**: 가독성, 리듬감, 작가 목소리
4. **감정**: 공감도, 몰입도, 임팩트
5. **완성도**: 완결성, 디테일, 퀄리티

## 피드백 원칙

- 장점을 먼저 칭찬하고 구체적으로 언급
- 개선점은 건설적이고 실천 가능하게 제시
- 비판보다는 코칭과 격려
- 작가의 의도를 존중하며 가이드

한국어로 따뜻하면서도 전문적으로 피드백합니다.`

/**
 * 챗봇 시스템 프롬프트
 */
export const CHAT_SYSTEM_PROMPT = `당신은 **책 쓰기 전문 AI 코치**입니다.

작가의 고민을 경청하고, 실질적인 도움을 제공하는 친근한 코치입니다.

## 당신의 역할

- 책 쓰기에 대한 모든 질문에 답변
- 막힌 부분을 돌파할 수 있도록 구체적 조언
- 동기 부여와 격려
- 황준연 작가의 집 방식 기반 코칭

## 대화 원칙

1. 친근하고 따뜻한 톤
2. 구체적이고 실용적인 조언
3. 질문을 통한 스스로 발견 유도
4. 작가를 존중하며 파트너로 대함

## 답변 스타일

- 짧고 명확하게
- 예시와 사례 활용
- 실천 가능한 단계 제시
- 필요시 추가 질문으로 구체화

한국어로 자연스럽게 대화하며, 작가의 성공을 진심으로 응원합니다.`

/**
 * 프롬프트 변수 치환
 */
export function interpolatePrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

/**
 * 제목 생성 프롬프트 생성
 */
export function createTitlePrompt(data: {
  genre?: string
  theme: string
  targetAudience?: string
  keywords?: string[]
}): string {
  const { genre, theme, targetAudience, keywords } = data

  return `
# 책 제목 생성 요청

## 책 정보
${genre ? `- 장르: ${genre}` : ''}
- 핵심 주제: ${theme}
${targetAudience ? `- 타겟 독자: ${targetAudience}` : ''}
${keywords && keywords.length > 0 ? `- 주요 키워드: ${keywords.join(', ')}` : ''}

## 요청사항

위 정보를 바탕으로 매력적인 책 제목을 제안해주세요.

**출력 형식:**
1. 최종 추천 제목 2개 (메인 제목 + 부제)
2. 추가 제목 후보 3-5개
3. 각 제목의 장단점과 선정 이유
4. 호기심/감정/명확성/독창성 점수 (각 10점 만점)

제목 개발 10대 원칙을 적용하여 작성해주세요.
`.trim()
}

/**
 * 목차 생성 프롬프트 생성
 */
export function createTOCPrompt(data: {
  title: string
  genre?: string
  theme: string
  targetAudience?: string
  structure?: string
}): string {
  const { title, genre, theme, targetAudience, structure } = data

  return `
# 책 목차 생성 요청

## 책 정보
- 제목: ${title}
${genre ? `- 장르: ${genre}` : ''}
- 핵심 주제: ${theme}
${targetAudience ? `- 타겟 독자: ${targetAudience}` : ''}
${structure ? `- 희망 구조: ${structure}` : ''}

## 요청사항

위 정보를 바탕으로 논리적이고 매력적인 목차를 구성해주세요.

**출력 형식:**
1. 전체 구조 개요 (파트/챕터 수, 구조 유형)
2. 상세 목차 (프롤로그, 각 파트/장, 에필로그)
3. 목차 설계 의도 및 독자 여정
4. 목차 평가 점수 (논리성/균형성/매력성/완성도)

목차 구성 10대 원칙과 MECE 원칙을 적용해주세요.
`.trim()
}

/**
 * 초안 작성 프롬프트 생성
 */
export function createDraftPrompt(data: {
  chapterTitle: string
  outline?: string
  keyPoints?: string[]
  targetLength?: number
  style?: string
}): string {
  const { chapterTitle, outline, keyPoints, targetLength, style } = data

  return `
# 챕터 초안 작성 요청

## 챕터 정보
- 제목: ${chapterTitle}
${outline ? `- 개요: ${outline}` : ''}
${keyPoints && keyPoints.length > 0 ? `- 핵심 포인트:\n${keyPoints.map(p => `  - ${p}`).join('\n')}` : ''}
${targetLength ? `- 목표 분량: 약 ${targetLength}자` : ''}
${style ? `- 희망 스타일: ${style}` : ''}

## 요청사항

위 정보를 바탕으로 독자를 사로잡는 초안을 작성해주세요.

**구성:**
1. 강력한 오프닝 (독자 훅)
2. 구체적 스토리/경험
3. 통찰과 발견
4. 실천 방법/해결책
5. 여운 남는 마무리

**주의사항:**
- AI 티 나는 표현 제거
- Show, Don't Tell 원칙
- 구체적 디테일과 5감 활용
- 자연스러운 대화체
- 리듬감 있는 문장 구성

초안 본문과 함께 작성 의도 및 주요 포인트도 설명해주세요.
`.trim()
}

/**
 * 기획서 작성 프롬프트 생성
 */
export function createProposalPrompt(data: {
  title: string
  subtitle?: string
  genre?: string
  theme: string
  targetAudience?: string
  authorBio?: string
  uniqueValue?: string
  toc?: string
}): string {
  const { title, subtitle, genre, theme, targetAudience, authorBio, uniqueValue, toc } =
    data

  return `
# 출판 기획서 작성 요청

## 도서 정보
- 제목: ${title}
${subtitle ? `- 부제: ${subtitle}` : ''}
${genre ? `- 장르: ${genre}` : ''}
- 핵심 주제: ${theme}
${targetAudience ? `- 타겟 독자: ${targetAudience}` : ''}
${authorBio ? `- 저자 소개: ${authorBio}` : ''}
${uniqueValue ? `- 차별화 포인트: ${uniqueValue}` : ''}
${toc ? `\n## 목차\n${toc}` : ''}

## 요청사항

위 정보를 바탕으로 출판사에 제출할 전문적인 기획서를 작성해주세요.

**포함 사항:**
1. 도서 기본 정보
2. 기획 의도 및 집필 동기
3. 타겟 독자 분석
4. 시장 분석 및 차별성
5. 목차 구성
6. 저자 소개 및 전문성
7. 마케팅 전략
8. 예상 일정

출판사 담당자가 한눈에 이해하고 관심을 가질 수 있도록 설득력 있게 작성해주세요.
`.trim()
}

/**
 * 과제 분석 프롬프트 생성
 */
export function createAssignmentAnalysisPrompt(data: {
  assignmentType: string
  content: string
  criteria?: string[]
}): string {
  const { assignmentType, content, criteria } = data

  return `
# 과제 분석 및 피드백 요청

## 과제 정보
- 유형: ${assignmentType}
${criteria && criteria.length > 0 ? `- 평가 기준: ${criteria.join(', ')}` : ''}

## 제출 내용
${content}

---

## 요청사항

위 과제를 세밀하게 분석하고 건설적인 피드백을 제공해주세요.

**분석 영역:**
1. 구조 및 논리적 흐름
2. 내용의 깊이와 독창성
3. 문체와 가독성
4. 감정적 공감도와 몰입도
5. 전체적인 완성도

**피드백 형식:**
1. 잘된 점 (구체적으로)
2. 개선할 점 (실천 가능한 제안)
3. 점수 및 평가
4. 다음 단계 제안

격려와 코칭 관점에서 따뜻하면서도 전문적으로 피드백해주세요.
`.trim()
}
