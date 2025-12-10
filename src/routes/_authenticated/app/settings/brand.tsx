import { createFileRoute } from '@tanstack/react-router'
import AppSettingsBrand from '@/features/app-settings/brand'

export const Route = createFileRoute('/_authenticated/app/settings/brand')({
  component: AppSettingsBrand,
})
