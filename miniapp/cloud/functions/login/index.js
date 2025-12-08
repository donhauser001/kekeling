// 云函数入口文件 - 用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const unionid = wxContext.UNIONID

  try {
    // 查找用户
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let user = userRes.data[0]
    let isNewUser = false

    if (!user) {
      // 新用户，创建记录
      isNewUser = true
      const now = new Date()
      const newUser = {
        _openid: openid,
        unionid: unionid || '',
        phone: '',
        nickname: '微信用户',
        avatar: '',
        gender: 'unknown',
        status: 'active',
        memberLevel: 'normal',
        points: 0,
        createdAt: now,
        updatedAt: now
      }

      const addRes = await db.collection('users').add({
        data: newUser
      })

      user = {
        _id: addRes._id,
        ...newUser
      }
    } else {
      // 更新最后登录时间
      await db.collection('users').doc(user._id).update({
        data: {
          updatedAt: new Date()
        }
      })
    }

    return {
      code: 0,
      message: 'success',
      data: {
        openid: openid,
        user: {
          id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          gender: user.gender,
          status: user.status,
          memberLevel: user.memberLevel,
          points: user.points
        },
        isNewUser: isNewUser,
        needBindPhone: !user.phone
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      code: 50001,
      message: '登录失败',
      error: err.message
    }
  }
}

