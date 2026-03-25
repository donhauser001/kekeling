import * as crypto from 'crypto'
import { BadRequestException } from '@nestjs/common'
import { PaymentService } from '../../src/modules/payment/payment.service'

function buildXml(fields: Record<string, string>) {
  const body = Object.entries(fields)
    .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
    .join('')
  return `<xml>${body}</xml>`
}

function createWechatSign(fields: Record<string, string>, apiKey: string) {
  const stringA = Object.keys(fields)
    .filter((key) => fields[key] !== '')
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join('&')

  return crypto
    .createHash('md5')
    .update(`${stringA}&key=${apiKey}`, 'utf8')
    .digest('hex')
    .toUpperCase()
}

function createService() {
  const prisma = {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    membershipOrder: {
      findUnique: jest.fn(),
    },
  } as unknown as ConstructorParameters<typeof PaymentService>[0]

  const notificationService = {
    send: jest.fn().mockResolvedValue(undefined),
  } as unknown as ConstructorParameters<typeof PaymentService>[1]

  const configService = {
    getWechatPaySettings: jest.fn().mockResolvedValue({
      enabled: true,
      appId: 'wx-app',
      mchId: 'mch-001',
      apiKey: 'secret-key',
      notifyUrl: 'https://example.com/api/payment/notify',
    }),
  } as unknown as ConstructorParameters<typeof PaymentService>[2]

  const service = new PaymentService(prisma, notificationService, configService)
  ;(service as any).handleUserSelectEscort = jest.fn().mockResolvedValue(false)

  return {
    service,
    prisma: prisma as any,
    notificationService: notificationService as any,
    configService: configService as any,
  }
}

describe('Payment status recovery', () => {
  it('syncs pending order to paid when queryPaymentStatus finds a paid WeChat order', async () => {
    const { service, prisma, notificationService } = createService()

    prisma.order.findUnique
      .mockResolvedValueOnce({
        id: 'order-1',
        orderNo: 'KKL202603190001',
        userId: 'user-1',
        status: 'pending',
        transactionId: null,
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        orderNo: 'KKL202603190001',
        userId: 'user-1',
        status: 'paid',
        transactionId: 'wx-tx-1',
      })
    prisma.order.updateMany.mockResolvedValue({ count: 1 })

    ;(service as any).httpPost = jest.fn().mockResolvedValue(
      buildXml({
        return_code: 'SUCCESS',
        result_code: 'SUCCESS',
        trade_state: 'SUCCESS',
        transaction_id: 'wx-tx-1',
        time_end: '20260319124030',
      }),
    )

    const result = await service.queryPaymentStatus('order-1')

    expect(result).toEqual({
      paid: true,
      status: 'paid',
      transactionId: 'wx-tx-1',
    })
    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'pending' },
        data: expect.objectContaining({
          status: 'paid',
          paymentMethod: 'wechat',
          transactionId: 'wx-tx-1',
        }),
      }),
    )
    expect(notificationService.send).toHaveBeenCalled()
  })

  it('recovers local order status before surfacing ORDERPAID from unified order', async () => {
    const { service, prisma, notificationService } = createService()

    prisma.order.findUnique.mockResolvedValue({
      id: 'order-2',
      orderNo: 'KKL202603190002',
      userId: 'user-2',
      status: 'pending',
      paidAmount: 68,
      service: { name: '诊前咨询' },
    })
    prisma.order.updateMany.mockResolvedValue({ count: 1 })

    const unifiedOrderFields = {
      return_code: 'SUCCESS',
      result_code: 'FAIL',
      err_code: 'ORDERPAID',
      err_code_des: '该订单已支付',
    }

    const queryOrderFields = {
      return_code: 'SUCCESS',
      result_code: 'SUCCESS',
      trade_state: 'SUCCESS',
      transaction_id: 'wx-tx-2',
      time_end: '20260319124100',
    }

    ;(service as any).httpPost = jest
      .fn()
      .mockResolvedValueOnce(buildXml(unifiedOrderFields))
      .mockResolvedValueOnce(buildXml(queryOrderFields))

    try {
      await service.createPrepay({
        orderId: 'order-2',
        openid: 'openid-123',
      })
      throw new Error('expected createPrepay to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect((error as Error).message).toContain('该订单已支付')
    }

    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-2', status: 'pending' },
        data: expect.objectContaining({
          status: 'paid',
          transactionId: 'wx-tx-2',
        }),
      }),
    )
    expect(notificationService.send).toHaveBeenCalled()
  })

  it('accepts valid signed notify callback and marks the order paid', async () => {
    const { service, prisma, notificationService } = createService()

    prisma.order.findUnique.mockResolvedValue({
      id: 'order-3',
      orderNo: 'KKL202603190003',
      userId: 'user-3',
      status: 'pending',
      paidAmount: 68,
    })
    prisma.membershipOrder.findUnique.mockResolvedValue(null)
    prisma.order.updateMany.mockResolvedValue({ count: 1 })

    const fields = {
      return_code: 'SUCCESS',
      result_code: 'SUCCESS',
      appid: 'wx-app',
      mch_id: 'mch-001',
      out_trade_no: 'KKL202603190003',
      transaction_id: 'wx-tx-3',
      total_fee: '6800',
    }

    const xml = buildXml({
      ...fields,
      sign: createWechatSign(fields, 'secret-key'),
    })

    const result = await service.handlePaymentNotify(xml)

    expect(result).toEqual({ success: true, message: 'OK' })
    expect(prisma.order.updateMany).toHaveBeenCalled()
    expect(notificationService.send).toHaveBeenCalled()
  })
})
