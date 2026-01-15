/**
 * 系统配置 API
 */

import { request } from './request'

// ============================================================================
// 订单设置
// ============================================================================

// 单个阶段的取消扣费配置
export interface CancellationFeeStage {
  enabled: boolean   // 是否允许退款
  feeRate: number    // 扣费比例 (0-1)
}

// 分阶段取消扣费规则
export interface CancellationFeeRules {
  unassigned: CancellationFeeStage     // 未指派陪诊员阶段
  assigned: CancellationFeeStage       // 已指派陪诊员阶段
  beforeOneDay: CancellationFeeStage   // 距离服务开始超过1天
  sameDay: CancellationFeeStage        // 服务当天（不足1天）
  afterStart: CancellationFeeStage     // 服务已开始
}

// 自动派单权重配置
export interface DispatchWeights {
  distance: number              // 距离权重（0-1）
  hospitalFamiliarity: number   // 医院熟悉度权重（0-1）
  rating: number                // 评分权重（0-1）
  levelWeight: number           // 等级权重（0-1）
  availability: number          // 空闲度权重（0-1）
}

export interface OrderSettings {
  autoCancelMinutes: number     // 未支付自动取消时间（分钟）
  autoCompleteHours: number     // 服务自动完成时间（小时）
  dispatchMode: 'grab' | 'assign' | 'mixed'  // 派单模式
  grabTimeoutMinutes: number    // 抢单超时时间（分钟）
  cancellationFeeRules: CancellationFeeRules  // 分阶段取消扣费规则
  dispatchWeights: DispatchWeights  // 自动派单权重配置
  autoDispatchTimeout: number   // 自动派单超时时间（分钟）
}

// ============================================================================
// 主题设置
// ============================================================================

export type BrandLayout = 'logo-only' | 'logo-name' | 'logo-slogan' | 'logo-name-slogan' | 'name-only' | 'name-slogan'
export type ThemeMode = 'light' | 'dark' | 'system'
export type FooterVisiblePage = 'home' | 'services' | 'orders' | 'profile'

export interface ThemeSettings {
  primaryColor: string          // 主色调
  defaultThemeMode: ThemeMode   // 默认主题模式
  brandName: string             // 品牌名称
  brandSlogan: string           // 品牌标语
  // 顶部 Logo
  headerLogo: string            // 顶部 Logo（浅色模式）
  headerLogoDark: string        // 顶部 Logo（深色模式）
  // 页脚 Logo
  footerLogo: string            // 页脚 Logo（浅色模式）
  footerLogoDark: string        // 页脚 Logo（深色模式）
  // 显示开关
  headerShowName: boolean       // 顶部显示名称
  headerShowSlogan: boolean     // 顶部显示标语
  footerShowLogo: boolean       // 页脚显示 Logo
  footerShowName: boolean       // 页脚显示名称
  footerShowSlogan: boolean     // 页脚显示标语
  // 组合模式
  headerLayout: BrandLayout     // 顶部布局模式
  footerLayout: BrandLayout     // 页脚布局模式
  // 页脚组件设置
  footerEnabled: boolean        // 页脚组件开关
  footerVisiblePages: FooterVisiblePage[]  // 页脚显示页面
  servicePhone: string          // 客服电话
  servicePhoneEnabled: boolean  // 客服电话开关
}

// ============================================================================
// 短信设置
// ============================================================================

export type SmsProvider = 'aliyun' | 'tencent'

export interface SmsSettings {
  enabled: boolean           // 是否启用短信服务
  provider: SmsProvider      // 短信服务提供商
  accessKeyId: string        // 阿里云 AccessKey ID
  accessKeySecret: string    // 阿里云 AccessKey Secret（返回时脱敏）
  signName: string           // 短信签名
  templateCode: string       // 短信模板编码
  devMode: boolean           // 开发模式
  devCode: string            // 开发模式下的固定验证码
  // 频控配置
  rateLimitPhone60s: number  // 同手机号发送间隔（秒）
  rateLimitIpHour: number    // 同IP每小时发送上限
  rateLimitPhoneDay: number  // 同手机号每日发送上限
  codeLength: number         // 验证码长度
  codeTtl: number            // 验证码有效期（秒）
}

// ============================================================================
// 配置 API
// ============================================================================

// ============================================================================
// 小程序设置
// ============================================================================

export interface MiniappSettings {
  devMode: boolean              // 小程序开发模式
  skipWorkbenchLogin: boolean   // 跳过工作台登录验证
  devEscortId: string           // 开发模式下的默认陪诊员ID
}

// ============================================================================
// 支付配置
// ============================================================================

// 微信支付配置
export interface WechatPaySettings {
  enabled: boolean
  appId: string
  mchId: string
  apiKey: string
  apiV3Key: string
  certSerialNo: string
  privateKey: string
  notifyUrl: string
}

// 支付宝配置
export interface AlipaySettings {
  enabled: boolean
  appId: string
  privateKey: string
  alipayPublicKey: string
  signType: 'RSA' | 'RSA2'
  notifyUrl: string
  sandbox: boolean
}

// 完整支付配置
export interface PaymentSettings {
  wechat: WechatPaySettings
  alipay: AlipaySettings
}

// ============================================================================
// 配置 API
// ============================================================================

export const configApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll: () => request<Record<string, any>>('/config'),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (key: string) => request<any>(`/config/${encodeURIComponent(key)}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (key: string, value: any, remark?: string) =>
    request<void>(`/config/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value, remark }),
    }),

  getOrderSettings: () =>
    request<OrderSettings>('/config/order/settings'),

  updateOrderSettings: (data: Partial<OrderSettings>) =>
    request<OrderSettings>('/config/order/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getThemeSettings: () =>
    request<ThemeSettings>('/config/theme/settings'),

  updateThemeSettings: (data: Partial<ThemeSettings>) =>
    request<ThemeSettings>('/config/theme/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSmsSettings: () =>
    request<SmsSettings>('/config/sms/settings'),

  updateSmsSettings: (data: Partial<SmsSettings>) =>
    request<SmsSettings>('/config/sms/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMiniappSettings: () =>
    request<MiniappSettings>('/config/miniapp/settings'),

  updateMiniappSettings: (data: Partial<MiniappSettings>) =>
    request<MiniappSettings>('/config/miniapp/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 支付配置
  getWechatPaySettings: () =>
    request<WechatPaySettings>('/config/payment/wechat'),

  updateWechatPaySettings: (data: Partial<WechatPaySettings>) =>
    request<WechatPaySettings>('/config/payment/wechat', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAlipaySettings: () =>
    request<AlipaySettings>('/config/payment/alipay'),

  updateAlipaySettings: (data: Partial<AlipaySettings>) =>
    request<AlipaySettings>('/config/payment/alipay', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getPaymentSettings: () =>
    request<PaymentSettings>('/config/payment/settings'),
}
