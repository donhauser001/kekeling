// 云函数入口文件 - 保存就诊人
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { id, name, phone, idCard, gender, birthday, relation, medicalCardNo, isDefault } = event

  try {
    // 验证必填字段
    if (!name || !phone || !idCard || !relation) {
      return {
        code: 40001,
        message: '缺少必填参数'
      }
    }

    const now = new Date()

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await db.collection('patients')
        .where({
          _openid: openid,
          isDefault: true
        })
        .update({
          data: {
            isDefault: false,
            updatedAt: now
          }
        })
    }

    if (id) {
      // 更新就诊人
      const patientRes = await db.collection('patients').doc(id).get()
      
      if (!patientRes.data || patientRes.data._openid !== openid) {
        return {
          code: 40301,
          message: '无权操作该就诊人'
        }
      }

      await db.collection('patients').doc(id).update({
        data: {
          name,
          phone,
          idCard,
          gender: gender || 'unknown',
          birthday: birthday || '',
          relation,
          medicalCardNo: medicalCardNo || '',
          isDefault: isDefault || false,
          updatedAt: now
        }
      })

      return {
        code: 0,
        message: 'success',
        data: { id }
      }
    } else {
      // 新增就诊人
      // 检查数量限制
      const countRes = await db.collection('patients').where({ _openid: openid }).count()
      if (countRes.total >= 10) {
        return {
          code: 40001,
          message: '最多添加10个就诊人'
        }
      }

      const addRes = await db.collection('patients').add({
        data: {
          _openid: openid,
          name,
          phone,
          idCard,
          gender: gender || 'unknown',
          birthday: birthday || '',
          relation,
          medicalCardNo: medicalCardNo || '',
          isDefault: isDefault || (countRes.total === 0), // 第一个自动设为默认
          createdAt: now,
          updatedAt: now
        }
      })

      return {
        code: 0,
        message: 'success',
        data: { id: addRes._id }
      }
    }
  } catch (err) {
    console.error('保存就诊人失败:', err)
    return {
      code: 50001,
      message: '保存就诊人失败',
      error: err.message
    }
  }
}

