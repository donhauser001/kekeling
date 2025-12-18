import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Edit, ExternalLink } from 'lucide-react'
import type { CmsPage } from '@/lib/api'

interface PagesDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CmsPage | null
  onEdit?: (item: CmsPage) => void
}

export function PagesDetailSheet({
  open,
  onOpenChange,
  item,
  onEdit,
}: PagesDetailSheetProps) {
  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-xl overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            {item.title}
            {item.status === 'published' ? (
              <Badge variant='default' className='bg-green-500'>已发布</Badge>
            ) : (
              <Badge variant='secondary'>草稿</Badge>
            )}
          </SheetTitle>
          <SheetDescription>/{item.slug}</SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* 操作按钮 */}
          <div className='flex gap-2'>
            {onEdit && (
              <Button variant='outline' size='sm' onClick={() => onEdit(item)}>
                <Edit className='mr-2 h-4 w-4' />
                编辑
              </Button>
            )}
            {item.status === 'published' && (
              <Button variant='outline' size='sm' asChild>
                <a href={`/page/${item.slug}`} target='_blank' rel='noreferrer'>
                  <ExternalLink className='mr-2 h-4 w-4' />
                  预览
                </a>
              </Button>
            )}
          </div>

          <Separator />

          {/* 基本信息 */}
          <div className='space-y-4'>
            <h4 className='font-medium'>基本信息</h4>
            <div className='grid gap-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>URL 别名</span>
                <span className='font-mono'>/{item.slug}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>排序权重</span>
                <span>{item.sort}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>创建时间</span>
                <span>{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>更新时间</span>
                <span>{new Date(item.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
              {item.publishedAt && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>发布时间</span>
                  <span>{new Date(item.publishedAt).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 摘要 */}
          {item.excerpt && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h4 className='font-medium'>摘要</h4>
                <p className='text-sm text-muted-foreground'>{item.excerpt}</p>
              </div>
            </>
          )}

          {/* SEO 信息 */}
          {(item.seoTitle || item.seoDesc || item.seoKeywords) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='font-medium'>SEO 信息</h4>
                <div className='grid gap-3 text-sm'>
                  {item.seoTitle && (
                    <div>
                      <span className='text-muted-foreground'>SEO 标题</span>
                      <p className='mt-1'>{item.seoTitle}</p>
                    </div>
                  )}
                  {item.seoDesc && (
                    <div>
                      <span className='text-muted-foreground'>SEO 描述</span>
                      <p className='mt-1'>{item.seoDesc}</p>
                    </div>
                  )}
                  {item.seoKeywords && (
                    <div>
                      <span className='text-muted-foreground'>SEO 关键词</span>
                      <p className='mt-1'>{item.seoKeywords}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 内容预览 */}
          <Separator />
          <div className='space-y-2'>
            <h4 className='font-medium'>内容预览</h4>
            <div
              className='prose prose-sm dark:prose-invert max-w-none rounded-lg border p-4 bg-muted/30'
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
