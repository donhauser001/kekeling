import { createFileRoute } from '@tanstack/react-router'
import { Tags } from '@/features/tags'

export const Route = createFileRoute('/_authenticated/tags/')({
    component: Tags,
})


export const Route = createFileRoute('/_authenticated/tags/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/tags/"!</div>
}
