import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Doctors } from '@/features/medical/doctors'

const searchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  name: z.string().optional(),
  status: z.string().array().optional(),
  title: z.string().array().optional(),
})

export const Route = createFileRoute('/_authenticated/doctors/')({
  validateSearch: searchSchema,
  component: Doctors,
})
