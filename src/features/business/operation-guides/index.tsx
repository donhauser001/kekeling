import { useState } from 'react'
import {
  BookOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Search as SearchIcon,
  X,
  Eye,
  FolderOpen,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
import { SimplePagination } from '@/components/simple-pagination'
import { RichEditor } from '@/components/rich-editor'
import { cn } from '@/lib/utils'
import {
  useOperationGuides,
  useActiveOperationGuideCategories,
  useCreateOperationGuide,
  useUpdateOperationGuide,
  useDeleteOperationGuide,
  useOperationGuideCategories,
  useCreateOperationGuideCategory,
  useUpdateOperationGuideCategory,
  useDeleteOperationGuideCategory,
} from '@/hooks/use-api'
import type { OperationGuide, OperationGuideCategory } from '@/lib/api'

// 状态选项
const statusOptions = [
  { value: 'active', label: '启用', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: '停用', color: 'bg-gray-100 text-gray-700' },
  { value: 'draft', label: '草稿', color: 'bg-yellow-100 text-yellow-700' },
]

// 表单数据类型
interface GuideFormData {
  categoryId: string
  title: string
  summary: string
  content: string
  sort: string
  status: string
}

const defaultFormData: GuideFormData = {
  categoryId: '',
  title: '',
  summary: '',
  content: '',
  sort: '0',
  status: 'draft',
}

// 分类表单数据类型
interface CategoryFormData {
  name: string
  description: string
  icon: string
  sort: string
  status: string
}

const defaultCategoryFormData: CategoryFormData = {
  name: '',
  description: '',
  icon: '',
  sort: '0',
  status: 'active',
}

export function OperationGuides() {
  // 筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<OperationGuide | null>(null)
  const [deletingItem, setDeletingItem] = useState<OperationGuide | null>(null)
  const [previewItem, setPreviewItem] = useState<OperationGuide | null>(null)
  const [editingCategory, setEditingCategory] = useState<OperationGuideCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<OperationGuideCategory | null>(null)

  const [formData, setFormData] = useState<GuideFormData>(defaultFormData)
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(defaultCategoryFormData)

  // API hooks
  const { data: guidesData, isLoading, error } = useOperationGuides({
    categoryId: selectedCategory || undefined,
    status: selectedStatus || undefined,
    keyword: searchQuery || undefined,
    page,
    pageSize,
  })
  const { data: categories = [] } = useActiveOperationGuideCategories()
  const { data: allCategories = [] } = useOperationGuideCategories()

  const createMutation = useCreateOperationGuide()
  const updateMutation = useUpdateOperationGuide()
  const deleteMutation = useDeleteOperationGuide()
  const createCategoryMutation = useCreateOperationGuideCategory()
  const updateCategoryMutation = useUpdateOperationGuideCategory()
  const deleteCategoryMutation = useDeleteOperationGuideCategory()

  const guides = guidesData?.list || []
  const total = guidesData?.total || 0
  const totalPages = guidesData?.totalPages || 0

  // 打开创建对话框
  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const openEditDialog = (item: OperationGuide) => {
    setEditingItem(item)
    setFormData({
      categoryId: item.categoryId,
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      sort: item.sort.toString(),
      status: item.status,
    })
    setDialogOpen(true)
  }

  // 打开预览对话框
  const openPreviewDialog = (item: OperationGuide) => {
    setPreviewItem(item)
    setPreviewDialogOpen(true)
  }

  // 打开删除确认
  const openDeleteDialog = (item: OperationGuide) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  // 打开分类管理对话框
  const openCategoryDialog = (item?: OperationGuideCategory) => {
    if (item) {
      setEditingCategory(item)
      setCategoryFormData({
        name: item.name,
        description: item.description || '',
        icon: item.icon || '',
        sort: item.sort.toString(),
        status: item.status,
      })
    } else {
      setEditingCategory(null)
      setCategoryFormData(defaultCategoryFormData)
    }
    setCategoryDialogOpen(true)
  }

  // 保存
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!formData.categoryId) {
      toast.error('请选择分类')
      return
    }
    if (!formData.content.trim()) {
      toast.error('请输入内容')
      return
    }

    const submitData = {
      categoryId: formData.categoryId,
      title: formData.title.trim(),
      summary: formData.summary.trim() || undefined,
      content: formData.content,
      sort: parseInt(formData.sort) || 0,
      status: formData.status as 'active' | 'inactive' | 'draft',
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
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

  // 删除
  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '删除失败')
    }
  }

  // 保存分类
  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }

    const submitData = {
      name: categoryFormData.name.trim(),
      description: categoryFormData.description.trim() || undefined,
      icon: categoryFormData.icon.trim() || undefined,
      sort: parseInt(categoryFormData.sort) || 0,
      status: categoryFormData.status as 'active' | 'inactive',
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: submitData,
        })
        toast.success('更新成功')
      } else {
        await createCategoryMutation.mutateAsync(submitData)
        toast.success('创建成功')
      }
      setCategoryDialogOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 删除分类
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id)
      toast.success('删除成功')
      setCategoryDeleteDialogOpen(false)
      setDeletingCategory(null)
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '删除失败')
    }
  }

  // 快速切换状态
  const handleToggleStatus = async (item: OperationGuide) => {
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

  // 状态徽章
  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return (
      <Badge variant='outline' className={cn('font-normal', option?.color)}>
        {option?.label || status}
      </Badge>
    )
  }

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

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>操作规范</h1>
            <p className='text-muted-foreground'>
              管理陪诊员操作规范，可在服务中关联展示给陪诊员
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => openCategoryDialog()}>
              <FolderOpen className='mr-2 h-4 w-4' />
              分类管理
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              添加规范
            </Button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className='mb-6 flex flex-wrap items-center gap-4'>
          <div className='relative min-w-[200px] max-w-md flex-1'>
            <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索规范标题或内容...'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className='pl-9'
            />
            {searchQuery && (
              <button
                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                onClick={() => {
                  setSearchQuery('')
                  setPage(1)
                }}
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <Select
            value={selectedCategory || '__all__'}
            onValueChange={(v) => {
              setSelectedCategory(v === '__all__' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='全部分类' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>全部分类</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus || '__all__'}
            onValueChange={(v) => {
              setSelectedStatus(v === '__all__' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>全部状态</SelectItem>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-destructive' />
            <p className='text-muted-foreground'>加载失败，请刷新重试</p>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && guides.length === 0 && (
          <div className='flex h-64 flex-col items-center justify-center gap-4'>
            <BookOpen className='h-12 w-12 text-muted-foreground' />
            <p className='text-muted-foreground'>暂无操作规范</p>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              创建第一个规范
            </Button>
          </div>
        )}

        {/* 列表 */}
        {!isLoading && !error && guides.length > 0 && (
          <>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead>使用数</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guides.map(item => (
                    <TableRow
                      key={item.id}
                      className={cn('group', item.status !== 'active' && 'opacity-60')}
                    >
                      <TableCell>
                        <span className='font-medium'>{item.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {item.category?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className='max-w-[300px]'>
                        <p className='text-muted-foreground text-sm line-clamp-2'>
                          {item.summary || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{item.serviceCount || 0} 个服务</Badge>
                      </TableCell>
                      <TableCell>{item.sort}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 opacity-0 group-hover:opacity-100'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => openPreviewDialog(item)}>
                              <Eye className='mr-2 h-4 w-4' />
                              预览
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Pencil className='mr-2 h-4 w-4' />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.status === 'active' ? '停用' : '启用'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={() => openDeleteDialog(item)}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className='mt-4 flex justify-center'>
                <SimplePagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Main>

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              {editingItem ? '编辑规范' : '添加规范'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? '修改操作规范内容' : '添加新的操作规范'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>
                  分类 <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={v => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='选择分类' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>
                  标题 <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder='输入规范标题'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>摘要</Label>
              <Textarea
                placeholder='输入规范摘要（可选）'
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
              />
            </div>

            <div className='space-y-2'>
              <Label>
                内容 <span className='text-destructive'>*</span>
              </Label>
              <RichEditor
                value={formData.content}
                onChange={(v) => setFormData({ ...formData, content: v })}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>排序</Label>
                <Input
                  type='number'
                  value={formData.sort}
                  onChange={e => setFormData({ ...formData, sort: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label>状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={v => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
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
              {editingItem ? '保存' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>
              {previewItem?.category?.name} · {previewItem?.summary || '暂无摘要'}
            </DialogDescription>
          </DialogHeader>
          <div
            className='prose prose-sm dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: previewItem?.content || '' }}
          />
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除规范 "{deletingItem?.title}" 吗？
              {(deletingItem?.serviceCount || 0) > 0 && (
                <span className='text-destructive mt-2 block'>
                  该规范已被 {deletingItem?.serviceCount} 个服务使用，无法删除！
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending || (deletingItem?.serviceCount || 0) > 0}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleteMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 分类管理对话框 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              {editingCategory ? '编辑分类' : '分类管理'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? '修改分类信息' : '管理操作规范的分类'}
            </DialogDescription>
          </DialogHeader>

          {/* 分类表单 */}
          {(editingCategory || !allCategories.length) ? (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>
                  分类名称 <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder='如：服务礼仪'
                  value={categoryFormData.name}
                  onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label>描述</Label>
                <Textarea
                  placeholder='分类描述（可选）'
                  value={categoryFormData.description}
                  onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>图标名称</Label>
                  <Input
                    placeholder='lucide 图标名'
                    value={categoryFormData.icon}
                    onChange={e => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>排序</Label>
                  <Input
                    type='number'
                    value={categoryFormData.sort}
                    onChange={e => setCategoryFormData({ ...categoryFormData, sort: e.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>状态</Label>
                  <Select
                    value={categoryFormData.status}
                    onValueChange={v => setCategoryFormData({ ...categoryFormData, status: v })}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>启用</SelectItem>
                      <SelectItem value='inactive'>停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={() => {
                  if (editingCategory) {
                    setEditingCategory(null)
                    setCategoryFormData(defaultCategoryFormData)
                  } else {
                    setCategoryDialogOpen(false)
                  }
                }}>
                  {editingCategory ? '返回列表' : '取消'}
                </Button>
                <Button
                  onClick={handleSaveCategory}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {editingCategory ? '保存' : '创建'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 分类列表 */}
              <div className='space-y-2'>
                {allCategories.map(cat => (
                  <div
                    key={cat.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <div className='font-medium'>{cat.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {cat.description || '暂无描述'} · {cat.guideCount || 0} 个规范
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openCategoryDialog(cat)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setDeletingCategory(cat)
                          setCategoryDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-end pt-4'>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className='mr-2 h-4 w-4' />
                  添加分类
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 分类删除确认对话框 */}
      <AlertDialog open={categoryDeleteDialogOpen} onOpenChange={setCategoryDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类 "{deletingCategory?.name}" 吗？
              {(deletingCategory?.guideCount || 0) > 0 && (
                <span className='text-destructive mt-2 block'>
                  该分类下有 {deletingCategory?.guideCount} 个规范，无法删除！
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending || (deletingCategory?.guideCount || 0) > 0}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleteCategoryMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
