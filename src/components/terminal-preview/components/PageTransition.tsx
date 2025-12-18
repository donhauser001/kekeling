/**
 * 页面切换过渡组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { useEffect, useState, useRef } from 'react'
import { Box } from '../ui/primitives'
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (pageKey !== displayedKey) {
      setIsTransitioning(true)
      timeoutRef.current = setTimeout(() => {
        setDisplayedKey(pageKey)
        setDisplayedChildren(children)
        requestAnimationFrame(() => {
          setIsTransitioning(false)
        })
      }, duration / 2)
    } else {
      setDisplayedChildren(children)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pageKey, children, displayedKey, duration])

  return (
    <Box
      className={cn('transition-opacity ease-in-out', className)}
      style={{
        transitionDuration: `${duration / 2}ms`,
        opacity: isTransitioning ? 0 : 1,
      }}
    >
      {displayedChildren}
    </Box>
  )
}

/**
 * 内容淡入淡出过渡组件
 */
interface FadeTransitionProps {
  isVisible: boolean
  children: React.ReactNode
  duration?: number
  className?: string
}

export function FadeTransition({
  isVisible,
  children,
  duration = 200,
  className,
}: FadeTransitionProps) {
  return (
    <Box
      className={cn('transition-opacity ease-in-out', className)}
      style={{
        transitionDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </Box>
  )
}

/**
 * 列表刷新过渡样式类
 */
export function getRefreshingClass(isFetching: boolean, hasData: boolean): string {
  if (isFetching && hasData) {
    return 'opacity-50 transition-opacity duration-150 ease-out'
  }
  return 'opacity-100 transition-opacity duration-150 ease-out'
}
