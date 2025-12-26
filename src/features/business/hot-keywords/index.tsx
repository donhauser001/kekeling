import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import { Plus, Loader2, Search, Flame, GripVertical, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchInput } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableViewOptions,
} from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api'

// 热门搜索类型
interface HotKeyword {
  id: string
  keyword: string
  type: string  // hot=热门搜索, guess=猜你想找
  isHot: boolean
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

// 状态选项
const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' },
]

// 类型选项
const typeOptions = [
  { value: 'hot', label: '热门搜索', color: 'bg-orange-100 text-orange-700' },
  { value: 'guess', label: '猜你想找', color: 'bg-purple-100 text-purple-700' },
]

// 表单数据类型
interface KeywordFormData {
  keyword: string
  type: string
  isHot: boolean
  sort: string
  status: string
}

const defaultFormData: KeywordFormData = {
  keyword: '',
  type: 'hot',
  isHot: false,
  sort: '0',
  status: 'active',
}

// API 函数
const hotKeywordsApi = {
  getAll: (status?: string) =>
    request<HotKeyword[]>(`/admin/hot-keywords${status ? `?status=${status}` : ''}`),
  create: (data: Partial<HotKeyword>) =>
    request<HotKeyword>('/admin/hot-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<HotKeyword>) =>
    request<HotKeyword>(`/admin/hot-keywords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request(`/admin/hot-keywords/${id}`, { method: 'DELETE' }),
  batchUpdateStatus: (ids: string[], status: string) =>
    request('/admin/hot-keywords/batch/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    }),
}

export function HotKeywords() {
  // 分页和筛选状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<HotKeyword | null>(null)
  const [formData, setFormData] = useState<KeywordFormData>(defaultFormData)

  const queryClient = useQueryClient()

  // API hooks
  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['admin-hot-keywords'],
    queryFn: () => hotKeywordsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: hotKeywordsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hot-keywords'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HotKeyword> }) =>
      hotKeywordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hot-keywords'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: hotKeywordsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hot-keywords'] })
    },
  })

  // 打开创建弹窗
  const handleCreate = () => {
    setCurrentRow(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  // 编辑
  const handleEdit = (item: HotKeyword) => {
    setCurrentRow(item)
    setFormData({
      keyword: item.keyword,
      type: item.type || 'hot',
      isHot: item.isHot,
      sort: item.sort.toString(),
      status: item.status,
    })
    setDialogOpen(true)
  }

  // 删除
  const handleDelete = (item: HotKeyword) => {
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

  // 切换状态
  const handleToggleStatus = async (item: HotKeyword) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active'
      await updateMutation.mutateAsync({
        id: item.id,
        data: { status: newStatus },
      })
      toast.success(newStatus === 'active' ? '已启用' : '已停用')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 切换热门标记
  const handleToggleHot = async (item: HotKeyword) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: { isHot: !item.isHot },
      })
      toast.success(item.isHot ? '已取消热门' : '已标记为热门')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 保存
  const handleSave = async () => {
    if (!formData.keyword.trim()) {
      toast.error('请输入关键词')
      return
    }

    const submitData = {
      keyword: formData.keyword.trim(),
      type: formData.type,
      isHot: formData.isHot,
      sort: parseInt(formData.sort) || 0,
      status: formData.status,
    }

    try {
      if (currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
          data: submitData,
        })
        toast.success('更新成功')
      } else {
        await createMutation.mutateAsync(submitData)
        toast.success('创建成功')
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 列定义
  const columns = useMemo<ColumnDef<HotKeyword>[]>(
    () => [
      {
        accessorKey: 'sort',
        header: '排序',
        cell: ({ row }) => (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <GripVertical className='h-4 w-4' />
            <span>{row.original.sort}</span>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: 'keyword',
        header: '关键词',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <span className='font-medium'>{row.original.keyword}</span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: '分类',
        cell: ({ row }) => {
          const typeOpt = typeOptions.find((t) => t.value === row.original.type)
          return (
            <Badge variant='outline' className={typeOpt?.color || ''}>
              {typeOpt?.label || '热门搜索'}
            </Badge>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'isHot',
        header: 'HOT标签',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {row.original.isHot ? (
              <Badge variant='destructive' className='gap-1'>
                <Flame className='h-3 w-3' />
                热门
              </Badge>
            ) : (
              <Badge variant='outline' className='text-muted-foreground'>
                普通
              </Badge>
            )}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'active' ? 'default' : 'secondary'}
          >
            {row.original.status === 'active' ? '启用' : '停用'}
          </Badge>
        ),
        size: 80,
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
              <DropdownMenuItem onClick={() => handleToggleHot(row.original)}>
                <Flame className='mr-2 h-4 w-4' />
                {row.original.isHot ? '取消热门' : '标记热门'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>
                {row.original.status === 'active' ? (
                  <>
                    <EyeOff className='mr-2 h-4 w-4' />
                    停用
                  </>
                ) : (
                  <>
                    <Eye className='mr-2 h-4 w-4' />
                    启用
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => handleDelete(row.original)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 60,
      },
    ],
    []
  )

  // 表格实例
  const table = useReactTable({
    data: keywords,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination: { pageIndex: page - 1, pageSize },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize })
          : updater
      setPage(newState.pageIndex + 1)
      setPageSize(newState.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <>
      <Header>
        <SearchInput />
        <div className='ms-auto flex items-center gap-4'>
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>热门搜索</h2>
            <p className='text-muted-foreground'>
              管理小程序搜索页的热门搜索关键词
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            添加关键词
          </Button>
        </div>

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='搜索关键词...'
            searchKey='keyword'
            showViewOptions={false}
            filters={[
              {
                columnId: 'type',
                title: '分类',
                options: typeOptions.map((t) => ({ value: t.value, label: t.label })),
              },
              {
                columnId: 'status',
                title: '状态',
                options: statusOptions,
              },
            ]}
          />
          <DataTableViewOptions table={table} className='ml-auto' />
        </div>

        {/* 表格 */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.column.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className='h-6 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {/* 创建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Search className='h-5 w-5' />
              {currentRow ? '编辑关键词' : '添加关键词'}
            </DialogTitle>
            <DialogDescription>
              {currentRow
                ? '修改热门搜索关键词'
                : '添加新的热门搜索关键词'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>
                关键词 <span className='text-destructive'>*</span>
              </Label>
              <Input
                placeholder='如：全程陪诊'
                value={formData.keyword}
                onChange={(e) =>
                  setFormData({ ...formData, keyword: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>显示区域</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-muted-foreground'>
                热门搜索显示在搜索页顶部列表，猜你想找显示在页面底部标签区
              </p>
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>标记为热门</Label>
                <p className='text-xs text-muted-foreground'>
                  热门关键词会显示红色 HOT 标签（仅热门搜索区域生效）
                </p>
              </div>
              <Switch
                checked={formData.isHot}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isHot: checked })
                }
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>排序</Label>
                <Input
                  type='number'
                  placeholder='0'
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: e.target.value })
                  }
                />
                <p className='text-xs text-muted-foreground'>数字越小越靠前</p>
              </div>
              <div className='space-y-2'>
                <Label>状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {currentRow ? '保存' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title='删除关键词'
        desc={<>确定要删除关键词「{currentRow?.keyword}」吗？</>}
        confirmText='删除'
        destructive
      />
    </>
  )
}

