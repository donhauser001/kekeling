/**
 * 微信支付工具函数
 */
import Taro from '@tarojs/taro'
import { paymentApi } from '../services/api'

interface PaymentResult {
  success: boolean
  errMsg?: string
}

/**
 * 发起微信支付
 * @param orderId 订单ID
 */
export async function wxPay(orderId: string): Promise<PaymentResult> {
  try {
    // 1. 获取预支付参数
    Taro.showLoading({ title: '获取支付参数...' })
    const payParams = await paymentApi.prepay(orderId)
    Taro.hideLoading()

    // 2. 调起微信支付
    return new Promise((resolve) => {
      Taro.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType as 'MD5' | 'RSA',
        paySign: payParams.paySign,
        success: () => {
          resolve({ success: true })
        },
        fail: (err) => {
          // 用户取消支付
          if (err.errMsg.includes('cancel')) {
            resolve({ success: false, errMsg: '支付取消' })
          } else {
            resolve({ success: false, errMsg: err.errMsg || '支付失败' })
          }
        },
      })
    })
  } catch (error: any) {
    Taro.hideLoading()
    return { success: false, errMsg: error.message || '支付失败' }
  }
}

/**
 * 模拟支付（开发环境使用）
 * @param orderId 订单ID
 */
export async function mockPay(orderId: string): Promise<PaymentResult> {
  try {
    Taro.showLoading({ title: '处理中...' })
    await paymentApi.mockPay(orderId)
    Taro.hideLoading()
    return { success: true }
  } catch (error: any) {
    Taro.hideLoading()
    return { success: false, errMsg: error.message || '支付失败' }
  }
}

/**
 * 查询支付状态
 * @param orderId 订单ID
 */
export async function queryPaymentStatus(orderId: string) {
  return paymentApi.queryStatus(orderId)
}

/**
 * 统一支付接口
 * 开发环境使用模拟支付，生产环境使用真实微信支付
 * @param orderId 订单ID
 */
export async function pay(orderId: string): Promise<PaymentResult> {
  // 判断是否为开发环境
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    // 开发环境：弹窗询问使用模拟支付还是真实支付
    return new Promise((resolve) => {
      Taro.showModal({
        title: '支付方式',
        content: '开发环境下，选择支付方式',
        confirmText: '模拟支付',
        cancelText: '真实支付',
        success: async (res) => {
          if (res.confirm) {
            // 模拟支付
            const result = await mockPay(orderId)
            resolve(result)
          } else if (res.cancel) {
            // 真实微信支付
            const result = await wxPay(orderId)
            resolve(result)
          } else {
            resolve({ success: false, errMsg: '取消支付' })
          }
        },
      })
    })
  } else {
    // 生产环境：直接调用微信支付
    return wxPay(orderId)
  }
}

