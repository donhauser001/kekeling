import { createFileRoute } from '@tanstack/react-router'
import { SupportChat } from '@/features/support-chat'

export const Route = createFileRoute('/_authenticated/support/chat')({
  component: SupportChatPage,
})

function SupportChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">在线客服</h1>
        <p className="text-muted-foreground">
          实时处理用户咨询，提供即时服务支持
        </p>
      </div>
      <SupportChat />
    </div>
  )
}
