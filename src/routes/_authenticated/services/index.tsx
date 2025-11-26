import { createFileRoute } from '@tanstack/react-router'
import { Services } from '@/features/business/services'

export const Route = createFileRoute('/_authenticated/services/')({
  component: Services,
})

