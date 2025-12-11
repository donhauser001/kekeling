import { createFileRoute } from '@tanstack/react-router'
import { EscortDetail } from '@/features/escorts/detail'

export const Route = createFileRoute('/_authenticated/escorts/$escortId')({
  component: EscortDetail,
})
