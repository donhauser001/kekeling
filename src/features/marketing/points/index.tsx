import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle, ShoppingBag, UserPlus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { referralApi } from '@/lib/api'
import { CheckinSettings } from './components/checkin-settings'
import { TaskSettings } from './components/task-settings'
import { OrderPointsSettings } from './components/order-points-settings'
import { ReferralSettings } from './components/referral-settings'
import { ReferralRecordsTable } from '../referrals/components/referral-records-table'

const topNav = [
  { title: '积分与奖励', href: '/marketing/points', isActive: true },
]

export function Points() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [showRecords, setShowRecords] = useState(false)

  // 邀请记录分页
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsPageSize, setRecordsPageSize] = useState(10)

  // 邀请记录数据
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['referral-records', recordsPage, recordsPageSize],
    queryFn: () => referralApi.getRecords({ page: recordsPage, pageSize: recordsPageSize }),
    enabled: activeTab === 'referral' && showRecords,
  })

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
            <h2 className='text-2xl font-bold tracking-tight'>积分与奖励</h2>
            <p className='text-muted-foreground'>配置积分获取规则和邀请奖励</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowRecords(false) }} className='flex flex-1 flex-col'>
          <TabsList className='w-fit'>
            <TabsTrigger value='checkin' className='gap-2'>
              <Calendar className='h-4 w-4' />
              签到设置
            </TabsTrigger>
            <TabsTrigger value='task' className='gap-2'>
              <CheckCircle className='h-4 w-4' />
              任务奖励
            </TabsTrigger>
            <TabsTrigger value='order' className='gap-2'>
              <ShoppingBag className='h-4 w-4' />
              订单积分
            </TabsTrigger>
            <TabsTrigger value='referral' className='gap-2'>
              <UserPlus className='h-4 w-4' />
              邀请奖励
            </TabsTrigger>
          </TabsList>

          <TabsContent value='checkin' className='flex flex-1 flex-col mt-6'>
            <CheckinSettings />
          </TabsContent>

          <TabsContent value='task' className='flex flex-1 flex-col mt-6'>
            <TaskSettings />
          </TabsContent>

          <TabsContent value='order' className='flex flex-1 flex-col mt-6'>
            <OrderPointsSettings />
          </TabsContent>

          <TabsContent value='referral' className='flex flex-1 flex-col mt-6'>
            {!showRecords ? (
              <ReferralSettings onShowRecords={() => setShowRecords(true)} />
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>邀请记录</h3>
                  <button
                    onClick={() => setShowRecords(false)}
                    className='text-sm text-muted-foreground hover:text-foreground'
                  >
                    ← 返回设置
                  </button>
                </div>
                <ReferralRecordsTable
                  data={recordsData?.data ?? []}
                  total={recordsData?.total ?? 0}
                  page={recordsPage}
                  pageSize={recordsPageSize}
                  onPageChange={setRecordsPage}
                  onPageSizeChange={setRecordsPageSize}
                  isLoading={recordsLoading}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
