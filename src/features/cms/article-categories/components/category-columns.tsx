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
import { MoreHorizontal, Eye, Edit, Trash, Power, PowerOff, Lock } from 'lucide-react'
import type { ArticleCategory } from '@/lib/api'

interface GetColumnsOptions {
  onView: (item: ArticleCategory) => void
  onEdit: (item: ArticleCategory) => void
  onToggleStatus: (item: ArticleCategory) => void
  onDelete: (item: ArticleCategory) => void
}

export function getCategoryColumns({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: GetColumnsOptions): ColumnDef<ArticleCategory>[] {
  return [
    {
      accessorKey: 'name',
      header: '分类名称',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{row.original.name}</span>
            {row.original.isSystem && (
              <Badge variant='outline' className='text-xs px-1.5 py-0'>
                <Lock className='h-3 w-3 mr-1' />
                系统
              </Badge>
            )}
          </div>
          <span className='text-xs text-muted-foreground'>/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground line-clamp-2 max-w-[250px]'>
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'articleCount',
      header: '文章数',
      cell: ({ row }) => (
        <Badge variant='secondary'>{row.original.articleCount || 0}</Badge>
      ),
    },
    {
      accessorKey: 'sort',
      header: '排序',
      cell: ({ row }) => row.original.sort,
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status
        return status === 'active' ? (
          <Badge variant='default' className='bg-green-500'>启用</Badge>
        ) : (
          <Badge variant='secondary'>停用</Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('zh-CN'),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const item = row.original
        const isActive = item.status === 'active'

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
                {isActive ? (
                  <>
                    <PowerOff className='mr-2 h-4 w-4' />
                    停用
                  </>
                ) : (
                  <>
                    <Power className='mr-2 h-4 w-4' />
                    启用
                  </>
                )}
              </DropdownMenuItem>
              {!item.isSystem && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className='text-destructive focus:text-destructive'
                    disabled={(item.articleCount || 0) > 0}
                  >
                    <Trash className='mr-2 h-4 w-4' />
                    删除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
