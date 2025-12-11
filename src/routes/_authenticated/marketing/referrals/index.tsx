import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Referrals } from '@/features/marketing/referrals'

const referralsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.string().optional().catch(''),
  status: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/marketing/referrals/')({
  validateSearch: referralsSearchSchema,
  component: Referrals,
})

