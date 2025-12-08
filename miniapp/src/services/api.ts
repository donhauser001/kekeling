/**
 * API 接口封装
 * 统一管理所有后端接口调用
 */
import { get, post, put, del, setToken, clearToken } from './request'

// ========== 认证模块 ==========
export const authApi = {
  // 微信登录
  wechatLogin: (code: string) => 
    post<{ token: string; user: any; isNewUser: boolean }>('/auth/weixin', { code }),
  
  // 绑定手机号
  bindPhone: (code: string) => 
    post<{ phone: string }>('/auth/bind-phone', { code }),
}

// ========== 首页模块 ==========
export const homeApi = {
  // 获取首页配置
  getConfig: () => get('/home/config'),
  
  // 获取轮播图
  getBanners: () => get('/home/banners'),
  
  // 获取统计数据
  getStats: () => get('/home/stats'),
}

// ========== 配置模块 ==========
export const configApi = {
  // 获取主题设置
  getThemeSettings: () => get<{
    primaryColor: string
    brandName: string
    brandSlogan: string
  }>('/config/theme/settings'),
}

// ========== 服务模块 ==========
export const servicesApi = {
  // 获取分类列表
  getCategories: () => get('/services/categories'),
  
  // 获取服务列表
  getList: (params?: { categoryId?: string; keyword?: string; page?: number; pageSize?: number }) =>
    get('/services', params),
  
  // 获取热门服务
  getHot: (limit?: number) => get('/services/hot', { limit }),
  
  // 获取服务详情
  getDetail: (id: string) => get(`/services/${id}`),
}

// ========== 医院模块 ==========
export const hospitalsApi = {
  // 获取医院列表
  getList: (params?: { keyword?: string; level?: string; page?: number; pageSize?: number }) =>
    get('/hospitals', params),
  
  // 获取医院详情
  getDetail: (id: string) => get(`/hospitals/${id}`),
  
  // 获取医院科室树
  getDepartments: (id: string) => get(`/hospitals/${id}/departments`),
  
  // 获取医院医生列表
  getDoctors: (id: string, params?: { departmentId?: string; page?: number; pageSize?: number }) =>
    get(`/hospitals/${id}/doctors`, params),
}

// ========== 科室模块 ==========
export const departmentsApi = {
  // 获取科室列表 (管理端)
  getList: (params?: { hospitalId?: string; status?: string; keyword?: string; page?: number; pageSize?: number }) =>
    get('/departments', params),
  
  // 获取科室详情
  getDetail: (id: string) => get(`/departments/${id}`),
}

// ========== 医生模块 ==========
export const doctorsApi = {
  // 获取医生列表
  getList: (params?: {
    hospitalId?: string
    departmentId?: string
    keyword?: string
    title?: string
    sort?: 'rating' | 'consultCount' | 'default'
    page?: number
    pageSize?: number
  }) => get('/doctors', params),
  
  // 搜索医生
  search: (keyword: string, limit?: number) => get('/doctors/search', { keyword, limit }),
  
  // 获取推荐医生
  getRecommended: (limit?: number) => get('/doctors/recommended', { limit }),
  
  // 获取医生详情
  getDetail: (id: string) => get(`/doctors/${id}`),
}

// ========== 陪诊员模块 ==========
export const escortsApi = {
  // 获取陪诊员列表
  getList: (params?: { hospitalId?: string; level?: string; page?: number; pageSize?: number }) =>
    get('/escorts', params),
  
  // 获取推荐陪诊员
  getRecommended: (limit?: number) => get('/escorts/recommended', { limit }),
  
  // 获取陪诊员详情
  getDetail: (id: string) => get(`/escorts/${id}`),
}

// ========== 就诊人模块 ==========
export const patientsApi = {
  // 获取就诊人列表
  getList: () => get('/patients'),
  
  // 添加就诊人
  create: (data: {
    name: string
    gender: string
    age: number
    phone: string
    idCard?: string
    relation: string
    isDefault?: boolean
  }) => post('/patients', data),
  
  // 更新就诊人
  update: (id: string, data: any) => put(`/patients/${id}`, data),
  
  // 删除就诊人
  delete: (id: string) => del(`/patients/${id}`),
  
  // 设为默认
  setDefault: (id: string) => post(`/patients/${id}/default`),
}

// ========== 订单模块 ==========
export const ordersApi = {
  // 创建订单
  create: (data: {
    serviceId: string
    hospitalId: string
    patientId: string
    appointmentDate: string
    appointmentTime: string
    departmentName?: string
    remark?: string
  }) => post('/orders', data, { showLoading: true, loadingText: '提交中...' }),
  
  // 获取订单列表
  getList: (params?: { status?: string; page?: number; pageSize?: number }) =>
    get('/orders', params),
  
  // 获取订单详情
  getDetail: (id: string) => get(`/orders/${id}`),
  
  // 取消订单
  cancel: (id: string, reason?: string) => 
    post(`/orders/${id}/cancel`, { reason }),
}

// ========== 支付模块 ==========
export const paymentApi = {
  // 创建预支付订单
  prepay: (orderId: string) => 
    post<{
      appId: string
      timeStamp: string
      nonceStr: string
      package: string
      signType: string
      paySign: string
    }>('/payment/prepay', { orderId }),
  
  // 查询支付状态
  queryStatus: (orderId: string) => 
    get<{
      paid: boolean
      status: string
      transactionId?: string
    }>(`/payment/status/${orderId}`),
  
  // 模拟支付（仅开发环境）
  mockPay: (orderId: string) =>
    post('/payment/mock-pay', { orderId }),
  
  // 申请退款
  refund: (orderId: string, reason: string) =>
    post('/payment/refund', { orderId, reason }),
}

// ========== 用户模块 ==========
export const usersApi = {
  // 获取用户信息
  getProfile: () => get('/users/profile'),
  
  // 更新用户资料
  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    put('/users/profile', data),
}

// ========== 上传模块 ==========
export const uploadApi = {
  // 上传图片（返回URL）
  uploadImage: async (filePath: string): Promise<string> => {
    // 这里需要使用 Taro.uploadFile
    const Taro = await import('@tarojs/taro')
    const token = Taro.default.getStorageSync('token')
    
    return new Promise((resolve, reject) => {
      Taro.default.uploadFile({
        url: 'http://localhost:3000/api/upload', // TODO: 根据环境切换
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data.url)
          } else {
            reject(new Error(data.message))
          }
        },
        fail: (err) => {
          reject(err)
        },
      })
    })
  },
}

// 导出 Token 管理
export { setToken, clearToken }

