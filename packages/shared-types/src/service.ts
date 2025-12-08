import { z } from 'zod'
import { statusSchema, timestampsSchema } from './common'

/**
 * 服务分类
 */
export const serviceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  sort: z.number().default(0),
  status: statusSchema,
}).merge(timestampsSchema)

export type ServiceCategory = z.infer<typeof serviceCategorySchema>

/**
 * 服务项目 Schema
 */
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  description: z.string(),
  detailContent: z.string().optional(), // 富文本详情
  
  // 价格相关
  price: z.number(),              // 基础价格
  originalPrice: z.number().optional(), // 原价（划线价）
  unit: z.string(),               // 计价单位：次、天、小时
  
  // 服务属性
  duration: z.string().optional(), // 服务时长
  serviceScope: z.string().optional(), // 服务范围说明
  serviceProcess: z.array(z.string()).optional(), // 服务流程
  
  // 展示相关
  coverImage: z.string().optional(), // 封面图
  images: z.array(z.string()).optional(), // 详情图
  tags: z.array(z.string()).optional(), // 标签
  
  // 统计
  orderCount: z.number().default(0),   // 订单数
  rating: z.number().default(100),     // 满意度 %
  
  // 状态
  status: statusSchema,
  sort: z.number().default(0),
  isHot: z.boolean().default(false),   // 是否热门
  isRecommend: z.boolean().default(false), // 是否推荐
}).merge(timestampsSchema)

export type Service = z.infer<typeof serviceSchema>

/**
 * 服务列表查询参数
 */
export const serviceQueryParamsSchema = z.object({
  categoryId: z.string().optional(),
  keyword: z.string().optional(),
  status: statusSchema.optional(),
  isHot: z.boolean().optional(),
  isRecommend: z.boolean().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})
export type ServiceQueryParams = z.infer<typeof serviceQueryParamsSchema>

/**
 * 价格政策
 */
export const pricingPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceId: z.string(),
  
  // 价格规则
  basePrice: z.number(),
  // 时段加价
  peakTimeExtra: z.number().optional(),  // 高峰时段加价
  nightExtra: z.number().optional(),     // 夜间加价
  holidayExtra: z.number().optional(),   // 节假日加价
  
  // 距离加价（针对跑腿服务）
  distanceRules: z.array(z.object({
    minKm: z.number(),
    maxKm: z.number(),
    price: z.number(),
  })).optional(),
  
  status: statusSchema,
}).merge(timestampsSchema)

export type PricingPolicy = z.infer<typeof pricingPolicySchema>

