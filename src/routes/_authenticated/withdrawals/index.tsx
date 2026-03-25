import { createFileRoute } from '@tanstack/react-router'
import { EscortWithdrawRecords } from '@/features/escort-withdraw-records'

export const Route = createFileRoute('/_authenticated/withdrawals/')({
  component: EscortWithdrawRecords,
})
