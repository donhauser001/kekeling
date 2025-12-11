/**
 * 图片预览弹窗
 */

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

export interface PreviewModalProps {
  open: boolean
  images: string[]
  currentIndex: number
  onClose: () => void
  onIndexChange?: (index: number) => void
}

export function PreviewModal({
  open,
  images,
  currentIndex,
  onClose,
  onIndexChange,
}: PreviewModalProps) {
  const total = images.length
  const currentImage = images[currentIndex]

  // 上一张
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange?.(currentIndex - 1)
    }
  }, [currentIndex, onIndexChange])

  // 下一张
  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      onIndexChange?.(currentIndex + 1)
    }
  }, [currentIndex, total, onIndexChange])

  // 键盘导航
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handlePrev, handleNext, onClose])

  if (!currentImage) return null

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none'>
        <DialogTitle className='sr-only'>图片预览</DialogTitle>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
        >
          <X className='h-5 w-5 text-white' />
        </button>

        {/* 图片计数 */}
        {total > 1 && (
          <div className='absolute top-4 left-4 z-50 px-3 py-1 rounded-full bg-white/10 text-white text-sm'>
            {currentIndex + 1} / {total}
          </div>
        )}

        {/* 图片区域 */}
        <div className='relative flex items-center justify-center w-full h-[80vh]'>
          <img
            src={currentImage}
            alt={`预览图片 ${currentIndex + 1}`}
            className='max-w-full max-h-full object-contain'
          />

          {/* 左箭头 */}
          {total > 1 && currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className={cn(
                'absolute left-4 p-3 rounded-full',
                'bg-white/10 hover:bg-white/20 transition-colors'
              )}
            >
              <ChevronLeft className='h-6 w-6 text-white' />
            </button>
          )}

          {/* 右箭头 */}
          {total > 1 && currentIndex < total - 1 && (
            <button
              onClick={handleNext}
              className={cn(
                'absolute right-4 p-3 rounded-full',
                'bg-white/10 hover:bg-white/20 transition-colors'
              )}
            >
              <ChevronRight className='h-6 w-6 text-white' />
            </button>
          )}
        </div>

        {/* 缩略图列表 */}
        {total > 1 && (
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-lg bg-white/10'>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange?.(idx)}
                className={cn(
                  'w-12 h-12 rounded overflow-hidden border-2 transition-all',
                  idx === currentIndex
                    ? 'border-white scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <img src={img} alt='' className='w-full h-full object-cover' />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
