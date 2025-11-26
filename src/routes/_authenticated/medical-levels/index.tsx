import { createFileRoute } from '@tanstack/react-router'
import { MedicalLevels } from '@/features/medical/levels'

export const Route = createFileRoute('/_authenticated/medical-levels/')({
  component: MedicalLevels,
})

