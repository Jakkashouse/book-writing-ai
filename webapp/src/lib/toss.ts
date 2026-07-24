import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''
const secretKey = process.env.TOSS_SECRET_KEY || ''

export interface TossPaymentRequest {
  orderId: string
  orderName: string
  amount: number
  customerEmail?: string
  customerName?: string
}

export interface TossPaymentConfirm {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossPaymentCancel {
  paymentKey: string
  cancelReason: string
  cancelAmount?: number
}

export class TossPaymentsAPI {
  private readonly baseUrl = 'https://api.tosspayments.com/v1'
  private readonly secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(this.secretKey + ':').toString('base64')
  }

  async confirmPayment(data: TossPaymentConfirm) {
    const response = await fetch(`${this.baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Payment confirmation failed')
    }

    return response.json()
  }

  async getPayment(paymentKey: string) {
    const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get payment')
    }

    return response.json()
  }

  async cancelPayment(data: TossPaymentCancel) {
    const response = await fetch(
      `${this.baseUrl}/payments/${data.paymentKey}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: data.cancelReason,
          cancelAmount: data.cancelAmount,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Payment cancellation failed')
    }

    return response.json()
  }
}

export const tossPayments = new TossPaymentsAPI(secretKey)

export async function loadTossPaymentWidget(customerKey: string) {
  return await loadPaymentWidget(clientKey, customerKey)
}
