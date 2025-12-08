import { z } from 'zod'
import { timestampsSchema, contactInfoSchema } from './common'

/**
 * 用户状态
 */
export const userStatusSchema = z.enum([
  'active',    // 正常
  'inactive',  // 未激活
  'suspended', // 已封禁
])
export type UserStatus = z.infer<typeof userStatusSchema>

/**
 * 用户性别
 */
export const genderSchema = z.enum(['male', 'female', 'unknown'])
export type Gender = z.infer<typeof genderSchema>

/**
 * 小程序用户 Schema（C端用户）
 */
export const appUserSchema = z.object({
  id: z.string(),
  openid: z.string(),          // 微信 openid
  unionid: z.string().optional(), // 微信 unionid
  phone: z.string().optional(),   // 绑定手机号
  nickname: z.string(),
  avatar: z.string().optional(),
  gender: genderSchema.default('unknown'),
  status: userStatusSchema,
  // 会员信息
  memberLevel: z.string().optional(),
  points: z.number().default(0),
}).merge(timestampsSchema)

export type AppUser = z.infer<typeof appUserSchema>

/**
 * 就诊人 Schema
 */
export const patientSchema = z.object({
  id: z.string(),
  userId: z.string(),           // 所属用户ID
  name: z.string(),
  phone: z.string(),
  idCard: z.string(),
  gender: genderSchema,
  birthday: z.string().optional(),
  relation: z.string(),         // 与用户关系：本人、父母、配偶、子女、其他
  medicalCardNo: z.string().optional(), // 就诊卡号
  isDefault: z.boolean().default(false),
}).merge(timestampsSchema)

export type Patient = z.infer<typeof patientSchema>

/**
 * 管理后台用户 Schema（运营人员）
 */
export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  realName: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'operator', 'viewer']),
  status: userStatusSchema,
  lastLoginAt: z.string().datetime().optional(),
}).merge(timestampsSchema)

export type AdminUser = z.infer<typeof adminUserSchema>

/**
 * 用户登录响应
 */
export const loginResponseSchema = z.object({
  token: z.string(),
  expiresIn: z.number(),
  user: appUserSchema,
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

