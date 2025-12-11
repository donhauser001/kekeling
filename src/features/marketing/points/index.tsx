import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { pointApi, type PointRule } from '@/lib/api'

const topNav = [
  { title: '积分规则', url: '/marketing/points' },
  { title: '用户积分', url: '/marketing/points/users' },
  { title: '积分记录', url: '/marketing/points/records' },
]

export function Points() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['point-rules', page, pageSize],
    queryFn: () => pointApi.getRules({ page, pageSize }),
  })

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
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>积分管理</h1>
          <p className='text-muted-foreground'>管理积分规则和用户积分</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>积分规则列表</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-muted-foreground'>加载中...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>规则名称</TableHead>
                      <TableHead>规则代码</TableHead>
                      <TableHead>积分值</TableHead>
                      <TableHead>每日上限</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className='font-medium'>{rule.name}</TableCell>
                        <TableCell>{rule.code}</TableCell>
                        <TableCell>
                          {rule.points ? `${rule.points} 积分` : `${rule.pointsRate} 比例`}
                        </TableCell>
                        <TableCell>{rule.dailyLimit || '无限制'}</TableCell>
                        <TableCell>
                          {rule.status === 'active' ? '启用' : '禁用'}
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

