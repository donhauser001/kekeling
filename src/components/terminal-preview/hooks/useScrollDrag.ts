/**
 * 触控滚动拖拽 Hook
 */

import { useRef, useState, useCallback } from 'react'

export interface UseScrollDragReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  isDragging: boolean
  showScrollIndicator: boolean
  scrollProgress: number
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void
  handleScroll: () => void
}

export function useScrollDrag(): UseScrollDragReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // 处理鼠标按下（开始拖动）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartY(e.clientY)
    setScrollTop(scrollContainerRef.current.scrollTop)
    setShowScrollIndicator(true)
  }, [])

  // 处理鼠标移动（拖动中）
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const deltaY = startY - e.clientY
    scrollContainerRef.current.scrollTop = scrollTop + deltaY
  }, [isDragging, startY, scrollTop])

  // 处理鼠标松开（结束拖动）
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    // 延迟隐藏滚动指示器
    setTimeout(() => setShowScrollIndicator(false), 1000)
  }, [])

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setTimeout(() => setShowScrollIndicator(false), 1000)
    }
  }, [isDragging])

  // 监听滚动更新进度
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const progress = scrollTop / (scrollHeight - clientHeight)
    setScrollProgress(Math.min(1, Math.max(0, progress)))
    setShowScrollIndicator(true)
    // 滚动停止后隐藏指示器
    setTimeout(() => setShowScrollIndicator(false), 1500)
  }, [])

  return {
    scrollContainerRef,
    isDragging,
    showScrollIndicator,
    scrollProgress,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleScroll,
  }
}
