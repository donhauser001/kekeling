import { createFileRoute } from '@tanstack/react-router'
import { Withdrawals } from '@/features/withdrawals'

export const Route = createFileRoute('/_authenticated/withdrawals/')({
  component: Withdrawals,
})
