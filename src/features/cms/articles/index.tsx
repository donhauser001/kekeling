import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableViewOptions } from '@/components/data-table'
import {
  useArticles,
  useActiveArticleCategories,
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
  useToggleArticleTop,
} from '@/hooks/use-api'
import type { Article } from '@/lib/api'
import { getArticleColumns, ArticleTable, ArticleDetailSheet } from './components'

// 状态选项
const statusOptions = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已归档' },
]

export function Articles() {
  const navigate = useNavigate()

  // 分页和筛选状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 弹窗状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Article | null>(null)

  // API hooks
  const { data: articlesData, isLoading } = useArticles({
    page,
    pageSize,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    keyword: globalFilter || undefined,
  })
  const { data: categories = [] } = useActiveArticleCategories()
  const deleteMutation = useDeleteArticle()
  const publishMutation = usePublishArticle()
  const unpublishMutation = useUnpublishArticle()
  const toggleTopMutation = useToggleArticleTop()

  const articles = articlesData?.list || []

  // 新建文章
  const handleCreate = () => {
    navigate({ to: '/cms/articles/$id', params: { id: 'new' } })
  }

  // 查看详情
  const handleView = (item: Article) => {
    setCurrentRow(item)
    setDetailSheetOpen(true)
  }

  // 编辑
  const handleEdit = (item: Article) => {
    navigate({ to: '/cms/articles/$id', params: { id: item.id } })
  }

  // 删除
  const handleDelete = (item: Article) => {
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

  // 切换发布状态
  const handleToggleStatus = async (item: Article) => {
    try {
      if (item.status === 'published') {
        await unpublishMutation.mutateAsync(item.id)
        toast.success('已取消发布')
      } else {
        await publishMutation.mutateAsync(item.id)
        toast.success('发布成功')
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 切换置顶
  const handleToggleTop = async (item: Article) => {
    try {
      await toggleTopMutation.mutateAsync(item.id)
      toast.success(item.isTop ? '已取消置顶' : '已置顶')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 列定义
  const columns = useMemo(
    () =>
      getArticleColumns({
        onView: handleView,
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        onToggleTop: handleToggleTop,
        onDelete: handleDelete,
      }),
    []
  )

  // 表格实例
  const table = useReactTable({
    data: articles,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: articlesData?.totalPages || 0,
  })

  // 分类筛选选项
  const categoryOptions = [
    { value: 'all', label: '全部分类' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <>
      <Header>
        <Search />
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
            <h2 className='text-2xl font-bold tracking-tight'>文章管理</h2>
            <p className='text-muted-foreground'>
              管理营销文章、帮助文档、新闻资讯等内容
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建文章
          </Button>
        </div>

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <Input
            placeholder='搜索文章标题...'
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value)
              setPage(1)
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
            <SelectTrigger className='w-[150px] h-8'>
              <SelectValue placeholder='全部分类' />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className='w-[120px] h-8'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DataTableViewOptions table={table} className='ml-auto' />
        </div>

        {/* 表格 */}
        <ArticleTable table={table} isLoading={isLoading} onRowClick={handleEdit} />

        {/* 分页 */}
        <div className='flex items-center justify-between mt-auto'>
          <p className='text-sm text-muted-foreground'>
            共 {articlesData?.total || 0} 条记录
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className='text-sm'>
              {page} / {articlesData?.totalPages || 1}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= (articlesData?.totalPages || 1)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Main>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title='删除文章'
        desc={
          <>
            确定要删除文章「{currentRow?.title}」吗？
            <span className='text-muted-foreground block mt-1'>
              此操作不可撤销
            </span>
          </>
        }
        confirmText='删除'
        destructive
      />

      {/* 详情抽屉 */}
      <ArticleDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        item={currentRow}
        onEdit={handleEdit}
      />
    </>
  )
}
