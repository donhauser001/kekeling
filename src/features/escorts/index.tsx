import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EscortsDialogs } from './components/escorts-dialogs'
import { EscortsPrimaryButtons } from './components/escorts-primary-buttons'
import { EscortsProvider } from './components/escorts-provider'
import { EscortsTable } from './components/escorts-table'
import { escorts } from './data/escorts'

const route = getRouteApi('/_authenticated/escorts/')

export function Escorts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

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
        <EscortsTable data={escorts} search={search} navigate={navigate} />
      </Main>

      <EscortsDialogs />
    </EscortsProvider>
  )
}
