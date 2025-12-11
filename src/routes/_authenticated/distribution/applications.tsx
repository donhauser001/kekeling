import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { DistributionApplications } from '@/features/distribution/applications'

const applicationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  status: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/distribution/applications')({
  validateSearch: applicationsSearchSchema,
  component: DistributionApplications,
})
