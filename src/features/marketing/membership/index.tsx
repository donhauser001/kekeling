import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { SimplePagination } from '@/components/simple-pagination'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { membershipApi, type MembershipLevel } from '@/lib/api'

const topNav = [
  { title: '会员等级', url: '/marketing/membership' },
  { title: '会员方案', url: '/marketing/membership/plans' },
  { title: '用户会员', url: '/marketing/membership/users' },
]

export function Membership() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [status, setStatus] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<MembershipLevel | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['membership-levels', page, pageSize, status],
    queryFn: () => membershipApi.getLevels({ page, pageSize, status: status || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => membershipApi.createLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
      setDialogOpen(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      membershipApi.updateLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
      setDialogOpen(false)
      setEditingLevel(null)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membershipApi.deleteLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleCreate = () => {
    setEditingLevel(null)
    setDialogOpen(true)
  }

  const handleEdit = (level: MembershipLevel) => {
    setEditingLevel(level)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个会员等级吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      level: Number(formData.get('level')),
      discount: Number(formData.get('discount')),
      price: Number(formData.get('price')),
      duration: Number(formData.get('duration')),
      bonusDays: Number(formData.get('bonusDays') || 0),
      description: formData.get('description') as string,
      benefits: (formData.get('benefits') as string)?.split('\n').filter(Boolean) || [],
      status: (formData.get('status') as string) || 'active',
    }

    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>会员等级管理</h1>
            <p className='text-muted-foreground'>管理会员等级和权益配置</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建等级
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>会员等级列表</CardTitle>
              <div className='flex gap-2'>
                <Button
                  variant={status === '' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatus('')}
                >
                  全部
                </Button>
                <Button
                  variant={status === 'active' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatus('active')}
                >
                  启用
                </Button>
                <Button
                  variant={status === 'inactive' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatus('inactive')}
                >
                  禁用
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-muted-foreground'>加载中...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>等级名称</TableHead>
                      <TableHead>等级</TableHead>
                      <TableHead>折扣</TableHead>
                      <TableHead>价格</TableHead>
                      <TableHead>时长</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className='font-medium'>{level.name}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>Lv.{level.level}</Badge>
                        </TableCell>
                        <TableCell>{level.discount}%</TableCell>
                        <TableCell>¥{level.price}</TableCell>
                        <TableCell>{level.duration}天</TableCell>
                        <TableCell>
                          <Badge
                            variant={level.status === 'active' ? 'default' : 'secondary'}
                          >
                            {level.status === 'active' ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEdit(level)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDelete(level.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data && data.total > 0 && (
                  <div className='mt-4'>
                    <SimplePagination
                      page={page}
                      pageSize={pageSize}
                      total={data.total}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>{editingLevel ? '编辑会员等级' : '新建会员等级'}</DialogTitle>
              <DialogDescription>
                {editingLevel ? '修改会员等级信息' : '创建一个新的会员等级'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='name'>等级名称 *</Label>
                    <Input
                      id='name'
                      name='name'
                      defaultValue={editingLevel?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='level'>等级 *</Label>
                    <Input
                      id='level'
                      name='level'
                      type='number'
                      defaultValue={editingLevel?.level}
                      required
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='discount'>折扣 (%) *</Label>
                    <Input
                      id='discount'
                      name='discount'
                      type='number'
                      defaultValue={editingLevel?.discount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='price'>价格 (元) *</Label>
                    <Input
                      id='price'
                      name='price'
                      type='number'
                      defaultValue={editingLevel?.price}
                      required
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='duration'>时长 (天) *</Label>
                    <Input
                      id='duration'
                      name='duration'
                      type='number'
                      defaultValue={editingLevel?.duration}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='bonusDays'>赠送天数</Label>
                    <Input
                      id='bonusDays'
                      name='bonusDays'
                      type='number'
                      defaultValue={editingLevel?.bonusDays || 0}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='description'>描述</Label>
                  <Textarea
                    id='description'
                    name='description'
                    defaultValue={editingLevel?.description || ''}
                  />
                </div>
                <div>
                  <Label htmlFor='benefits'>权益（每行一个）</Label>
                  <Textarea
                    id='benefits'
                    name='benefits'
                    defaultValue={editingLevel?.benefits?.join('\n') || ''}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor='status'>状态</Label>
                  <select
                    id='status'
                    name='status'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    defaultValue={editingLevel?.status || 'active'}
                  >
                    <option value='active'>启用</option>
                    <option value='inactive'>禁用</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingLevel ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}

