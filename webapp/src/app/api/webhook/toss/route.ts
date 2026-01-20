import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Toss Payments webhook event types
    const { eventType, data } = body

    switch (eventType) {
      case 'PAYMENT_APPROVED':
        await handlePaymentApproved(data)
        break

      case 'PAYMENT_CANCELLED':
        await handlePaymentCancelled(data)
        break

      case 'PAYMENT_FAILED':
        await handlePaymentFailed(data)
        break

      case 'VIRTUAL_ACCOUNT_ISSUED':
        await handleVirtualAccountIssued(data)
        break

      case 'VIRTUAL_ACCOUNT_DEPOSIT':
        await handleVirtualAccountDeposit(data)
        break

      default:
        console.log('Unknown webhook event type:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handlePaymentApproved(data: any) {
  const { orderId, paymentKey, method, approvedAt, receipt } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId },
  })

  if (!payment) {
    console.error('Payment not found for webhook:', orderId)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      paymentKey,
      method,
      approvedAt: new Date(approvedAt),
      receiptUrl: receipt?.url,
    },
  })

  console.log('Payment approved via webhook:', orderId)
}

async function handlePaymentCancelled(data: any) {
  const { orderId, cancels } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId },
  })

  if (!payment) {
    console.error('Payment not found for webhook:', orderId)
    return
  }

  const lastCancel = cancels[cancels.length - 1]

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CANCELLED',
      cancelReason: lastCancel.cancelReason,
      cancelledAt: new Date(lastCancel.canceledAt),
    },
  })

  // Cancel associated subscription if exists
  if (payment.subscriptionId) {
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
        cancelledAt: new Date(),
      },
    })
  }

  console.log('Payment cancelled via webhook:', orderId)
}

async function handlePaymentFailed(data: any) {
  const { orderId, failure } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId },
  })

  if (!payment) {
    console.error('Payment not found for webhook:', orderId)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      failReason: failure?.message || 'Payment failed',
    },
  })

  console.log('Payment failed via webhook:', orderId)
}

async function handleVirtualAccountIssued(data: any) {
  const { orderId, virtualAccount } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId },
  })

  if (!payment) {
    console.error('Payment not found for webhook:', orderId)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        ...(payment.metadata as object),
        virtualAccount,
      },
    },
  })

  console.log('Virtual account issued via webhook:', orderId)
}

async function handleVirtualAccountDeposit(data: any) {
  const { orderId, paymentKey, method, approvedAt } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId },
  })

  if (!payment) {
    console.error('Payment not found for webhook:', orderId)
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      paymentKey,
      method,
      approvedAt: new Date(approvedAt),
    },
  })

  console.log('Virtual account deposit via webhook:', orderId)
}
