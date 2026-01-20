import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// POST /api/prompts/usage - 프롬프트 사용 기록 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { promptId, variables, result } = body;

    if (!promptId) {
      return NextResponse.json(
        { error: 'promptId is required' },
        { status: 400 }
      );
    }

    // 사용 기록 생성
    const usageLog = await prisma.promptUsageLog.create({
      data: {
        userId: user.id,
        promptId,
        variables: variables || null,
        result: result || null,
      },
    });

    return NextResponse.json({ usageLog, message: 'Usage logged successfully' });
  } catch (error) {
    console.error('Error logging usage:', error);
    return NextResponse.json(
      { error: 'Failed to log usage' },
      { status: 500 }
    );
  }
}

// GET /api/prompts/usage - 사용 기록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const promptId = searchParams.get('promptId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {
      userId: user.id,
    };

    if (promptId) {
      where.promptId = promptId;
    }

    const [usageLogs, total] = await Promise.all([
      prisma.promptUsageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          prompt: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.promptUsageLog.count({ where }),
    ]);

    return NextResponse.json({
      usageLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching usage logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage logs' },
      { status: 500 }
    );
  }
}
