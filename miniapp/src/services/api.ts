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

// 轮播图项
export interface BannerItem {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
}

// 轮播图区域数据（包含开关和配置）
export interface BannerAreaData {
  enabled: boolean
  width: number
  height: number
  items: BannerItem[]
}

// 统计项配置
export interface StatsItemConfig {
  key: string
  label: string
  suffix: string
  enabled: boolean
  customValue?: string  // 自定义值
}

// 内容项配置
export interface ContentItem {
  icon: string
  title: string
  desc: string
}

// 服务推荐选项卡类型
export type ServiceTabType = 'recommended' | 'hot' | 'rating' | 'custom'

// 服务推荐选项卡配置
export interface ServiceTabConfig {
  key: ServiceTabType
  title: string
  enabled: boolean
  limit: number
  serviceIds?: string[]
}

// 服务推荐设置
export interface ServiceRecommendSettings {
  enabled: boolean
  tabs: ServiceTabConfig[]
}

// 首页页面设置
export interface HomePageSettings {
  stats: {
    enabled: boolean
    items: StatsItemConfig[]
  }
  content: {
    enabled: boolean
    code: string
  }
  serviceRecommend: ServiceRecommendSettings
}

// 推荐服务项
export interface RecommendedServiceItem {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  coverImage?: string
  orderCount: number
  rating: number
}

// 推荐服务选项卡数据
export interface RecommendedTabData {
  key: ServiceTabType
  title: string
  services: RecommendedServiceItem[]
}

// 推荐服务响应数据
export interface RecommendedServicesData {
  enabled: boolean
  tabs: RecommendedTabData[]
}

export const homeApi = {
  // 获取首页配置
  getConfig: () => get('/home/config'),

  // 获取轮播图（支持按位置筛选，返回包含开关状态的数据）
  // position: home=首页, services=服务页, profile=个人中心, service-detail=服务详情, cases=病例页
  getBanners: (position: string = 'home') => get<BannerAreaData>('/home/banners', { position }),

  // 获取统计数据
  getStats: () => get('/home/stats'),

  // 获取首页页面设置
  getPageSettings: () => get<HomePageSettings>('/home/page-settings'),

  // 获取推荐服务数据
  getRecommendedServices: () => get<RecommendedServicesData>('/home/recommended-services'),
}

// ========== 配置模块 ==========

// 品牌布局模式
export type BrandLayout = 'logo-only' | 'logo-name' | 'logo-slogan' | 'logo-name-slogan' | 'name-only' | 'name-slogan'

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system'

// 主题设置类型
export interface ThemeSettings {
  primaryColor: string
  defaultThemeMode: ThemeMode
  brandName: string
  brandSlogan: string
  headerLogo: string
  headerLogoDark: string
  footerLogo: string
  footerLogoDark: string
  headerShowName: boolean
  headerShowSlogan: boolean
  footerShowName: boolean
  footerShowSlogan: boolean
  headerLayout: BrandLayout
  footerLayout: BrandLayout
}

export const configApi = {
  // 获取主题设置
  getThemeSettings: () => get<ThemeSettings>('/config/theme/settings'),
}

// ========== 服务模块 ==========
export interface ServicePriceDetail {
  originalPrice: number
  campaignPrice: number | null
  memberPrice: number | null
  couponPrice: number | null
  finalPrice: number
  campaignDiscount: number
  campaignName: string | null
  memberDiscount: number
  memberLevelName: string | null
  couponDiscount: number
  couponName: string | null
  pointsDiscount: number
  pointsUsed: number
  totalSavings: number
  isMember: boolean
  membershipExpireAt: Date | null
  overtimeWaiverRate: number
  snapshot: any
}

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

  // 获取服务价格详情
  getPrice: (id: string) => get<ServicePriceDetail>(`/services/${id}/price`),
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

  // 获取医院关联的陪诊员列表
  getEscorts: (
    id: string,
    params?: {
      levelCode?: string
      sortBy?: 'rating' | 'orderCount' | 'experience'
      page?: number
      pageSize?: number
    },
  ) => get(`/hospitals/${id}/escorts`, params),
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
    couponId?: string
    campaignId?: string
    pointsToUse?: number
  }) => post('/orders', data, { showLoading: true, loadingText: '提交中...' }),

  // 获取订单列表
  getList: (params?: { status?: string; page?: number; pageSize?: number }) =>
    get('/orders', params),

  // 获取订单详情
  getDetail: (id: string) => get(`/orders/${id}`),

  // 取消订单
  cancel: (id: string, reason?: string) =>
    post(`/orders/${id}/cancel`, { reason }),

  // 评价陪诊员
  review: (id: string, data: {
    rating: number
    content?: string
    tags?: string[]
    images?: string[]
    isAnonymous?: boolean
  }) => post(`/orders/${id}/review`, data, { showLoading: true, loadingText: '提交中...' }),

  // 检查是否已评价
  checkReviewed: (id: string) => get<{ reviewed: boolean }>(`/orders/${id}/review/status`),

  // 提交投诉
  submitComplaint: (id: string, data: {
    type: string
    description: string
    evidence?: string[]
  }) => post(`/orders/${id}/complaint`, data, { showLoading: true, loadingText: '提交中...' }),
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

// ========== 营销中心 API ==========

// 会员系统
export const membershipApi = {
  // 获取会员等级列表
  getLevels: () => get('/membership/levels'),

  // 获取会员方案列表
  getPlans: (levelId?: string) => get('/membership/plans', { levelId }),

  // 获取我的会员信息
  getMyMembership: () => get('/membership/my'),

  // 购买会员
  purchase: (planId: string) => post('/membership/purchase', { planId }),
}

// 优惠券系统
export interface UserCoupon {
  id: string
  name: string
  type: 'amount' | 'percent' | 'free'
  value: number
  maxDiscount?: number
  minAmount: number
  applicableScope: 'all' | 'category' | 'service'
  startAt: string
  expireAt: string
  status: 'unused' | 'used' | 'expired' | 'returned'
  usedAt?: string
}

export const couponApi = {
  // 获取可领取的优惠券列表
  getAvailable: () => get<UserCoupon[]>('/coupons/available'),

  // 领取优惠券
  claim: (templateId: string) => post('/coupons/claim', { templateId }),

  // 兑换码兑换优惠券
  exchange: (code: string) => post('/coupons/exchange', { code }),

  // 获取我的优惠券列表
  getMyCoupons: (params?: { status?: string; page?: number; pageSize?: number }) =>
    get<{ data: UserCoupon[]; total: number; page: number; pageSize: number }>('/coupons/my', params),

  // 获取下单时可用优惠券列表
  getUsableCoupons: (serviceId: string, currentPrice: number) =>
    get<UserCoupon[]>('/coupons/usable', { serviceId, currentPrice }),
}

// 积分系统
export interface UserPoint {
  totalPoints: number
  usedPoints: number
  expiredPoints: number
  currentPoints: number
}

export interface PointRecord {
  id: string
  type: 'earn' | 'use' | 'expire' | 'refund'
  points: number
  balance: number
  source: string
  description?: string
  createdAt: string
}

export const pointApi = {
  // 获取我的积分概览
  getMyPoints: () => get<UserPoint>('/points/my'),

  // 获取积分明细
  getRecords: (params?: { type?: string; page?: number; pageSize?: number }) =>
    get<{ data: PointRecord[]; total: number; page: number; pageSize: number }>('/points/records', params),

  // 每日签到
  dailyCheckin: () => post<{ pointsEarned: number; currentPoints: number }>('/points/checkin'),
}

// 邀请系统
export interface ReferralStats {
  inviteCode: string
  totalInvites: number
  registeredCount: number
  rewardedCount: number
  inviteCount: number
  rewardCount: number
}

export interface ReferralRecord {
  id: string
  inviteeId?: string
  type: 'user' | 'patient'
  status: 'pending' | 'registered' | 'rewarded' | 'invalid'
  registeredAt?: string
  rewardedAt?: string
  createdAt: string
  invitee?: {
    id: string
    nickname: string
    phone: string
  }
}

export interface InviteLink {
  inviteCode: string
  inviteLink: string
  qrCodeUrl: string
}

export interface InvitePoster {
  inviteCode: string
  inviteLink: string
  qrCodeUrl: string
  posterData: {
    userName: string
    userAvatar: string
    inviteCode: string
    inviteLink: string
    qrCodeUrl: string
    title: string
    subtitle: string
  }
}

export const referralApi = {
  // 获取我的邀请码
  getInviteCode: () => get<{ code: string }>('/referrals/invite-code'),

  // 获取邀请统计
  getStats: () => get<ReferralStats>('/referrals/stats'),

  // 获取邀请记录列表
  getRecords: (params?: { type?: string; status?: string; page?: number; pageSize?: number }) =>
    get<{ data: ReferralRecord[]; total: number; page: number; pageSize: number }>('/referrals/records', params),

  // 邀请就诊人
  invitePatient: (data: { name: string; phone: string; gender?: string; birthday?: string }) =>
    post('/referrals/invite-patient', data),

  // 获取邀请链接
  getInviteLink: () => get<InviteLink>('/referrals/link'),

  // 生成邀请海报
  getInvitePoster: () => get<InvitePoster>('/referrals/poster'),
}

// 活动系统
export interface Campaign {
  id: string
  name: string
  type: 'flash_sale' | 'seckill' | 'threshold' | 'newcomer'
  startAt: string
  endAt: string
  discountType: 'amount' | 'percent'
  discountValue: number
  maxDiscount?: number
  minAmount: number
  description?: string
  bannerUrl?: string
  status: 'pending' | 'active' | 'ended' | 'cancelled'
}

export interface SeckillItem {
  id: string
  serviceId: string
  seckillPrice: number
  stockTotal: number
  stockSold: number
  stockRemaining: number
  service: {
    id: string
    name: string
    price: number
    image?: string
  }
}

export const campaignApi = {
  // 获取进行中的活动列表
  getActiveCampaigns: (params?: { type?: string; page?: number; pageSize?: number }) =>
    get<{ data: Campaign[]; total: number; page: number; pageSize: number }>('/campaigns/active', params),

  // 获取活动详情
  getDetail: (id: string) => get<Campaign & { seckillItems?: SeckillItem[] }>(`/campaigns/${id}`),

  // 获取服务适用的活动
  getCampaignForService: (serviceId: string) => get<Campaign | null>(`/campaigns/service/${serviceId}`),

  // 秒杀预占库存
  reserveSeckillStock: (campaignId: string, serviceId: string) =>
    post<{ success: boolean; stockRemaining: number }>(`/campaigns/seckill/${campaignId}/${serviceId}/reserve`),
}

// 价格引擎
export interface PricingPreview {
  originalPrice: number
  campaignPrice?: number
  memberPrice?: number
  couponDiscount: number
  pointsDiscount: number
  finalPrice: number
  totalSavings: number
  breakdown: Array<{
    type: 'original' | 'campaign' | 'member' | 'coupon' | 'points' | 'final'
    label: string
    amount: number
    strikethrough?: boolean
    details?: string
  }>
  memberLevelName?: string
  couponName?: string
  pointsUsed?: number
}

export const pricingApi = {
  // 计算订单价格（包含活动、会员、优惠券、积分）
  calculate: (data: {
    serviceId: string
    quantity?: number
    couponId?: string
    campaignId?: string
    pointsToUse?: number
  }) => post<PricingPreview>('/pricing/calculate', data),
}

// 导出 Token 管理和工具函数
export { setToken, clearToken, getResourceUrl } from './request'

