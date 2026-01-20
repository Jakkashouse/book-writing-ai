import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { tossPayments } from '@/lib/toss'
import { PaymentCancelRequest } from '@/types/payment'
import { z } from 'zod'

const cancelPaymentSchema = z.object({
  paymentId: z.string().min(1),
  cancelReason: z.string().min(1),
  cancelAmount: z.number().positive().optional(),
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
    const validatedData = cancelPaymentSchema.parse(body) as PaymentCancelRequest

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: validatedData.paymentId },
      include: { user: true },
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

    // Verify payment is completed
    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed payments can be cancelled' },
        { status: 400 }
      )
    }

    if (!payment.paymentKey) {
      return NextResponse.json(
        { error: 'Payment key not found' },
        { status: 400 }
      )
    }

    // Cancel payment with Toss Payments
    const tossResponse = await tossPayments.cancelPayment({
      paymentKey: payment.paymentKey,
      cancelReason: validatedData.cancelReason,
      cancelAmount: validatedData.cancelAmount,
    })

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
        cancelReason: validatedData.cancelReason,
        cancelledAt: new Date(),
      },
    })

    // If payment is linked to a subscription, cancel it
    if (payment.subscriptionId) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          autoRenew: false,
        },
      })
    }

    return NextResponse.json({
      id: updatedPayment.id,
      orderId: updatedPayment.orderId,
      status: updatedPayment.status,
      cancelReason: updatedPayment.cancelReason,
      cancelledAt: updatedPayment.cancelledAt,
    })
  } catch (error: any) {
    console.error('Payment cancellation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to cancel payment' },
      { status: 500 }
    )
  }
}
