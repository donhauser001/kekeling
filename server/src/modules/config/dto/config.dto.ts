import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({ description: '配置值 (JSON 格式)' })
  @IsObject()
  value: Record<string, any>;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class BatchUpdateConfigDto {
  @ApiProperty({ description: '配置项列表' })
  configs: { key: string; value: any; remark?: string }[];
}

// 订单设置配置键
export const ORDER_CONFIG_KEYS = {
  AUTO_CANCEL_MINUTES: 'order.auto_cancel_minutes',
  AUTO_COMPLETE_HOURS: 'order.auto_complete_hours',
  PLATFORM_FEE_RATE: 'order.platform_fee_rate',
  DISPATCH_MODE: 'order.dispatch_mode',
  GRAB_TIMEOUT_MINUTES: 'order.grab_timeout_minutes',
  ALLOW_REFUND_BEFORE_START: 'order.allow_refund_before_start',
  REFUND_FEE_RATE: 'order.refund_fee_rate',
} as const;

// 订单设置默认值
export const ORDER_CONFIG_DEFAULTS: Record<string, any> = {
  [ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES]: 15,
  [ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS]: 24,
  [ORDER_CONFIG_KEYS.PLATFORM_FEE_RATE]: 0.2,
  [ORDER_CONFIG_KEYS.DISPATCH_MODE]: 'assign', // grab, assign, mixed
  [ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES]: 30,
  [ORDER_CONFIG_KEYS.ALLOW_REFUND_BEFORE_START]: true,
  [ORDER_CONFIG_KEYS.REFUND_FEE_RATE]: 0.5,
};

// 订单设置类型
export interface OrderSettings {
  autoCancelMinutes: number;
  autoCompleteHours: number;
  platformFeeRate: number;
  dispatchMode: 'grab' | 'assign' | 'mixed';
  grabTimeoutMinutes: number;
  allowRefundBeforeStart: boolean;
  refundFeeRate: number;
}

// ============================================
// 主题设置
// ============================================

// 主题设置配置键
export const THEME_CONFIG_KEYS = {
  PRIMARY_COLOR: 'theme.primary_color',
  // 默认主题模式
  DEFAULT_THEME_MODE: 'theme.default_theme_mode',
  // 品牌基础信息
  BRAND_NAME: 'theme.brand_name',
  BRAND_SLOGAN: 'theme.brand_slogan',
  // 顶部 Logo
  HEADER_LOGO: 'theme.header_logo',
  HEADER_LOGO_DARK: 'theme.header_logo_dark',
  // 页脚 Logo
  FOOTER_LOGO: 'theme.footer_logo',
  FOOTER_LOGO_DARK: 'theme.footer_logo_dark',
  // 显示设置
  HEADER_SHOW_NAME: 'theme.header_show_name',
  HEADER_SHOW_SLOGAN: 'theme.header_show_slogan',
  FOOTER_SHOW_NAME: 'theme.footer_show_name',
  FOOTER_SHOW_SLOGAN: 'theme.footer_show_slogan',
  // 组合模式
  HEADER_LAYOUT: 'theme.header_layout',
  FOOTER_LAYOUT: 'theme.footer_layout',
  // 页脚组件设置
  FOOTER_ENABLED: 'theme.footer_enabled',
  FOOTER_VISIBLE_PAGES: 'theme.footer_visible_pages',
  SERVICE_PHONE: 'theme.service_phone',
  SERVICE_PHONE_ENABLED: 'theme.service_phone_enabled',
} as const;

// 主题设置默认值
export const THEME_CONFIG_DEFAULTS: Record<string, any> = {
  [THEME_CONFIG_KEYS.PRIMARY_COLOR]: '#f97316',
  [THEME_CONFIG_KEYS.DEFAULT_THEME_MODE]: 'light', // light, dark, system
  [THEME_CONFIG_KEYS.BRAND_NAME]: '科科灵',
  [THEME_CONFIG_KEYS.BRAND_SLOGAN]: '让就医不再孤单',
  [THEME_CONFIG_KEYS.HEADER_LOGO]: '',
  [THEME_CONFIG_KEYS.HEADER_LOGO_DARK]: '',
  [THEME_CONFIG_KEYS.FOOTER_LOGO]: '',
  [THEME_CONFIG_KEYS.FOOTER_LOGO_DARK]: '',
  [THEME_CONFIG_KEYS.HEADER_SHOW_NAME]: true,
  [THEME_CONFIG_KEYS.HEADER_SHOW_SLOGAN]: false,
  [THEME_CONFIG_KEYS.FOOTER_SHOW_NAME]: true,
  [THEME_CONFIG_KEYS.FOOTER_SHOW_SLOGAN]: true,
  [THEME_CONFIG_KEYS.HEADER_LAYOUT]: 'logo-name', // logo-only, logo-name, logo-name-slogan, name-only
  [THEME_CONFIG_KEYS.FOOTER_LAYOUT]: 'logo-name-slogan',
  // 页脚组件设置
  [THEME_CONFIG_KEYS.FOOTER_ENABLED]: true,
  [THEME_CONFIG_KEYS.FOOTER_VISIBLE_PAGES]: ['home'], // 默认只在首页显示
  [THEME_CONFIG_KEYS.SERVICE_PHONE]: '400-888-8888',
  [THEME_CONFIG_KEYS.SERVICE_PHONE_ENABLED]: true,
};

// 品牌布局模式
export type BrandLayout = 'logo-only' | 'logo-name' | 'logo-slogan' | 'logo-name-slogan' | 'name-only' | 'name-slogan';

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system';

// 页脚可见页面类型
export type FooterVisiblePage = 'home' | 'services' | 'cases' | 'profile';

// 主题设置类型
export interface ThemeSettings {
  primaryColor: string;
  defaultThemeMode: ThemeMode;
  brandName: string;
  brandSlogan: string;
  headerLogo: string;
  headerLogoDark: string;
  footerLogo: string;
  footerLogoDark: string;
  headerShowName: boolean;
  headerShowSlogan: boolean;
  footerShowName: boolean;
  footerShowSlogan: boolean;
  headerLayout: BrandLayout;
  footerLayout: BrandLayout;
  // 页脚组件设置
  footerEnabled: boolean;
  footerVisiblePages: FooterVisiblePage[];
  servicePhone: string;
  servicePhoneEnabled: boolean;
}

// ============================================
// 轮播图区域配置
// ============================================

// 轮播图位置类型
export type BannerPosition = 'home' | 'services' | 'profile' | 'service-detail' | 'cases';

// 轮播图区域配置
export interface BannerAreaConfig {
  enabled: boolean;        // 是否启用
  width: number;           // 建议宽度
  height: number;          // 建议高度
  title: string;           // 区域标题
  description: string;     // 区域描述
}

// 轮播图配置键
export const BANNER_CONFIG_KEYS = {
  HOME_ENABLED: 'banner.home.enabled',
  HOME_WIDTH: 'banner.home.width',
  HOME_HEIGHT: 'banner.home.height',
  SERVICES_ENABLED: 'banner.services.enabled',
  SERVICES_WIDTH: 'banner.services.width',
  SERVICES_HEIGHT: 'banner.services.height',
  PROFILE_ENABLED: 'banner.profile.enabled',
  PROFILE_WIDTH: 'banner.profile.width',
  PROFILE_HEIGHT: 'banner.profile.height',
  SERVICE_DETAIL_ENABLED: 'banner.service_detail.enabled',
  SERVICE_DETAIL_WIDTH: 'banner.service_detail.width',
  SERVICE_DETAIL_HEIGHT: 'banner.service_detail.height',
  CASES_ENABLED: 'banner.cases.enabled',
  CASES_WIDTH: 'banner.cases.width',
  CASES_HEIGHT: 'banner.cases.height',
} as const;

// 轮播图配置默认值
export const BANNER_CONFIG_DEFAULTS: Record<string, any> = {
  [BANNER_CONFIG_KEYS.HOME_ENABLED]: true,
  [BANNER_CONFIG_KEYS.HOME_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.HOME_HEIGHT]: 360,
  [BANNER_CONFIG_KEYS.SERVICES_ENABLED]: false,
  [BANNER_CONFIG_KEYS.SERVICES_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.SERVICES_HEIGHT]: 280,
  [BANNER_CONFIG_KEYS.PROFILE_ENABLED]: false,
  [BANNER_CONFIG_KEYS.PROFILE_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.PROFILE_HEIGHT]: 200,
  [BANNER_CONFIG_KEYS.SERVICE_DETAIL_ENABLED]: false,
  [BANNER_CONFIG_KEYS.SERVICE_DETAIL_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.SERVICE_DETAIL_HEIGHT]: 400,
  [BANNER_CONFIG_KEYS.CASES_ENABLED]: false,
  [BANNER_CONFIG_KEYS.CASES_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.CASES_HEIGHT]: 280,
};

// 轮播图区域信息
export const BANNER_AREAS: Record<BannerPosition, { title: string; description: string }> = {
  home: { title: '首页轮播图', description: '显示在小程序首页顶部' },
  services: { title: '服务页轮播图', description: '显示在服务列表页顶部' },
  profile: { title: '个人中心轮播图', description: '显示在个人中心页顶部' },
  'service-detail': { title: '服务详情轮播图', description: '显示在服务详情页' },
  cases: { title: '病例页轮播图', description: '显示在病例管理页顶部' },
};

// 所有轮播图区域配置类型
export interface BannerSettings {
  home: BannerAreaConfig;
  services: BannerAreaConfig;
  profile: BannerAreaConfig;
  serviceDetail: BannerAreaConfig;
  cases: BannerAreaConfig;
}

// ============================================
// 首页配置
// ============================================

// 统计卡片项配置
export interface StatsItemConfig {
  key: string;           // 统计项标识：userCount, hospitalCount, rating, orderCount, custom
  label: string;         // 显示标签
  suffix: string;        // 后缀，如 +, %
  enabled: boolean;      // 是否启用
  customValue?: string;  // 自定义值（当 key 为 custom 时使用）
}

// 首页配置键
export const HOME_CONFIG_KEYS = {
  // 统计卡片
  STATS_ENABLED: 'home.stats.enabled',
  STATS_ITEMS: 'home.stats.items',
  // 内容区（HTML 代码）
  CONTENT_ENABLED: 'home.content.enabled',
  CONTENT_CODE: 'home.content.code',
  // 服务推荐
  SERVICE_RECOMMEND_SETTINGS: 'home.serviceRecommend.settings',
} as const;

// 默认统计项
export const DEFAULT_STATS_ITEMS: StatsItemConfig[] = [
  { key: 'userCount', label: '服务用户', suffix: '+', enabled: true },
  { key: 'hospitalCount', label: '合作医院', suffix: '+', enabled: true },
  { key: 'rating', label: '好评率', suffix: '%', enabled: true },
];

// 默认内容区 HTML 代码
export const DEFAULT_CONTENT_CODE = '';

// ============================================
// 服务推荐配置
// ============================================

// 服务推荐选项卡类型
export type ServiceTabType = 'recommended' | 'hot' | 'rating' | 'custom';

// 服务推荐选项卡配置
export interface ServiceTabConfig {
  key: ServiceTabType;      // 选项卡标识
  title: string;            // 选项卡名称
  enabled: boolean;         // 是否启用
  limit: number;            // 显示数量
  serviceIds?: string[];    // 自定义选项卡的服务ID列表
}

// 服务推荐设置
export interface ServiceRecommendSettings {
  enabled: boolean;                 // 整个板块是否启用
  tabs: ServiceTabConfig[];         // 选项卡配置
}

// 默认服务推荐选项卡
export const DEFAULT_SERVICE_TABS: ServiceTabConfig[] = [
  { key: 'recommended', title: '推荐服务', enabled: true, limit: 5 },
  { key: 'hot', title: '热门服务', enabled: true, limit: 5 },
  { key: 'rating', title: '好评榜', enabled: true, limit: 5 },
  { key: 'custom', title: '精选服务', enabled: false, limit: 5, serviceIds: [] },
];

// 默认服务推荐设置
export const DEFAULT_SERVICE_RECOMMEND_SETTINGS: ServiceRecommendSettings = {
  enabled: true,
  tabs: DEFAULT_SERVICE_TABS,
};

// 首页配置默认值
export const HOME_CONFIG_DEFAULTS: Record<string, any> = {
  [HOME_CONFIG_KEYS.STATS_ENABLED]: true,
  [HOME_CONFIG_KEYS.STATS_ITEMS]: DEFAULT_STATS_ITEMS,
  [HOME_CONFIG_KEYS.CONTENT_ENABLED]: false,
  [HOME_CONFIG_KEYS.CONTENT_CODE]: DEFAULT_CONTENT_CODE,
  [HOME_CONFIG_KEYS.SERVICE_RECOMMEND_SETTINGS]: DEFAULT_SERVICE_RECOMMEND_SETTINGS,
};

// 首页设置类型
export interface HomePageSettings {
  statsEnabled: boolean;
  statsItems: StatsItemConfig[];
  contentEnabled: boolean;
  contentCode: string;
  serviceRecommend: ServiceRecommendSettings;
}

