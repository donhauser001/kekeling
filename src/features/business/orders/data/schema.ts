import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  escortName: z.string().nullable(),
  escortPhone: z.string().nullable(),
  hospital: z.string(),
  department: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  status: orderStatusSchema,
  amount: z.number(),
  paidAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  remark: z.string(),
})

export type Order = z.infer<typeof orderSchema>

