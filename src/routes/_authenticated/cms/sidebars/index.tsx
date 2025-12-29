import { createFileRoute } from '@tanstack/react-router'
import { CmsSidebars } from '@/features/cms/sidebars'

export const Route = createFileRoute('/_authenticated/cms/sidebars/')({
  component: CmsSidebars,
})

