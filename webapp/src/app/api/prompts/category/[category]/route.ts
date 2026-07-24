import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PromptCategory } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/prompts/category/[category] - 카테고리별 프롬프트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: categoryParam } = await params;
    const category = categoryParam.toUpperCase() as PromptCategory;

    // 카테고리 유효성 검사
    const validCategories = [
      'TITLE_TOC',
      'DRAFT',
      'EDITING',
      'PROPOSAL',
      'MARKETING',
      'COACHING',
      'WORKFLOW',
      'BUSINESS',
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const prompts = await prisma.promptTemplate.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        variables: true,
        tags: true,
        order: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ prompts, category });
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
