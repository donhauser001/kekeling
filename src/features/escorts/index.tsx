import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useEscorts } from '@/hooks/use-api'
import { EscortsDialogs } from './components/escorts-dialogs'
import { EscortsPrimaryButtons } from './components/escorts-primary-buttons'
import { EscortsProvider } from './components/escorts-provider'
import { EscortsTable } from './components/escorts-table'

const route = getRouteApi('/_authenticated/escorts/')

// 映射陪诊员等级
const levelMap: Record<string, 'senior' | 'intermediate' | 'junior' | 'trainee'> = {
  'senior': 'senior',
  'intermediate': 'intermediate',
  'junior': 'junior',
  'trainee': 'trainee',
  '资深': 'senior',
  '高级': 'senior',
  '中级': 'intermediate',
  '初级': 'junior',
  '实习': 'trainee',
}

export function Escorts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // 从 API 获取数据
  const { data: escortsData, isLoading } = useEscorts({
    page: 1,
    pageSize: 100,
  })

  // 转换陪诊员数据格式以匹配现有表格
  const escorts = (escortsData?.data ?? []).map(escort => ({
    id: escort.id,
    firstName: escort.name.slice(0, 1),
    lastName: escort.name.slice(1),
    username: escort.phone,
    email: `${escort.phone}@kekeling.com`,
    phoneNumber: escort.phone,
    status: escort.status as 'active' | 'inactive' | 'pending' | 'suspended',
    category: levelMap[escort.level] ?? 'junior',
    consultCount: escort.serviceCount,
    satisfaction: escort.rating, // 数据库已是百分制
    createdAt: new Date(escort.createdAt),
    updatedAt: new Date(escort.updatedAt),
  }))

  return (
    <EscortsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>陪诊员列表</h2>
            <p className='text-muted-foreground'>
              在这里管理陪诊员和他们的分类
            </p>
          </div>
          <EscortsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-3'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ) : (
          <EscortsTable data={escorts} search={search} navigate={navigate} />
        )}
      </Main>

      <EscortsDialogs />
    </EscortsProvider>
  )
}
