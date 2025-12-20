import { createFileRoute } from '@tanstack/react-router'
import { FinanceBills } from '@/features/finance/bills'

export const Route = createFileRoute('/_authenticated/finance/bills')({
  component: FinanceBills,
})

