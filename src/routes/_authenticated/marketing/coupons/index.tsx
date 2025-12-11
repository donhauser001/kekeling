import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Coupons } from '@/features/marketing/coupons'

const couponsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.string().optional().catch(''),
  type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/marketing/coupons/')({
  validateSearch: couponsSearchSchema,
  component: Coupons,
})

