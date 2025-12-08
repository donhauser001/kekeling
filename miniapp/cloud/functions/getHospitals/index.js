// 云函数入口文件 - 获取医院列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { keyword, city, level, page = 1, pageSize = 20 } = event

  try {
    // 构建查询条件
    const where = {
      status: 'active'
    }

    if (city) {
      where.city = city
    }

    if (level) {
      where.level = level
    }

    if (keyword) {
      where.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }

    // 获取总数
    const countRes = await db.collection('hospitals').where(where).count()
    const total = countRes.total

    // 获取列表
    const listRes = await db.collection('hospitals')
      .where(where)
      .orderBy('sort', 'asc')
      .orderBy('orderCount', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(h => ({
      id: h._id,
      name: h.name,
      shortName: h.shortName,
      level: h.level,
      type: h.type,
      address: `${h.district || ''}${h.address || ''}`,
      city: h.city,
      logo: h.logo,
      latitude: h.latitude,
      longitude: h.longitude,
      orderCount: h.orderCount
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
    console.error('获取医院列表失败:', err)
    return {
      code: 50001,
      message: '获取医院列表失败',
      error: err.message
    }
  }
}

