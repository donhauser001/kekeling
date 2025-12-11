import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
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
import { referralApi, type ReferralRecord } from '@/lib/api'

export function Referrals() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['referral-records', page, pageSize],
    queryFn: () => referralApi.getRecords({ page, pageSize }),
  })

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
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>邀请奖励管理</h1>
          <p className='text-muted-foreground'>管理邀请规则和邀请记录</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>邀请记录列表</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-muted-foreground'>加载中...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邀请人</TableHead>
                      <TableHead>被邀请人</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.inviter?.nickname || record.inviterId}</TableCell>
                        <TableCell>
                          {record.invitee?.nickname || record.inviteeId || '未注册'}
                        </TableCell>
                        <TableCell>
                          {record.type === 'user' ? '用户邀请' : '就诊人邀请'}
                        </TableCell>
                        <TableCell>
                          {record.status === 'pending'
                            ? '待注册'
                            : record.status === 'registered'
                              ? '已注册'
                              : record.status === 'rewarded'
                                ? '已奖励'
                                : '无效'}
                        </TableCell>
                        <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
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

