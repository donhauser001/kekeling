import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { FolderOpen, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  useArticleCategories,
  useCreateArticleCategory,
  useUpdateArticleCategory,
  useDeleteArticleCategory,
} from '@/hooks/use-api'
import type { ArticleCategory } from '@/lib/api'
import { getCategoryColumns, CategoryTable } from './components'

// 状态选项
const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' },
]

// 预设分类
const presetCategories = [
  { slug: 'help', name: '帮助中心', desc: '常见问题和使用指南' },
  { slug: 'news', name: '新闻动态', desc: '公司新闻和行业资讯' },
  { slug: 'guide', name: '使用指南', desc: '产品使用教程' },
  { slug: 'promotion', name: '活动推广', desc: '营销活动和优惠信息' },
]

// 表单数据类型
interface CategoryFormData {
  name: string
  slug: string
  description: string
  icon: string
  sort: string
  status: string
}

const defaultFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  sort: '0',
  status: 'active',
}

export function ArticleCategories() {
  // 筛选状态
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<ArticleCategory | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)

  // API hooks
  const { data: categories = [], isLoading } = useArticleCategories({})
  const createMutation = useCreateArticleCategory()
  const updateMutation = useUpdateArticleCategory()
  const deleteMutation = useDeleteArticleCategory()

  // 打开创建弹窗
  const handleCreate = () => {
    setCurrentRow(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  // 使用预设
  const handleUsePreset = (preset: typeof presetCategories[0]) => {
    setFormData({
      ...defaultFormData,
      name: preset.name,
      slug: preset.slug,
      description: preset.desc,
    })
  }

  // 查看详情
  const handleView = (item: ArticleCategory) => {
    handleEdit(item)
  }

  // 编辑
  const handleEdit = (item: ArticleCategory) => {
    setCurrentRow(item)
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      icon: item.icon || '',
      sort: item.sort.toString(),
      status: item.status,
    })
    setDialogOpen(true)
  }

  // 删除
  const handleDelete = (item: ArticleCategory) => {
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
  const handleToggleStatus = async (item: ArticleCategory) => {
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

  // 保存
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('请输入 URL 别名')
      return
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('URL 别名只能包含小写字母、数字和连字符')
      return
    }

    const submitData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      icon: formData.icon.trim() || undefined,
      sort: parseInt(formData.sort) || 0,
      status: formData.status as 'active' | 'inactive',
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
  const columns = useMemo(
    () =>
      getCategoryColumns({
        onView: handleView,
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete,
      }),
    []
  )

  // 表格实例
  const table = useReactTable({
    data: categories,
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
            <h2 className='text-2xl font-bold tracking-tight'>文章分类</h2>
            <p className='text-muted-foreground'>
              管理文章分类，如帮助中心、新闻动态、使用指南等
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建分类
          </Button>
        </div>

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='搜索分类名称...'
            searchKey='name'
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
        <CategoryTable table={table} isLoading={isLoading} onRowClick={handleView} />

        {/* 分页 */}
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {/* 创建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FolderOpen className='h-5 w-5' />
              {currentRow ? '编辑分类' : '新建分类'}
            </DialogTitle>
            <DialogDescription>
              {currentRow ? '修改分类信息' : '创建新的文章分类'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* 快速预设（仅新建时显示） */}
            {!currentRow && (
              <div className='space-y-2'>
                <Label>常用预设</Label>
                <div className='flex flex-wrap gap-2'>
                  {presetCategories.map((preset) => (
                    <Button
                      key={preset.slug}
                      variant='outline'
                      size='sm'
                      onClick={() => handleUsePreset(preset)}
                      disabled={categories.some((c) => c.slug === preset.slug)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>
                  分类名称 <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder='如：帮助中心'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>
                  URL 别名 <span className='text-destructive'>*</span>
                  {currentRow?.isSystem && (
                    <span className='text-muted-foreground text-xs ml-2'>（系统分类不可修改）</span>
                  )}
                </Label>
                <Input
                  placeholder='如：help'
                  value={formData.slug}
                  disabled={currentRow?.isSystem}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>分类描述</Label>
              <Textarea
                placeholder='分类简介'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>图标名称</Label>
                <Input
                  placeholder='Lucide 图标名，如：help-circle'
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>排序</Label>
                <Input
                  type='number'
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: e.target.value })
                  }
                />
              </div>
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
        disabled={(currentRow?.articleCount || 0) > 0}
        title='删除分类'
        desc={
          <>
            确定要删除分类「{currentRow?.name}」吗？
            {(currentRow?.articleCount || 0) > 0 && (
              <span className='text-destructive mt-2 block'>
                该分类下还有 {currentRow?.articleCount} 篇文章，无法删除！
              </span>
            )}
          </>
        }
        confirmText='删除'
        destructive
      />
    </>
  )
}
