import { createFileRoute } from '@tanstack/react-router'
import { ArticleEdit } from '@/features/cms/articles/edit'

export const Route = createFileRoute('/_authenticated/cms/articles/$id')({
  component: ArticleEdit,
})

