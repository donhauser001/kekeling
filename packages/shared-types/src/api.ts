import { z } from 'zod'
import { paginationMetaSchema } from './common'

/**
 * API 响应状态码
 */
export const apiCodeSchema = z.enum([
  '0',        // 成功
  '401',      // 未授权
  '403',      // 禁止访问
  '404',      // 资源不存在
  '422',      // 参数验证失败
  '500',      // 服务器错误
])

/**
 * 统一 API 响应格式
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
    timestamp: z.number(),
  })

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页响应格式
 */
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: z.object({
      list: z.array(itemSchema),
      pagination: paginationMetaSchema,
    }),
    timestamp: z.number(),
  })

export type PaginatedResponse<T> = {
  code: number
  message: string
  data: {
    list: T[]
    pagination: {
      current: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
  timestamp: number
}

/**
 * API 错误响应
 */
export const apiErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
  timestamp: z.number(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

/**
 * 微信登录请求
 */
export const wechatLoginRequestSchema = z.object({
  code: z.string(), // 微信 login code
})
export type WechatLoginRequest = z.infer<typeof wechatLoginRequestSchema>

/**
 * 手机号绑定请求
 */
export const bindPhoneRequestSchema = z.object({
  code: z.string(),       // 微信获取手机号的 code
  encryptedData: z.string().optional(),
  iv: z.string().optional(),
})
export type BindPhoneRequest = z.infer<typeof bindPhoneRequestSchema>

/**
 * 首页配置数据
 */
export const homeConfigSchema = z.object({
  banners: z.array(z.object({
    id: z.string(),
    image: z.string(),
    link: z.string().optional(),
    linkType: z.enum(['none', 'page', 'service', 'url']).optional(),
  })),
  serviceEntries: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    link: z.string(),
  })),
  hotServices: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    coverImage: z.string().optional(),
    orderCount: z.number(),
  })),
  recommendEscorts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    level: z.string(),
    rating: z.number(),
    orderCount: z.number(),
  })),
  popup: z.object({
    id: z.string(),
    image: z.string(),
    link: z.string().optional(),
  }).optional(),
})
export type HomeConfig = z.infer<typeof homeConfigSchema>

