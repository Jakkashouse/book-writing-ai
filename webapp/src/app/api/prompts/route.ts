import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/prompts - 전체 프롬프트 목록 또는 검색
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { template: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // 프롬프트 조회
    const [prompts, total] = await Promise.all([
      prisma.promptTemplate.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
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
          // template은 상세 조회에서만 제공
        },
      }),
      prisma.promptTemplate.count({ where }),
    ]);

    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
