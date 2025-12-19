/**
 * 仪表盘 API
 */

import { request } from './request'

export interface DashboardStatistics {
  todayOrders: number
  todayRevenue: number
  totalUsers: number
  totalEscorts: number
  pendingOrders: number
  completedOrders: number
  orderGrowth: number
  revenueGrowth: number
}

export interface OrderTrendItem {
  date: string
  count: number
}

export interface OrderStatusItem {
  status: string
  count: number
}

export const dashboardApi = {
  getStatistics: () =>
    request<DashboardStatistics>('/admin/dashboard/statistics'),

  getOrderTrend: (days: number = 7) =>
    request<OrderTrendItem[]>('/admin/dashboard/order-trend', {
      params: { days },
    }),

  getOrderStatus: () =>
    request<OrderStatusItem[]>('/admin/dashboard/order-status'),
}
