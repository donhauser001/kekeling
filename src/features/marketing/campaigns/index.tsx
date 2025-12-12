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
import { campaignApi, type Campaign } from '@/lib/api'
import { CampaignsTable } from './components/campaigns-table'

export function Campaigns() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, pageSize],
    queryFn: () => campaignApi.getCampaigns({ page, pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => campaignApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setDialogOpen(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => campaignApi.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setDialogOpen(false)
      setEditingCampaign(null)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个活动吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCreate = () => {
    setEditingCampaign(null)
    setDialogOpen(true)
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
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

    const startAt = formData.get('startAt') as string
    const endAt = formData.get('endAt') as string

    const payload = {
      name: formData.get('name') as string,
      code: (formData.get('code') as string) || undefined,
      type: formData.get('type') as string,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      discountType: formData.get('discountType') as string,
      discountValue: Number(formData.get('discountValue')),
      maxDiscount: (formData.get('maxDiscount') as string) ? Number(formData.get('maxDiscount')) : undefined,
      minAmount: (formData.get('minAmount') as string) ? Number(formData.get('minAmount')) : undefined,
      applicableScope: (formData.get('applicableScope') as string) || 'all',
      applicableIds: ((formData.get('applicableIds') as string) || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      totalQuantity: (formData.get('totalQuantity') as string) ? Number(formData.get('totalQuantity')) : undefined,
      perUserLimit: (formData.get('perUserLimit') as string) ? Number(formData.get('perUserLimit')) : undefined,
      description: (formData.get('description') as string) || undefined,
      bannerUrl: (formData.get('bannerUrl') as string) || undefined,
      detailUrl: (formData.get('detailUrl') as string) || undefined,
      sort: (formData.get('sort') as string) ? Number(formData.get('sort')) : undefined,
      stackWithMember: formData.get('stackWithMember') === 'on',
      status: (formData.get('status') as string) || 'pending',
    }

    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <>
      <Header fixed>
        <TopNav links={[]} />
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
            <h2 className='text-2xl font-bold tracking-tight'>活动管理</h2>
            <p className='text-muted-foreground'>管理营销活动和秒杀商品</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建活动
          </Button>
        </div>

        <CampaignsTable
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
            <DialogTitle>{editingCampaign ? '编辑活动' : '新建活动'}</DialogTitle>
            <DialogDescription>
              {editingCampaign ? '修改活动基础信息（秒杀商品请在活动详情中管理）' : '创建一个新的营销活动'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>活动名称 *</Label>
                  <Input id='name' name='name' defaultValue={editingCampaign?.name} required />
                </div>
                <div>
                  <Label htmlFor='code'>活动编码</Label>
                  <Input id='code' name='code' defaultValue={editingCampaign?.code ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='type'>活动类型 *</Label>
                  <select
                    id='type'
                    name='type'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingCampaign?.type ?? 'flash_sale'}
                    required
                  >
                    <option value='flash_sale'>限时特惠</option>
                    <option value='seckill'>秒杀</option>
                    <option value='threshold'>满减</option>
                    <option value='newcomer'>新人专享</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='status'>状态</Label>
                  <select
                    id='status'
                    name='status'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingCampaign?.status ?? 'pending'}
                  >
                    <option value='pending'>未开始</option>
                    <option value='active'>进行中</option>
                    <option value='ended'>已结束</option>
                    <option value='cancelled'>已取消</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='startAt'>开始时间 *</Label>
                  <Input
                    id='startAt'
                    name='startAt'
                    type='datetime-local'
                    defaultValue={toDatetimeLocal(editingCampaign?.startAt)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='endAt'>结束时间 *</Label>
                  <Input
                    id='endAt'
                    name='endAt'
                    type='datetime-local'
                    defaultValue={toDatetimeLocal(editingCampaign?.endAt)}
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='discountType'>优惠类型 *</Label>
                  <select
                    id='discountType'
                    name='discountType'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingCampaign?.discountType ?? 'amount'}
                    required
                  >
                    <option value='amount'>减免金额</option>
                    <option value='percent'>折扣比例</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='discountValue'>优惠值 *</Label>
                  <Input
                    id='discountValue'
                    name='discountValue'
                    type='number'
                    defaultValue={editingCampaign?.discountValue ?? 0}
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='minAmount'>门槛金额（元）</Label>
                  <Input id='minAmount' name='minAmount' type='number' defaultValue={editingCampaign?.minAmount ?? 0} />
                </div>
                <div>
                  <Label htmlFor='maxDiscount'>最高优惠（元）</Label>
                  <Input id='maxDiscount' name='maxDiscount' type='number' defaultValue={editingCampaign?.maxDiscount ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='applicableScope'>适用范围</Label>
                  <select
                    id='applicableScope'
                    name='applicableScope'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingCampaign?.applicableScope ?? 'all'}
                  >
                    <option value='all'>全场</option>
                    <option value='category'>分类</option>
                    <option value='service'>服务</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='applicableIds'>适用ID（逗号分隔）</Label>
                  <Input
                    id='applicableIds'
                    name='applicableIds'
                    placeholder='如：cat_1,cat_2 或 service_1'
                    defaultValue={editingCampaign?.applicableIds?.join(',') ?? ''}
                  />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='totalQuantity'>总库存</Label>
                  <Input id='totalQuantity' name='totalQuantity' type='number' defaultValue={editingCampaign?.totalQuantity ?? ''} />
                </div>
                <div>
                  <Label htmlFor='perUserLimit'>每人限购</Label>
                  <Input id='perUserLimit' name='perUserLimit' type='number' defaultValue={editingCampaign?.perUserLimit ?? 1} />
                </div>
                <div>
                  <Label htmlFor='sort'>排序</Label>
                  <Input id='sort' name='sort' type='number' defaultValue={editingCampaign?.sort ?? 0} />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='stackWithMember'>允许与会员叠加</Label>
                <input
                  id='stackWithMember'
                  name='stackWithMember'
                  type='checkbox'
                  defaultChecked={editingCampaign?.stackWithMember ?? true}
                  className='h-4 w-4'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='bannerUrl'>Banner URL</Label>
                  <Input id='bannerUrl' name='bannerUrl' defaultValue={editingCampaign?.bannerUrl ?? ''} />
                </div>
                <div>
                  <Label htmlFor='detailUrl'>详情 URL</Label>
                  <Input id='detailUrl' name='detailUrl' defaultValue={editingCampaign?.detailUrl ?? ''} />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>活动说明</Label>
                <Textarea id='description' name='description' defaultValue={editingCampaign?.description ?? ''} />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCampaign ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
