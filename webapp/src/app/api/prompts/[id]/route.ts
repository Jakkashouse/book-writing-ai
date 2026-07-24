import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/prompts/[id] - 프롬프트 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usageLogs: true,
            favorites: true,
          },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // 사용 횟수 증가 (조회수)
    await prisma.promptTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}
