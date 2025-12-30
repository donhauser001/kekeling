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
  DISPATCH_MODE: 'order.dispatch_mode',
  GRAB_TIMEOUT_MINUTES: 'order.grab_timeout_minutes',
  // 分阶段取消扣费规则
  CANCELLATION_FEE_RULES: 'order.cancellation_fee_rules',
  // 自动派单算法权重配置
  DISPATCH_WEIGHTS: 'order.dispatch_weights',
  // 自动派单超时时间（分钟）
  AUTO_DISPATCH_TIMEOUT: 'order.auto_dispatch_timeout',
} as const;

// 自动派单权重配置
export interface DispatchWeights {
  /** 距离权重（0-1） */
  distance: number;
  /** 医院熟悉度权重（0-1） */
  hospitalFamiliarity: number;
  /** 评分权重（0-1） */
  rating: number;
  /** 等级权重（0-1） */
  levelWeight: number;
  /** 空闲度权重（0-1） */
  availability: number;
}

// 默认自动派单权重
export const DEFAULT_DISPATCH_WEIGHTS: DispatchWeights = {
  distance: 0.30,           // 距离权重30%
  hospitalFamiliarity: 0.25, // 医院熟悉度25%
  rating: 0.20,             // 评分权重20%
  levelWeight: 0.15,        // 等级权重15%
  availability: 0.10,       // 空闲度权重10%
};

// 单个阶段的取消扣费配置
export interface CancellationFeeStage {
  /** 是否允许退款 */
  enabled: boolean;
  /** 扣费比例 (0-1) */
  feeRate: number;
}

// 取消扣费规则类型
export interface CancellationFeeRules {
  /** 未指派陪诊员阶段 */
  unassigned: CancellationFeeStage;
  /** 已指派陪诊员阶段 */
  assigned: CancellationFeeStage;
  /** 距离服务开始超过1天 */
  beforeOneDay: CancellationFeeStage;
  /** 服务当天（不足1天） */
  sameDay: CancellationFeeStage;
  /** 服务已开始 */
  afterStart: CancellationFeeStage;
}

// 默认取消扣费规则
export const DEFAULT_CANCELLATION_FEE_RULES: CancellationFeeRules = {
  unassigned: { enabled: true, feeRate: 0 },       // 未指派：允许退款，全额退
  assigned: { enabled: true, feeRate: 0.1 },       // 已指派：允许退款，扣10%
  beforeOneDay: { enabled: true, feeRate: 0.2 },   // 距服务超1天：允许退款，扣20%
  sameDay: { enabled: true, feeRate: 0.5 },        // 服务当天：允许退款，扣50%
  afterStart: { enabled: false, feeRate: 0.8 },    // 服务已开始：默认不允许退款
};

// 订单设置默认值
export const ORDER_CONFIG_DEFAULTS: Record<string, any> = {
  [ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES]: 15,
  [ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS]: 24,
  [ORDER_CONFIG_KEYS.DISPATCH_MODE]: 'assign', // grab, assign, mixed
  [ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES]: 30,
  [ORDER_CONFIG_KEYS.CANCELLATION_FEE_RULES]: DEFAULT_CANCELLATION_FEE_RULES,
  [ORDER_CONFIG_KEYS.DISPATCH_WEIGHTS]: DEFAULT_DISPATCH_WEIGHTS,
  [ORDER_CONFIG_KEYS.AUTO_DISPATCH_TIMEOUT]: 30, // 默认30分钟无人抢单后自动派单
};

// 订单设置类型
export interface OrderSettings {
  autoCancelMinutes: number;
  autoCompleteHours: number;
  dispatchMode: 'grab' | 'assign' | 'mixed';
  grabTimeoutMinutes: number;
  /** 分阶段取消扣费规则 */
  cancellationFeeRules: CancellationFeeRules;
  /** 自动派单权重配置 */
  dispatchWeights: DispatchWeights;
  /** 自动派单超时时间（分钟），无人抢单后自动派单 */
  autoDispatchTimeout: number;
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
  [THEME_CONFIG_KEYS.BRAND_SLOGAN]: '全家一站式就医助手',
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
export type FooterVisiblePage = 'home' | 'services' | 'orders' | 'profile';

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
export type BannerPosition = 'home' | 'services' | 'profile' | 'service-detail' | 'orders' | 'cases';

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
  ORDERS_ENABLED: 'banner.orders.enabled',
  ORDERS_WIDTH: 'banner.orders.width',
  ORDERS_HEIGHT: 'banner.orders.height',
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
  [BANNER_CONFIG_KEYS.ORDERS_ENABLED]: false,
  [BANNER_CONFIG_KEYS.ORDERS_WIDTH]: 750,
  [BANNER_CONFIG_KEYS.ORDERS_HEIGHT]: 280,
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
  orders: { title: '订单页轮播图', description: '显示在订单列表页顶部' },
  cases: { title: '病例页轮播图', description: '显示在病例管理页顶部' },
};

// 所有轮播图区域配置类型
export interface BannerSettings {
  home: BannerAreaConfig;
  services: BannerAreaConfig;
  profile: BannerAreaConfig;
  serviceDetail: BannerAreaConfig;
  orders: BannerAreaConfig;
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

// ============================================
// 短信配置（阿里云短信服务）
// ============================================

// 短信配置键
export const SMS_CONFIG_KEYS = {
  ENABLED: 'sms.enabled',
  PROVIDER: 'sms.provider',
  ACCESS_KEY_ID: 'sms.access_key_id',
  ACCESS_KEY_SECRET: 'sms.access_key_secret',
  SIGN_NAME: 'sms.sign_name',
  TEMPLATE_CODE: 'sms.template_code',
  DEV_MODE: 'sms.dev_mode',
  DEV_CODE: 'sms.dev_code',
  // 频控配置
  RATE_LIMIT_PHONE_60S: 'sms.rate_limit_phone_60s', // 同手机号60秒内只能发1次
  RATE_LIMIT_IP_HOUR: 'sms.rate_limit_ip_hour', // 同IP每小时上限
  RATE_LIMIT_PHONE_DAY: 'sms.rate_limit_phone_day', // 同手机号每日上限
  CODE_LENGTH: 'sms.code_length', // 验证码长度
  CODE_TTL: 'sms.code_ttl', // 验证码有效期（秒）
} as const;

// 短信配置默认值
export const SMS_CONFIG_DEFAULTS: Record<string, any> = {
  [SMS_CONFIG_KEYS.ENABLED]: false,
  [SMS_CONFIG_KEYS.PROVIDER]: 'aliyun',
  [SMS_CONFIG_KEYS.ACCESS_KEY_ID]: '',
  [SMS_CONFIG_KEYS.ACCESS_KEY_SECRET]: '',
  [SMS_CONFIG_KEYS.SIGN_NAME]: '',
  [SMS_CONFIG_KEYS.TEMPLATE_CODE]: '',
  [SMS_CONFIG_KEYS.DEV_MODE]: true,
  [SMS_CONFIG_KEYS.DEV_CODE]: '123456',
  // 频控配置默认值
  [SMS_CONFIG_KEYS.RATE_LIMIT_PHONE_60S]: 60, // 60秒冷却
  [SMS_CONFIG_KEYS.RATE_LIMIT_IP_HOUR]: 20, // 同IP每小时20次
  [SMS_CONFIG_KEYS.RATE_LIMIT_PHONE_DAY]: 10, // 同手机号每日10次
  [SMS_CONFIG_KEYS.CODE_LENGTH]: 6, // 6位验证码
  [SMS_CONFIG_KEYS.CODE_TTL]: 300, // 5分钟有效
};

// 短信服务提供商
export type SmsProvider = 'aliyun' | 'tencent';

// 短信配置类型
export interface SmsSettings {
  /** 是否启用短信服务 */
  enabled: boolean;
  /** 短信服务提供商 */
  provider: SmsProvider;
  /** 阿里云 AccessKey ID */
  accessKeyId: string;
  /** 阿里云 AccessKey Secret */
  accessKeySecret: string;
  /** 短信签名 */
  signName: string;
  /** 短信模板编码 */
  templateCode: string;
  /** 开发模式（不调用真实接口） */
  devMode: boolean;
  /** 开发模式下的固定验证码 */
  devCode: string;
  // 频控配置
  /** 同手机号发送间隔（秒），默认60秒 */
  rateLimitPhone60s: number;
  /** 同IP每小时发送上限，默认20次 */
  rateLimitIpHour: number;
  /** 同手机号每日发送上限，默认10次 */
  rateLimitPhoneDay: number;
  /** 验证码长度，默认6位 */
  codeLength: number;
  /** 验证码有效期（秒），默认300秒（5分钟） */
  codeTtl: number;
}

// ============================================
// 支付配置（微信支付 + 支付宝）
// ============================================

// 支付配置键
export const PAYMENT_CONFIG_KEYS = {
  // 微信支付
  WECHAT_ENABLED: 'payment.wechat.enabled',
  WECHAT_APP_ID: 'payment.wechat.app_id',
  WECHAT_MCH_ID: 'payment.wechat.mch_id',
  WECHAT_API_KEY: 'payment.wechat.api_key',
  WECHAT_API_V3_KEY: 'payment.wechat.api_v3_key',
  WECHAT_CERT_SERIAL_NO: 'payment.wechat.cert_serial_no',
  WECHAT_PRIVATE_KEY: 'payment.wechat.private_key',
  WECHAT_NOTIFY_URL: 'payment.wechat.notify_url',
  // 支付宝
  ALIPAY_ENABLED: 'payment.alipay.enabled',
  ALIPAY_APP_ID: 'payment.alipay.app_id',
  ALIPAY_PRIVATE_KEY: 'payment.alipay.private_key',
  ALIPAY_PUBLIC_KEY: 'payment.alipay.public_key',
  ALIPAY_SIGN_TYPE: 'payment.alipay.sign_type',
  ALIPAY_NOTIFY_URL: 'payment.alipay.notify_url',
  ALIPAY_SANDBOX: 'payment.alipay.sandbox',
} as const;

// 支付配置默认值
export const PAYMENT_CONFIG_DEFAULTS: Record<string, any> = {
  // 微信支付默认值
  [PAYMENT_CONFIG_KEYS.WECHAT_ENABLED]: false,
  [PAYMENT_CONFIG_KEYS.WECHAT_APP_ID]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_MCH_ID]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_API_KEY]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_API_V3_KEY]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_CERT_SERIAL_NO]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_PRIVATE_KEY]: '',
  [PAYMENT_CONFIG_KEYS.WECHAT_NOTIFY_URL]: '',
  // 支付宝默认值
  [PAYMENT_CONFIG_KEYS.ALIPAY_ENABLED]: false,
  [PAYMENT_CONFIG_KEYS.ALIPAY_APP_ID]: '',
  [PAYMENT_CONFIG_KEYS.ALIPAY_PRIVATE_KEY]: '',
  [PAYMENT_CONFIG_KEYS.ALIPAY_PUBLIC_KEY]: '',
  [PAYMENT_CONFIG_KEYS.ALIPAY_SIGN_TYPE]: 'RSA2',
  [PAYMENT_CONFIG_KEYS.ALIPAY_NOTIFY_URL]: '',
  [PAYMENT_CONFIG_KEYS.ALIPAY_SANDBOX]: false,
};

// 微信支付配置类型
export interface WechatPaySettings {
  /** 是否启用微信支付 */
  enabled: boolean;
  /** 小程序 AppID */
  appId: string;
  /** 商户号 */
  mchId: string;
  /** API 密钥 (V2) */
  apiKey: string;
  /** API V3 密钥 */
  apiV3Key: string;
  /** 证书序列号 */
  certSerialNo: string;
  /** 商户私钥 */
  privateKey: string;
  /** 支付回调地址 */
  notifyUrl: string;
}

// 支付宝配置类型
export interface AlipaySettings {
  /** 是否启用支付宝 */
  enabled: boolean;
  /** 应用 ID */
  appId: string;
  /** 应用私钥 */
  privateKey: string;
  /** 支付宝公钥 */
  alipayPublicKey: string;
  /** 签名类型 */
  signType: 'RSA' | 'RSA2';
  /** 异步通知地址 */
  notifyUrl: string;
  /** 沙箱模式 */
  sandbox: boolean;
}

// 完整支付配置类型
export interface PaymentSettings {
  wechat: WechatPaySettings;
  alipay: AlipaySettings;
}

// ============================================
// 小程序设置
// ============================================

// 小程序配置键
export const MINIAPP_CONFIG_KEYS = {
  // 开发模式开关
  DEV_MODE: 'miniapp.dev_mode',
  // 开发模式下跳过工作台登录
  SKIP_WORKBENCH_LOGIN: 'miniapp.skip_workbench_login',
  // 开发模式下的默认陪诊员ID（用于跳过登录时加载数据）
  DEV_ESCORT_ID: 'miniapp.dev_escort_id',
} as const;

// 小程序配置默认值
export const MINIAPP_CONFIG_DEFAULTS: Record<string, any> = {
  [MINIAPP_CONFIG_KEYS.DEV_MODE]: false,
  [MINIAPP_CONFIG_KEYS.SKIP_WORKBENCH_LOGIN]: false,
  [MINIAPP_CONFIG_KEYS.DEV_ESCORT_ID]: '',
};

// 小程序设置类型
export interface MiniappSettings {
  /** 小程序开发模式 */
  devMode: boolean;
  /** 跳过工作台登录验证 */
  skipWorkbenchLogin: boolean;
  /** 开发模式下的默认陪诊员ID */
  devEscortId: string;
}

