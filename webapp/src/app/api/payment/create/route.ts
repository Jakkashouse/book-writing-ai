import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PaymentCreateRequest } from '@/types/payment'
import { z } from 'zod'

const createPaymentSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'PREMIUM']),
  amount: z.number().positive(),
  orderName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
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
    const validatedData = createPaymentSchema.parse(body) as PaymentCreateRequest

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        orderId,
        orderName: validatedData.orderName,
        amount: validatedData.amount,
        status: 'PENDING',
        metadata: {
          plan: validatedData.plan,
          customerEmail: validatedData.customerEmail || session.user.email,
          customerName: validatedData.customerName || user.name,
        },
      },
    })

    return NextResponse.json({
      orderId: payment.orderId,
      amount: payment.amount,
      orderName: payment.orderName,
      customerEmail: validatedData.customerEmail || session.user.email,
      customerName: validatedData.customerName || user.name || '',
    })
  } catch (error) {
    console.error('Payment creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
