/**
 * 网站前台 API 客户端
 * 与后台 CMS 系统对接
 */

const API_BASE = '/api'

// 后端API响应格式
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 通用请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()
  
  // 后端API返回格式为 { code, message, data }
  if (result.code !== 0) {
    throw new Error(result.message || 'API request failed')
  }
  
  return result.data
}

// ==================== 类型定义 ====================

/** 菜单类型 */
export type MenuType = 
  | 'link' 
  | 'category' 
  | 'page' 
  | 'user_login' 
  | 'escort_register' 
  | 'escort_login' 
  | 'escort_forgot_password' 
  | 'escort_profile'

/** 菜单项 */
export interface MenuItem {
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
  category?: { id: string; name: string; slug: string } | null
  page?: { id: string; title: string; slug: string } | null
  children?: MenuItem[]
}

/** 网站设置 */
export interface SiteSetting {
  id: string
  key: string
  value: string
  label: string
  type: string
  group: string
  options: string | null
}

/** 文章分类 */
export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  sort: number
  status: 'active' | 'inactive'
  _count?: { articles: number }
}

/** 文章 */
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  categoryId: string | null
  category?: ArticleCategory | null
  tags?: { id: string; name: string; slug: string }[]
  authorId: string | null
  viewCount: number
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** 页面 */
export interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  template: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** 侧边栏组件 */
export interface SidebarWidget {
  type: 'menu' | 'category' | 'html'
  showTitle?: boolean
  title?: string
  titleIcon?: string
  menuId?: string
  categoryId?: string
  limit?: number
  htmlContent?: string
  sort?: number
  // 渲染后的数据
  renderedMenu?: MenuItem[]
  renderedCategories?: ArticleCategory[]
}

/** 侧边栏 */
export interface Sidebar {
  id: string
  name: string
  code: string
  position: 'left' | 'right'
  width: 'narrow' | 'medium' | 'wide' | 'custom'
  customWidth: number | null
  title: string | null
  description: string | null
  applyTo: { type: string; id?: string; categoryId?: string }[]
  widgets: SidebarWidget[]
  sort: number
  status: 'active' | 'inactive'
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==================== API 方法 ====================

/** 菜单 API */
export const menuApi = {
  /** 获取所有菜单（不含隐藏的） */
  getAll: (excludeHidden = true) => 
    request<MenuItem[]>(`/cms/menus?status=active&excludeHidden=${excludeHidden}`),
  
  /** 获取菜单树（公开接口，已包含 category/page 关联数据） */
  getTree: (excludeHidden = true) => 
    request<MenuItem[]>(`/cms/menus/tree${excludeHidden ? '' : '?excludeHidden=false'}`),
  
  /** 获取首页菜单 */
  getHomepage: async () => {
    const menus = await request<MenuItem[]>('/cms/menus?status=active&isHome=true')
    return menus.find(m => m.isHome) || null
  },
}

/** 网站设置（键值对格式） */
export type SiteSettings = Record<string, string>

/** 网站设置 API */
export const settingApi = {
  /** 获取所有设置（公开接口，返回键值对格式） */
  getPublic: () => request<SiteSettings>('/cms/settings/public'),
  
  /** 获取所有设置（管理后台用，返回数组格式） */
  getAll: () => request<SiteSetting[]>('/cms/settings'),
  
  /** 获取设置值 */
  getValue: async (key: string): Promise<string | null> => {
    const settings = await settingApi.getPublic()
    return settings[key] || null
  },
  
  /** 批量获取设置 */
  getValues: async (keys: string[]): Promise<Record<string, string>> => {
    const settings = await settingApi.getPublic()
    const result: Record<string, string> = {}
    for (const key of keys) {
      if (settings[key]) {
        result[key] = settings[key]
      }
    }
    return result
  },
}

/** 文章分类 API */
export const categoryApi = {
  /** 获取所有分类 */
  getAll: () => 
    request<ArticleCategory[]>('/cms/article-categories?status=active'),
  
  /** 根据 slug 获取分类 */
  getBySlug: (slug: string) => 
    request<ArticleCategory>(`/cms/article-categories/slug/${slug}`),
}

/** 文章 API */
export const articleApi = {
  /** 获取文章列表 */
  getList: (params?: {
    page?: number
    pageSize?: number
    categoryId?: string
    keyword?: string
  }) => {
    const query = new URLSearchParams()
    query.set('status', 'published')
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    if (params?.categoryId) query.set('categoryId', params.categoryId)
    if (params?.keyword) query.set('keyword', params.keyword)
    return request<PaginatedResponse<Article>>(`/cms/articles?${query}`)
  },
  
  /** 获取文章详情 */
  getById: (id: string) => 
    request<Article>(`/cms/articles/${id}`),
  
  /** 根据 slug 获取文章 */
  getBySlug: (slug: string) => 
    request<Article>(`/cms/articles/slug/${slug}`),
  
  /** 获取最新文章 */
  getLatest: (limit = 5) => 
    request<Article[]>(`/cms/articles?status=published&pageSize=${limit}&sort=publishedAt:desc`),
  
  /** 获取热门文章 */
  getPopular: (limit = 5) => 
    request<Article[]>(`/cms/articles?status=published&pageSize=${limit}&sort=viewCount:desc`),
}

/** 页面 API */
export const pageApi = {
  /** 获取所有已发布页面（公开接口） */
  getAll: () => 
    request<Page[]>('/cms/pages/public'),
  
  /** 获取页面详情（管理接口） */
  getById: (id: string) => 
    request<Page>(`/cms/pages/${id}`),
  
  /** 根据 slug 获取已发布页面（公开接口） */
  getBySlug: (slug: string) => 
    request<Page>(`/cms/pages/public/${slug}`),
}

/** 侧边栏 API */
export const sidebarApi = {
  /** 获取所有侧边栏 */
  getAll: () => 
    request<Sidebar[]>('/cms/sidebars?status=active'),
  
  /** 根据应用目标获取侧边栏 */
  getForTarget: async (targetType: string, targetId?: string): Promise<Sidebar[]> => {
    const sidebars = await sidebarApi.getAll()
    
    // 过滤匹配的侧边栏
    return sidebars.filter(sidebar => {
      return sidebar.applyTo.some(target => {
        if (target.type === 'all') return true
        if (target.type === targetType) {
          if (targetType === 'page' && target.id === targetId) return true
          if (targetType === 'category' && target.categoryId === targetId) return true
          if (targetType === 'article' && (!target.categoryId || target.categoryId === targetId)) return true
        }
        return false
      })
    }).sort((a, b) => a.sort - b.sort)
  },
}

// ==================== 辅助函数 ====================

/** 根据菜单类型生成链接 */
export function getMenuLink(menu: MenuItem): string {
  // 如果是首页，直接返回根路径
  if (menu.isHome) {
    return '/'
  }
  
  switch (menu.type) {
    case 'link':
      return menu.url || '#'
    case 'category':
      return menu.category ? `/category/${menu.category.slug}` : '#'
    case 'page':
      return menu.page ? `/page/${menu.page.slug}` : '#'
    case 'user_login':
      return '/login'
    case 'escort_register':
      return '/escort/register'
    case 'escort_login':
      return '/escort/login'
    case 'escort_forgot_password':
      return '/escort/forgot-password'
    case 'escort_profile':
      return '/escort/profile'
    default:
      return '#'
  }
}

/** 构建菜单树 */
export function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const menuMap = new Map<string, MenuItem>()
  const roots: MenuItem[] = []

  // 首先创建所有菜单的映射
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  // 然后构建树结构
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.id)!
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!
      parent.children = parent.children || []
      parent.children.push(menuItem)
    } else {
      roots.push(menuItem)
    }
  })

  // 按 sort 排序
  const sortMenus = (items: MenuItem[]) => {
    items.sort((a, b) => a.sort - b.sort)
    items.forEach(item => {
      if (item.children?.length) {
        sortMenus(item.children)
      }
    })
  }
  sortMenus(roots)

  return roots
}

