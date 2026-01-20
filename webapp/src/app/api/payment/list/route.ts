import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

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
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const payments = user.payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      orderName: payment.orderName,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      approvedAt: payment.approvedAt,
      paymentKey: payment.paymentKey,
      cancelReason: payment.cancelReason,
      cancelledAt: payment.cancelledAt,
      receiptUrl: payment.receiptUrl,
      createdAt: payment.createdAt,
    }))

    return NextResponse.json(payments)
  } catch (error) {
    console.error('List payments error:', error)
    return NextResponse.json(
      { error: 'Failed to list payments' },
      { status: 500 }
    )
  }
}
