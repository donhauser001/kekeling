import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Campaigns } from '@/features/marketing/campaigns'

const campaignsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.string().optional().catch(''),
  type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/marketing/campaigns/')({
  validateSearch: campaignsSearchSchema,
  component: Campaigns,
})

