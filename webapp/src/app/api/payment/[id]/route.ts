import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentId = params.id

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify user owns this payment
    if (payment.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
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
      metadata: payment.metadata,
    })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment' },
      { status: 500 }
    )
  }
}
