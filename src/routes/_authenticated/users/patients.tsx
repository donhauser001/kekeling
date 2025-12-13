import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Patients } from '@/features/users/patients'

const patientsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''),
  userId: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/patients')({
  validateSearch: patientsSearchSchema,
  component: Patients,
})
