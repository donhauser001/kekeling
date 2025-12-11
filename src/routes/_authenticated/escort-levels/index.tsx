import { createFileRoute } from '@tanstack/react-router'
import { EscortLevels } from '@/features/escort-levels'

export const Route = createFileRoute('/_authenticated/escort-levels/')({
  component: EscortLevels,
})
