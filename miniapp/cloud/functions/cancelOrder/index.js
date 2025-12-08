// 云函数入口文件 - 取消订单
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { orderId, reason } = event

  try {
    if (!orderId) {
      return {
        code: 40001,
        message: '缺少订单ID'
      }
    }

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

    // 验证订单状态
    const cancelableStatus = ['pending', 'paid', 'confirmed']
    if (!cancelableStatus.includes(order.status)) {
      return {
        code: 40001,
        message: '当前订单状态不可取消'
      }
    }

    // 更新订单状态
    const now = new Date()
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        cancelReason: reason || '用户主动取消',
        cancelTime: now,
        updatedAt: now
      }
    })

    // TODO: 如果已支付，需要发起退款

    return {
      code: 0,
      message: 'success',
      data: {
        orderId,
        status: 'cancelled'
      }
    }
  } catch (err) {
    console.error('取消订单失败:', err)
    return {
      code: 50001,
      message: '取消订单失败',
      error: err.message
    }
  }
}

