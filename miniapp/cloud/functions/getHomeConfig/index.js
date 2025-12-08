// 云函数入口文件 - 获取首页配置
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 并行获取多个数据
    const [bannersRes, configRes, hotServicesRes, recommendEscortsRes] = await Promise.all([
      // 获取轮播图
      db.collection('banners')
        .where({
          status: 'active'
        })
        .orderBy('sort', 'asc')
        .limit(5)
        .get(),
      
      // 获取应用配置
      db.collection('app_config')
        .doc('home_config')
        .get()
        .catch(() => ({ data: null })),
      
      // 获取热门服务
      db.collection('services')
        .where({
          status: 'active',
          isHot: true
        })
        .orderBy('orderCount', 'desc')
        .limit(6)
        .get(),
      
      // 获取推荐陪诊员
      db.collection('escorts')
        .where({
          status: 'active',
          isOnline: true
        })
        .orderBy('rating', 'desc')
        .limit(4)
        .get()
    ])

    const banners = bannersRes.data.map(b => ({
      id: b._id,
      image: b.image,
      link: b.link,
      linkType: b.linkType
    }))

    const config = configRes.data || {}
    const serviceEntries = config.serviceEntries || [
      { id: '1', name: '全程陪诊', icon: '🏥', link: '/pages/services/detail?id=1' },
      { id: '2', name: '代办挂号', icon: '📋', link: '/pages/services/detail?id=2' },
      { id: '3', name: '陪检服务', icon: '🔬', link: '/pages/services/detail?id=3' },
      { id: '4', name: '住院陪护', icon: '🛏️', link: '/pages/services/detail?id=4' }
    ]

    const hotServices = hotServicesRes.data.map(s => ({
      id: s._id,
      name: s.name,
      price: s.price,
      coverImage: s.coverImage,
      orderCount: s.orderCount
    }))

    const recommendEscorts = recommendEscortsRes.data.map(e => ({
      id: e._id,
      name: e.name,
      avatar: e.avatar,
      level: e.level,
      rating: e.rating,
      orderCount: e.orderCount
    }))

    return {
      code: 0,
      message: 'success',
      data: {
        banners,
        serviceEntries,
        hotServices,
        recommendEscorts,
        popup: null // 暂不支持弹窗
      }
    }
  } catch (err) {
    console.error('获取首页配置失败:', err)
    return {
      code: 50001,
      message: '获取首页配置失败',
      error: err.message
    }
  }
}

