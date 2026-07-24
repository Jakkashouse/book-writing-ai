import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const changeSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'PREMIUM']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = changeSubscriptionSchema.parse(body)

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

    const currentSubscription = user.subscriptions[0]

    if (!currentSubscription) {
      // Create new subscription if none exists
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: validatedData.plan,
          status: 'ACTIVE',
          startDate: new Date(),
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: validatedData.plan !== 'FREE',
        },
      })

      return NextResponse.json({
        id: newSubscription.id,
        userId: newSubscription.userId,
        plan: newSubscription.plan,
        status: newSubscription.status,
        startDate: newSubscription.startDate,
        endDate: newSubscription.endDate,
        autoRenew: newSubscription.autoRenew,
      })
    }

    // Update existing subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        plan: validatedData.plan,
        autoRenew: validatedData.plan !== 'FREE',
        billingCycleStart: new Date(),
        billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({
      id: updatedSubscription.id,
      userId: updatedSubscription.userId,
      plan: updatedSubscription.plan,
      status: updatedSubscription.status,
      startDate: updatedSubscription.startDate,
      endDate: updatedSubscription.endDate,
      autoRenew: updatedSubscription.autoRenew,
    })
  } catch (error) {
    console.error('Change subscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to change subscription' },
      { status: 500 }
    )
  }
}
