import { createFileRoute } from '@tanstack/react-router'
import { ServiceCategories } from '@/features/business/service-categories'

export const Route = createFileRoute('/_authenticated/service-categories/')({
  component: ServiceCategories,
})
