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
}
