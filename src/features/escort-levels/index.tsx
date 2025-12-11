import { useState } from 'react'
import {
  Plus,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Award,
  MoreHorizontal,
  Users,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useEscortLevels,
  useCreateEscortLevel,
  useUpdateEscortLevel,
  useDeleteEscortLevel,
} from '@/hooks/use-api'
import type { EscortLevel, CreateEscortLevelData } from '@/lib/api'

interface FormData {
  code: string
  name: string
  commissionRate: number
  dispatchWeight: number
  minExperience: number
  minOrderCount: number
  minRating: number
  badge: string
  description: string
  sort: number
  status: string
}

const defaultFormData: FormData = {
  code: '',
  name: '',
  commissionRate: 70,
  dispatchWeight: 1,
  minExperience: 0,
  minOrderCount: 0,
  minRating: 0,
  badge: '',
  description: '',
  sort: 0,
  status: 'active',
}

export function EscortLevels() {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<EscortLevel | null>(null)
  const [deletingLevel, setDeletingLevel] = useState<EscortLevel | null>(null)
  const [formData, setFormData] = useState<FormData>(defaultFormData)

  const { data: levels, isLoading, error } = useEscortLevels()
  const createMutation = useCreateEscortLevel()
  const updateMutation = useUpdateEscortLevel()
  const deleteMutation = useDeleteEscortLevel()

  const openCreateDialog = () => {
    setEditingLevel(null)
    setFormData(defaultFormData)
    setFormDialogOpen(true)
  }

  const openEditDialog = (level: EscortLevel) => {
    setEditingLevel(level)
    setFormData({
      code: level.code,
      name: level.name,
      commissionRate: level.commissionRate,
      dispatchWeight: level.dispatchWeight,
      minExperience: level.minExperience,
      minOrderCount: level.minOrderCount,
      minRating: level.minRating,
      badge: level.badge || '',
      description: level.description || '',
      sort: level.sort,
      status: level.status,
    })
    setFormDialogOpen(true)
  }

  const openDeleteDialog = (level: EscortLevel) => {
    setDeletingLevel(level)
    setDeleteDialogOpen(true)
  }

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error('请输入等级编码')
      return
    }
    if (!formData.name.trim()) {
      toast.error('请输入等级名称')
      return
    }

    const data: CreateEscortLevelData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      commissionRate: formData.commissionRate,
      dispatchWeight: formData.dispatchWeight,
      minExperience: formData.minExperience,
      minOrderCount: formData.minOrderCount,
      minRating: formData.minRating,
      badge: formData.badge.trim() || undefined,
      description: formData.description.trim() || undefined,
      sort: formData.sort,
      status: formData.status,
    }

    try {
      if (editingLevel) {
        await updateMutation.mutateAsync({ id: editingLevel.id, data })
        toast.success('更新成功')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('创建成功')
      }
      setFormDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const handleDelete = async () => {
    if (!deletingLevel) return
    try {
      await deleteMutation.mutateAsync(deletingLevel.id)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>陪诊员等级</h1>
            <p className='text-muted-foreground'>管理陪诊员等级体系和分成比例</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className='mr-2 h-4 w-4' />
            新增等级
          </Button>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : error ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <AlertCircle className='h-12 w-12 text-destructive' />
            <p className='text-muted-foreground'>加载失败，请刷新重试</p>
          </div>
        ) : !levels || levels.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <Award className='text-muted-foreground h-12 w-12' />
            <p className='text-muted-foreground'>暂无等级数据</p>
            <Button variant='outline' onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              创建第一个等级
            </Button>
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {levels.map(level => (
              <Card key={level.id}>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <div className='flex items-center gap-2'>
                    <Award className='h-5 w-5 text-primary' />
                    <CardTitle className='text-lg'>{level.name}</CardTitle>
                    <Badge variant={level.status === 'active' ? 'default' : 'secondary'}>
                      {level.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => openEditDialog(level)}>
                        <Pencil className='mr-2 h-4 w-4' />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-destructive'
                        onClick={() => openDeleteDialog(level)}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className='text-muted-foreground mb-3 text-sm'>
                    编码：{level.code}
                  </div>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Percent className='h-4 w-4 text-green-500' />
                      <span>分成 {level.commissionRate}%</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <TrendingUp className='h-4 w-4 text-blue-500' />
                      <span>权重 {level.dispatchWeight}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Users className='h-4 w-4 text-purple-500' />
                      <span>{level._count?.escorts || 0} 人</span>
                    </div>
                  </div>
                  {level.description && (
                    <p className='text-muted-foreground mt-3 text-xs'>{level.description}</p>
                  )}
                  <div className='mt-3 text-xs text-muted-foreground'>
                    晋升条件：{level.minOrderCount}单 / {level.minRating}分 / {level.minExperience}月
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      {/* 创建/编辑对话框 */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editingLevel ? '编辑等级' : '新增等级'}</DialogTitle>
            <DialogDescription>
              {editingLevel ? '修改等级信息' : '创建新的陪诊员等级'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='code'>等级编码 *</Label>
                <Input
                  id='code'
                  value={formData.code}
                  onChange={e => updateField('code', e.target.value)}
                  placeholder='如 senior'
                  disabled={!!editingLevel}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='name'>等级名称 *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder='如 资深陪诊员'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='commissionRate'>分成比例 (%)</Label>
                <Input
                  id='commissionRate'
                  type='number'
                  min={0}
                  max={100}
                  value={formData.commissionRate}
                  onChange={e => updateField('commissionRate', Number(e.target.value))}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dispatchWeight'>派单权重</Label>
                <Input
                  id='dispatchWeight'
                  type='number'
                  min={0}
                  step={0.1}
                  value={formData.dispatchWeight}
                  onChange={e => updateField('dispatchWeight', Number(e.target.value))}
                />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='minOrderCount'>最低订单数</Label>
                <Input
                  id='minOrderCount'
                  type='number'
                  min={0}
                  value={formData.minOrderCount}
                  onChange={e => updateField('minOrderCount', Number(e.target.value))}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='minRating'>最低评分</Label>
                <Input
                  id='minRating'
                  type='number'
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.minRating}
                  onChange={e => updateField('minRating', Number(e.target.value))}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='minExperience'>最低经验(月)</Label>
                <Input
                  id='minExperience'
                  type='number'
                  min={0}
                  value={formData.minExperience}
                  onChange={e => updateField('minExperience', Number(e.target.value))}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sort'>排序</Label>
                <Input
                  id='sort'
                  type='number'
                  value={formData.sort}
                  onChange={e => updateField('sort', Number(e.target.value))}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>状态</Label>
                <Select value={formData.status} onValueChange={v => updateField('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>启用</SelectItem>
                    <SelectItem value='inactive'>停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>等级描述</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder='描述该等级的特点和权益...'
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setFormDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {editingLevel ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除等级「{deletingLevel?.name}」吗？此操作不可撤销。
              {deletingLevel?._count?.escorts ? (
                <span className='mt-2 block text-amber-600'>
                  该等级下有 {deletingLevel._count.escorts} 名陪诊员，请先调整后再删除。
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleDelete}
              disabled={deleteMutation.isPending || (deletingLevel?._count?.escorts || 0) > 0}
            >
              {deleteMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
