import { createFileRoute } from '@tanstack/react-router'
import { QuickReplyManagement } from '@/features/support-chat/quick-replies'

export const Route = createFileRoute('/_authenticated/support/quick-replies')({
  component: QuickRepliesPage,
})

function QuickRepliesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">快捷回复管理</h1>
        <p className="text-muted-foreground">
          配置客服常用的快捷回复，提高服务效率
        </p>
      </div>
      <QuickReplyManagement />
    </div>
  )
}
