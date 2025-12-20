import { createFileRoute } from '@tanstack/react-router'
import { FinanceInvoices } from '@/features/finance/invoices'

export const Route = createFileRoute('/_authenticated/finance/invoices')({
  component: FinanceInvoices,
})

