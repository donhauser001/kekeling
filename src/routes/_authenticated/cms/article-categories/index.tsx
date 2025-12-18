import { createFileRoute } from '@tanstack/react-router'
import { ArticleCategories } from '@/features/cms/article-categories'

export const Route = createFileRoute('/_authenticated/cms/article-categories/')({
  component: ArticleCategories,
})
