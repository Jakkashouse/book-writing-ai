import { PrismaClient, PromptCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PromptData {
  name: string;
  description: string;
  category: PromptCategory;
  template: string;
  variables: string[];
  tags: string[];
  order: number;
}

// 프롬프트 파일 매핑
const promptFiles: PromptData[] = [
  // 제목/목차 기획 (TITLE_TOC)
  {
    name: '제목/목차 기획',
    description: '세계 최고 수준의 책 제목/목차 개발 전문가 시스템 프롬프트',
    category: 'TITLE_TOC',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/01-제목목차기획.md'), 'utf-8'),
    variables: ['작가정보', '책주제', '타겟독자', '장르'],
    tags: ['제목', '목차', '기획', '베스트셀러'],
    order: 1
  },

  // 초안 작성 (DRAFT)
  {
    name: '초안 작성',
    description: '작가의 목소리를 살리면서 독자를 사로잡는 초안 작성 전문가',
    category: 'DRAFT',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/02-초안작성.md'), 'utf-8'),
    variables: ['챕터제목', '핵심메시지', '작가샘플텍스트', '참고자료'],
    tags: ['초안', '글쓰기', '스토리텔링', '작가목소리'],
    order: 2
  },

  // 원고 교정 (EDITING)
  {
    name: '원고 교정',
    description: '출판사 편집자 수준의 꼼꼼한 맞춤법, 띄어쓰기, 비문 교정 전문가',
    category: 'EDITING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/03-원고교정.md'), 'utf-8'),
    variables: ['원고내용', '검토레벨'],
    tags: ['교정', '맞춤법', '띄어쓰기', '비문'],
    order: 3
  },

  {
    name: '원고 진단',
    description: '원고의 전체적인 품질과 개선점을 진단하는 전문가',
    category: 'EDITING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/04-원고진단.md'), 'utf-8'),
    variables: ['원고내용', '진단목적'],
    tags: ['진단', '분석', '피드백', '개선'],
    order: 4
  },

  // 출판 제안서 (PROPOSAL)
  {
    name: '출간 제안서',
    description: '잠재 작가에게 진심 어린 출간 제안서를 생성하는 전문가',
    category: 'PROPOSAL',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/24-출간제안서.md'), 'utf-8'),
    variables: ['대상자정보', '콘텐츠링크', '감동포인트', '제안유형'],
    tags: ['출간제안', '계약', '작가발굴', '러브레터'],
    order: 24
  },

  // 마케팅/홍보 (MARKETING)
  {
    name: '상세페이지 카피',
    description: '책 소개 페이지의 매력적인 카피를 작성하는 전문가',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/08-상세페이지카피.md'), 'utf-8'),
    variables: ['책정보', '타겟독자', '핵심메시지'],
    tags: ['카피라이팅', '마케팅', '홍보', '상세페이지'],
    order: 8
  },

  {
    name: '블로그/뉴스레터 생성',
    description: '책 홍보를 위한 블로그 포스트와 뉴스레터 작성 전문가',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/10-블로그뉴스레터생성.md'), 'utf-8'),
    variables: ['책정보', '콘텐츠유형', '타겟채널'],
    tags: ['블로그', '뉴스레터', '콘텐츠마케팅'],
    order: 10
  },

  {
    name: '책 홍보 투두리스트',
    description: '체계적인 책 홍보 계획 및 실행 체크리스트 생성',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/18-책홍보투두리스트.md'), 'utf-8'),
    variables: ['책정보', '출간일', '마케팅예산'],
    tags: ['홍보계획', '체크리스트', '마케팅전략'],
    order: 18
  },

  {
    name: '작가 인터뷰 질문 생성',
    description: '효과적인 작가 인터뷰 질문 세트 생성 전문가',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/19-작가인터뷰질문생성.md'), 'utf-8'),
    variables: ['작가정보', '책정보', '인터뷰목적'],
    tags: ['인터뷰', '질문', '미디어'],
    order: 19
  },

  {
    name: '독자 타겟팅 채널 전략',
    description: '타겟 독자에게 효과적으로 도달하는 채널 전략 수립',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/20-독자타겟팅채널전략.md'), 'utf-8'),
    variables: ['타겟독자', '책장르', '마케팅목표'],
    tags: ['타겟팅', '채널전략', '독자분석'],
    order: 20
  },

  {
    name: '책 리뷰 요청 문구',
    description: '독자와 인플루언서에게 리뷰를 요청하는 효과적인 문구 작성',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/21-책리뷰요청문구.md'), 'utf-8'),
    variables: ['책정보', '요청대상', '리뷰채널'],
    tags: ['리뷰', '요청문구', 'SNS'],
    order: 21
  },

  {
    name: 'SNS 콘텐츠 캘린더',
    description: '체계적인 SNS 콘텐츠 발행 계획 및 캘린더 생성',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/22-SNS콘텐츠캘린더.md'), 'utf-8'),
    variables: ['책정보', 'SNS채널', '발행기간'],
    tags: ['SNS', '콘텐츠캘린더', '소셜미디어'],
    order: 22
  },

  {
    name: '강연/북토크 제안서',
    description: '강연 및 북토크 행사 제안서 작성 전문가',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/23-강연북토크제안서.md'), 'utf-8'),
    variables: ['책정보', '강연주제', '대상기관'],
    tags: ['강연', '북토크', '제안서', '행사'],
    order: 23
  },

  {
    name: '도서 상세페이지 카피',
    description: '온라인 서점용 매력적인 도서 상세페이지 작성',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/26-도서상세페이지카피.md'), 'utf-8'),
    variables: ['책정보', '타겟독자', '주요특징'],
    tags: ['상세페이지', '온라인서점', '카피'],
    order: 26
  },

  {
    name: '도서 영상 대본 생성',
    description: '책 소개 영상 및 홍보 영상 대본 작성 전문가',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/27-도서영상대본생성.md'), 'utf-8'),
    variables: ['책정보', '영상길이', '영상목적'],
    tags: ['영상대본', '유튜브', '홍보영상'],
    order: 27
  },

  {
    name: '도서 보도자료 작성',
    description: '언론 배포용 전문적인 보도자료 작성',
    category: 'MARKETING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/43-도서보도자료작성.md'), 'utf-8'),
    variables: ['책정보', '출간의의', '작가정보'],
    tags: ['보도자료', '언론', 'PR'],
    order: 43
  },

  // 코칭/피드백 (COACHING)
  {
    name: '맞춤 과제 생성',
    description: '작가의 수준과 목표에 맞는 맞춤형 글쓰기 과제 생성',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/05-맞춤과제생성.md'), 'utf-8'),
    variables: ['작가수준', '목표', '주제'],
    tags: ['과제', '코칭', '연습', '성장'],
    order: 5
  },

  {
    name: '격려 메시지 생성',
    description: '작가에게 동기부여하는 따뜻한 격려 메시지 작성',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/06-격려메시지생성.md'), 'utf-8'),
    variables: ['작가상황', '진행상황', '어려움'],
    tags: ['격려', '동기부여', '응원'],
    order: 6
  },

  {
    name: 'FAQ 답변 생성',
    description: '작가들의 자주 묻는 질문에 대한 친절한 답변 생성',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/07-FAQ답변생성.md'), 'utf-8'),
    variables: ['질문내용', '작가상황'],
    tags: ['FAQ', '답변', '질문', '가이드'],
    order: 7
  },

  {
    name: '강의 커리큘럼 설계',
    description: '체계적인 책쓰기 강의 커리큘럼 설계 전문가',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/09-강의커리큘럼설계.md'), 'utf-8'),
    variables: ['강의목표', '수강대상', '강의기간'],
    tags: ['커리큘럼', '강의', '교육'],
    order: 9
  },

  {
    name: '수강생 모집 문구',
    description: '책쓰기 강의/프로그램 참가자 모집 문구 작성',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/11-수강생모집문구.md'), 'utf-8'),
    variables: ['프로그램정보', '대상자', '혜택'],
    tags: ['모집', '홍보', '수강생'],
    order: 11
  },

  {
    name: '설문지 진단',
    description: '작가 설문 결과 분석 및 맞춤형 피드백 제공',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/12-설문지진단.md'), 'utf-8'),
    variables: ['설문응답', '진단목적'],
    tags: ['설문', '진단', '분석'],
    order: 12
  },

  {
    name: '진도 트래커',
    description: '작가의 글쓰기 진행 상황 추적 및 피드백',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/13-진도트래커.md'), 'utf-8'),
    variables: ['목표', '현재진행상황', '기간'],
    tags: ['진도', '추적', '관리'],
    order: 13
  },

  {
    name: '챕터별 피드백',
    description: '각 챕터에 대한 상세한 피드백 및 개선 제안',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/14-챕터별피드백.md'), 'utf-8'),
    variables: ['챕터내용', '목표', '작가수준'],
    tags: ['피드백', '챕터', '개선'],
    order: 14
  },

  {
    name: '작가 셀프 체크리스트',
    description: '작가가 스스로 원고를 점검할 수 있는 체크리스트 생성',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/15-작가셀프체크리스트.md'), 'utf-8'),
    variables: ['원고유형', '점검목적'],
    tags: ['체크리스트', '셀프점검', '가이드'],
    order: 15
  },

  {
    name: '완주 동기부여 시스템',
    description: '작가가 책을 끝까지 완성하도록 돕는 동기부여 시스템',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/16-완주동기부여시스템.md'), 'utf-8'),
    variables: ['작가상황', '진행률', '어려움'],
    tags: ['동기부여', '완주', '지속'],
    order: 16
  },

  {
    name: '베타리더 피드백 분석',
    description: '베타리더 피드백을 체계적으로 분석하고 개선 방향 제시',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/17-베타리더피드백분석.md'), 'utf-8'),
    variables: ['피드백내용', '원고정보'],
    tags: ['베타리더', '피드백', '분석'],
    order: 17
  },

  {
    name: '상담 분석',
    description: '작가 상담 내용 분석 및 액션 플랜 제시',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/28-상담분석.md'), 'utf-8'),
    variables: ['상담내용', '작가정보'],
    tags: ['상담', '분석', '액션플랜'],
    order: 28
  },

  {
    name: '필체 분석 및 스타일 학습',
    description: '작가의 필체와 스타일을 분석하고 학습하는 전문가',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/25-필체분석스타일학습.md'), 'utf-8'),
    variables: ['샘플텍스트', '분석목적'],
    tags: ['필체', '스타일', '분석', '학습'],
    order: 25
  },

  {
    name: '스타일 반영 초안 작성',
    description: '학습한 작가 스타일을 반영하여 초안 작성',
    category: 'DRAFT',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/41-스타일반영초안작성.md'), 'utf-8'),
    variables: ['챕터주제', '작가스타일', '참고자료'],
    tags: ['초안', '스타일', 'AI작성'],
    order: 41
  },

  {
    name: '초안 피드백 생성',
    description: '작성된 초안에 대한 건설적인 피드백 제공',
    category: 'COACHING',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/42-초안피드백생성.md'), 'utf-8'),
    variables: ['초안내용', '피드백목적'],
    tags: ['피드백', '초안', '개선'],
    order: 42
  },

  {
    name: '녹음본 목차 배열',
    description: '음성 녹음 내용을 텍스트화하여 목차로 구조화',
    category: 'WORKFLOW',
    template: fs.readFileSync(path.join(__dirname, '../../prompts/44-녹음본목차배열.md'), 'utf-8'),
    variables: ['녹음텍스트', '주제'],
    tags: ['녹음', '목차', '구조화'],
    order: 44
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 기존 프롬프트 데이터 삭제
  await prisma.promptFavorite.deleteMany();
  await prisma.promptUsageLog.deleteMany();
  await prisma.promptTemplate.deleteMany();

  console.log('🗑️  Cleared existing prompt data');

  // 프롬프트 템플릿 생성
  let successCount = 0;
  let failCount = 0;

  for (const promptData of promptFiles) {
    try {
      await prisma.promptTemplate.create({
        data: promptData,
      });
      console.log(`✅ Created: ${promptData.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${promptData.name}:`, error);
      failCount++;
    }
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${promptFiles.length}`);
  console.log('\n✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
