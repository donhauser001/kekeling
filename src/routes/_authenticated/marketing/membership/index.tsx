import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Membership } from '@/features/marketing/membership'

const membershipSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/marketing/membership/')({
  validateSearch: membershipSearchSchema,
  component: Membership,
})

