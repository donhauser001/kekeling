import { z } from 'zod'

// ============================================
// 订单状态定义
// ============================================

/**
 * 订单状态枚举
 * - pending: 待支付
 * - paid: 已支付
 * - confirmed: 已确认（陪诊员已接单）
 * - in_progress: 服务中
 * - completed: 已完成
 * - cancelled: 已取消
 * - refunded: 已退款
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

// 状态标签映射
export const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  pending: '待支付',
  paid: '待接单',
  confirmed: '已确认',
  in_progress: '服务中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

// 状态颜色映射
export const ORDER_STATUS_COLORS: Record<OrderStatusType, string> = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  paid: 'text-blue-600 bg-blue-50 border-blue-200',
  confirmed: 'text-purple-600 bg-purple-50 border-purple-200',
  in_progress: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
  refunded: 'text-red-600 bg-red-50 border-red-200',
}

// ============================================
// Zod Schemas
// ============================================

export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  escortName: z.string().nullable(),
  escortPhone: z.string().nullable(),
  hospital: z.string(),
  department: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  status: orderStatusSchema,
  // ✅ 使用 coerce 处理 Decimal 可能返回的字符串
  amount: z.coerce.number(),
  paidAmount: z.coerce.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string(),
})

export type Order = z.infer<typeof orderSchema>

