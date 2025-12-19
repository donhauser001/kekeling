/**
 * CMS 内容管理 API（页面、文章分类、文章）
 */

import { request } from './request'

// ============================================================================
// CMS 页面
// ============================================================================

export interface CmsPage {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  seoTitle: string | null
  seoDesc: string | null
  seoKeywords: string | null
  sort: number
  status: 'draft' | 'published'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCmsPageData {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  seoTitle?: string
  seoDesc?: string
  seoKeywords?: string
  sort?: number
  status?: 'draft' | 'published'
}

export interface UpdateCmsPageData extends Partial<CreateCmsPageData> { }

export interface CmsPageQuery {
  status?: string
  keyword?: string
}

export const cmsPageApi = {
  getAll: (query?: CmsPageQuery) =>
    request<CmsPage[]>('/cms/pages', { params: query }),

  getById: (id: string) => request<CmsPage>(`/cms/pages/${id}`),

  create: (data: CreateCmsPageData) =>
    request<CmsPage>('/cms/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCmsPageData) =>
    request<CmsPage>(`/cms/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/cms/pages/${id}`, {
      method: 'DELETE',
    }),

  publish: (id: string) =>
    request<CmsPage>(`/cms/pages/${id}/publish`, {
      method: 'POST',
    }),

  unpublish: (id: string) =>
    request<CmsPage>(`/cms/pages/${id}/unpublish`, {
      method: 'POST',
    }),

  getPublished: () =>
    request<Pick<CmsPage, 'id' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'publishedAt'>[]>('/cms/pages/public'),

  getBySlug: (slug: string) =>
    request<CmsPage>(`/cms/pages/public/${slug}`),
}

// ============================================================================
// 文章分类
// ============================================================================

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  coverImage: string | null
  sort: number
  status: 'active' | 'inactive'
  isSystem?: boolean
  articleCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateArticleCategoryData {
  name: string
  slug: string
  description?: string
  icon?: string
  coverImage?: string
  sort?: number
  status?: 'active' | 'inactive'
}

export interface UpdateArticleCategoryData extends Partial<CreateArticleCategoryData> { }

export const articleCategoryApi = {
  getActive: () =>
    request<ArticleCategory[]>('/cms/article-categories/active'),

  getAll: (query?: { status?: string; keyword?: string }) =>
    request<ArticleCategory[]>('/cms/article-categories', { params: query }),

  getById: (id: string) =>
    request<ArticleCategory>(`/cms/article-categories/${id}`),

  create: (data: CreateArticleCategoryData) =>
    request<ArticleCategory>('/cms/article-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateArticleCategoryData) =>
    request<ArticleCategory>(`/cms/article-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/cms/article-categories/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// 文章
// ============================================================================

export interface Article {
  id: string
  categoryId: string | null
  title: string
  slug: string
  summary: string | null
  content: string
  coverImage: string | null
  author: string | null
  source: string | null
  tags: string[]
  viewCount: number
  isTop: boolean
  isHot: boolean
  seoTitle: string | null
  seoDesc: string | null
  seoKeywords: string | null
  sort: number
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

export interface CreateArticleData {
  categoryId?: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImage?: string
  author?: string
  source?: string
  tags?: string[]
  isTop?: boolean
  isHot?: boolean
  seoTitle?: string
  seoDesc?: string
  seoKeywords?: string
  sort?: number
  status?: 'draft' | 'published' | 'archived'
}

export interface UpdateArticleData extends Partial<CreateArticleData> { }

export interface ArticleQuery {
  categoryId?: string
  categorySlug?: string
  status?: string
  isTop?: boolean
  isHot?: boolean
  keyword?: string
  page?: number
  pageSize?: number
}

export const articleApi = {
  getList: (query: ArticleQuery = {}) =>
    request<{
      list: Article[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/cms/articles', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) =>
    request<Article>(`/cms/articles/${id}`),

  create: (data: CreateArticleData) =>
    request<Article>('/cms/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateArticleData) =>
    request<Article>(`/cms/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/cms/articles/${id}`, {
      method: 'DELETE',
    }),

  publish: (id: string) =>
    request<Article>(`/cms/articles/${id}/publish`, {
      method: 'POST',
    }),

  unpublish: (id: string) =>
    request<Article>(`/cms/articles/${id}/unpublish`, {
      method: 'POST',
    }),

  toggleTop: (id: string) =>
    request<Article>(`/cms/articles/${id}/toggle-top`, {
      method: 'POST',
    }),

  getPublished: (query: ArticleQuery = {}) =>
    request<{
      list: Pick<Article, 'id' | 'title' | 'slug' | 'summary' | 'coverImage' | 'author' | 'tags' | 'viewCount' | 'isTop' | 'isHot' | 'publishedAt' | 'category'>[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }>('/cms/articles/public', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getBySlug: (slug: string) =>
    request<Article>(`/cms/articles/public/${slug}`),
}
