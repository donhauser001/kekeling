import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Menu,
  FolderTree,
  Code,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconPicker, AppIcon, type IconName } from '@/components/ui/icon-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCmsSidebar,
  useCmsSidebars,
  useCreateCmsSidebar,
  useUpdateCmsSidebar,
  useCmsMenus,
  useArticleCategories,
  useCmsPages,
} from '@/hooks/use-api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { SidebarWidget, WidgetType, ApplyTarget, ApplyTargetType, SidebarWidthType, CmsSidebar } from '@/lib/api/cms'

// 状态选项
const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' },
]

// 位置选项
const positionOptions = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
]

// 宽度预设选项
const widthOptions: { value: SidebarWidthType; label: string; width: number }[] = [
  { value: 'narrow', label: '窄 (240px)', width: 240 },
  { value: 'medium', label: '中 (300px)', width: 300 },
  { value: 'wide', label: '宽 (360px)', width: 360 },
  { value: 'custom', label: '自定义', width: 0 },
]

// 获取实际宽度值
const getActualWidth = (width: SidebarWidthType, customWidth?: number): number => {
  const preset = widthOptions.find((w) => w.value === width)
  if (width === 'custom' && customWidth) {
    return customWidth
  }
  return preset?.width || 300
}

// 组件类型选项
const widgetTypeOptions: { value: WidgetType; label: string; icon: React.ReactNode }[] = [
  { value: 'menu', label: '菜单', icon: <Menu className='h-4 w-4' /> },
  { value: 'category', label: '文章分类', icon: <FolderTree className='h-4 w-4' /> },
  { value: 'html', label: '自定义HTML', icon: <Code className='h-4 w-4' /> },
]

// 应用目标类型选项
const applyTargetTypeOptions: { value: ApplyTargetType; label: string; description?: string }[] = [
  { value: 'all', label: '全部页面', description: '应用到网站所有页面' },
  { value: 'page', label: '指定页面', description: '应用到指定的静态页面' },
  { value: 'category', label: '文章分类页', description: '应用到文章分类列表页' },
  { value: 'article', label: '文章页', description: '应用到文章详情页（可按分类筛选）' },
]

// 表单数据类型
interface SidebarFormData {
  name: string
  code: string
  description: string
  position: string
  width: SidebarWidthType
  customWidth: string
  applyTo: ApplyTarget[]
  widgets: SidebarWidget[]
  sort: string
  status: string
}

const defaultFormData: SidebarFormData = {
  name: '',
  code: '',
  description: '',
  position: 'right',
  width: 'medium',
  customWidth: '300',
  applyTo: [],
  widgets: [],
  sort: '0',
  status: 'active',
}

const defaultWidget: SidebarWidget = {
  type: 'menu',
  title: '',
  showTitle: true,
  titleIcon: '',
  menuId: '',
  categoryId: '',
  limit: 10,
  htmlContent: '',
  sort: 0,
}

interface SidebarEditProps {
  id?: string
}

export function SidebarEdit({ id }: SidebarEditProps) {
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [formData, setFormData] = useState<SidebarFormData>(defaultFormData)
  const [showPreview, setShowPreview] = useState(true)

  // API hooks
  const { data: existingSidebar, isLoading: isSidebarLoading } = useCmsSidebar(isNew ? undefined : id)
  const { data: allSidebars = [] } = useCmsSidebars({ status: 'active' })
  const { data: menus = [] } = useCmsMenus({ status: 'active' })
  const { data: categories = [] } = useArticleCategories({ status: 'active' })
  const { data: pages = [] } = useCmsPages({ status: 'published' })
  const createMutation = useCreateCmsSidebar()
  const updateMutation = useUpdateCmsSidebar()

  // 检测冲突的侧边栏
  const detectConflicts = (): { sidebar: CmsSidebar; conflictTargets: string[] }[] => {
    if (formData.applyTo.length === 0) return []

    // 排除当前正在编辑的侧边栏
    const otherSidebars = allSidebars.filter((s) => s.id !== id && s.status === 'active')

    const conflicts: { sidebar: CmsSidebar; conflictTargets: string[] }[] = []

    for (const sidebar of otherSidebars) {
      // 只检测相同位置的侧边栏
      if (sidebar.position !== formData.position) continue

      const conflictTargets: string[] = []

      for (const myTarget of formData.applyTo) {
        for (const otherTarget of sidebar.applyTo || []) {
          // 检测冲突
          const conflict = detectTargetConflict(myTarget, otherTarget)
          if (conflict) {
            conflictTargets.push(conflict)
          }
        }
      }

      if (conflictTargets.length > 0) {
        conflicts.push({ sidebar, conflictTargets: [...new Set(conflictTargets)] })
      }
    }

    return conflicts
  }

  // 检测两个应用目标是否冲突
  const detectTargetConflict = (a: ApplyTarget, b: ApplyTarget): string | null => {
    // 全部页面与任何目标都冲突
    if (a.type === 'all' || b.type === 'all') {
      return '全部页面'
    }

    // 相同类型的目标
    if (a.type === b.type) {
      if (a.type === 'page' && a.id && b.id && a.id === b.id) {
        return `页面: ${a.name || a.id}`
      }
      if (a.type === 'category' && a.id && b.id && a.id === b.id) {
        return `分类页: ${a.name || a.id}`
      }
      if (a.type === 'article') {
        // 文章页：如果都没指定分类或分类相同则冲突
        if (!a.categoryId && !b.categoryId) {
          return '所有文章页'
        }
        if (a.categoryId && b.categoryId && a.categoryId === b.categoryId) {
          return `文章页(${a.categoryName || a.categoryId})`
        }
        // 一个是所有文章，另一个是特定分类，也算冲突
        if (!a.categoryId || !b.categoryId) {
          return `文章页(${a.categoryName || b.categoryName || '部分重叠'})`
        }
      }
    }

    return null
  }

  // 获取冲突信息
  const conflicts = detectConflicts()

  // 加载已有数据
  useEffect(() => {
    if (existingSidebar) {
      setFormData({
        name: existingSidebar.name,
        code: existingSidebar.code,
        description: existingSidebar.description || '',
        position: existingSidebar.position || 'right',
        width: existingSidebar.width || 'medium',
        customWidth: existingSidebar.customWidth?.toString() || '300',
        applyTo: existingSidebar.applyTo || [],
        widgets: existingSidebar.widgets || [],
        sort: existingSidebar.sort.toString(),
        status: existingSidebar.status,
      })
    }
  }, [existingSidebar])

  // 返回列表
  const handleBack = () => {
    navigate({ to: '/cms/sidebars' })
  }

  // 添加组件
  const handleAddWidget = () => {
    setFormData({
      ...formData,
      widgets: [...formData.widgets, { ...defaultWidget, sort: formData.widgets.length }],
    })
  }

  // 更新组件
  const handleUpdateWidget = (index: number, updates: Partial<SidebarWidget>) => {
    const newWidgets = [...formData.widgets]
    newWidgets[index] = { ...newWidgets[index], ...updates }
    setFormData({ ...formData, widgets: newWidgets })
  }

  // 删除组件
  const handleRemoveWidget = (index: number) => {
    const newWidgets = formData.widgets.filter((_, i) => i !== index)
    setFormData({ ...formData, widgets: newWidgets })
  }

  // 添加应用目标
  const handleAddApplyTarget = () => {
    setFormData({
      ...formData,
      applyTo: [...formData.applyTo, { type: 'page' as ApplyTargetType }],
    })
  }

  // 更新应用目标
  const handleUpdateApplyTarget = (index: number, updates: Partial<ApplyTarget>) => {
    const newApplyTo = [...formData.applyTo]
    // 如果类型变化，清除旧的关联数据
    if (updates.type && updates.type !== newApplyTo[index].type) {
      newApplyTo[index] = { type: updates.type }
    } else {
      newApplyTo[index] = { ...newApplyTo[index], ...updates }
    }
    setFormData({ ...formData, applyTo: newApplyTo })
  }

  // 删除应用目标
  const handleRemoveApplyTarget = (index: number) => {
    const newApplyTo = formData.applyTo.filter((_, i) => i !== index)
    setFormData({ ...formData, applyTo: newApplyTo })
  }

  // 保存
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入侧边栏名称')
      return
    }
    if (!formData.code.trim()) {
      toast.error('请输入侧边栏标识')
      return
    }
    if (!/^[a-z0-9_-]+$/.test(formData.code)) {
      toast.error('侧边栏标识只能包含小写字母、数字、下划线和连字符')
      return
    }

    const submitData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: formData.description.trim() || undefined,
      position: formData.position as 'left' | 'right',
      width: formData.width,
      customWidth: formData.width === 'custom' ? parseInt(formData.customWidth) || 300 : undefined,
      applyTo: formData.applyTo,
      widgets: formData.widgets,
      sort: parseInt(formData.sort) || 0,
      status: formData.status as 'active' | 'inactive',
    }

    try {
      if (isNew) {
        await createMutation.mutateAsync(submitData)
        toast.success('创建成功')
      } else {
        await updateMutation.mutateAsync({ id: id!, data: submitData })
        toast.success('更新成功')
      }
      navigate({ to: '/cms/sidebars' })
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || '操作失败')
    }
  }

  // 渲染预览组件
  const renderWidgetPreview = (widget: SidebarWidget, index: number) => {
    const widgetType = widgetTypeOptions.find((w) => w.value === widget.type)
    const showTitle = widget.showTitle !== false

    return (
      <div key={index} className='border rounded-md p-3 bg-card'>
        {showTitle && (
          <div className='flex items-center gap-2 mb-2 pb-2 border-b'>
            {widget.titleIcon ? (
              <AppIcon name={widget.titleIcon as IconName} className='h-4 w-4 text-primary' />
            ) : (
              widgetType?.icon
            )}
            <span className='text-sm font-medium'>{widget.title || widgetType?.label || '未命名组件'}</span>
          </div>
        )}

        {widget.type === 'menu' && (
          <div className='space-y-1'>
            {menus
              .filter((m) => m.id === widget.menuId || !widget.menuId)
              .slice(0, 5)
              .map((m) => (
                <div key={m.id} className='text-sm text-muted-foreground pl-2 border-l-2 border-primary/20'>
                  {m.name}
                </div>
              ))}
          </div>
        )}

        {widget.type === 'category' && (
          <div className='space-y-1'>
            {categories.slice(0, widget.limit || 5).map((c) => (
              <div key={c.id} className='text-sm text-muted-foreground pl-2 border-l-2 border-primary/20'>
                {c.name}
              </div>
            ))}
          </div>
        )}

        {widget.type === 'html' && (
          <div
            className='text-sm text-muted-foreground prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: widget.htmlContent || '<p>自定义内容</p>' }}
          />
        )}
      </div>
    )
  }

  if (!isNew && isSidebarLoading) {
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
          <div className='space-y-4'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-96 w-full' />
          </div>
        </Main>
      </>
    )
  }

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
        {/* 页面标题 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={handleBack}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {isNew ? '新建侧边栏' : '编辑侧边栏'}
              </h1>
              <p className='text-muted-foreground'>
                {isNew ? '创建新的侧边栏配置' : `编辑 ${existingSidebar?.name}`}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className='mr-2 h-4 w-4' />
              {showPreview ? '隐藏预览' : '显示预览'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              <Save className='mr-2 h-4 w-4' />
              保存
            </Button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-3' : ''}`}>
          {/* 编辑区域 */}
          <div className={showPreview ? 'lg:col-span-2' : ''}>
            <div className='space-y-6'>
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>设置侧边栏的基本属性</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>
                        侧边栏名称 <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        placeholder='如：博客侧边栏'
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>
                        唯一标识 <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        placeholder='如：blog-sidebar'
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>描述</Label>
                    <Input
                      placeholder='侧边栏描述（可选）'
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>位置</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(v) => setFormData({ ...formData, position: v })}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {positionOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>宽度</Label>
                      <div className='flex gap-2'>
                        <Select
                          value={formData.width}
                          onValueChange={(v) => setFormData({ ...formData, width: v as SidebarWidthType })}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {widthOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.width === 'custom' && (
                          <div className='flex items-center gap-1'>
                            <Input
                              type='number'
                              min={200}
                              max={500}
                              className='w-24'
                              value={formData.customWidth}
                              onChange={(e) => setFormData({ ...formData, customWidth: e.target.value })}
                            />
                            <span className='text-sm text-muted-foreground'>px</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>排序</Label>
                      <Input
                        type='number'
                        value={formData.sort}
                        onChange={(e) => setFormData({ ...formData, sort: e.target.value })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>状态</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger className='w-full'>
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
                </CardContent>
              </Card>

              {/* 应用目标 */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>应用目标</CardTitle>
                      <CardDescription>设置侧边栏显示在哪些页面</CardDescription>
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={handleAddApplyTarget}>
                      <Plus className='mr-1 h-3 w-3' />
                      添加目标
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.applyTo.length === 0 ? (
                    <div className='text-center py-6 text-muted-foreground border rounded-md border-dashed'>
                      暂未设置应用目标，将不会在任何页面显示
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {formData.applyTo.map((target, index) => (
                        <div key={index} className='flex items-center gap-3 p-3 border rounded-md'>
                          <Select
                            value={target.type}
                            onValueChange={(v) =>
                              handleUpdateApplyTarget(index, { type: v as ApplyTargetType, id: undefined, name: undefined })
                            }
                          >
                            <SelectTrigger className='w-[140px]'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {applyTargetTypeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {target.type === 'page' && (
                            <Select
                              value={target.id || 'none'}
                              onValueChange={(v) => {
                                const page = pages.find((p) => p.id === v)
                                handleUpdateApplyTarget(index, {
                                  id: v === 'none' ? undefined : v,
                                  name: page?.title,
                                })
                              }}
                            >
                              <SelectTrigger className='flex-1'>
                                <SelectValue placeholder='选择页面' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='none'>请选择页面</SelectItem>
                                {pages.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {target.type === 'category' && (
                            <Select
                              value={target.id || 'none'}
                              onValueChange={(v) => {
                                const cat = categories.find((c) => c.id === v)
                                handleUpdateApplyTarget(index, {
                                  id: v === 'none' ? undefined : v,
                                  name: cat?.name,
                                })
                              }}
                            >
                              <SelectTrigger className='flex-1'>
                                <SelectValue placeholder='选择分类' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='none'>请选择分类</SelectItem>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {target.type === 'article' && (
                            <Select
                              value={target.categoryId || 'all'}
                              onValueChange={(v) => {
                                const cat = categories.find((c) => c.id === v)
                                handleUpdateApplyTarget(index, {
                                  categoryId: v === 'all' ? undefined : v,
                                  categoryName: cat?.name,
                                  name: v === 'all' ? '所有文章' : `${cat?.name}分类文章`,
                                })
                              }}
                            >
                              <SelectTrigger className='flex-1'>
                                <SelectValue placeholder='选择文章分类（可选）' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='all'>所有文章页</SelectItem>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name} 分类下的文章
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {target.type === 'all' && (
                            <div className='flex-1 text-sm text-muted-foreground'>
                              将应用到所有页面
                            </div>
                          )}

                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:text-destructive'
                            onClick={() => handleRemoveApplyTarget(index)}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 冲突警告 */}
              {conflicts.length > 0 && (
                <Alert variant='destructive' className='border-amber-500/50 bg-amber-500/10'>
                  <AlertTriangle className='h-4 w-4 text-amber-500' />
                  <AlertTitle className='text-amber-600'>检测到应用目标冲突</AlertTitle>
                  <AlertDescription className='mt-2'>
                    <p className='text-sm text-muted-foreground mb-2'>
                      以下侧边栏与当前配置存在重叠，相同位置时将按排序值优先显示（数值小的优先）：
                    </p>
                    <div className='space-y-2'>
                      {conflicts.map(({ sidebar, conflictTargets }) => (
                        <div key={sidebar.id} className='flex items-start gap-2 p-2 bg-background/50 rounded'>
                          <Badge variant='outline' className='shrink-0'>
                            排序: {sidebar.sort}
                          </Badge>
                          <div className='flex-1'>
                            <div className='font-medium text-sm'>{sidebar.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              冲突: {conflictTargets.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className='text-xs text-muted-foreground mt-3'>
                      当前排序值: <strong>{formData.sort || 0}</strong>
                      {parseInt(formData.sort) <= Math.min(...conflicts.map((c) => c.sidebar.sort))
                        ? ' (当前优先级更高)'
                        : ' (可能被覆盖)'}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* 组件配置 */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>组件配置</CardTitle>
                      <CardDescription>添加和配置侧边栏中的组件</CardDescription>
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={handleAddWidget}>
                      <Plus className='mr-1 h-3 w-3' />
                      添加组件
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.widgets.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground border rounded-md border-dashed'>
                      暂无组件，点击"添加组件"开始配置
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {formData.widgets.map((widget, index) => (
                        <div key={index} className='border rounded-md p-4 space-y-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />
                              <span className='text-sm font-medium'>组件 {index + 1}</span>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='text-destructive hover:text-destructive'
                              onClick={() => handleRemoveWidget(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>

                          <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-1'>
                              <Label className='text-xs'>组件类型</Label>
                              <Select
                                value={widget.type}
                                onValueChange={(v) => handleUpdateWidget(index, { type: v as WidgetType })}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {widgetTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <div className='flex items-center gap-2'>
                                        {opt.icon}
                                        {opt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-1'>
                              <div className='flex items-center justify-between'>
                                <Label className='text-xs'>显示标题</Label>
                                <Switch
                                  checked={widget.showTitle !== false}
                                  onCheckedChange={(checked) => handleUpdateWidget(index, { showTitle: checked })}
                                />
                              </div>
                            </div>
                          </div>

                          {widget.showTitle !== false && (
                            <div className='grid grid-cols-2 gap-3'>
                              <div className='space-y-1'>
                                <Label className='text-xs'>标题文字</Label>
                                <Input
                                  placeholder='组件标题'
                                  value={widget.title || ''}
                                  onChange={(e) => handleUpdateWidget(index, { title: e.target.value })}
                                />
                              </div>
                              <div className='space-y-1'>
                                <Label className='text-xs'>标题图标</Label>
                                <IconPicker
                                  value={(widget.titleIcon || '') as IconName}
                                  onChange={(icon) => handleUpdateWidget(index, { titleIcon: icon })}
                                />
                              </div>
                            </div>
                          )}

                          {/* 菜单类型配置 */}
                          {widget.type === 'menu' && (
                            <div className='space-y-1'>
                              <Label className='text-xs'>选择菜单</Label>
                              <Select
                                value={widget.menuId || 'none'}
                                onValueChange={(v) => handleUpdateWidget(index, { menuId: v === 'none' ? '' : v })}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='请选择菜单' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='none'>请选择菜单</SelectItem>
                                  {menus.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* 分类类型配置 */}
                          {widget.type === 'category' && (
                            <div className='grid grid-cols-2 gap-3'>
                              <div className='space-y-1'>
                                <Label className='text-xs'>分类（可选，空为全部）</Label>
                                <Select
                                  value={widget.categoryId || 'all'}
                                  onValueChange={(v) => handleUpdateWidget(index, { categoryId: v === 'all' ? '' : v })}
                                >
                                  <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='全部分类' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='all'>全部分类</SelectItem>
                                    {categories.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='space-y-1'>
                                <Label className='text-xs'>显示数量</Label>
                                <Input
                                  type='number'
                                  min={1}
                                  max={50}
                                  value={widget.limit || 10}
                                  onChange={(e) => handleUpdateWidget(index, { limit: parseInt(e.target.value) || 10 })}
                                />
                              </div>
                            </div>
                          )}

                          {/* HTML类型配置 */}
                          {widget.type === 'html' && (
                            <div className='space-y-1'>
                              <Label className='text-xs'>HTML内容</Label>
                              <Textarea
                                placeholder='输入HTML代码...'
                                rows={4}
                                value={widget.htmlContent || ''}
                                onChange={(e) => handleUpdateWidget(index, { htmlContent: e.target.value })}
                                className='font-mono text-sm'
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 预览区域 */}
          {showPreview && (
            <div className='lg:col-span-1'>
              <Card className='sticky top-4'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    实时预览
                  </CardTitle>
                  <CardDescription>
                    预览侧边栏在{formData.position === 'left' ? '左侧' : '右侧'}的显示效果
                    <span className='ml-2 text-xs'>
                      宽度: {getActualWidth(formData.width, parseInt(formData.customWidth))}px
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    style={{ maxWidth: `${Math.min(getActualWidth(formData.width, parseInt(formData.customWidth)), 360)}px` }}
                    className={`border rounded-lg p-4 bg-muted/30 min-h-[300px] mx-auto ${
                      formData.position === 'left' ? 'border-l-4 border-l-primary' : 'border-r-4 border-r-primary'
                    }`}
                  >
                    {formData.widgets.length === 0 ? (
                      <div className='text-center py-8 text-muted-foreground'>
                        暂无组件
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {formData.widgets.map((widget, index) => renderWidgetPreview(widget, index))}
                      </div>
                    )}
                  </div>

                  {/* 应用目标预览 */}
                  {formData.applyTo.length > 0 && (
                    <div className='mt-4 pt-4 border-t'>
                      <p className='text-sm font-medium mb-2'>应用到：</p>
                      <div className='flex flex-wrap gap-1'>
                        {formData.applyTo.map((target, index) => (
                          <Badge key={index} variant='secondary' className='text-xs'>
                            {target.type === 'all'
                              ? '全部页面'
                              : target.type === 'page'
                              ? `页面: ${target.name || '未指定'}`
                              : target.type === 'category'
                              ? `分类页: ${target.name || '未指定'}`
                              : target.type === 'article'
                              ? `文章页: ${target.categoryName || '所有'}`
                              : '未知'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
