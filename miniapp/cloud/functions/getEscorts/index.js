// 云函数入口文件 - 获取陪诊员列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { hospitalId, level, isOnline, keyword, page = 1, pageSize = 20 } = event

  try {
    // 构建查询条件
    const where = {
      status: 'active',
      certificationStatus: 'approved'
    }

    if (hospitalId) {
      where.serviceHospitals = _.elemMatch(_.eq(hospitalId))
    }

    if (level) {
      where.level = level
    }

    if (isOnline !== undefined) {
      where.isOnline = isOnline
    }

    if (keyword) {
      where.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }

    // 获取总数
    const countRes = await db.collection('escorts').where(where).count()
    const total = countRes.total

    // 获取列表
    const listRes = await db.collection('escorts')
      .where(where)
      .orderBy('rating', 'desc')
      .orderBy('orderCount', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(e => ({
      id: e._id,
      name: e.name,
      avatar: e.avatar,
      gender: e.gender,
      level: e.level,
      introduction: e.introduction,
      specialties: e.specialties,
      orderCount: e.orderCount,
      rating: e.rating,
      isOnline: e.isOnline
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
    console.error('获取陪诊员列表失败:', err)
    return {
      code: 50001,
      message: '获取陪诊员列表失败',
      error: err.message
    }
  }
}

