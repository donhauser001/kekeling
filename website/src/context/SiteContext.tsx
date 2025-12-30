/**
 * 网站全局上下文
 * 提供菜单、设置等全局数据
 */

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useSiteData, type MenuItem, type SiteSettings, type ArticleCategory, type ThemeSettings } from '@/hooks/useApi'

// 预设主色调的调色板（RGB 格式，支持透明度）
const COLOR_PALETTES: Record<string, Record<string, string>> = {
  '#f97316': { // 橙色
    50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116', 400: '251 146 60',
    500: '249 115 22', 600: '234 88 12', 700: '194 65 12', 800: '154 52 18', 900: '124 45 18', 950: '67 20 7',
  },
  '#3b82f6': { // 蓝色
    50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250',
    500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138', 950: '23 37 84',
  },
  '#22c55e': { // 绿色
    50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172', 400: '74 222 128',
    500: '34 197 94', 600: '22 163 74', 700: '21 128 61', 800: '22 101 52', 900: '20 83 45', 950: '5 46 22',
  },
  '#8b5cf6': { // 紫色
    50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253', 400: '167 139 250',
    500: '139 92 246', 600: '124 58 237', 700: '109 40 217', 800: '91 33 182', 900: '76 29 149', 950: '46 16 101',
  },
  '#f43f5e': { // 玫瑰红
    50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175', 400: '251 113 133',
    500: '244 63 94', 600: '225 29 72', 700: '190 18 60', 800: '159 18 57', 900: '136 19 55', 950: '76 5 25',
  },
  '#06b6d4': { // 青碧
    50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249', 400: '34 211 238',
    500: '6 182 212', 600: '8 145 178', 700: '14 116 144', 800: '21 94 117', 900: '22 78 99', 950: '8 51 68',
  },
  '#71717a': { // 石墨灰
    50: '250 250 250', 100: '244 244 245', 200: '228 228 231', 300: '212 212 216', 400: '161 161 170',
    500: '113 113 122', 600: '82 82 91', 700: '63 63 70', 800: '39 39 42', 900: '24 24 27', 950: '9 9 11',
  },
}

/** 应用主色调到 CSS 变量 */
function applyPrimaryColor(color: string) {
  const palette = COLOR_PALETTES[color.toLowerCase()]
  if (!palette) return
  
  const root = document.documentElement
  Object.entries(palette).forEach(([level, value]) => {
    root.style.setProperty(`--primary-${level}`, value)
  })
}

interface SiteContextValue {
  /** 导航菜单树 */
  menus: MenuItem[]
  /** 网站设置（键值对格式） */
  settings: SiteSettings
  /** 主题设置 */
  themeSettings: ThemeSettings | null
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
  const { menus, settings, categories, themeSettings, loading, error } = useSiteData()

  const getSetting = (key: string, defaultValue = ''): string => {
    // settings 现在是键值对格式
    if (!settings || typeof settings !== 'object') {
      return defaultValue
    }
    return settings[key] || defaultValue
  }

  // 监听主色调设置变化，动态应用到 CSS 变量
  useEffect(() => {
    const primaryColor = themeSettings?.primaryColor
    if (primaryColor) {
      applyPrimaryColor(primaryColor)
    }
  }, [themeSettings])

  return (
    <SiteContext.Provider
      value={{
        menus,
        settings,
        themeSettings,
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

