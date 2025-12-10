/**
 * 终端全局预览器类型定义
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

// 预览器 Props
export interface TerminalPreviewProps {
  /** 预览的页面类型 */
  page?: 'home' | 'services' | 'orders' | 'profile'
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
