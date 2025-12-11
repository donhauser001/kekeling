import { createFileRoute } from '@tanstack/react-router'
import { ServiceEdit } from '@/features/business/services/edit'

export const Route = createFileRoute('/_authenticated/services/$id')({
    component: ServiceEdit,
})
