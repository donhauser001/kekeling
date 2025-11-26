import { createFileRoute } from '@tanstack/react-router'
import { Doctors } from '@/features/medical/doctors'

export const Route = createFileRoute('/_authenticated/doctors/')({
  component: Doctors,
})

