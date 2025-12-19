import { createFileRoute } from '@tanstack/react-router'
import { EscortApplications } from '@/features/escort-applications'

export const Route = createFileRoute('/_authenticated/escorts/applications')({
  component: EscortApplications,
})
