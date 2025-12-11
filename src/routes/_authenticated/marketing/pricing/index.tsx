import { createFileRoute } from '@tanstack/react-router'
import { PricingConfig } from '@/features/marketing/pricing'

export const Route = createFileRoute('/_authenticated/marketing/pricing/')({
  component: PricingConfig,
})

