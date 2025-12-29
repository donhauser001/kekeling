/**
 * 网站全局上下文
 * 提供菜单、设置等全局数据
 */

import { createContext, useContext, ReactNode } from 'react'
import { useSiteData, type MenuItem, type SiteSettings, type ArticleCategory } from '@/hooks/useApi'

interface SiteContextValue {
  /** 导航菜单树 */
  menus: MenuItem[]
  /** 网站设置（键值对格式） */
  settings: SiteSettings
  /** 文章分类 */
  categories: ArticleCategory[]
  /** 是否加载中 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 获取设置值 */
  getSetting: (key: string, defaultValue?: string) => string
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const { menus, settings, categories, loading, error } = useSiteData()

  const getSetting = (key: string, defaultValue = ''): string => {
    // settings 现在是键值对格式
    if (!settings || typeof settings !== 'object') {
      return defaultValue
    }
    return settings[key] || defaultValue
  }

  return (
    <SiteContext.Provider
      value={{
        menus,
        settings,
        categories,
        loading,
        error,
        getSetting,
      }}
    >
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}

/** 获取网站设置的便捷 hook */
export function useSiteSetting(key: string, defaultValue = '') {
  const { getSetting } = useSite()
  return getSetting(key, defaultValue)
}

