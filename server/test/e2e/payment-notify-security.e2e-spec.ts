import { PaymentService } from '../../src/modules/payment/payment.service'

function buildXml(fields: Record<string, string>) {
  const body = Object.entries(fields)
    .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
    .join('')
  return `<xml>${body}</xml>`
}

describe('Payment notify security checks', () => {
  it('rejects callback with invalid signature', async () => {
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      membershipOrder: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as ConstructorParameters<typeof PaymentService>[0]

    const notificationService = { send: jest.fn() } as unknown as ConstructorParameters<
      typeof PaymentService
    >[1]

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

    const xml = buildXml({
      return_code: 'SUCCESS',
      result_code: 'SUCCESS',
      appid: 'wx-app',
      mch_id: 'mch-001',
      out_trade_no: 'ORDER_001',
      transaction_id: 'TX_001',
      total_fee: '100',
      sign: 'INVALID_SIGN',
    })

    const result = await service.handlePaymentNotify(xml)
    expect(result.success).toBe(false)
    expect(result.message).toContain('签名')
  })
})

