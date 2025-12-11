/**
 * 上传触发器组件
 */

import { useRef, useState, useCallback } from 'react'
import { Plus, Upload, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadTriggerProps {
  accept?: string
  multiple?: boolean
  disabled?: boolean
  hint?: string
  maxSize?: string
  className?: string
  onSelect?: (files: File[]) => void
}

export function UploadTrigger({
  accept = 'image/jpeg,image/png,image/webp',
  multiple = false,
  disabled = false,
  hint = '点击或拖拽上传',
  maxSize = '≤5MB',
  className,
  onSelect,
}: UploadTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 点击选择
  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  // 文件选择
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onSelect?.(files)
      }
      // 清空 input，允许重复选择同一文件
      e.target.value = ''
    },
    [onSelect]
  )

  // 拖拽事件
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      )

      if (files.length > 0) {
        // 如果是单图模式，只取第一个
        onSelect?.(multiple ? files : [files[0]])
      }
    },
    [disabled, multiple, onSelect]
  )

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 p-4',
        'border-2 border-dashed rounded-lg cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:border-primary/50 hover:bg-primary/5',
        isDragging && 'border-primary bg-primary/10 scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
        className
      )}
      style={{ aspectRatio: '1' }}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className='hidden'
        onChange={handleChange}
      />

      {/* 图标 */}
      <div
        className={cn(
          'p-3 rounded-full bg-muted transition-colors',
          isDragging && 'bg-primary/20'
        )}
      >
        {isDragging ? (
          <Upload className='h-6 w-6 text-primary' />
        ) : (
          <ImagePlus className='h-6 w-6 text-muted-foreground' />
        )}
      </div>

      {/* 提示文字 */}
      <div className='text-center'>
        <p className='text-sm text-muted-foreground'>{hint}</p>
        <p className='text-xs text-muted-foreground/70 mt-0.5'>
          支持 jpg/png/webp {maxSize}
        </p>
      </div>
    </div>
  )
}

/**
 * 小型添加按钮（用于多图模式）
 */
export function AddButton({
  disabled = false,
  count,
  maxCount,
  onClick,
  className,
}: {
  disabled?: boolean
  count?: number
  maxCount?: number
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1',
        'border-2 border-dashed rounded-lg',
        'transition-all duration-200 ease-out',
        'hover:border-primary/50 hover:bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
        className
      )}
      style={{ aspectRatio: '1' }}
    >
      <Plus className='h-6 w-6 text-muted-foreground' />
      <span className='text-xs text-muted-foreground'>添加</span>
      {typeof count === 'number' && typeof maxCount === 'number' && (
        <span className='text-xs text-muted-foreground/70'>
          {count}/{maxCount}
        </span>
      )}
    </button>
  )
}
