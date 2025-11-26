import { createFileRoute } from '@tanstack/react-router'
import { OrderSettings } from '@/features/business/order-settings'

export const Route = createFileRoute('/_authenticated/order-settings/')({
  component: OrderSettings,
})

