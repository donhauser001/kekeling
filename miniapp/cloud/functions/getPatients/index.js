// 云函数入口文件 - 获取就诊人列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const listRes = await db.collection('patients')
      .where({
        _openid: openid
      })
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
      .get()

    const list = listRes.data.map(p => ({
      id: p._id,
      name: p.name,
      phone: p.phone,
      idCard: p.idCard.replace(/(\d{3})\d{11}(\d{4})/, '$1***********$2'), // 脱敏
      gender: p.gender,
      birthday: p.birthday,
      relation: p.relation,
      medicalCardNo: p.medicalCardNo,
      isDefault: p.isDefault
    }))

    return {
      code: 0,
      message: 'success',
      data: list
    }
  } catch (err) {
    console.error('获取就诊人列表失败:', err)
    return {
      code: 50001,
      message: '获取就诊人列表失败',
      error: err.message
    }
  }
}

