import { z } from 'zod'

const escortStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('pending'),
  z.literal('suspended'),
])
export type EscortStatus = z.infer<typeof escortStatusSchema>

const escortCategorySchema = z.union([
  z.literal('senior'),
  z.literal('intermediate'),
  z.literal('junior'),
  z.literal('trainee'),
])

const escortSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: escortStatusSchema,
  category: escortCategorySchema,
  consultCount: z.number(),
  satisfaction: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Escort = z.infer<typeof escortSchema>

export const escortListSchema = z.array(escortSchema)
