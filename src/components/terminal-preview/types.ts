/**
 * 终端全局预览器类型定义
 *
 * ⚠️ 重要声明：
 * 本文件定义的 Props（如 viewerRole / userSession / escortSession）
 * 仅用于管理后台的预览模拟，不代表真实终端逻辑。
 *
 * - 真实终端的 viewerRole 由 escortToken 的 validate 结果推导
 * - 预览器允许通过 Props 强制模拟视角，用于后台调试
 * - 禁止将预览器的视角切换逻辑搬到真实终端
 *
 * @see docs/终端预览器集成/01-TerminalPreview集成规格.md
 */

// 品牌布局模式
export type BrandLayout =
  | 'logo-only'
  | 'logo-name'
  | 'logo-slogan'
  | 'logo-name-slogan'
  | 'name-only'
  | 'name-slogan'

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system'

// 页脚可见页面类型
export type FooterVisiblePage = 'home' | 'services' | 'cases' | 'profile'

// ============================================================================
// 预览器页面路由与会话类型（Step 1 类型系统骨架）
// ============================================================================

/**
 * 预览页面类型
 * - 现有页面：home, services, cases, profile
 * - 营销中心：membership, coupons, points, referrals, campaigns
 * - 陪诊员（用户视角）：escort-list, escort-detail
 * - 工作台（陪诊员视角）：workbench, workbench-orders-pool, workbench-earnings, workbench-withdraw
 * - 分销中心（陪诊员视角）：distribution, distribution-members, distribution-records, distribution-invite, distribution-promotion
 */
export type PreviewPage =
  // 现有页面（TabBar）
  | 'home'
  | 'services'
  | 'cases'
  | 'profile'
  // 营销中心
  | 'membership'
  | 'membership-plans'
  | 'coupons'
  | 'coupons-available'
  | 'points'
  | 'points-records'
  | 'referrals'
  | 'campaigns'
  | 'campaigns-detail'
  // 陪诊员（用户视角可查看）
  | 'escort-list'
  | 'escort-detail'
  // 工作台（陪诊员视角）
  | 'workbench'
  | 'workbench-orders-pool'
  | 'workbench-order-detail'
  | 'workbench-earnings'
  | 'workbench-withdraw'
  // 分销中心（陪诊员视角）
  | 'distribution'
  | 'distribution-members'
  | 'distribution-records'
  | 'distribution-invite'
  | 'distribution-promotion'

/**
 * 预览器视角角色
 * ⚠️ 仅用于预览器模拟，真实终端由 escortToken validate 推导
 */
export type PreviewViewerRole = 'user' | 'escort'

// ============================================================================
// 分销中心类型定义（Step 11.1）
// ============================================================================

/**
 * 分销中心路由参数类型映射
 * 用于 navigateToPage 泛型约束，减少写错 key / 写错 params
 */
export interface PreviewPageParamsMap {
  'distribution': Record<string, never>
  'distribution-members': { relation?: 'direct' | 'indirect' }
  'distribution-records': { range?: '7d' | '30d' | 'all'; status?: 'pending' | 'settled' }
  'distribution-invite': Record<string, never>
  'distribution-promotion': Record<string, never>
}

/**
 * 分销统计数据
 * 对应接口: GET /escort-app/distribution/stats
 * 通道: escortRequest
 *
 * ⚠️ 金额单位约定：所有金额字段统一使用 元（保留两位小数）
 */
export interface DistributionStats {
  /** 团队总人数 */
  totalTeamSize: number
  /** 直属人数 */
  directCount: number
  /** 间接人数 */
  indirectCount: number
  /** 累计分润（单位：元） */
  totalDistribution: number
  /** 本月分润（单位：元） */
  monthlyDistribution: number
  /** 待结算（单位：元） */
  pendingDistribution: number
  /** 当前等级 */
  currentLevel: string
  /** 下一等级 */
  nextLevel?: string
  /**
   * 晋升进度 0-100
   * - undefined: 后端没算或不适用（不显示进度条）
   * - 0: 适用但完全没进度（显示 0% 进度条）
   * ⚠️ 禁止把 0 当成 falsy 显示成 "–"
   */
  promotionProgress?: number
}

/**
 * 分销成员列表查询参数
 */
export interface DistributionMembersParams {
  /** 关系类型：direct=直属，indirect=间接 */
  relation?: 'direct' | 'indirect'
  /** 页码，默认 1 */
  page?: number
  /** 每页数量，默认 20 */
  pageSize?: number
}

/**
 * 分销成员
 * 对应接口: GET /escort-app/distribution/members
 * 通道: escortRequest
 */
export interface DistributionMember {
  id: string
  name: string
  avatar?: string
  /**
   * 手机号（脱敏格式: 138****8888）
   * ⚠️ 前 3 位 + **** + 后 4 位
   */
  phone: string
  /** 等级 */
  level: string
  /** 关系类型 */
  relation: 'direct' | 'indirect'
  /** 加入时间 */
  joinedAt: string
  /** 累计订单数 */
  totalOrders: number
  /** 累计分润（单位：元） */
  totalDistribution: number
}

/**
 * 分销成员列表响应
 */
export interface DistributionMembersResponse {
  items: DistributionMember[]
  total: number
  hasMore: boolean
}

/**
 * 分润记录查询参数
 */
export interface DistributionRecordsParams {
  /** 时间范围，默认 'all' */
  range?: '7d' | '30d' | 'all'
  /** 状态筛选，不传表示全部 */
  status?: 'pending' | 'settled'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 分润记录
 * 对应接口: GET /escort-app/distribution/records
 * 通道: escortRequest
 */
export interface DistributionRecord {
  id: string
  /** 记录类型 */
  type: 'order' | 'bonus' | 'invite'
  /** 标题 */
  title: string
  /** 金额（单位：元） */
  amount: number
  /** 状态 */
  status: 'pending' | 'settled' | 'cancelled'
  /** 来源成员名称 */
  sourceEscortName?: string
  /** 关联订单号 */
  orderNo?: string
  /** 创建时间 */
  createdAt: string
  /** 结算时间 */
  settledAt?: string
}

/**
 * 分润记录列表响应
 */
export interface DistributionRecordsResponse {
  items: DistributionRecord[]
  total: number
  hasMore: boolean
}

/**
 * 邀请信息
 * 对应接口: GET /escort-app/distribution/invite-code
 * 通道: escortRequest
 */
export interface DistributionInvite {
  /** 邀请码 */
  inviteCode: string
  /** 邀请链接 */
  inviteLink: string
  /** 二维码图片 URL */
  qrCodeUrl?: string
  /** 累计邀请人数 */
  totalInvited: number
  /** 每次邀请奖励（单位：元） */
  rewardPerInvite: number
}

/**
 * 晋升等级信息
 */
export interface DistributionLevel {
  /** 等级代码 */
  code: string
  /** 等级名称 */
  name: string
  /** 佣金比例（0-1） */
  commissionRate: number
  /** 权益列表 */
  benefits: string[]
}

/**
 * 晋升条件
 */
export interface DistributionRequirement {
  /** 条件类型 */
  type: 'team_size' | 'total_orders' | 'monthly_orders'
  /** 当前值 */
  current: number
  /** 目标值 */
  required: number
}

/**
 * 晋升信息
 * 对应接口: GET /escort-app/distribution/promotion
 * 通道: escortRequest
 */
export interface DistributionPromotion {
  /** 当前等级 */
  currentLevel: DistributionLevel
  /**
   * 下一等级
   * undefined 表示已达最高级
   */
  nextLevel?: DistributionLevel & {
    /** 晋升条件列表 */
    requirements: DistributionRequirement[]
  }
}

/**
 * 用户会话（预览器模拟用）
 * ⚠️ 真实终端从 storage 读取，预览器通过 Props 注入
 */
export interface UserSession {
  /** 用户 token（mock 开头表示模拟） */
  token?: string
  /** 用户 ID */
  userId?: string
}

/**
 * 陪诊员会话（预览器模拟用）
 * ⚠️ 真实终端从 storage 读取，预览器通过 Props 注入
 */
export interface EscortSession {
  /** 陪诊员 token（mock 开头表示模拟） */
  token?: string
  /** 陪诊员 ID */
  escortId?: string
}

/**
 * 用户上下文（预览器数据覆盖用）
 */
export interface UserContext {
  /** 会员等级 */
  membershipLevel?: string
  /** 会员到期时间 */
  membershipExpireAt?: string
  /** 积分余额 */
  points?: number
  /** 优惠券数量 */
  couponCount?: number
}

/**
 * 陪诊员上下文（预览器数据覆盖用）
 */
export interface EscortContext {
  /** 陪诊员 ID */
  id?: string
  /** 陪诊员姓名 */
  name?: string
  /** 陪诊员等级 */
  level?: string
  /** 工作状态 */
  workStatus?: 'available' | 'busy' | 'offline'
  /** 累计收入 */
  earnings?: number
  /** 完成订单数 */
  orderCount?: number
}

// ============================================================================
// 营销中心数据覆盖类型（P0 页面数据覆盖）
// ============================================================================

/**
 * 会员信息（预览器覆盖用）
 * 与 api.ts 的 MembershipInfo 保持一致
 */
export interface MembershipInfoOverride {
  id?: string
  /** 会员等级 */
  level?: string
  /** 等级名称 */
  levelName?: string
  /** 过期时间 (YYYY-MM-DD) */
  expireAt?: string
  /** 积分余额 */
  points?: number
}

/**
 * 会员套餐（预览器覆盖用）
 * 与 api.ts 的 MembershipPlan 保持一致
 */
export interface MembershipPlanOverride {
  id: string
  name?: string
  description?: string
  /** 价格 */
  price?: number
  /** 原价 */
  originalPrice?: number
  /** 有效天数 */
  durationDays?: number
  /** 是否推荐 */
  isRecommended?: boolean
}

/**
 * 优惠券项（预览器覆盖用）
 * 与 api.ts 的 CouponItem 保持一致
 */
export interface CouponItemOverride {
  id: string
  name?: string
  description?: string
  /** 优惠金额 */
  amount?: number
  /** 最低消费金额 */
  minAmount?: number
  /** 过期时间（格式: YYYY-MM-DD） */
  expireAt?: string
  /** 状态 */
  status?: 'available' | 'used' | 'expired'
}

/**
 * 可领取优惠券（预览器覆盖用）
 * 与 api.ts 的 AvailableCoupon 保持一致
 */
export interface AvailableCouponOverride {
  id: string
  name?: string
  description?: string
  /** 优惠金额 */
  amount?: number
  /** 最低消费金额 */
  minAmount?: number
  /** 剩余可领数量 */
  remaining?: number
}

/**
 * 营销中心数据覆盖
 *
 * ⚠️ 用于管理后台预览，支持 Partial 覆盖
 * - 优先使用覆盖数据
 * - 覆盖数据不存在时，调用 previewApi 获取
 */
export interface MarketingDataOverride {
  /**
   * 会员信息覆盖
   * - null: 表示用户未开通会员
   * - undefined: 不覆盖，使用 API 数据
   * - object: 覆盖数据
   */
  membership?: MembershipInfoOverride | null

  /**
   * 会员套餐列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - array: 覆盖数据
   */
  membershipPlans?: MembershipPlanOverride[]

  /**
   * 我的优惠券列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - object: 覆盖数据（包含 items 和 total）
   */
  coupons?: {
    items?: CouponItemOverride[]
    total?: number
  }

  /**
   * 可领取优惠券列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - array: 覆盖数据
   */
  availableCoupons?: AvailableCouponOverride[]
}

// 主题设置
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
  // 页脚组件设置
  footerEnabled?: boolean
  footerVisiblePages?: FooterVisiblePage[]
  servicePhone?: string
  servicePhoneEnabled?: boolean
}

// 轮播图项
export interface BannerItem {
  id: string
  imageUrl: string
  title?: string
  linkUrl?: string
  sort: number
}

// 轮播图区域数据
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
  customValue?: string
}

// 统计数据
export interface StatsData {
  userCount: number
  hospitalCount: number
  rating: number
  orderCount: number
  escortCount: number
}

// 服务选项卡类型
export type ServiceTabType = 'recommended' | 'hot' | 'rating' | 'custom'

// 服务选项卡配置
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

// 推荐服务项
export interface RecommendedServiceItem {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  coverImage?: string
  orderCount?: number
  rating?: number
}

// 推荐服务选项卡数据
export interface RecommendedTabData {
  key: ServiceTabType
  title: string
  services: RecommendedServiceItem[]
}

// 推荐服务数据
export interface RecommendedServicesData {
  enabled: boolean
  tabs: RecommendedTabData[]
}

// 首页设置
export interface HomePageSettings {
  stats: {
    enabled: boolean
    items: StatsItemConfig[]
  }
  content: {
    enabled: boolean
    code: string
  }
  serviceRecommend?: ServiceRecommendSettings
}

// 服务分类
export interface ServiceCategory {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
  isPinned?: boolean
  serviceCount?: number
}

// 服务列表项
export interface ServiceListItem {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number | null
  unit?: string
  duration?: string | null
  coverImage?: string | null
  orderCount: number
  rating: number
  tags?: string[]
  status: string
  category?: {
    id: string
    name: string
    icon?: string
  }
}

// 服务列表响应
export interface ServiceListResponse {
  data: ServiceListItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 预览器 Props
 *
 * ⚠️ 注意：以下 Props 仅用于管理后台预览模拟
 * - viewerRole: 预览器强制模拟视角（真实终端由 token validate 推导）
 * - userSession / escortSession: 预览器会话模拟（真实终端从 storage 读取）
 */
export interface TerminalPreviewProps {
  /** 预览的页面类型（扩展后支持营销中心、陪诊员、工作台页面） */
  page?: PreviewPage

  // ============================================================================
  // 视角与会话（Step 1 新增，仅用于预览模拟）
  // ============================================================================

  /**
   * 预览器视角角色
   * ⚠️ 仅用于预览模拟，真实终端由 escortToken validate 推导
   * @default 'user'
   */
  viewerRole?: PreviewViewerRole

  /**
   * 用户会话模拟
   * ⚠️ 仅用于预览模拟，真实终端从 storage 读取
   */
  userSession?: UserSession

  /**
   * 陪诊员会话模拟
   * ⚠️ 仅用于预览模拟，真实终端从 storage 读取
   */
  escortSession?: EscortSession

  /**
   * 用户上下文数据覆盖
   */
  userContext?: UserContext

  /**
   * 陪诊员上下文数据覆盖
   */
  escortContext?: EscortContext

  /**
   * 营销中心数据覆盖
   *
   * ⚠️ 用于管理后台预览，优先使用覆盖数据
   * - membership: 会员信息（null 表示未开通）
   * - membershipPlans: 会员套餐列表
   * - coupons: 我的优惠券
   * - availableCoupons: 可领取优惠券
   */
  marketingData?: MarketingDataOverride

  // ============================================================================
  // 现有 Props（保持向后兼容）
  // ============================================================================

  /** 主题设置覆盖 */
  themeSettings?: Partial<ThemeSettings>
  /** 首页设置覆盖 */
  homeSettings?: Partial<HomePageSettings>
  /** 轮播图数据覆盖 */
  bannerData?: BannerAreaData | null
  /** 统计数据覆盖 */
  statsData?: Partial<StatsData>
  /** 服务分类覆盖 */
  categories?: ServiceCategory[]
  /** 推荐服务数据覆盖 */
  recommendedServices?: RecommendedServicesData | null
  /** 是否自动加载数据 */
  autoLoad?: boolean
  /** 预览器高度 */
  height?: number
  /** 是否显示外框 */
  showFrame?: boolean
  /** 自定义类名 */
  className?: string
}

// 默认主题设置
export const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#f97316',
  defaultThemeMode: 'light',
  brandName: '科科灵',
  brandSlogan: '让就医不再孤单',
  headerLogo: '',
  headerLogoDark: '',
  footerLogo: '',
  footerLogoDark: '',
  headerShowName: true,
  headerShowSlogan: false,
  footerShowName: true,
  footerShowSlogan: true,
  headerLayout: 'logo-name',
  footerLayout: 'logo-name-slogan',
  // 页脚组件设置
  footerEnabled: true,
  footerVisiblePages: ['home'],
  servicePhone: '400-888-8888',
  servicePhoneEnabled: true,
}

// 默认首页设置
export const defaultHomeSettings: HomePageSettings = {
  stats: {
    enabled: true,
    items: [
      { key: 'userCount', label: '服务用户', suffix: '+', enabled: true },
      { key: 'hospitalCount', label: '合作医院', suffix: '+', enabled: true },
      { key: 'rating', label: '好评率', suffix: '%', enabled: true },
    ],
  },
  content: {
    enabled: false,
    code: '',
  },
}

// 默认统计数据
export const defaultStatsData: StatsData = {
  userCount: 50000,
  hospitalCount: 50,
  rating: 98.5,
  orderCount: 10000,
  escortCount: 100,
}
