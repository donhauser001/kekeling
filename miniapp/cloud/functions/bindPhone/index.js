// 云函数入口文件 - 绑定手机号
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { cloudID } = event

  try {
    // 使用 cloudID 获取手机号
    let phoneNumber = ''
    
    if (cloudID) {
      // 通过 cloudID 获取开放数据
      const res = await cloud.getOpenData({
        list: [cloudID]
      })
      
      if (res.list && res.list[0] && res.list[0].data) {
        const phoneData = JSON.parse(res.list[0].data)
        phoneNumber = phoneData.phoneNumber
      }
    } else if (event.phoneNumber) {
      // 直接传入手机号（测试用）
      phoneNumber = event.phoneNumber
    }

    if (!phoneNumber) {
      return {
        code: 40001,
        message: '获取手机号失败'
      }
    }

    // 更新用户手机号
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        phone: phoneNumber,
        updatedAt: new Date()
      }
    })

    // 脱敏处理
    const maskedPhone = phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')

    return {
      code: 0,
      message: 'success',
      data: {
        phone: maskedPhone
      }
    }
  } catch (err) {
    console.error('绑定手机号失败:', err)
    return {
      code: 50001,
      message: '绑定手机号失败',
      error: err.message
    }
  }
}

