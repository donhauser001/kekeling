import { createFileRoute } from '@tanstack/react-router'
import { CmsPages } from '@/features/cms/pages'

export const Route = createFileRoute('/_authenticated/cms/pages/')({
  component: CmsPages,
})
