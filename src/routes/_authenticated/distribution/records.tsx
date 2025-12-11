import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { DistributionRecords } from '@/features/distribution/records'

const recordsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  type: z.string().optional().catch(''),
  status: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/distribution/records')({
  validateSearch: recordsSearchSchema,
  component: DistributionRecords,
})
