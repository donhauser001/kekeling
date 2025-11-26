import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Orders } from '@/features/business/orders'

const searchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  orderNo: z.string().optional(),
  status: z.string().array().optional(),
  category: z.string().array().optional(),
})

export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: searchSchema,
  component: Orders,
})
