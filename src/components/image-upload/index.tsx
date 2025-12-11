/**
 * 通用图片上传组件
 * 
 * 支持单图和多图模式，拖拽上传，预览删除等功能
 * 
 * @example
 * // 单图模式
 * <ImageUpload
 *   value={coverImage}
 *   onChange={setCoverImage}
 *   folder="service"
 * />
 * 
 * @example
 * // 多图模式
 * <ImageUpload
 *   value={detailImages}
 *   onChange={setDetailImages}
 *   multiple
 *   maxCount={9}
 *   sortable
 *   folder="service"
 * />
 */

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useUpload, type UploadResult } from './use-upload'
import { UploadItem } from './upload-item'
import { UploadTrigger, AddButton } from './upload-trigger'
import { PreviewModal } from './preview-modal'
import { Label } from '@/components/ui/label'

// 上传中的项
interface UploadingItem {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'error'
  error?: string
}

export interface ImageUploadProps {
  // 值
  value?: string | string[]
  onChange?: (value: string | string[]) => void

  // 模式
  multiple?: boolean
  maxCount?: number

  // 限制
  maxSize?: number // bytes
  accept?: string[]

  // 上传配置
  folder?: string

  // 交互
  sortable?: boolean
  showPreview?: boolean

  // 样式
  label?: string
  hint?: string
  itemSize?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

const ITEM_SIZES = {
  sm: 'w-20 h-20',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxCount = 9,
  maxSize = 5 * 1024 * 1024,
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  folder = 'common',
  sortable = false,
  showPreview = true,
  label,
  hint,
  itemSize = 'md',
  className,
  disabled = false,
}: ImageUploadProps) {
  // 解析当前值
  const images: string[] = multiple
    ? Array.isArray(value) ? value : []
    : value ? [value as string] : []

  // 上传中的项
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([])

  // 预览状态
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  // 用于生成唯一 ID
  const idCounter = useRef(0)

  // 上传 hook
  const { uploadFile } = useUpload({
    folder,
    maxSize,
    accept,
  })

  // 更新值
  const updateValue = useCallback(
    (newImages: string[]) => {
      if (multiple) {
        onChange?.(newImages)
      } else {
        onChange?.(newImages[0] || '')
      }
    },
    [multiple, onChange]
  )

  // 处理文件选择
  const handleSelect = useCallback(
    async (files: File[]) => {
      if (disabled) return

      // 限制数量
      const remainingSlots = multiple ? maxCount - images.length : 1
      const filesToUpload = files.slice(0, remainingSlots)

      if (filesToUpload.length === 0) return

      // 创建上传项
      const newUploadingItems: UploadingItem[] = filesToUpload.map(file => ({
        id: `upload-${++idCounter.current}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading' as const,
      }))

      setUploadingItems(prev => [...prev, ...newUploadingItems])

      // 逐个上传
      for (const item of newUploadingItems) {
        const result = await uploadFile(item.file)

        if (result) {
          // 上传成功，添加到值中
          updateValue([...images, result.url])
          // 移除上传项
          setUploadingItems(prev => prev.filter(i => i.id !== item.id))
          // 释放预览 URL
          URL.revokeObjectURL(item.preview)
        } else {
          // 上传失败，标记错误
          setUploadingItems(prev =>
            prev.map(i =>
              i.id === item.id
                ? { ...i, status: 'error' as const, error: '上传失败' }
                : i
            )
          )
        }
      }
    },
    [disabled, multiple, maxCount, images, uploadFile, updateValue]
  )

  // 移除图片
  const handleRemove = useCallback(
    (index: number) => {
      const newImages = [...images]
      newImages.splice(index, 1)
      updateValue(newImages)
    },
    [images, updateValue]
  )

  // 移除上传中的项
  const handleRemoveUploading = useCallback((id: string) => {
    setUploadingItems(prev => {
      const item = prev.find(i => i.id === id)
      if (item) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter(i => i.id !== id)
    })
  }, [])

  // 重试上传
  const handleRetry = useCallback(
    async (item: UploadingItem) => {
      setUploadingItems(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, status: 'uploading' as const, error: undefined } : i
        )
      )

      const result = await uploadFile(item.file)

      if (result) {
        updateValue([...images, result.url])
        setUploadingItems(prev => prev.filter(i => i.id !== item.id))
        URL.revokeObjectURL(item.preview)
      } else {
        setUploadingItems(prev =>
          prev.map(i =>
            i.id === item.id ? { ...i, status: 'error' as const, error: '上传失败' } : i
          )
        )
      }
    },
    [uploadFile, images, updateValue]
  )

  // 预览图片
  const handlePreview = useCallback((index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }, [])

  // 移动图片位置（简单排序）
  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!sortable || fromIndex === toIndex) return
      const newImages = [...images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      updateValue(newImages)
    },
    [sortable, images, updateValue]
  )

  // 计算是否可以继续添加
  const canAdd = multiple ? images.length + uploadingItems.length < maxCount : images.length === 0

  // 渲染单图模式
  if (!multiple) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && <Label>{label}</Label>}

        <div className={cn(ITEM_SIZES[itemSize])}>
          {images[0] ? (
            <UploadItem
              url={images[0]}
              onRemove={() => handleRemove(0)}
              onPreview={showPreview ? () => handlePreview(0) : undefined}
              className='w-full h-full'
            />
          ) : uploadingItems[0] ? (
            <UploadItem
              url={uploadingItems[0].preview}
              loading={uploadingItems[0].status === 'uploading'}
              error={uploadingItems[0].error}
              onRemove={() => handleRemoveUploading(uploadingItems[0].id)}
              onRetry={() => handleRetry(uploadingItems[0])}
              className='w-full h-full'
            />
          ) : (
            <UploadTrigger
              accept={accept.join(',')}
              disabled={disabled}
              hint={hint || '点击上传'}
              maxSize={`≤${Math.round(maxSize / 1024 / 1024)}MB`}
              onSelect={handleSelect}
              className='w-full h-full'
            />
          )}
        </div>

        {/* 预览弹窗 */}
        {showPreview && (
          <PreviewModal
            open={previewOpen}
            images={images}
            currentIndex={previewIndex}
            onClose={() => setPreviewOpen(false)}
            onIndexChange={setPreviewIndex}
          />
        )}
      </div>
    )
  }

  // 渲染多图模式
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label>{label}</Label>
          <span className='text-xs text-muted-foreground'>
            {images.length}/{maxCount}
          </span>
        </div>
      )}

      <div className='flex flex-wrap gap-3'>
        {/* 已上传的图片 */}
        {images.map((url, index) => (
          <div key={url} className={cn(ITEM_SIZES[itemSize])}>
            <UploadItem
              url={url}
              index={index}
              sortable={sortable}
              onRemove={() => handleRemove(index)}
              onPreview={showPreview ? () => handlePreview(index) : undefined}
              className='w-full h-full'
            />
          </div>
        ))}

        {/* 上传中的图片 */}
        {uploadingItems.map((item, index) => (
          <div key={item.id} className={cn(ITEM_SIZES[itemSize])}>
            <UploadItem
              url={item.preview}
              index={images.length + index}
              loading={item.status === 'uploading'}
              error={item.error}
              onRemove={() => handleRemoveUploading(item.id)}
              onRetry={() => handleRetry(item)}
              className='w-full h-full'
            />
          </div>
        ))}

        {/* 添加按钮 */}
        {canAdd && (
          <div className={cn(ITEM_SIZES[itemSize])}>
            <AddButton
              disabled={disabled}
              count={images.length + uploadingItems.length}
              maxCount={maxCount}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = accept.join(',')
                input.multiple = true
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || [])
                  handleSelect(files)
                }
                input.click()
              }}
              className='w-full h-full'
            />
          </div>
        )}
      </div>

      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}

      {/* 预览弹窗 */}
      {showPreview && (
        <PreviewModal
          open={previewOpen}
          images={images}
          currentIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
          onIndexChange={setPreviewIndex}
        />
      )}
    </div>
  )
}

// 导出子组件
export { UploadItem } from './upload-item'
export { UploadTrigger, AddButton } from './upload-trigger'
export { PreviewModal } from './preview-modal'
export { useUpload } from './use-upload'
export type { UploadResult, UploadState } from './use-upload'
