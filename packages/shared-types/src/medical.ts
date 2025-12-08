import { z } from 'zod'
import { statusSchema, timestampsSchema, locationSchema } from './common'

/**
 * 医院等级
 */
export const hospitalLevelSchema = z.enum([
  'tertiary_a',   // 三级甲等
  'tertiary_b',   // 三级乙等
  'tertiary_c',   // 三级丙等
  'secondary_a',  // 二级甲等
  'secondary_b',  // 二级乙等
  'primary',      // 一级
  'other',        // 其他
])
export type HospitalLevel = z.infer<typeof hospitalLevelSchema>

/**
 * 医院类型
 */
export const hospitalTypeSchema = z.enum([
  'general',      // 综合医院
  'specialized',  // 专科医院
  'tcm',          // 中医院
  'maternal',     // 妇幼保健院
  'other',        // 其他
])
export type HospitalType = z.infer<typeof hospitalTypeSchema>

/**
 * 医院 Schema
 */
export const hospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),   // 简称
  level: hospitalLevelSchema,
  type: hospitalTypeSchema,
  
  // 地址信息
  location: locationSchema,
  
  // 联系方式
  phone: z.string().optional(),
  website: z.string().optional(),
  
  // 展示信息
  logo: z.string().optional(),
  images: z.array(z.string()).optional(),
  introduction: z.string().optional(),
  
  // 特色科室/擅长领域
  features: z.array(z.string()).optional(),
  
  // 统计
  orderCount: z.number().default(0),
  
  // 状态
  status: statusSchema,
  sort: z.number().default(0),
  isHot: z.boolean().default(false),
}).merge(timestampsSchema)

export type Hospital = z.infer<typeof hospitalSchema>

/**
 * 医院列表项（简化版）
 */
export const hospitalListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  level: hospitalLevelSchema,
  type: hospitalTypeSchema,
  address: z.string(),
  logo: z.string().optional(),
  distance: z.number().optional(), // 距离（米）
  orderCount: z.number(),
})
export type HospitalListItem = z.infer<typeof hospitalListItemSchema>

/**
 * 科室 Schema
 */
export const departmentSchema = z.object({
  id: z.string(),
  hospitalId: z.string(),
  name: z.string(),
  parentId: z.string().optional(),    // 父科室ID（用于科室分组）
  introduction: z.string().optional(),
  location: z.string().optional(),    // 科室位置（楼层）
  phone: z.string().optional(),
  status: statusSchema,
  sort: z.number().default(0),
}).merge(timestampsSchema)

export type Department = z.infer<typeof departmentSchema>

/**
 * 医生职称
 */
export const doctorTitleSchema = z.enum([
  'chief',         // 主任医师
  'associate',     // 副主任医师
  'attending',     // 主治医师
  'resident',      // 住院医师
])
export type DoctorTitle = z.infer<typeof doctorTitleSchema>

/**
 * 医生 Schema
 */
export const doctorSchema = z.object({
  id: z.string(),
  hospitalId: z.string(),
  hospitalName: z.string(),
  departmentId: z.string(),
  departmentName: z.string(),
  
  name: z.string(),
  title: doctorTitleSchema,
  avatar: z.string().optional(),
  introduction: z.string().optional(),
  specialties: z.array(z.string()).optional(), // 擅长领域
  
  // 联系方式（管理后台用）
  phone: z.string().optional(),
  email: z.string().optional(),
  
  // 统计
  consultCount: z.number().default(0),
  rating: z.number().default(100),
  
  status: statusSchema,
}).merge(timestampsSchema)

export type Doctor = z.infer<typeof doctorSchema>

/**
 * 医院查询参数
 */
export const hospitalQueryParamsSchema = z.object({
  keyword: z.string().optional(),
  level: hospitalLevelSchema.optional(),
  type: hospitalTypeSchema.optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})
export type HospitalQueryParams = z.infer<typeof hospitalQueryParamsSchema>

