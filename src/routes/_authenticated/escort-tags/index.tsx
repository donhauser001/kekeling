import { createFileRoute } from '@tanstack/react-router'
import { EscortTags } from '@/features/escort-tags'

export const Route = createFileRoute('/_authenticated/escort-tags/')({
  component: EscortTags,
})

