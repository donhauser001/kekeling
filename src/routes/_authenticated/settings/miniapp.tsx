import { createFileRoute } from '@tanstack/react-router'
import { SettingsMiniapp } from '@/features/settings/miniapp'

export const Route = createFileRoute('/_authenticated/settings/miniapp')({
  component: SettingsMiniapp,
})
