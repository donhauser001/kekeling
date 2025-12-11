import { createFileRoute } from '@tanstack/react-router'
import { OperationGuides } from '@/features/business/operation-guides'

export const Route = createFileRoute('/_authenticated/operation-guides/')({
  component: OperationGuides,
})
