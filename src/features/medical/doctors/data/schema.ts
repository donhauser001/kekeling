import { z } from 'zod'

export const doctorStatusSchema = z.enum(['active', 'inactive'])

export type DoctorStatus = z.infer<typeof doctorStatusSchema>

export const doctorSchema = z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    department: z.string(),
    hospital: z.string(),
    specialty: z.array(z.string()),
    phone: z.string(),
    email: z.string(),
    introduction: z.string(),
    avatar: z.string().optional(),
    level: z.string(),
    status: doctorStatusSchema,
    consultCount: z.number(),
    satisfaction: z.number(),
})

export type Doctor = z.infer<typeof doctorSchema>

