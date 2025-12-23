import { createFileRoute } from '@tanstack/react-router'
import { DistributionTree } from '@/features/distribution/tree'

export const Route = createFileRoute('/_authenticated/distribution/tree')({
  component: DistributionTree,
})

