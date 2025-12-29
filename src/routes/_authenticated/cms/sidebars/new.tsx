import { createFileRoute } from '@tanstack/react-router'
import { SidebarEdit } from '@/features/cms/sidebars/sidebar-edit'

export const Route = createFileRoute('/_authenticated/cms/sidebars/new')({
  component: () => <SidebarEdit id='new' />,
})

