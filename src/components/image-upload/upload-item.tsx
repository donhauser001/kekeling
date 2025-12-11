/**
 * 单个图片项组件
 */

import { useState } from 'react'
import { X, Eye, Loader2, AlertCircle, RotateCcw, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadItemProps {
  url: string
  index?: number
  loading?: boolean
  error?: string | null
  sortable?: boolean
  onRemove?: () => void
  onPreview?: () => void
  onRetry?: () => void
  className?: string
}

export function UploadItem({
  url,
  index,
  loading = false,
  error = null,
  sortable = false,
  onRemove,
  onPreview,
  onRetry,
  className,
}: UploadItemProps) {
  const [imageError, setImageError] = useState(false)
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden bg-muted border-2 border-transparent',
        'transition-all duration-200 ease-out',
        hovering && 'border-primary/50 shadow-md',
        error && 'border-destructive',
        className
      )}
      style={{ aspectRatio: '1' }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* 图片 */}
      {!imageError && url ? (
        <img
          src={url}
          alt={`图片 ${(index ?? 0) + 1}`}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            hovering && 'scale-105'
          )}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-muted'>
          <AlertCircle className='h-6 w-6 text-muted-foreground' />
        </div>
      )}

      {/* 加载中遮罩 */}
      {loading && (
        <div className='absolute inset-0 bg-background/80 flex items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className='absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center gap-2 p-2'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          <span className='text-xs text-destructive text-center line-clamp-2'>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className='flex items-center gap-1 text-xs text-primary hover:underline'
            >
              <RotateCcw className='h-3 w-3' />
              重试
            </button>
          )}
        </div>
      )}

      {/* 悬停操作层 */}
      {!loading && !error && (
        <div
          className={cn(
            'absolute inset-0 bg-black/50 flex items-center justify-center gap-2',
            'opacity-0 transition-opacity duration-200',
            hovering && 'opacity-100'
          )}
        >
          {onPreview && (
            <button
              onClick={onPreview}
              className='p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors'
              title='预览'
            >
              <Eye className='h-4 w-4 text-white' />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className='p-2 rounded-full bg-white/20 hover:bg-destructive/80 transition-colors'
              title='删除'
            >
              <X className='h-4 w-4 text-white' />
            </button>
          )}
        </div>
      )}

      {/* 序号标识 */}
      {typeof index === 'number' && !loading && !error && (
        <div className='absolute top-1 left-1 w-5 h-5 rounded bg-black/60 flex items-center justify-center'>
          <span className='text-xs text-white font-medium'>{index + 1}</span>
        </div>
      )}

      {/* 拖拽手柄 */}
      {sortable && !loading && !error && (
        <div
          className={cn(
            'absolute top-1 right-1 p-1 rounded bg-black/60 cursor-grab',
            'opacity-0 transition-opacity duration-200',
            hovering && 'opacity-100'
          )}
        >
          <GripVertical className='h-3 w-3 text-white' />
        </div>
      )}
    </div>
  )
}
