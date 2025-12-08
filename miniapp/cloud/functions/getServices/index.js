// 云函数入口文件 - 获取服务列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { categoryId, keyword, isHot, page = 1, pageSize = 20 } = event

  try {
    // 构建查询条件
    const where = {
      status: 'active'
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (isHot !== undefined) {
      where.isHot = isHot
    }

    if (keyword) {
      where.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }

    // 获取总数
    const countRes = await db.collection('services').where(where).count()
    const total = countRes.total

    // 获取列表
    const listRes = await db.collection('services')
      .where(where)
      .orderBy('sort', 'asc')
      .orderBy('orderCount', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const list = listRes.data.map(s => ({
      id: s._id,
      name: s.name,
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      description: s.description,
      price: s.price,
      originalPrice: s.originalPrice,
      unit: s.unit,
      duration: s.duration,
      coverImage: s.coverImage,
      tags: s.tags,
      orderCount: s.orderCount,
      rating: s.rating,
      isHot: s.isHot,
      status: s.status
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
    console.error('获取服务列表失败:', err)
    return {
      code: 50001,
      message: '获取服务列表失败',
      error: err.message
    }
  }
}

