import { z } from 'zod'

/**
 * 通用状态枚举
 */
export const statusSchema = z.enum(['active', 'inactive'])
export type Status = z.infer<typeof statusSchema>

/**
 * 分页参数
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
})
export type PaginationParams = z.infer<typeof paginationParamsSchema>

/**
 * 分页响应元数据
 */
export const paginationMetaSchema = z.object({
  current: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
})
export type PaginationMeta = z.infer<typeof paginationMetaSchema>

/**
 * 时间戳字段
 */
export const timestampsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Timestamps = z.infer<typeof timestampsSchema>

/**
 * 地理位置
 */
export const locationSchema = z.object({
  province: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})
export type Location = z.infer<typeof locationSchema>

/**
 * 联系信息
 */
export const contactInfoSchema = z.object({
  name: z.string(),
  phone: z.string(),
  idCard: z.string().optional(),
  relation: z.string().optional(), // 与患者关系
})
export type ContactInfo = z.infer<typeof contactInfoSchema>

