import { createFileRoute } from '@tanstack/react-router'
import { HotKeywords } from '@/features/business/hot-keywords'

export const Route = createFileRoute('/_authenticated/app/hot-keywords')({
  component: HotKeywords,
})

