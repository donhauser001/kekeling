import { z } from 'zod'
import { timestampsSchema, contactInfoSchema, locationSchema } from './common'

// ============================================
// 订单状态常量
// ============================================

/**
 * 订单状态枚举对象 - 用于代码中引用，避免魔法字符串
 */
export const ORDER_STATUS = {
  PENDING: 'pending',           // 待支付
  PAID: 'paid',                 // 已支付，待确认
  CONFIRMED: 'confirmed',       // 已确认，待服务
  ASSIGNED: 'assigned',         // 已分配陪诊员
  IN_PROGRESS: 'in_progress',   // 服务中
  COMPLETED: 'completed',       // 已完成
  CANCELLED: 'cancelled',       // 已取消
  REFUNDING: 'refunding',       // 退款中
  REFUNDED: 'refunded',         // 已退款
} as const

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

/**
 * 订单状态标签映射
 */
export const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  pending: '待支付',
  paid: '待接单',
  confirmed: '已确认',
  assigned: '已分配',
  in_progress: '服务中',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
}

/**
 * 订单状态颜色映射 (Tailwind CSS classes)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatusType, string> = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  paid: 'text-blue-600 bg-blue-50 border-blue-200',
  confirmed: 'text-purple-600 bg-purple-50 border-purple-200',
  assigned: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  in_progress: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
  refunding: 'text-orange-600 bg-orange-50 border-orange-200',
  refunded: 'text-red-600 bg-red-50 border-red-200',
}

/**
 * 订单状态 Zod Schema
 */
export const orderStatusSchema = z.enum([
  'pending',      // 待支付
  'paid',         // 已支付，待确认
  'confirmed',    // 已确认，待服务
  'assigned',     // 已分配陪诊员
  'in_progress',  // 服务中
  'completed',    // 已完成
  'cancelled',    // 已取消
  'refunding',    // 退款中
  'refunded',     // 已退款
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/**
 * 支付方式
 */
export const paymentMethodSchema = z.enum([
  'wechat',   // 微信支付
  'alipay',   // 支付宝
  'balance',  // 余额支付
])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

/**
 * 订单来源
 */
export const orderSourceSchema = z.enum([
  'miniprogram', // 小程序
  'app',         // App
  'h5',          // H5
  'admin',       // 后台下单
])
export type OrderSource = z.infer<typeof orderSourceSchema>

/**
 * 订单服务项
 */
export const orderServiceItemSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  price: z.coerce.number(), // ✅ 处理 Decimal 可能返回的字符串
  quantity: z.number().default(1),
  unit: z.string(), // 次、天、小时
})
export type OrderServiceItem = z.infer<typeof orderServiceItemSchema>

/**
 * 就诊信息
 */
export const appointmentInfoSchema = z.object({
  hospitalId: z.string(),
  hospitalName: z.string(),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  appointmentDate: z.string(),     // 预约日期 YYYY-MM-DD
  appointmentTime: z.string(),     // 预约时间 HH:mm
  appointmentEndTime: z.string().optional(), // 预约结束时间
})
export type AppointmentInfo = z.infer<typeof appointmentInfoSchema>

/**
 * 订单 Schema
 */
export const orderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),              // 订单编号
  userId: z.string(),               // 下单用户ID
  
  // 服务信息
  services: z.array(orderServiceItemSchema),
  
  // 就诊信息
  appointment: appointmentInfoSchema,
  
  // 就诊人信息
  patientId: z.string(),
  patientName: z.string(),
  patientPhone: z.string(),
  patientIdCard: z.string().optional(),
  
  // 陪诊员信息
  escortId: z.string().nullable(),
  escortName: z.string().nullable(),
  escortPhone: z.string().nullable(),
  
  // 订单金额 (使用 coerce 处理 Decimal 返回的字符串)
  totalAmount: z.coerce.number(),         // 订单总额
  discountAmount: z.coerce.number().default(0), // 优惠金额
  paidAmount: z.coerce.number(),          // 实付金额
  
  // 优惠券
  couponId: z.string().optional(),
  couponAmount: z.coerce.number().optional(),
  
  // 支付信息
  paymentMethod: paymentMethodSchema.optional(),
  paymentTime: z.string().datetime().optional(),
  transactionId: z.string().optional(), // 支付流水号
  
  // 订单状态
  status: orderStatusSchema,
  source: orderSourceSchema,
  
  // 备注
  userRemark: z.string().optional(),   // 用户备注
  adminRemark: z.string().optional(),  // 管理员备注
  
  // 评价
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  reviewTime: z.string().datetime().optional(),
  
  // 取消/退款
  cancelReason: z.string().optional(),
  cancelTime: z.string().datetime().optional(),
  refundAmount: z.coerce.number().optional(),
  refundTime: z.string().datetime().optional(),
}).merge(timestampsSchema)

export type Order = z.infer<typeof orderSchema>

/**
 * 创建订单请求
 */
export const createOrderRequestSchema = z.object({
  serviceId: z.string(),
  hospitalId: z.string(),
  departmentId: z.string().optional(),
  escortId: z.string().optional(),
  patientId: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  couponId: z.string().optional(),
  userRemark: z.string().optional(),
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

/**
 * 订单列表查询参数
 */
export const orderQueryParamsSchema = z.object({
  status: orderStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  keyword: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})
export type OrderQueryParams = z.infer<typeof orderQueryParamsSchema>

