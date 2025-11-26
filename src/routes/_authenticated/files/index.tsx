import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Files } from '@/features/files'

const filesSearchSchema = z.object({
    type: z
        .enum([
            'all',
            'starred',
            'shared',
            'document',
            'image',
            'video',
            'audio',
            'archive',
            'code',
            'spreadsheet',
            'presentation',
            'other',
        ])
        .optional()
        .catch(undefined),
    filter: z.string().optional().catch(''),
    sort: z.enum(['name', 'name-desc', 'size', 'date']).optional().catch(undefined),
    view: z.enum(['grid', 'list']).optional().catch(undefined),
    folder: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/files/')({
    validateSearch: filesSearchSchema,
    component: Files,
})

