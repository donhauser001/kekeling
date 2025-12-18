import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash, Globe, GlobeLock, Tag, Check } from 'lucide-react'
import type { CmsPage } from '@/lib/api'

// 系统页面类型
const systemPageTypes = [
  { slug: 'about', label: '关于我们' },
  { slug: 'privacy', label: '隐私政策' },
  { slug: 'terms', label: '用户协议' },
  { slug: 'help', label: '帮助中心' },
  { slug: 'contact', label: '联系我们' },
]

interface GetColumnsOptions {
  onView: (item: CmsPage) => void
  onEdit: (item: CmsPage) => void
  onToggleStatus: (item: CmsPage) => void
  onDelete: (item: CmsPage) => void
  onSetAs?: (item: CmsPage, slug: string) => void
}

export function getPagesColumns({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onSetAs,
}: GetColumnsOptions): ColumnDef<CmsPage>[] {
  return [
    {
      accessorKey: 'title',
      header: '页面标题',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.title}</span>
          <span className='text-xs text-muted-foreground'>/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: 'excerpt',
      header: '摘要',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground line-clamp-2 max-w-[300px]'>
          {row.original.excerpt || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status
        return status === 'published' ? (
          <Badge variant='default' className='bg-green-500'>已发布</Badge>
        ) : (
          <Badge variant='secondary'>草稿</Badge>
        )
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
      accessorKey: 'updatedAt',
      header: '更新时间',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString('zh-CN'),
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
              {onSetAs && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Tag className='mr-2 h-4 w-4' />
                    设为
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {systemPageTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.slug}
                        onClick={() => onSetAs(item, type.slug)}
                        disabled={item.slug === type.slug}
                      >
                        {item.slug === type.slug && (
                          <Check className='mr-2 h-4 w-4' />
                        )}
                        <span className={item.slug === type.slug ? 'font-medium' : ''}>
                          {type.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
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
