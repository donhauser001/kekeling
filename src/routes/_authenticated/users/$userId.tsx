import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@/features/users/detail'

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetail,
})
