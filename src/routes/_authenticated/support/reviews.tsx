import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ReviewsManagement } from '@/features/reviews'

const reviewsSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
    status: z.string().optional().catch(''),
    rating: z.number().optional(),
    escortId: z.string().optional(),
    tab: z.enum(['list', 'ranking']).optional().catch('list'),
})

export const Route = createFileRoute('/_authenticated/support/reviews')({
    validateSearch: reviewsSearchSchema,
    component: ReviewsManagement,
})
