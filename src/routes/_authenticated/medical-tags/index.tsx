import { createFileRoute } from '@tanstack/react-router'
import { MedicalTags } from '@/features/medical/tags'

export const Route = createFileRoute('/_authenticated/medical-tags/')({
  component: MedicalTags,
})

