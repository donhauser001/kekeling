import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Points } from '@/features/marketing/points'

const pointsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/marketing/points/')({
  validateSearch: pointsSearchSchema,
  component: Points,
})

