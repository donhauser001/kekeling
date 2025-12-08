// 云函数入口文件 - 获取订单列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { status, orderId, page = 1, pageSize = 20 } = event

  try {
    // 如果指定了 orderId，返回单个订单详情
    if (orderId) {
      const orderRes = await db.collection('orders').doc(orderId).get()
      
      if (!orderRes.data) {
        return {
          code: 40401,
          message: '订单不存在'
        }
      }

      // 验证订单归属
      if (orderRes.data._openid !== openid) {
        return {
          code: 40301,
          message: '无权查看该订单'
        }
      }

      const order = orderRes.data
      return {
        code: 0,
        message: 'success',
        data: {
          id: order._id,
          orderNo: order.orderNo,
          status: order.status,
          serviceName: order.serviceName,
          serviceCategory: order.serviceCategory,
          hospitalName: order.hospitalName,
          departmentName: order.departmentName,
          appointmentDate: order.appointmentDate,
          appointmentTime: order.appointmentTime,
          patientName: order.patientName,
          patientPhone: order.patientPhone,
          escortName: order.escortName,
          escortPhone: order.escortPhone,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          paidAmount: order.paidAmount,
          userRemark: order.userRemark,
          paymentTime: order.paymentTime,
          createdAt: order.createdAt,
          rating: order.rating,
          review: order.review
        }
      }
    }

    // 构建查询条件
    const where = {
      _openid: openid
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // 获取总数
    const countRes = await db.collection('orders').where(where).count()
    const total = countRes.total

    // 获取列表
    const listRes = await db.collection('orders')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(order => ({
      id: order._id,
      orderNo: order.orderNo,
      serviceName: order.serviceName,
      serviceCategory: order.serviceCategory,
      hospitalName: order.hospitalName,
      escortName: order.escortName,
      escortAvatar: '', // TODO: 关联获取
      appointmentDate: order.appointmentDate,
      appointmentTime: order.appointmentTime,
      status: order.status,
      paidAmount: order.paidAmount,
      createdAt: order.createdAt
    }))

    return {
      code: 0,
      message: 'success',
      data: {
        list,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  } catch (err) {
    console.error('获取订单失败:', err)
    return {
      code: 50001,
      message: '获取订单失败',
      error: err.message
    }
  }
}

