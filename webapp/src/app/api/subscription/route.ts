import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET: Get current user's subscription
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const subscription = user.subscriptions[0]

    if (!subscription) {
      // Create default FREE subscription
      const freeSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          status: 'ACTIVE',
          startDate: new Date(),
          autoRenew: false,
        },
      })

      return NextResponse.json({
        id: freeSubscription.id,
        userId: freeSubscription.userId,
        plan: freeSubscription.plan,
        status: freeSubscription.status,
        startDate: freeSubscription.startDate,
        endDate: freeSubscription.endDate,
        trialEndsAt: freeSubscription.trialEndsAt,
        autoRenew: freeSubscription.autoRenew,
        cancelledAt: freeSubscription.cancelledAt,
        createdAt: freeSubscription.createdAt,
      })
    }

    return NextResponse.json({
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEndsAt: subscription.trialEndsAt,
      autoRenew: subscription.autoRenew,
      cancelledAt: subscription.cancelledAt,
      createdAt: subscription.createdAt,
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}
