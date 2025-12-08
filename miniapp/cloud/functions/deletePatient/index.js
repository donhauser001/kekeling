// 云函数入口文件 - 删除就诊人
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { id } = event

  try {
    if (!id) {
      return {
        code: 40001,
        message: '缺少就诊人ID'
      }
    }

    // 验证就诊人归属
    const patientRes = await db.collection('patients').doc(id).get()
    
    if (!patientRes.data) {
      return {
        code: 40401,
        message: '就诊人不存在'
      }
    }

    if (patientRes.data._openid !== openid) {
      return {
        code: 40301,
        message: '无权删除该就诊人'
      }
    }

    // 删除
    await db.collection('patients').doc(id).remove()

    return {
      code: 0,
      message: 'success'
    }
  } catch (err) {
    console.error('删除就诊人失败:', err)
    return {
      code: 50001,
      message: '删除就诊人失败',
      error: err.message
    }
  }
}

