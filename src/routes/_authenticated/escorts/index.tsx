import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Escorts } from '@/features/escorts'

const escortSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  username: z.string().optional(),
  status: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/escorts/')({
  validateSearch: escortSearchSchema,
  component: Escorts,
})

