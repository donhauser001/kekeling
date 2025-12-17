import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash, Globe, GlobeLock, Pin, PinOff } from 'lucide-react'
import type { Article } from '@/lib/api'

interface GetColumnsOptions {
  onView: (item: Article) => void
  onEdit: (item: Article) => void
  onToggleStatus: (item: Article) => void
  onToggleTop: (item: Article) => void
  onDelete: (item: Article) => void
}

export function getArticleColumns({
  onView,
  onEdit,
  onToggleStatus,
  onToggleTop,
  onDelete,
}: GetColumnsOptions): ColumnDef<Article>[] {
  return [
    {
      accessorKey: 'title',
      header: '文章标题',
      cell: ({ row }) => (
        <div className='flex flex-col max-w-[300px]'>
          <div className='flex items-center gap-1.5'>
            {row.original.isTop && (
              <Badge variant='destructive' className='text-[10px] px-1 py-0'>置顶</Badge>
            )}
            {row.original.isHot && (
              <Badge variant='secondary' className='text-[10px] px-1 py-0 bg-orange-500 text-white'>热门</Badge>
            )}
            <span className='font-medium truncate'>{row.original.title}</span>
          </div>
          <span className='text-xs text-muted-foreground truncate'>/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: '分类',
      cell: ({ row }) => (
        <Badge variant='outline'>
          {row.original.category?.name || '未分类'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        const categoryId = row.original.categoryId
        return value.includes(categoryId || 'uncategorized')
      },
    },
    {
      accessorKey: 'viewCount',
      header: '阅读量',
      cell: ({ row }) => row.original.viewCount,
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'published') {
          return <Badge variant='default' className='bg-green-500'>已发布</Badge>
        } else if (status === 'archived') {
          return <Badge variant='secondary'>已归档</Badge>
        }
        return <Badge variant='secondary'>草稿</Badge>
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'publishedAt',
      header: '发布时间',
      cell: ({ row }) => {
        const date = row.original.publishedAt
        return date ? new Date(date).toLocaleString('zh-CN') : '-'
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const item = row.original
        const isPublished = item.status === 'published'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className='mr-2 h-4 w-4' />
                查看
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className='mr-2 h-4 w-4' />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                {isPublished ? (
                  <>
                    <GlobeLock className='mr-2 h-4 w-4' />
                    取消发布
                  </>
                ) : (
                  <>
                    <Globe className='mr-2 h-4 w-4' />
                    发布
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleTop(item)}>
                {item.isTop ? (
                  <>
                    <PinOff className='mr-2 h-4 w-4' />
                    取消置顶
                  </>
                ) : (
                  <>
                    <Pin className='mr-2 h-4 w-4' />
                    置顶
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className='text-destructive focus:text-destructive'
              >
                <Trash className='mr-2 h-4 w-4' />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
