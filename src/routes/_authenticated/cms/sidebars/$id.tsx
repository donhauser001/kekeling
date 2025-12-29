import { createFileRoute } from '@tanstack/react-router'
import { SidebarEdit } from '@/features/cms/sidebars/sidebar-edit'

export const Route = createFileRoute('/_authenticated/cms/sidebars/$id')({
  component: SidebarEditPage,
})

function SidebarEditPage() {
  const { id } = Route.useParams()
  return <SidebarEdit id={id} />
}

