import { createFileRoute } from '@tanstack/react-router'
import { ServiceGuarantees } from '@/features/business/service-guarantees'

export const Route = createFileRoute('/_authenticated/service-guarantees/')({
  component: ServiceGuarantees,
})
