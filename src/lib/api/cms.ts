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

// ============================================================================
// CMS 菜单管理
// ============================================================================

export type MenuType = 'link' | 'category' | 'page' | 'user_login' | 'escort_register' | 'escort_login' | 'escort_forgot_password' | 'escort_profile'

export interface CmsMenu {
  id: string
  name: string
  code: string
  type: MenuType
  url: string | null
  categoryId: string | null
  pageId: string | null
  target: '_self' | '_blank'
  icon: string | null
  parentId: string | null
  isHome: boolean
  hideInMain: boolean
  sort: number
  status: 'active' | 'inactive'
  parent?: { id: string; name: string } | null
  category?: { id: string; name: string; slug: string } | null
  page?: { id: string; title: string; slug: string } | null
  children?: CmsMenu[]
  childrenCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateMenuData {
  name: string
  code: string
  type?: MenuType
  url?: string
  categoryId?: string
  pageId?: string
  target?: '_self' | '_blank'
  icon?: string
  parentId?: string
  isHome?: boolean
  hideInMain?: boolean
  sort?: number
  status?: 'active' | 'inactive'
}

export interface UpdateMenuData extends Partial<CreateMenuData> { }

export interface MenuQuery {
  status?: string
  keyword?: string
  parentId?: string
  hideInMain?: boolean
  excludeHidden?: boolean
}

export const cmsMenuApi = {
  getTree: (position?: string) =>
    request<CmsMenu[]>('/cms/menus/tree', { params: position ? { position } : undefined }),

  getAll: (query?: MenuQuery) =>
    request<CmsMenu[]>('/cms/menus', { params: query }),

  getById: (id: string) =>
    request<CmsMenu>(`/cms/menus/${id}`),

  create: (data: CreateMenuData) =>
    request<CmsMenu>('/cms/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateMenuData) =>
    request<CmsMenu>(`/cms/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateSort: (items: { id: string; sort: number }[]) =>
    request<{ success: boolean }>('/cms/menus/sort', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),

  delete: (id: string) =>
    request<void>(`/cms/menus/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// CMS 网站设置
// ============================================================================

export interface CmsSetting {
  id: string
  key: string
  value: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'switch' | 'select' | 'color'
  group: 'general' | 'seo' | 'social' | 'contact' | 'appearance'
  options: string | null
  sort: number
  createdAt: string
  updatedAt: string
}

export interface CreateSettingData {
  key: string
  value: string
  label: string
  type?: 'text' | 'textarea' | 'image' | 'switch' | 'select' | 'color'
  group?: 'general' | 'seo' | 'social' | 'contact' | 'appearance'
  options?: string
  sort?: number
}

export interface UpdateSettingData extends Partial<Omit<CreateSettingData, 'key'>> { }

export interface SettingQuery {
  group?: string
  keyword?: string
}

export interface SettingGroup {
  value: string
  label: string
  description: string
}

export const cmsSettingApi = {
  getPublic: () =>
    request<Record<string, string>>('/cms/settings/public'),

  getGroups: () =>
    request<SettingGroup[]>('/cms/settings/groups'),

  getAll: (query?: SettingQuery) =>
    request<CmsSetting[]>('/cms/settings', { params: query }),

  getByGroup: (group: string) =>
    request<CmsSetting[]>(`/cms/settings/group/${group}`),

  getByKey: (key: string) =>
    request<CmsSetting>(`/cms/settings/key/${key}`),

  create: (data: CreateSettingData) =>
    request<CmsSetting>('/cms/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSettingData) =>
    request<CmsSetting>(`/cms/settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateByKey: (key: string, value: string) =>
    request<CmsSetting>(`/cms/settings/key/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  batchUpdate: (settings: { key: string; value: string }[]) =>
    request<{ success: boolean }>('/cms/settings/batch', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),

  delete: (id: string) =>
    request<void>(`/cms/settings/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// CMS 侧边栏
// ============================================================================

export type WidgetType = 'menu' | 'category' | 'html'
export type ApplyTargetType = 'page' | 'category' | 'article' | 'all'
export type SidebarWidthType = 'narrow' | 'medium' | 'wide' | 'custom'

export interface SidebarWidget {
  type: WidgetType
  title?: string
  showTitle?: boolean
  titleIcon?: string
  menuId?: string
  categoryId?: string
  limit?: number
  htmlContent?: string
  sort?: number
}

export interface ApplyTarget {
  type: ApplyTargetType
  id?: string
  name?: string
  categoryId?: string    // 用于 article 类型，筛选指定分类下的文章
  categoryName?: string  // 分类名称（展示用）
}

export interface CmsSidebar {
  id: string
  name: string
  code: string
  description: string | null
  position: 'left' | 'right'
  width: SidebarWidthType
  customWidth: number | null
  applyTo: ApplyTarget[]
  widgets: SidebarWidget[]
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateSidebarData {
  name: string
  code: string
  description?: string
  position?: 'left' | 'right'
  width?: SidebarWidthType
  customWidth?: number
  applyTo?: ApplyTarget[]
  widgets?: SidebarWidget[]
  sort?: number
  status?: 'active' | 'inactive'
}

export interface UpdateSidebarData extends Partial<CreateSidebarData> { }

export interface SidebarQuery {
  status?: string
  keyword?: string
}

export interface WidgetTypeInfo {
  value: WidgetType
  label: string
  description: string
}

export const cmsSidebarApi = {
  getWidgetTypes: () =>
    request<WidgetTypeInfo[]>('/cms/sidebars/widget-types'),

  renderByCode: (code: string) =>
    request<CmsSidebar>(`/cms/sidebars/render/${code}`),

  getAll: (query?: SidebarQuery) =>
    request<CmsSidebar[]>('/cms/sidebars', { params: query }),

  getById: (id: string) =>
    request<CmsSidebar>(`/cms/sidebars/${id}`),

  create: (data: CreateSidebarData) =>
    request<CmsSidebar>('/cms/sidebars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSidebarData) =>
    request<CmsSidebar>(`/cms/sidebars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/cms/sidebars/${id}`, {
      method: 'DELETE',
    }),
}
