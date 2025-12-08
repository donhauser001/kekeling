import { z } from 'zod'

// 医生状态
export const doctorStatusSchema = z.enum(['active', 'inactive'])
export type DoctorStatus = z.infer<typeof doctorStatusSchema>

// 职称
export const doctorTitleSchema = z.enum(['chief', 'associate_chief', 'attending', 'resident'])
export type DoctorTitle = z.infer<typeof doctorTitleSchema>

// 关联对象 schema
const hospitalRefSchema = z.object({
    id: z.string(),
    name: z.string(),
})

const departmentRefSchema = z.object({
    id: z.string(),
    name: z.string(),
    parent: z.object({
        id: z.string(),
        name: z.string(),
    }).optional().nullable(),
})

// 医生 schema - 与后端 Prisma 返回结构完全对齐
export const doctorSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    gender: z.string().nullable(),
    hospitalId: z.string(),
    departmentId: z.string(),
    title: z.string(), // chief, associate_chief, attending, resident
    level: z.string().nullable(),
    introduction: z.string().nullable(),
    specialties: z.array(z.string()), // ⚠️ 复数形式，与后端对齐
    education: z.string().nullable(),
    experience: z.string().nullable(),
    consultCount: z.number(),
    rating: z.number(), // ⚠️ rating 而不是 satisfaction，与后端对齐
    reviewCount: z.number(),
    phone: z.string().nullable(),
    status: doctorStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    // 关联对象
    hospital: hospitalRefSchema.optional(),
    department: departmentRefSchema.optional(),
})

export type Doctor = z.infer<typeof doctorSchema>
export const doctorListSchema = z.array(doctorSchema)
