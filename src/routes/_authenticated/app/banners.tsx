import { createFileRoute } from '@tanstack/react-router'
import BannersManagement from '@/features/app-settings/banners'

export const Route = createFileRoute('/_authenticated/app/banners')({
  component: BannersManagement,
})
