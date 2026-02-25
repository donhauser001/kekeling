/**
 * 订单 API
 */

import { request, type PaginatedData } from './request'

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunding' | 'refunded'

export interface Order {
  id: string
  orderNo: string
  userId: string
  serviceId: string
  hospitalId: string
  patientId: string
  escortId: string | null
  appointmentDate: string
  appointmentTime: string
  departmentName: string | null
  totalAmount: number
  paidAmount: number
  status: OrderStatus
  userRemark: string | null
  adminRemark: string | null
  cancelReason: string | null
  paymentMethod: string | null
  paymentTime: string | null
  transactionId: string | null
  refundAmount: number | null
  refundTime: string | null
  createdAt: string
  updatedAt: string
  // 关联数据
  user?: {
    id: string
    nickname: string | null
    phone: string | null
    avatar: string | null
  }
  service?: {
    id: string
    name: string
    price: number
    unit: string
  }
  hospital?: {
    id: string
    name: string
    address: string | null
  }
  department?: {
    id: string
    name: string
  }
  doctor?: {
    id: string
    name: string
    title: string
  }
  patient?: {
    id: string
    name: string
    phone: string
    gender: string | null
    age: number | null
  }
  escort?: {
    id: string
    name: string
    phone: string
    avatar: string | null
    level: string
  }
}

export interface OrderQuery {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
  userId?: string
  escortId?: string
  hospitalId?: string
  startDate?: string
  endDate?: string
}

export interface OrderStats {
  totalOrders: number
  todayOrders: number
  yesterdayOrders: number
  orderGrowth: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  cancelledOrders: number
  todayRevenue: number
  yesterdayRevenue: number
  revenueGrowth: number
  totalRevenue: number
}

export const orderApi = {
  // 获取列表
  getList: (query: OrderQuery = {}) =>
    request<PaginatedData<Order>>('/admin/orders', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  // 获取统计
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    request<OrderStats>('/admin/orders/stats', { params }),

  // 获取详情
  getById: (id: string) =>
    request<Order>(`/admin/orders/${id}`),

  // 派单
  assign: (id: string, escortId: string) =>
    request<Order>(`/admin/orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ escortId }),
    }),

  // 确认订单
  confirm: (id: string) =>
    request<Order>(`/admin/orders/${id}/confirm`, {
      method: 'POST',
    }),

  // 开始服务
  startService: (id: string) =>
    request<Order>(`/admin/orders/${id}/start`, {
      method: 'POST',
    }),

  // 完成订单
  complete: (id: string) =>
    request<Order>(`/admin/orders/${id}/complete`, {
      method: 'POST',
    }),

  // 取消订单
  cancel: (id: string, reason?: string) =>
    request<Order>(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 申请退款
  requestRefund: (id: string, reason?: string) =>
    request<Order>(`/admin/orders/${id}/refund/request`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 确认退款
  confirmRefund: (id: string) =>
    request<Order>(`/admin/orders/${id}/refund/confirm`, {
      method: 'POST',
    }),

  // 更新备注
  updateRemark: (id: string, remark: string) =>
    request<Order>(`/admin/orders/${id}/remark`, {
      method: 'PUT',
      body: JSON.stringify({ remark }),
    }),

  // 删除订单
  deleteOrder: (id: string) =>
    request<{ success: boolean }>(`/admin/orders/${id}`, {
      method: 'DELETE',
    }),

  // 批量删除订单
  batchDelete: (ids: string[]) =>
    request<{ deleted: number }>('/admin/orders/batch/delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
}
