import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { configApi } from '../services/api'

export interface ThemeSettings {
  primaryColor: string
  primaryColorLight: string
  brandName: string
  brandSlogan: string
}

// 默认主题色
const DEFAULT_PRIMARY_COLOR = '#1890ff'

// 全局主题色缓存
let cachedPrimaryColor = DEFAULT_PRIMARY_COLOR

// 根据主色生成浅色
function getLightColor(color: string): string {
  return `${color}15`
}

// 获取缓存的主题色（同步方法，用于 Icon 等需要立即获取颜色的场景）
export function getPrimaryColor(): string {
  return cachedPrimaryColor
}

// 主题色 Hook
export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: cachedPrimaryColor,
    primaryColorLight: getLightColor(cachedPrimaryColor),
    brandName: '科科灵',
    brandSlogan: '让就医不再孤单',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const data = await configApi.getThemeSettings()
        if (data?.primaryColor) {
          cachedPrimaryColor = data.primaryColor
          setTheme({
            primaryColor: data.primaryColor,
            primaryColorLight: getLightColor(data.primaryColor),
            brandName: data.brandName || '科科灵',
            brandSlogan: data.brandSlogan || '让就医不再孤单',
          })
          
          // 同步更新页面的 CSS 变量
          const page = Taro.getCurrentInstance()?.page
          if (page) {
            const pageElement = document.querySelector('.taro_page') as HTMLElement
            if (pageElement) {
              pageElement.style.setProperty('--primary-color', data.primaryColor)
              pageElement.style.setProperty('--primary-color-light', getLightColor(data.primaryColor))
            }
          }
        }
      } catch (err) {
        console.error('加载主题设置失败:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTheme()
  }, [])

  return { theme, loading }
}

// 初始化主题色（在 App 启动时调用）
export async function initTheme(): Promise<string> {
  try {
    const data = await configApi.getThemeSettings()
    if (data?.primaryColor) {
      cachedPrimaryColor = data.primaryColor
      return data.primaryColor
    }
  } catch (err) {
    console.error('初始化主题失败:', err)
  }
  return DEFAULT_PRIMARY_COLOR
}

