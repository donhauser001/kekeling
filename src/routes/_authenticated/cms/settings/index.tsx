import { createFileRoute } from '@tanstack/react-router'
import { CmsSettings } from '@/features/cms/settings'

export const Route = createFileRoute('/_authenticated/cms/settings/')({
    component: CmsSettings,
})

