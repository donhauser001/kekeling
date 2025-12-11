import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react'
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
import { campaignApi, type Campaign } from '@/lib/api'

export function Campaigns() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [status, setStatus] = useState<string>('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, pageSize, status],
    queryFn: () => campaignApi.getCampaigns({ page, pageSize, status: status || undefined }),
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

  return (
    <>
      <Header>
        <TopNav links={[]} />
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
            <h1 className='text-2xl font-bold tracking-tight'>活动管理</h1>
            <p className='text-muted-foreground'>管理营销活动和秒杀商品</p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            新建活动
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>活动列表</CardTitle>
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
                  进行中
                </Button>
                <Button
                  variant={status === 'ended' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatus('ended')}
                >
                  已结束
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
                      <TableHead>活动名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>优惠</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>参与人数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className='text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className='font-medium'>{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {campaign.type === 'flash_sale'
                              ? '限时特惠'
                              : campaign.type === 'seckill'
                                ? '秒杀'
                                : campaign.type === 'threshold'
                                  ? '满减'
                                  : '新人专享'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.discountType === 'amount'
                            ? `减¥${campaign.discountValue}`
                            : `${campaign.discountValue}%`}
                        </TableCell>
                        <TableCell>
                          {new Date(campaign.startAt).toLocaleDateString()} -{' '}
                          {new Date(campaign.endAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{campaign.participationCount || 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === 'active'
                                ? 'default'
                                : campaign.status === 'ended'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {campaign.status === 'active'
                              ? '进行中'
                              : campaign.status === 'ended'
                                ? '已结束'
                                : campaign.status === 'pending'
                                  ? '未开始'
                                  : '已取消'}
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
                              onClick={() => handleDelete(campaign.id)}
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

