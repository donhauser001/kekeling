/**
 * 系统配置 API
 */

import { request } from './request'

// ============================================================================
// 订单设置
// ============================================================================

export interface OrderSettings {
  autoCancelMinutes: number     // 未支付自动取消时间（分钟）
  autoCompleteHours: number     // 服务自动完成时间（小时）
  platformFeeRate: number       // 平台抽成比例 (0-1)
  dispatchMode: 'grab' | 'assign' | 'mixed'  // 派单模式
  grabTimeoutMinutes: number    // 抢单超时时间（分钟）
  allowRefundBeforeStart: boolean  // 允许服务前退款
  refundFeeRate: number         // 取消扣款比例 (0-1)
}

// ============================================================================
// 主题设置
// ============================================================================

export type BrandLayout = 'logo-only' | 'logo-name' | 'logo-slogan' | 'logo-name-slogan' | 'name-only' | 'name-slogan'
export type ThemeMode = 'light' | 'dark' | 'system'
export type FooterVisiblePage = 'home' | 'services' | 'cases' | 'profile'

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
}
