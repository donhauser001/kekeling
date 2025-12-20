import { createFileRoute } from '@tanstack/react-router'
import { FinanceSettlements } from '@/features/finance/settlements'

export const Route = createFileRoute('/_authenticated/finance/settlements')({
  component: FinanceSettlements,
})

