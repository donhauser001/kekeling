import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import {
  LayoutPanelLeft,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useCmsSidebars, useDeleteCmsSidebar } from '@/hooks/use-api'
import type { CmsSidebar } from '@/lib/api/cms'

export function CmsSidebars() {
  const navigate = useNavigate()

  // 筛选状态
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // 弹窗状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<CmsSidebar | null>(null)

  // API hooks
  const { data: sidebars = [], isLoading } = useCmsSidebars({})
  const deleteMutation = useDeleteCmsSidebar()

  // 新建
  const handleCreate = () => {
    navigate({ to: '/cms/sidebars/new' })
  }

  // 编辑
  const handleEdit = (item: CmsSidebar) => {
    navigate({ to: '/cms/sidebars/$id', params: { id: item.id } })
  }

  // 删除
  const handleDelete = (item: CmsSidebar) => {
    setCurrentRow(item)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!currentRow) return

    try {
      await deleteMutation.mutateAsync(currentRow.id)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setCurrentRow(null)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '删除失败')
    }
  }

  // 列定义
  const columns: ColumnDef<CmsSidebar>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '侧边栏名称',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <LayoutPanelLeft className='h-4 w-4 text-primary' />
            <span className='font-medium'>{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'code',
        header: '标识',
        cell: ({ getValue }) => (
          <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>{getValue() as string}</code>
        ),
      },
      {
        accessorKey: 'position',
        header: '位置/宽度',
        cell: ({ row }) => {
          const position = row.original.position
          const width = row.original.width
          const customWidth = row.original.customWidth

          const widthLabels: Record<string, string> = {
            narrow: '240px',
            medium: '300px',
            wide: '360px',
            custom: customWidth ? `${customWidth}px` : '自定义',
          }

          return (
            <div className='flex flex-col gap-0.5'>
              <Badge variant='outline'>
                {position === 'left' ? '左侧' : '右侧'}
              </Badge>
              <span className='text-xs text-muted-foreground'>
                {widthLabels[width] || '300px'}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'applyTo',
        header: '应用目标',
        cell: ({ row }) => {
          const applyTo = row.original.applyTo || []
          if (applyTo.length === 0) {
            return <span className='text-muted-foreground'>未设置</span>
          }
          const hasAll = applyTo.some((t) => t.type === 'all')
          if (hasAll) {
            return <Badge variant='secondary'>全部页面</Badge>
          }

          const getTargetLabel = (t: typeof applyTo[0]) => {
            switch (t.type) {
              case 'page':
                return `页面: ${t.name || '未指定'}`
              case 'category':
                return `分类页: ${t.name || '未指定'}`
              case 'article':
                return `文章页: ${t.categoryName || '所有'}`
              default:
                return '未知'
            }
          }

          return (
            <div className='flex flex-wrap gap-1'>
              {applyTo.slice(0, 2).map((t, i) => (
                <Badge key={i} variant='outline' className='text-xs'>
                  {getTargetLabel(t)}
                </Badge>
              ))}
              {applyTo.length > 2 && (
                <Badge variant='outline' className='text-xs'>+{applyTo.length - 2}</Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'widgets',
        header: '组件数量',
        cell: ({ row }) => {
          const widgets = row.original.widgets || []
          return (
            <span className='text-muted-foreground'>{widgets.length} 个组件</span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ getValue }) => {
          const status = getValue() as string
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? '启用' : '停用'}
            </Badge>
          )
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className='mr-2 h-4 w-4' />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Eye className='mr-2 h-4 w-4' />
                预览
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => handleDelete(row.original)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  // 表格实例
  const table = useReactTable({
    data: sidebars,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <MessageButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>侧边栏管理</h1>
            <p className='text-muted-foreground'>管理网站侧边栏，可添加菜单、分类、自定义内容等组件</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建侧边栏
          </Button>
        </div>

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <Input
            placeholder='搜索侧边栏名称...'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='h-8 w-[200px]'
          />
        </div>

        {/* 表格 */}
        {isLoading ? (
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 分页 */}
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='确认删除'
        description={`确定要删除侧边栏 "${currentRow?.name}" 吗？此操作不可撤销。`}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
