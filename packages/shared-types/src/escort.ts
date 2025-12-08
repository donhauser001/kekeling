import { z } from 'zod'
import { timestampsSchema, genderSchema } from './common'
import { userStatusSchema } from './user'

/**
 * 陪诊员等级
 */
export const escortLevelSchema = z.enum([
  'trainee',      // 实习
  'junior',       // 初级
  'intermediate', // 中级
  'senior',       // 高级
  'expert',       // 专家
])
export type EscortLevel = z.infer<typeof escortLevelSchema>

/**
 * 陪诊员认证状态
 */
export const certificationStatusSchema = z.enum([
  'pending',   // 待审核
  'approved',  // 已认证
  'rejected',  // 已拒绝
  'expired',   // 已过期
])
export type CertificationStatus = z.infer<typeof certificationStatusSchema>

/**
 * 陪诊员 Schema
 */
export const escortSchema = z.object({
  id: z.string(),
  
  // 基本信息
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  gender: genderSchema,
  avatar: z.string().optional(),
  idCard: z.string(),
  birthday: z.string().optional(),
  
  // 职业信息
  level: escortLevelSchema,
  introduction: z.string().optional(),   // 个人简介
  specialties: z.array(z.string()).optional(), // 擅长领域
  certificates: z.array(z.string()).optional(), // 证书
  
  // 服务范围
  serviceHospitals: z.array(z.string()).optional(), // 服务医院ID列表
  serviceCategories: z.array(z.string()).optional(), // 服务类型ID列表
  
  // 统计数据
  orderCount: z.number().default(0),      // 总接单数
  completedCount: z.number().default(0),  // 完成订单数
  rating: z.number().default(100),        // 满意度 %
  reviewCount: z.number().default(0),     // 评价数
  
  // 状态
  status: userStatusSchema,
  certificationStatus: certificationStatusSchema,
  isOnline: z.boolean().default(false),   // 是否在线接单
  
  // 排班相关
  workDays: z.array(z.number()).optional(), // 工作日 1-7
  workTimeStart: z.string().optional(),     // 工作开始时间
  workTimeEnd: z.string().optional(),       // 工作结束时间
}).merge(timestampsSchema)

export type Escort = z.infer<typeof escortSchema>

/**
 * 陪诊员列表响应（简化版，用于列表展示）
 */
export const escortListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  gender: genderSchema,
  level: escortLevelSchema,
  introduction: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  orderCount: z.number(),
  rating: z.number(),
  isOnline: z.boolean(),
})
export type EscortListItem = z.infer<typeof escortListItemSchema>

/**
 * 陪诊员查询参数
 */
export const escortQueryParamsSchema = z.object({
  hospitalId: z.string().optional(),
  serviceCategoryId: z.string().optional(),
  level: escortLevelSchema.optional(),
  isOnline: z.boolean().optional(),
  keyword: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})
export type EscortQueryParams = z.infer<typeof escortQueryParamsSchema>

