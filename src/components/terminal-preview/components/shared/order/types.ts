/**
 * 订单详情共享类型定义
 */

import type { ThemeSettings } from '../../../types'

/** 订单状态 */
export type OrderStatus = 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'

/** 订单详情数据（通用） */
export interface OrderDetailData {
  id: string
  orderNo: string
  status: OrderStatus
  statusText: string
  service: {
    id: string
    name: string
    type: string
    duration?: number
  }
  appointment: {
    date: string
    time: string
    hospitalName: string
    department?: string
    address?: string
  }
  user: {
    id: string
    name: string
    phone: string
    maskedPhone: string
    avatar?: string
  }
  payment: {
    amount: number
    commission: number
    tip?: number
  }
  remark?: string
  createdAt: string
  updatedAt: string
  /** 陪诊员信息（用户端可见） */
  escort?: {
    id: string
    name: string
    phone: string
    avatar?: string
    rating?: number
  }
}

/** 共享组件通用 Props */
export interface SharedCardProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
}

/** 状态颜色配置 */
export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  accepted: { bg: '#dbeafe', text: '#2563eb' },
  ongoing: { bg: '#d1fae5', text: '#059669' },
  completed: { bg: '#e5e7eb', text: '#6b7280' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
}

