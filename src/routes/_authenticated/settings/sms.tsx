import { createFileRoute } from '@tanstack/react-router'
import { SettingsSms } from '@/features/settings/sms'

export const Route = createFileRoute('/_authenticated/settings/sms')({
  component: SettingsSms,
})
