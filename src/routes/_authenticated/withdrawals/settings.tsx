import { createFileRoute } from '@tanstack/react-router'
import SettlementPage from '@/features/settings/settlement'

export const Route = createFileRoute('/_authenticated/withdrawals/settings')({
  component: SettlementPage,
})

