import { createFileRoute } from '@tanstack/react-router'
import { PageEdit } from '@/features/cms/pages/edit'

export const Route = createFileRoute('/_authenticated/cms/pages/$id')({
  component: PageEdit,
})

