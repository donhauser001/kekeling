import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { couponApi, type CouponTemplate } from '@/lib/api'
import { CouponsTable } from './components/coupons-table'

const topNav = [
  { title: '优惠券模板', url: '/marketing/coupons' },
  { title: '发放规则', url: '/marketing/coupons/rules' },
  { title: '用户优惠券', url: '/marketing/coupons/users' },
]

export function Coupons() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CouponTemplate | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['coupon-templates', page, pageSize],
    queryFn: () => couponApi.getTemplates({ page, pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => couponApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-templates'] })
      setDialogOpen(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => couponApi.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-templates'] })
      setDialogOpen(false)
      setEditingTemplate(null)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-templates'] })
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个优惠券模板吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleEdit = (template: CouponTemplate) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const toDatetimeLocal = (value?: string | null) => {
    if (!value) return ''
    const d = new Date(value)
    const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const startAt = (formData.get('startAt') as string) || ''
    const endAt = (formData.get('endAt') as string) || ''
    const validityType = (formData.get('validityType') as string) || 'fixed'

    const payload = {
      name: formData.get('name') as string,
      code: (formData.get('code') as string) || undefined,
      type: formData.get('type') as string,
      value: Number(formData.get('value')),
      maxDiscount: (formData.get('maxDiscount') as string) ? Number(formData.get('maxDiscount')) : undefined,
      minAmount: (formData.get('minAmount') as string) ? Number(formData.get('minAmount')) : undefined,
      applicableScope: (formData.get('applicableScope') as string) || 'all',
      applicableIds: ((formData.get('applicableIds') as string) || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      memberOnly: formData.get('memberOnly') === 'on',
      memberLevelIds: ((formData.get('memberLevelIds') as string) || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      totalQuantity: (formData.get('totalQuantity') as string) ? Number(formData.get('totalQuantity')) : undefined,
      perUserLimit: (formData.get('perUserLimit') as string) ? Number(formData.get('perUserLimit')) : undefined,
      validityType,
      startAt: validityType === 'fixed' && startAt ? new Date(startAt).toISOString() : undefined,
      endAt: validityType === 'fixed' && endAt ? new Date(endAt).toISOString() : undefined,
      validDays: validityType === 'relative' && (formData.get('validDays') as string) ? Number(formData.get('validDays')) : undefined,
      stackWithMember: formData.get('stackWithMember') === 'on',
      stackWithCampaign: formData.get('stackWithCampaign') === 'on',
      description: (formData.get('description') as string) || undefined,
      tips: (formData.get('tips') as string) || undefined,
      status: (formData.get('status') as string) || 'active',
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <>
      <Header fixed>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>优惠券管理</h2>
            <p className='text-muted-foreground'>管理优惠券模板和发放规则</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建模板
          </Button>
        </div>

        <CouponsTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </Main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? '编辑优惠券模板' : '新建优惠券模板'}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? '修改模板基础信息（发放规则单独管理）' : '创建一个新的优惠券模板'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>模板名称 *</Label>
                  <Input id='name' name='name' defaultValue={editingTemplate?.name} required />
                </div>
                <div>
                  <Label htmlFor='code'>兑换码（可选）</Label>
                  <Input id='code' name='code' defaultValue={editingTemplate?.code ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='type'>类型 *</Label>
                  <select
                    id='type'
                    name='type'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingTemplate?.type ?? 'amount'}
                    required
                  >
                    <option value='amount'>满减</option>
                    <option value='percent'>折扣</option>
                    <option value='free'>免费</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='value'>面值/折扣 *</Label>
                  <Input id='value' name='value' type='number' defaultValue={editingTemplate?.value ?? 0} required />
                </div>
                <div>
                  <Label htmlFor='minAmount'>门槛金额（元）</Label>
                  <Input id='minAmount' name='minAmount' type='number' defaultValue={editingTemplate?.minAmount ?? 0} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='maxDiscount'>最高折扣金额（元）</Label>
                  <Input id='maxDiscount' name='maxDiscount' type='number' defaultValue={editingTemplate?.maxDiscount ?? ''} />
                </div>
                <div>
                  <Label htmlFor='status'>状态</Label>
                  <select
                    id='status'
                    name='status'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingTemplate?.status ?? 'active'}
                  >
                    <option value='active'>启用</option>
                    <option value='inactive'>禁用</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='applicableScope'>适用范围</Label>
                  <select
                    id='applicableScope'
                    name='applicableScope'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingTemplate?.applicableScope ?? 'all'}
                  >
                    <option value='all'>全场</option>
                    <option value='category'>分类</option>
                    <option value='service'>服务</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='applicableIds'>适用ID（逗号分隔）</Label>
                  <Input id='applicableIds' name='applicableIds' defaultValue={editingTemplate?.applicableIds?.join(',') ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='totalQuantity'>总发行量</Label>
                  <Input id='totalQuantity' name='totalQuantity' type='number' defaultValue={editingTemplate?.totalQuantity ?? ''} />
                </div>
                <div>
                  <Label htmlFor='perUserLimit'>每人限领</Label>
                  <Input id='perUserLimit' name='perUserLimit' type='number' defaultValue={editingTemplate?.perUserLimit ?? 1} />
                </div>
                <div>
                  <Label htmlFor='validityType'>有效期类型</Label>
                  <select
                    id='validityType'
                    name='validityType'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingTemplate?.validityType ?? 'fixed'}
                  >
                    <option value='fixed'>固定时间</option>
                    <option value='relative'>领取后 N 天</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='startAt'>开始时间（固定时间）</Label>
                  <Input id='startAt' name='startAt' type='datetime-local' defaultValue={toDatetimeLocal(editingTemplate?.startAt)} />
                </div>
                <div>
                  <Label htmlFor='endAt'>结束时间（固定时间）</Label>
                  <Input id='endAt' name='endAt' type='datetime-local' defaultValue={toDatetimeLocal(editingTemplate?.endAt)} />
                </div>
                <div>
                  <Label htmlFor='validDays'>有效天数（相对时间）</Label>
                  <Input id='validDays' name='validDays' type='number' defaultValue={editingTemplate?.validDays ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between rounded-md border border-input px-3 py-2'>
                  <Label htmlFor='stackWithMember'>与会员折扣叠加</Label>
                  <input
                    id='stackWithMember'
                    name='stackWithMember'
                    type='checkbox'
                    defaultChecked={editingTemplate?.stackWithMember ?? true}
                    className='h-4 w-4'
                  />
                </div>
                <div className='flex items-center justify-between rounded-md border border-input px-3 py-2'>
                  <Label htmlFor='stackWithCampaign'>与活动叠加</Label>
                  <input
                    id='stackWithCampaign'
                    name='stackWithCampaign'
                    type='checkbox'
                    defaultChecked={editingTemplate?.stackWithCampaign ?? true}
                    className='h-4 w-4'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between rounded-md border border-input px-3 py-2'>
                  <Label htmlFor='memberOnly'>仅会员可用</Label>
                  <input
                    id='memberOnly'
                    name='memberOnly'
                    type='checkbox'
                    defaultChecked={editingTemplate?.memberOnly ?? false}
                    className='h-4 w-4'
                  />
                </div>
                <div>
                  <Label htmlFor='memberLevelIds'>会员等级ID（逗号分隔）</Label>
                  <Input id='memberLevelIds' name='memberLevelIds' defaultValue={editingTemplate?.memberLevelIds?.join(',') ?? ''} />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>描述</Label>
                <Textarea id='description' name='description' defaultValue={editingTemplate?.description ?? ''} />
              </div>
              <div>
                <Label htmlFor='tips'>使用提示</Label>
                <Textarea id='tips' name='tips' defaultValue={editingTemplate?.tips ?? ''} />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTemplate ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
