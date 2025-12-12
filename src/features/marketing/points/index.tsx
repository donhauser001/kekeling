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
import { pointApi, type PointRule } from '@/lib/api'
import { PointsTable } from './components/points-table'

const topNav = [
  { title: '积分规则', url: '/marketing/points' },
  { title: '用户积分', url: '/marketing/points/users' },
  { title: '积分记录', url: '/marketing/points/records' },
]

export function Points() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PointRule | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['point-rules', page, pageSize],
    queryFn: () => pointApi.getRules({ page, pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => pointApi.createRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      setDialogOpen(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => pointApi.updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      setDialogOpen(false)
      setEditingRule(null)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pointApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleCreate = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  const handleEdit = (rule: PointRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个积分规则吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const conditionsText = ((formData.get('conditions') as string) || '').trim()
    let conditions: any | undefined
    if (conditionsText) {
      try {
        conditions = JSON.parse(conditionsText)
      } catch {
        toast.error('条件(JSON)格式不正确')
        return
      }
    }

    const pointsStr = (formData.get('points') as string) || ''
    const pointsRateStr = (formData.get('pointsRate') as string) || ''

    const payload = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      points: pointsStr ? Number(pointsStr) : undefined,
      pointsRate: pointsRateStr ? Number(pointsRateStr) : undefined,
      dailyLimit: (formData.get('dailyLimit') as string) ? Number(formData.get('dailyLimit')) : undefined,
      totalLimit: (formData.get('totalLimit') as string) ? Number(formData.get('totalLimit')) : undefined,
      conditions,
      status: formData.get('status') === 'on' ? 'active' : 'inactive',
    }

    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, payload })
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
            <h2 className='text-2xl font-bold tracking-tight'>积分管理</h2>
            <p className='text-muted-foreground'>管理积分规则和用户积分</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建规则
          </Button>
        </div>

        <PointsTable
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
            <DialogTitle>{editingRule ? '编辑积分规则' : '新建积分规则'}</DialogTitle>
            <DialogDescription>
              积分值（points）和比例（pointsRate）二选一填写即可
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>规则名称 *</Label>
                  <Input id='name' name='name' defaultValue={editingRule?.name} required />
                </div>
                <div>
                  <Label htmlFor='code'>规则代码 *</Label>
                  <Input id='code' name='code' defaultValue={editingRule?.code} required />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='points'>固定积分（points）</Label>
                  <Input id='points' name='points' type='number' defaultValue={editingRule?.points ?? ''} />
                </div>
                <div>
                  <Label htmlFor='pointsRate'>比例（pointsRate）</Label>
                  <Input id='pointsRate' name='pointsRate' type='number' defaultValue={editingRule?.pointsRate ?? ''} />
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

              <div>
                <Label htmlFor='conditions'>条件（JSON，可选）</Label>
                <Textarea
                  id='conditions'
                  name='conditions'
                  placeholder='例如：{"minAmount":100}'
                  defaultValue={editingRule?.conditions ? JSON.stringify(editingRule.conditions, null, 2) : ''}
                  rows={6}
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
              <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
                {editingRule ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
