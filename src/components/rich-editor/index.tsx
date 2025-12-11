/**
 * 富文本编辑器组件
 * 
 * 基于 contenteditable 的简易富文本编辑器
 * 后续可升级为 TipTap
 * 
 * @example
 * <RichEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="请输入内容..."
 * />
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload, useUpload } from '@/components/image-upload'

export interface RichEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  maxLength?: number
  disabled?: boolean
  className?: string
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolbarButton({ icon, title, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Button
      type='button'
      size='sm'
      variant={active ? 'secondary' : 'ghost'}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className='h-8 w-8 p-0'
    >
      {icon}
    </Button>
  )
}

export function RichEditor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  minHeight = 200,
  maxHeight = 400,
  maxLength = 10000,
  disabled = false,
  className,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  // 上传 hook
  const { uploadFile, uploading } = useUpload({
    folder: 'service',
    onSuccess: (result) => {
      insertImage(result.url)
      setImagePopoverOpen(false)
    },
  })

  // 初始化内容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
      updateCharCount()
    }
  }, [value])

  // 更新字数统计
  const updateCharCount = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || ''
      setCharCount(text.length)
    }
  }, [])

  // 处理内容变化
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      // 处理空内容
      if (html === '<br>' || html === '<div><br></div>') {
        editorRef.current.innerHTML = ''
        onChange?.('')
      } else {
        onChange?.(html)
      }
      updateCharCount()
    }
  }, [onChange, updateCharCount])

  // 执行格式化命令
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  // 格式化按钮
  const formatBold = () => execCommand('bold')
  const formatItalic = () => execCommand('italic')
  const formatUnderline = () => execCommand('underline')
  const formatH1 = () => execCommand('formatBlock', 'h1')
  const formatH2 = () => execCommand('formatBlock', 'h2')
  const formatUl = () => execCommand('insertUnorderedList')
  const formatOl = () => execCommand('insertOrderedList')
  const undo = () => execCommand('undo')
  const redo = () => execCommand('redo')

  // 插入链接
  const insertLink = useCallback(() => {
    if (linkUrl) {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        execCommand('createLink', linkUrl)
      } else {
        // 如果没有选中文本，插入链接文本
        const linkHtml = `<a href="${linkUrl}" target="_blank">${linkUrl}</a>`
        execCommand('insertHTML', linkHtml)
      }
      setLinkUrl('')
      setLinkPopoverOpen(false)
    }
  }, [linkUrl, execCommand])

  // 插入图片
  const insertImage = useCallback((url: string) => {
    if (url) {
      const imgHtml = `<img src="${url}" alt="图片" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`
      execCommand('insertHTML', imgHtml)
      setImageUrl('')
    }
  }, [execCommand])

  // 处理图片上传
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }, [uploadFile])

  // 处理粘贴
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    handleInput()
  }, [handleInput])

  // 处理拖拽图片
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }, [handleImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* 工具栏 */}
      <div className='flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/30'>
        <ToolbarButton
          icon={<Bold className='h-4 w-4' />}
          title='加粗 (Ctrl+B)'
          onClick={formatBold}
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Italic className='h-4 w-4' />}
          title='斜体 (Ctrl+I)'
          onClick={formatItalic}
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Underline className='h-4 w-4' />}
          title='下划线 (Ctrl+U)'
          onClick={formatUnderline}
          disabled={disabled}
        />

        <Separator orientation='vertical' className='mx-1 h-6' />

        <ToolbarButton
          icon={<Heading1 className='h-4 w-4' />}
          title='一级标题'
          onClick={formatH1}
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Heading2 className='h-4 w-4' />}
          title='二级标题'
          onClick={formatH2}
          disabled={disabled}
        />

        <Separator orientation='vertical' className='mx-1 h-6' />

        <ToolbarButton
          icon={<List className='h-4 w-4' />}
          title='无序列表'
          onClick={formatUl}
          disabled={disabled}
        />
        <ToolbarButton
          icon={<ListOrdered className='h-4 w-4' />}
          title='有序列表'
          onClick={formatOl}
          disabled={disabled}
        />

        <Separator orientation='vertical' className='mx-1 h-6' />

        {/* 插入链接 */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              disabled={disabled}
              title='插入链接'
              className='h-8 w-8 p-0'
            >
              <LinkIcon className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-72' align='start'>
            <div className='space-y-3'>
              <Label>链接地址</Label>
              <Input
                placeholder='https://'
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              />
              <div className='flex justify-end'>
                <Button size='sm' onClick={insertLink} disabled={!linkUrl}>
                  插入
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 插入图片 */}
        <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              disabled={disabled}
              title='插入图片'
              className='h-8 w-8 p-0'
            >
              <ImageIcon className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='start'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>上传图片</Label>
                <ImageUpload
                  onChange={(value) => {
                    if (value) {
                      insertImage(value as string)
                      setImagePopoverOpen(false)
                    }
                  }}
                  folder='service'
                  itemSize='md'
                />
              </div>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-popover px-2 text-muted-foreground'>或</span>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>图片链接</Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='https://'
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && imageUrl) {
                        insertImage(imageUrl)
                        setImagePopoverOpen(false)
                      }
                    }}
                  />
                  <Button
                    size='sm'
                    onClick={() => {
                      if (imageUrl) {
                        insertImage(imageUrl)
                        setImagePopoverOpen(false)
                      }
                    }}
                    disabled={!imageUrl}
                  >
                    插入
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className='flex-1' />

        <ToolbarButton
          icon={<Undo className='h-4 w-4' />}
          title='撤销 (Ctrl+Z)'
          onClick={undo}
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Redo className='h-4 w-4' />}
          title='重做 (Ctrl+Y)'
          onClick={redo}
          disabled={disabled}
        />
      </div>

      {/* 编辑区 */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          'p-4 outline-none overflow-y-auto prose prose-sm max-w-none',
          'focus:ring-0 focus:outline-none',
          '[&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-2',
          '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:my-3',
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-2',
          '[&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:list-decimal',
          '[&_a]:text-primary [&_a]:underline',
          disabled && 'opacity-60 cursor-not-allowed',
          !value && !isFocused && 'text-muted-foreground'
        )}
        style={{
          minHeight,
          maxHeight,
        }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* 底部状态栏 */}
      <div className='flex items-center justify-between px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground'>
        <span>支持拖拽图片到编辑区</span>
        <span>
          {charCount}
          {maxLength && ` / ${maxLength}`}
        </span>
      </div>

      {/* 占位符样式 */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default RichEditor
