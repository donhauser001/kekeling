import { createFileRoute } from '@tanstack/react-router'
import { ArticleTags } from '@/features/cms/article-tags'

export const Route = createFileRoute('/_authenticated/cms/article-tags/')({
  component: ArticleTags,
})
