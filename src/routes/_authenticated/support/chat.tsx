import { createFileRoute } from '@tanstack/react-router'
import { SupportChat } from '@/features/support-chat'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export const Route = createFileRoute('/_authenticated/support/chat')({
  component: SupportChatPage,
})

function SupportChatPage() {
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed className='flex flex-col gap-4'>
        <div className="shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">在线客服</h1>
          <p className="text-muted-foreground">
            实时处理用户咨询，提供即时服务支持
          </p>
        </div>
        <SupportChat />
      </Main>
    </>
  )
}
