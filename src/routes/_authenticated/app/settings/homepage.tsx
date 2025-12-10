import { createFileRoute } from '@tanstack/react-router'
import HomepageManagement from '@/features/app-settings/homepage'

export const Route = createFileRoute('/_authenticated/app/settings/homepage')({
  component: HomepageManagement,
})
