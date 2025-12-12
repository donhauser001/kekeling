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
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { referralApi, type ReferralRule } from '@/lib/api'
import { ReferralRulesTable } from './components/referral-rules-table'
import { ReferralRecordsTable } from './components/referral-records-table'

export function Referrals() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ReferralRule | null>(null)
  const queryClient = useQueryClient()

  // 获取邀请记录
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['referral-records', page, pageSize],
    queryFn: () => referralApi.getRecords({ page, pageSize }),
  })

  // 获取邀请规则
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['referral-rules'],
    queryFn: () => referralApi.getRules({ page: 1, pageSize: 50 }),
  })

  const createRuleMutation = useMutation({
    mutationFn: (payload: any) => referralApi.createRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
      setRuleDialogOpen(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => referralApi.updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
      setRuleDialogOpen(false)
      setEditingRule(null)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => referralApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleCreateRule = () => {
    setEditingRule(null)
    setRuleDialogOpen(true)
  }

  const handleEditRule = (rule: ReferralRule) => {
    setEditingRule(rule)
    setRuleDialogOpen(true)
  }

  const handleDeleteRule = (id: string) => {
    if (confirm('确定要删除这个邀请规则吗？')) {
      deleteRuleMutation.mutate(id)
    }
  }

  const handleRuleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      inviterCouponId: (formData.get('inviterCouponId') as string) || undefined,
      inviterPoints: (formData.get('inviterPoints') as string) ? Number(formData.get('inviterPoints')) : undefined,
      inviteeCouponId: (formData.get('inviteeCouponId') as string) || undefined,
      inviteePoints: (formData.get('inviteePoints') as string) ? Number(formData.get('inviteePoints')) : undefined,
      requireFirstOrder: formData.get('requireFirstOrder') === 'on',
      dailyLimit: (formData.get('dailyLimit') as string) ? Number(formData.get('dailyLimit')) : undefined,
      totalLimit: (formData.get('totalLimit') as string) ? Number(formData.get('totalLimit')) : undefined,
      status: formData.get('status') === 'on' ? 'active' : 'inactive',
    }

    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, payload })
    } else {
      createRuleMutation.mutate(payload)
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

      <Main className='flex flex-1 flex-col gap-6 sm:gap-8'>
        {/* 邀请规则部分 */}
        <section>
          <div className='mb-4 flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>邀请规则</h2>
              <p className='text-muted-foreground'>配置邀请奖励规则</p>
            </div>
            <Button onClick={handleCreateRule}>
              <Plus className='mr-2 h-4 w-4' />
              新建规则
            </Button>
          </div>
          <ReferralRulesTable
            data={rulesData?.data ?? []}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
            isLoading={rulesLoading}
          />
        </section>

        {/* 邀请记录部分 */}
        <section>
          <div className='mb-4'>
            <h2 className='text-2xl font-bold tracking-tight'>邀请记录</h2>
            <p className='text-muted-foreground'>查看邀请记录和奖励发放情况</p>
          </div>
          <ReferralRecordsTable
            data={recordsData?.data ?? []}
            total={recordsData?.total ?? 0}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={recordsLoading}
          />
        </section>
      </Main>

      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{editingRule ? '编辑邀请规则' : '新建邀请规则'}</DialogTitle>
            <DialogDescription>奖励字段支持仅填积分或仅填优惠券ID，也可同时填写</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRuleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>规则名称 *</Label>
                  <Input id='name' name='name' defaultValue={editingRule?.name} required />
                </div>
                <div>
                  <Label htmlFor='type'>类型 *</Label>
                  <select
                    id='type'
                    name='type'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingRule?.type ?? 'user'}
                    required
                  >
                    <option value='user'>用户邀请</option>
                    <option value='patient'>就诊人邀请</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='inviterPoints'>邀请人积分</Label>
                  <Input id='inviterPoints' name='inviterPoints' type='number' defaultValue={editingRule?.inviterPoints ?? 0} />
                </div>
                <div>
                  <Label htmlFor='inviterCouponId'>邀请人优惠券ID</Label>
                  <Input id='inviterCouponId' name='inviterCouponId' defaultValue={editingRule?.inviterCouponId ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='inviteePoints'>被邀请人积分</Label>
                  <Input id='inviteePoints' name='inviteePoints' type='number' defaultValue={editingRule?.inviteePoints ?? 0} />
                </div>
                <div>
                  <Label htmlFor='inviteeCouponId'>被邀请人优惠券ID</Label>
                  <Input id='inviteeCouponId' name='inviteeCouponId' defaultValue={editingRule?.inviteeCouponId ?? ''} />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='dailyLimit'>每日上限</Label>
                  <Input id='dailyLimit' name='dailyLimit' type='number' defaultValue={editingRule?.dailyLimit ?? ''} />
                </div>
                <div>
                  <Label htmlFor='totalLimit'>总上限</Label>
                  <Input id='totalLimit' name='totalLimit' type='number' defaultValue={editingRule?.totalLimit ?? ''} />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='requireFirstOrder'>需完成首单</Label>
                <input
                  id='requireFirstOrder'
                  name='requireFirstOrder'
                  type='checkbox'
                  defaultChecked={editingRule?.requireFirstOrder ?? false}
                  className='h-4 w-4'
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='status'>启用</Label>
                <input
                  id='status'
                  name='status'
                  type='checkbox'
                  defaultChecked={(editingRule?.status ?? 'active') === 'active'}
                  className='h-4 w-4'
                />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setRuleDialogOpen(false)}>
                取消
              </Button>
              <Button type='submit' disabled={createRuleMutation.isPending || updateRuleMutation.isPending}>
                {editingRule ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
