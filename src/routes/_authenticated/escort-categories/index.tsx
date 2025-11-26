import { createFileRoute } from '@tanstack/react-router'
import { EscortCategories } from '@/features/escort-categories'

export const Route = createFileRoute('/_authenticated/escort-categories/')({
  component: EscortCategories,
})
