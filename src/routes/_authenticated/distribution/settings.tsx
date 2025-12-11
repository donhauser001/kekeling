import { createFileRoute } from '@tanstack/react-router'
import { DistributionSettings } from '@/features/distribution/settings'

export const Route = createFileRoute('/_authenticated/distribution/settings')({
  component: DistributionSettings,
})
