// 云函数入口文件 - 微信支付
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { orderId, action } = event

  try {
    // 获取订单
    const orderRes = await db.collection('orders').doc(orderId).get()
    
    if (!orderRes.data) {
      return {
        code: 40401,
        message: '订单不存在'
      }
    }

    const order = orderRes.data

    // 验证订单归属
    if (order._openid !== openid) {
      return {
        code: 40301,
        message: '无权操作该订单'
      }
    }

    if (action === 'prepay') {
      // 发起支付
      if (order.status !== 'pending') {
        return {
          code: 40001,
          message: '订单状态不正确'
        }
      }

      // 调用微信支付统一下单
      const res = await cloud.cloudPay.unifiedOrder({
        body: `可客灵陪诊-${order.serviceName}`,
        outTradeNo: order.orderNo,
        spbillCreateIp: '127.0.0.1',
        subMchId: '商户号', // 需要替换为真实商户号
        totalFee: Math.round(order.paidAmount * 100), // 转为分
        envId: cloud.DYNAMIC_CURRENT_ENV,
        functionName: 'wxpay', // 支付结果通知回调云函数
        nonceStr: Math.random().toString(36).substr(2, 15),
        tradeType: 'JSAPI'
      })

      if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
        return {
          code: 0,
          message: 'success',
          data: {
            payment: res.payment
          }
        }
      } else {
        return {
          code: 50001,
          message: res.returnMsg || '发起支付失败'
        }
      }
    } else if (action === 'callback') {
      // 支付回调
      const { outTradeNo, transactionId, resultCode } = event

      if (resultCode === 'SUCCESS') {
        // 支付成功，更新订单状态
        const now = new Date()
        await db.collection('orders').where({
          orderNo: outTradeNo
        }).update({
          data: {
            status: 'paid',
            paymentMethod: 'wechat',
            paymentTime: now,
            transactionId: transactionId,
            updatedAt: now
          }
        })
      }

      return { errcode: 0 }
    }

    return {
      code: 40001,
      message: '未知操作'
    }
  } catch (err) {
    console.error('支付失败:', err)
    return {
      code: 50001,
      message: '支付失败',
      error: err.message
    }
  }
}

