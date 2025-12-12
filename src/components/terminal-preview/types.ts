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

/**
 * 预览器视角角色
 * ⚠️ 仅用于预览器模拟，真实终端由 escortToken validate 推导
 */
export type PreviewViewerRole = 'user' | 'escort'

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
