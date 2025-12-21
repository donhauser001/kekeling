import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { FeedbackManagement } from '@/features/feedback'

const feedbackSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.string().optional().catch(''),
  type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/support/feedback')({
  validateSearch: feedbackSearchSchema,
  component: FeedbackManagement,
})

