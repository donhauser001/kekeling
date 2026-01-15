import { createFileRoute } from '@tanstack/react-router'
import { MarketingSettingsPage } from '@/features/marketing/settings'

export const Route = createFileRoute('/_authenticated/marketing/settings/')({
    component: MarketingSettingsPage,
})
