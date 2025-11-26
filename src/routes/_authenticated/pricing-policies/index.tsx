import { createFileRoute } from '@tanstack/react-router'
import { PricingPolicies } from '@/features/business/pricing-policies'

export const Route = createFileRoute('/_authenticated/pricing-policies/')({
  component: PricingPolicies,
})
