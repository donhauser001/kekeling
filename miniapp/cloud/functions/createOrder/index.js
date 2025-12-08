// 云函数入口文件 - 创建订单
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `KKL${year}${month}${day}${Date.now().toString().slice(-6)}${random}`
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const {
    serviceId,
    hospitalId,
    departmentId,
    escortId,
    patientId,
    appointmentDate,
    appointmentTime,
    couponId,
    userRemark
  } = event

  try {
    // 验证必填字段
    if (!serviceId || !hospitalId || !patientId || !appointmentDate || !appointmentTime) {
      return {
        code: 40001,
        message: '缺少必填参数'
      }
    }

    // 获取服务信息
    const serviceRes = await db.collection('services').doc(serviceId).get()
    if (!serviceRes.data) {
      return {
        code: 40401,
        message: '服务不存在'
      }
    }
    const service = serviceRes.data

    // 获取医院信息
    const hospitalRes = await db.collection('hospitals').doc(hospitalId).get()
    if (!hospitalRes.data) {
      return {
        code: 40401,
        message: '医院不存在'
      }
    }
    const hospital = hospitalRes.data

    // 获取就诊人信息
    const patientRes = await db.collection('patients').doc(patientId).get()
    if (!patientRes.data) {
      return {
        code: 40401,
        message: '就诊人不存在'
      }
    }
    const patient = patientRes.data

    // 验证就诊人归属
    if (patient._openid !== openid) {
      return {
        code: 40301,
        message: '无权使用该就诊人'
      }
    }

    // 获取陪诊员信息（可选）
    let escort = null
    if (escortId) {
      const escortRes = await db.collection('escorts').doc(escortId).get()
      escort = escortRes.data
    }

    // 获取科室信息（可选）
    let department = null
    if (departmentId) {
      const deptRes = await db.collection('departments').doc(departmentId).get()
      department = deptRes.data
    }

    // 计算价格
    let totalAmount = service.price
    let discountAmount = 0
    let couponAmount = 0

    // TODO: 优惠券逻辑
    // if (couponId) { ... }

    const paidAmount = totalAmount - discountAmount - couponAmount

    // 创建订单
    const now = new Date()
    const orderData = {
      _openid: openid,
      orderNo: generateOrderNo(),
      
      serviceId: service._id,
      serviceName: service.name,
      serviceCategory: service.categoryName,
      
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      departmentId: department?._id || '',
      departmentName: department?.name || '',
      
      appointmentDate,
      appointmentTime,
      
      patientId: patient._id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientIdCard: patient.idCard,
      
      escortId: escort?._id || null,
      escortName: escort?.name || null,
      escortPhone: escort?.phone || null,
      
      totalAmount,
      discountAmount,
      couponId: couponId || null,
      couponAmount,
      paidAmount,
      
      paymentMethod: null,
      paymentTime: null,
      transactionId: null,
      
      status: 'pending',
      source: 'miniprogram',
      
      userRemark: userRemark || '',
      adminRemark: '',
      
      rating: null,
      review: null,
      reviewTime: null,
      
      cancelReason: null,
      cancelTime: null,
      refundAmount: null,
      refundTime: null,
      
      createdAt: now,
      updatedAt: now
    }

    const addRes = await db.collection('orders').add({
      data: orderData
    })

    // 更新服务订单数
    await db.collection('services').doc(serviceId).update({
      data: {
        orderCount: db.command.inc(1)
      }
    })

    return {
      code: 0,
      message: 'success',
      data: {
        orderId: addRes._id,
        orderNo: orderData.orderNo,
        totalAmount,
        discountAmount,
        paidAmount,
        status: 'pending'
      }
    }
  } catch (err) {
    console.error('创建订单失败:', err)
    return {
      code: 50001,
      message: '创建订单失败',
      error: err.message
    }
  }
}

