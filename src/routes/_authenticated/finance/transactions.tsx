import { createFileRoute } from '@tanstack/react-router'
import { FinanceTransactions } from '@/features/finance/transactions'

export const Route = createFileRoute('/_authenticated/finance/transactions')({
  component: FinanceTransactions,
})

