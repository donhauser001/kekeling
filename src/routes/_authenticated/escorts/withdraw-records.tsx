import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { EscortWithdrawRecords } from '@/features/escort-withdraw-records'

const withdrawRecordsSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  status: z.string().optional(),
  method: z.string().optional(),
  keyword: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/escorts/withdraw-records')({
  validateSearch: withdrawRecordsSearchSchema,
  component: EscortWithdrawRecords,
})

