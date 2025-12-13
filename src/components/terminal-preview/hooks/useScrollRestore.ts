/**
 * 滚动位置恢复 Hook
 * 
 * 用于在页面切换时保存和恢复滚动位置，提升用户体验。
 * 
 * @see docs/终端预览器集成/DEV_NOTES.md 「滚动位置恢复」章节
 * 
 * 使用场景：
 * - 列表 → 详情 → 返回：恢复列表滚动位置
 * - TabBar 切换：保持各 Tab 独立滚动位置
 * 
 * @example
 * ```tsx
 * const { saveScrollPosition, restoreScrollPosition, scrollToTop } = useScrollRestore(scrollContainerRef)
 * 
 * // 页面切换前保存
 * saveScrollPosition('campaigns')
 * 
 * // 页面切换后恢复
 * restoreScrollPosition('campaigns')
 * ```
 */

import { useCallback, useRef, type RefObject } from 'react'

export interface UseScrollRestoreOptions {
  /**
   * 滚动容器的 ref
   * 如果不传，将使用内部创建的 ref
   */
  scrollContainerRef?: RefObject<HTMLDivElement>
}

export interface UseScrollRestoreResult {
  /**
   * 保存指定页面的滚动位置
   * @param pageKey - 页面标识符（如 'campaigns', 'home'）
   */
  saveScrollPosition: (pageKey: string) => void

  /**
   * 恢复指定页面的滚动位置
   * @param pageKey - 页面标识符
   * @param options - 恢复选项
   */
  restoreScrollPosition: (pageKey: string, options?: RestoreOptions) => void

  /**
   * 滚动到顶部
   * @param smooth - 是否使用平滑滚动，默认 false
   */
  scrollToTop: (smooth?: boolean) => void

  /**
   * 获取指定页面的保存的滚动位置
   * @param pageKey - 页面标识符
   * @returns 滚动位置，如果没有保存则返回 undefined
   */
  getScrollPosition: (pageKey: string) => number | undefined

  /**
   * 清除指定页面的滚动位置记录
   * @param pageKey - 页面标识符，如果不传则清除所有
   */
  clearScrollPosition: (pageKey?: string) => void

  /**
   * 滚动位置存储 Map（只读，用于调试）
   */
  scrollPositions: Map<string, number>
}

export interface RestoreOptions {
  /**
   * 是否使用平滑滚动
   * @default false
   */
  smooth?: boolean

  /**
   * 恢复延迟（毫秒）
   * 用于等待页面内容渲染完成
   * @default 0
   */
  delay?: number

  /**
   * 如果没有保存的位置，是否滚动到顶部
   * @default true
   */
  fallbackToTop?: boolean
}

/**
 * 滚动位置恢复 Hook
 * 
 * @param scrollContainerRef - 滚动容器的 ref
 */
export function useScrollRestore(
  scrollContainerRef: RefObject<HTMLDivElement | null>
): UseScrollRestoreResult {
  // 使用 ref 存储滚动位置，避免组件重渲染时丢失
  const scrollPositionsRef = useRef<Map<string, number>>(new Map())

  /**
   * 保存滚动位置
   */
  const saveScrollPosition = useCallback((pageKey: string) => {
    const container = scrollContainerRef.current
    if (!container) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useScrollRestore] scrollContainerRef.current is null, cannot save scroll position')
      }
      return
    }

    const scrollTop = container.scrollTop
    scrollPositionsRef.current.set(pageKey, scrollTop)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[useScrollRestore] Saved scroll position for "${pageKey}": ${scrollTop}px`)
    }
  }, [scrollContainerRef])

  /**
   * 恢复滚动位置
   */
  const restoreScrollPosition = useCallback((
    pageKey: string,
    options: RestoreOptions = {}
  ) => {
    const { smooth = false, delay = 0, fallbackToTop = true } = options

    const doRestore = () => {
      const container = scrollContainerRef.current
      if (!container) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useScrollRestore] scrollContainerRef.current is null, cannot restore scroll position')
        }
        return
      }

      const savedPosition = scrollPositionsRef.current.get(pageKey)

      if (savedPosition !== undefined) {
        // 校正：如果保存的位置超过了当前内容高度，则滚动到最底部
        const maxScrollTop = container.scrollHeight - container.clientHeight
        const targetPosition = Math.min(savedPosition, Math.max(0, maxScrollTop))

        container.scrollTo({
          top: targetPosition,
          behavior: smooth ? 'smooth' : 'auto',
        })

        if (process.env.NODE_ENV === 'development') {
          console.log(`[useScrollRestore] Restored scroll position for "${pageKey}": ${targetPosition}px (saved: ${savedPosition}px, max: ${maxScrollTop}px)`)
        }
      } else if (fallbackToTop) {
        // 没有保存的位置，滚动到顶部
        container.scrollTo({
          top: 0,
          behavior: smooth ? 'smooth' : 'auto',
        })

        if (process.env.NODE_ENV === 'development') {
          console.log(`[useScrollRestore] No saved position for "${pageKey}", scrolled to top`)
        }
      }
    }

    if (delay > 0) {
      setTimeout(doRestore, delay)
    } else {
      // 使用 requestAnimationFrame 确保在下一帧渲染后执行
      requestAnimationFrame(doRestore)
    }
  }, [scrollContainerRef])

  /**
   * 滚动到顶部
   */
  const scrollToTop = useCallback((smooth = false) => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [scrollContainerRef])

  /**
   * 获取保存的滚动位置
   */
  const getScrollPosition = useCallback((pageKey: string) => {
    return scrollPositionsRef.current.get(pageKey)
  }, [])

  /**
   * 清除滚动位置记录
   */
  const clearScrollPosition = useCallback((pageKey?: string) => {
    if (pageKey) {
      scrollPositionsRef.current.delete(pageKey)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[useScrollRestore] Cleared scroll position for "${pageKey}"`)
      }
    } else {
      scrollPositionsRef.current.clear()
      if (process.env.NODE_ENV === 'development') {
        console.log('[useScrollRestore] Cleared all scroll positions')
      }
    }
  }, [])

  return {
    saveScrollPosition,
    restoreScrollPosition,
    scrollToTop,
    getScrollPosition,
    clearScrollPosition,
    scrollPositions: scrollPositionsRef.current,
  }
}

