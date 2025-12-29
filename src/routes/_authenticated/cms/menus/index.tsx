import { createFileRoute } from '@tanstack/react-router'
import { CmsMenus } from '@/features/cms/menus'

export const Route = createFileRoute('/_authenticated/cms/menus/')({
    component: CmsMenus,
})

