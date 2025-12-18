import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { FileText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableViewOptions,
} from '@/components/data-table'
import {
  useCmsPages,
  useUpdateCmsPage,
  useDeleteCmsPage,
  usePublishCmsPage,
  useUnpublishCmsPage,
} from '@/hooks/use-api'
import type { CmsPage } from '@/lib/api'
import { getPagesColumns, PagesTable, PagesDetailSheet } from './components'

// 状态选项
const statusOptions = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
]

export function CmsPages() {
  const navigate = useNavigate()

  // 分页和筛选状态
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // 弹窗状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<CmsPage | null>(null)

  // API hooks
  const { data: pages = [], isLoading } = useCmsPages({})
  const updateMutation = useUpdateCmsPage()
  const deleteMutation = useDeleteCmsPage()
  const publishMutation = usePublishCmsPage()
  const unpublishMutation = useUnpublishCmsPage()

  // 新建页面
  const handleCreate = () => {
    navigate({ to: '/cms/pages/$id', params: { id: 'new' } })
  }

  // 查看详情
  const handleView = (item: CmsPage) => {
    setCurrentRow(item)
    setDetailSheetOpen(true)
  }

  // 编辑
  const handleEdit = (item: CmsPage) => {
    navigate({ to: '/cms/pages/$id', params: { id: item.id } })
  }

  // 删除
  const handleDelete = (item: CmsPage) => {
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
  const handleToggleStatus = async (item: CmsPage) => {
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

  // 设为系统页面
  const handleSetAs = async (item: CmsPage, slug: string) => {
    // 系统页面名称映射
    const slugNames: Record<string, string> = {
      about: '关于我们',
      privacy: '隐私政策',
      terms: '用户协议',
      help: '帮助中心',
      contact: '联系我们',
    }

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: {
          slug,
          title: slugNames[slug] || item.title,
        },
      })
      toast.success(`已设为「${slugNames[slug]}」`)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 列定义
  const columns = useMemo(
    () =>
      getPagesColumns({
        onView: handleView,
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete,
        onSetAs: handleSetAs,
      }),
    []
  )

  // 表格实例
  const table = useReactTable({
    data: pages,
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
            <h2 className='text-2xl font-bold tracking-tight'>页面管理</h2>
            <p className='text-muted-foreground'>
              管理静态页面，如关于我们、隐私政策、用户协议等
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建页面
          </Button>
        </div>

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='搜索页面标题...'
            searchKey='title'
            filters={[
              {
                columnId: 'status',
                title: '状态',
                options: statusOptions,
              },
            ]}
            showViewOptions={false}
          />
          <DataTableViewOptions table={table} className='ml-auto hidden h-8 lg:flex' />
        </div>

        {/* 表格 */}
        <PagesTable table={table} isLoading={isLoading} onRowClick={handleEdit} />

        {/* 分页 */}
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title='删除页面'
        desc={
          <>
            确定要删除页面「{currentRow?.title}」吗？
            <span className='text-muted-foreground block mt-1'>
              此操作不可撤销
            </span>
          </>
        }
        confirmText='删除'
        destructive
      />

      {/* 详情抽屉 */}
      <PagesDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        item={currentRow}
        onEdit={handleEdit}
      />
    </>
  )
}
