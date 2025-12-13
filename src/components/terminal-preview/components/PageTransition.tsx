/**
 * 页面切换过渡组件
 *
 * 为页面切换提供淡入淡出动画效果，消除瞬间切换的突兀感。
 *
 * @see docs/终端预览器集成/DEV_NOTES.md 动效规范章节
 */

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  /** 当前页面标识，变化时触发过渡动画 */
  pageKey: string
  /** 子内容 */
  children: React.ReactNode
  /** 过渡时长（毫秒），默认 200ms */
  duration?: number
  /** 自定义类名 */
  className?: string
}

/**
 * 页面过渡组件
 *
 * 使用 CSS opacity 过渡实现淡入淡出效果：
 * - 页面切换时：opacity 1 → 0 → 1
 * - 过渡时长：200ms（符合 Motion Contract 规范）
 */
export function PageTransition({
  pageKey,
  children,
  duration = 200,
  className,
}: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedKey, setDisplayedKey] = useState(pageKey)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 清理之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 如果 pageKey 变化，触发过渡动画
    if (pageKey !== displayedKey) {
      // 开始淡出
      setIsTransitioning(true)

      // 淡出完成后，切换内容并淡入
      timeoutRef.current = setTimeout(() => {
        setDisplayedKey(pageKey)
        setDisplayedChildren(children)

        // 小延迟后开始淡入（确保 DOM 更新）
        requestAnimationFrame(() => {
          setIsTransitioning(false)
        })
      }, duration / 2)
    } else {
      // pageKey 没变，直接更新 children（不触发过渡）
      setDisplayedChildren(children)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pageKey, children, displayedKey, duration])

  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        className
      )}
      style={{
        transitionDuration: `${duration / 2}ms`,
        opacity: isTransitioning ? 0 : 1,
      }}
    >
      {displayedChildren}
    </div>
  )
}

/**
 * 内容淡入淡出过渡组件（用于锁态/解锁态切换）
 *
 * 与 PageTransition 不同，此组件基于 isVisible 布尔值控制显示/隐藏
 */
interface FadeTransitionProps {
  /** 是否可见 */
  isVisible: boolean
  /** 子内容 */
  children: React.ReactNode
  /** 过渡时长（毫秒），默认 200ms */
  duration?: number
  /** 自定义类名 */
  className?: string
}

export function FadeTransition({
  isVisible,
  children,
  duration = 200,
  className,
}: FadeTransitionProps) {
  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

/**
 * 列表刷新过渡样式类
 *
 * 当列表正在刷新时（isFetching && hasData），使用半透明效果
 * 用法：className={cn('...', getRefreshingClass(isFetching, hasData))}
 */
export function getRefreshingClass(isFetching: boolean, hasData: boolean): string {
  if (isFetching && hasData) {
    return 'opacity-50 transition-opacity duration-150 ease-out'
  }
  return 'opacity-100 transition-opacity duration-150 ease-out'
}
