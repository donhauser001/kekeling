import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react'
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
import { SimplePagination } from '@/components/simple-pagination'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { couponApi, type CouponTemplate } from '@/lib/api'

const topNav = [
  { title: '优惠券模板', url: '/marketing/coupons' },
  { title: '发放规则', url: '/marketing/coupons/rules' },
  { title: '用户优惠券', url: '/marketing/coupons/users' },
]

export function Coupons() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [status, setStatus] = useState<string>('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['coupon-templates', page, pageSize, status],
    queryFn: () => couponApi.getTemplates({ page, pageSize, status: status || undefined }),
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
            <h1 className='text-2xl font-bold tracking-tight'>优惠券管理</h1>
            <p className='text-muted-foreground'>管理优惠券模板和发放规则</p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            新建模板
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>优惠券模板列表</CardTitle>
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
                      <TableHead>名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>面值</TableHead>
                      <TableHead>适用范围</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className='font-medium'>{template.name}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {template.type === 'amount' ? '满减' : template.type === 'percent' ? '折扣' : '免费'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.type === 'amount'
                            ? `¥${template.value}`
                            : template.type === 'percent'
                              ? `${template.value}%`
                              : '免费'}
                        </TableCell>
                        <TableCell>
                          {template.applicableScope === 'all'
                            ? '全场'
                            : template.applicableScope === 'category'
                              ? '分类'
                              : '服务'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={template.status === 'active' ? 'default' : 'secondary'}
                          >
                            {template.status === 'active' ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDelete(template.id)}
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
      </Main>
    </>
  )
}

