/**
 * 数据获取 Hooks
 */

import { useState, useEffect, useCallback } from 'react'
import {
  menuApi,
  settingApi,
  categoryApi,
  articleApi,
  pageApi,
  sidebarApi,
  type MenuItem,
  type SiteSetting,
  type SiteSettings,
  type ArticleCategory,
  type Article,
  type Page,
  type Sidebar,
  type PaginatedResponse,
} from '@/lib/api'

// ==================== 通用 Hook ====================

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      console.warn('API Error:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      // 不设置 data 为 null，保留上次的数据
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// ==================== 菜单 Hooks ====================

/** 获取导航菜单（树形结构，直接从后端获取已构建好的树） */
export function useMenuTree() {
  return useAsync(() => menuApi.getTree(true), [])
}

/** 获取所有菜单 */
export function useMenus(excludeHidden = true) {
  return useAsync(() => menuApi.getAll(excludeHidden), [excludeHidden])
}

/** 获取首页菜单 */
export function useHomepageMenu() {
  return useAsync(() => menuApi.getHomepage(), [])
}

// ==================== 设置 Hooks ====================

/** 获取所有网站设置（公开接口，键值对格式） */
export function useSiteSettings() {
  return useAsync(() => settingApi.getPublic(), [])
}

/** 获取单个设置值 */
export function useSiteSetting(key: string) {
  return useAsync(() => settingApi.getValue(key), [key])
}

/** 批量获取设置值 */
export function useSiteSettingValues(keys: string[]) {
  return useAsync(() => settingApi.getValues(keys), [keys.join(',')])
}

// ==================== 分类 Hooks ====================

/** 获取所有文章分类 */
export function useCategories() {
  return useAsync(() => categoryApi.getAll(), [])
}

/** 根据 slug 获取分类 */
export function useCategoryBySlug(slug: string) {
  return useAsync(() => categoryApi.getBySlug(slug), [slug])
}

// ==================== 文章 Hooks ====================

interface UseArticlesParams {
  page?: number
  pageSize?: number
  categoryId?: string
  keyword?: string
}

/** 获取文章列表 */
export function useArticles(params?: UseArticlesParams) {
  const depsKey = JSON.stringify(params || {})
  return useAsync(() => articleApi.getList(params), [depsKey])
}

/** 获取文章详情 */
export function useArticle(id: string) {
  return useAsync(() => articleApi.getById(id), [id])
}

/** 根据 slug 获取文章 */
export function useArticleBySlug(slug: string) {
  return useAsync(() => articleApi.getBySlug(slug), [slug])
}

/** 获取最新文章 */
export function useLatestArticles(limit = 5) {
  return useAsync(() => articleApi.getLatest(limit), [limit])
}

/** 获取热门文章 */
export function usePopularArticles(limit = 5) {
  return useAsync(() => articleApi.getPopular(limit), [limit])
}

// ==================== 页面 Hooks ====================

/** 获取所有页面 */
export function usePages() {
  return useAsync(() => pageApi.getAll(), [])
}

/** 获取页面详情 */
export function usePage(id: string) {
  return useAsync(() => pageApi.getById(id), [id])
}

/** 根据 slug 获取页面 */
export function usePageBySlug(slug: string) {
  return useAsync(() => pageApi.getBySlug(slug), [slug])
}

// ==================== 侧边栏 Hooks ====================

/** 获取所有侧边栏 */
export function useSidebars() {
  return useAsync(() => sidebarApi.getAll(), [])
}

/** 获取指定目标的侧边栏 */
export function useSidebarsForTarget(targetType: string, targetId?: string) {
  return useAsync(
    () => sidebarApi.getForTarget(targetType, targetId),
    [targetType, targetId || '']
  )
}

// ==================== 组合 Hooks ====================

/** 获取网站全局数据（菜单、设置等） */
export function useSiteData() {
  const menus = useMenuTree()
  const settings = useSiteSettings()
  const categories = useCategories()

  return {
    // 菜单和分类确保返回数组
    menus: Array.isArray(menus.data) ? menus.data : [],
    // 设置返回键值对格式
    settings: settings.data && typeof settings.data === 'object' ? settings.data : {},
    categories: Array.isArray(categories.data) ? categories.data : [],
    loading: menus.loading || settings.loading || categories.loading,
    error: menus.error || settings.error || categories.error,
  }
}

// ==================== 导出类型 ====================

export type {
  MenuItem,
  SiteSetting,
  SiteSettings,
  ArticleCategory,
  Article,
  Page,
  Sidebar,
  PaginatedResponse,
}

