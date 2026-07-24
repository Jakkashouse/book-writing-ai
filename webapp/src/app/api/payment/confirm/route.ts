import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { tossPayments } from '@/lib/toss'
import { PaymentConfirmRequest } from '@/types/payment'
import { z } from 'zod'

const confirmPaymentSchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().positive(),
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
    const validatedData = confirmPaymentSchema.parse(body) as PaymentConfirmRequest

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId: validatedData.orderId },
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

    // Verify amount matches
    if (payment.amount !== validatedData.amount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // Confirm payment with Toss Payments
    const tossResponse = await tossPayments.confirmPayment({
      paymentKey: validatedData.paymentKey,
      orderId: validatedData.orderId,
      amount: validatedData.amount,
    })

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paymentKey: validatedData.paymentKey,
        method: tossResponse.method,
        approvedAt: new Date(tossResponse.approvedAt),
        receiptUrl: tossResponse.receipt?.url,
      },
    })

    // Get plan from metadata
    const plan = (payment.metadata as any)?.plan || 'PRO'

    // Create or update subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: payment.userId,
        status: 'ACTIVE',
      },
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan,
          status: 'ACTIVE',
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: payment.userId,
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true,
        },
      })
    }

    // Link payment to subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: payment.userId,
        status: 'ACTIVE',
      },
    })

    if (subscription) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { subscriptionId: subscription.id },
      })
    }

    return NextResponse.json({
      id: updatedPayment.id,
      orderId: updatedPayment.orderId,
      orderName: updatedPayment.orderName,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      method: updatedPayment.method,
      approvedAt: updatedPayment.approvedAt,
      receiptUrl: updatedPayment.receiptUrl,
    })
  } catch (error: any) {
    console.error('Payment confirmation error:', error)

    // Update payment status to failed
    if (error?.response?.data) {
      const { orderId } = await request.json()
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'FAILED',
          failReason: error.response.data.message || 'Payment confirmation failed',
        },
      })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
