/**
 * 主题色管理工具
 * 提供全局主题色的获取和设置
 */

import { configApi } from '../services/api'

// 默认主题色
const DEFAULT_PRIMARY_COLOR = '#1890ff'

// 全局主题色状态
let _primaryColor = DEFAULT_PRIMARY_COLOR
let _initialized = false
let _initPromise: Promise<void> | null = null

/**
 * 获取当前主题色（同步方法）
 * 用于 Icon 等需要立即获取颜色的场景
 */
export function getPrimaryColor(): string {
  return _primaryColor
}

/**
 * 获取主题色的浅色版本
 */
export function getPrimaryColorLight(): string {
  return `${_primaryColor}15`
}

/**
 * 设置全局 CSS 变量
 */
function updateCSSVariables(color: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary-color', color)
    document.documentElement.style.setProperty('--primary-color-light', `${color}15`)
    
    // 强制覆盖 tabBar 选中颜色（H5 模式）
    updateTabBarColor(color)
  }
}

/**
 * 更新 tabBar 选中颜色（H5 模式）
 */
function updateTabBarColor(color: string): void {
  if (typeof document === 'undefined') return
  
  // 延迟执行，确保 tabBar 已渲染
  setTimeout(() => {
    // 查找所有 tabBar 项的文字元素并更新选中颜色
    const tabBarItems = document.querySelectorAll('.taro-tabbar__tabbar-item')
    tabBarItems.forEach((item) => {
      const titleEl = item.querySelector('[class*="title"]') as HTMLElement
      if (titleEl && titleEl.style.color === 'rgb(24, 144, 255)') {
        titleEl.style.color = color
      }
    })
    
    // 使用 MutationObserver 监听 DOM 变化，持续更新
    if (!window.__tabBarObserver) {
      const observer = new MutationObserver(() => {
        const items = document.querySelectorAll('.taro-tabbar__tabbar-item [class*="title"]')
        items.forEach((el) => {
          const htmlEl = el as HTMLElement
          if (htmlEl.style.color === 'rgb(24, 144, 255)') {
            htmlEl.style.color = color
          }
        })
      })
      
      const tabBar = document.querySelector('.taro-tabbar__tabbar')
      if (tabBar) {
        observer.observe(tabBar, { subtree: true, attributes: true, attributeFilter: ['style'] })
        ;(window as any).__tabBarObserver = observer
      }
    }
  }, 100)
}

/**
 * 初始化主题（在 App 启动时调用一次）
 */
export async function initTheme(): Promise<string> {
  if (_initialized) {
    return _primaryColor
  }
  
  if (_initPromise) {
    await _initPromise
    return _primaryColor
  }
  
  _initPromise = (async () => {
    try {
      const data = await configApi.getThemeSettings()
      if (data?.primaryColor) {
        _primaryColor = data.primaryColor
        updateCSSVariables(_primaryColor)
      }
    } catch (err) {
      console.error('初始化主题失败:', err)
    } finally {
      _initialized = true
    }
  })()
  
  await _initPromise
  return _primaryColor
}

/**
 * 强制刷新主题色
 */
export async function refreshTheme(): Promise<string> {
  _initialized = false
  _initPromise = null
  return initTheme()
}

