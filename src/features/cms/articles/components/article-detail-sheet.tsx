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
import { Edit, ExternalLink, Eye, Pin } from 'lucide-react'
import type { Article } from '@/lib/api'

interface ArticleDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Article | null
  onEdit?: (item: Article) => void
}

export function ArticleDetailSheet({
  open,
  onOpenChange,
  item,
  onEdit,
}: ArticleDetailSheetProps) {
  if (!item) return null

  const getStatusBadge = () => {
    if (item.status === 'published') {
      return <Badge variant='default' className='bg-green-500'>已发布</Badge>
    } else if (item.status === 'archived') {
      return <Badge variant='secondary'>已归档</Badge>
    }
    return <Badge variant='secondary'>草稿</Badge>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-xl overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2 flex-wrap'>
            {item.isTop && <Pin className='h-4 w-4 text-destructive' />}
            {item.title}
            {getStatusBadge()}
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
                <a href={`/article/${item.slug}`} target='_blank' rel='noreferrer'>
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
                <span className='text-muted-foreground'>分类</span>
                <Badge variant='outline'>{item.category?.name || '未分类'}</Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>作者</span>
                <span>{item.author || '-'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>来源</span>
                <span>{item.source || '-'}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>阅读量</span>
                <span className='flex items-center gap-1'>
                  <Eye className='h-3.5 w-3.5' />
                  {item.viewCount}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>创建时间</span>
                <span>{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              {item.publishedAt && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>发布时间</span>
                  <span>{new Date(item.publishedAt).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          {item.tags && item.tags.length > 0 && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h4 className='font-medium'>标签</h4>
                <div className='flex flex-wrap gap-1.5'>
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant='secondary'>{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 摘要 */}
          {item.summary && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h4 className='font-medium'>摘要</h4>
                <p className='text-sm text-muted-foreground'>{item.summary}</p>
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
