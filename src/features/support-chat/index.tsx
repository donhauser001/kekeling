import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MessageSquare,
  Users,
  Clock,
  Star,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SessionList } from './components/session-list'
import { ChatWindow } from './components/chat-window'
import { useChatSocket } from './hooks/use-chat-socket'
import { chatApi, quickReplyApi } from './api'
import { configApi } from '@/lib/api/config'
import {
  type ChatSession,
  type ChatMessage,
  type QuickReply,
  type ChatSessionStatus,
  MessageType,
  SenderType,
} from './types'

export function SupportChat() {
  const { toast } = useToast()

  // 状态
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [statusFilter, setStatusFilter] = useState<ChatSessionStatus | 'all'>('all')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isUserTyping, setIsUserTyping] = useState(false)

  // 获取会话列表（始终获取所有会话，筛选在前端进行）
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions({
      pageSize: 100,
    }),
    refetchInterval: 10000, // 10秒刷新一次
  })

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['chat-stats'],
    queryFn: chatApi.getStats,
    refetchInterval: 30000,
  })

  // 获取快捷回复
  const { data: quickReplies = [] } = useQuery({
    queryKey: ['quick-replies-active'],
    queryFn: quickReplyApi.getActive,
  })

  // 获取品牌设置（用于客服头像）
  const { data: themeSettings } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: configApi.getThemeSettings,
  })

  // 客服头像：使用 footerLogo，与小程序保持一致
  const csAvatarUrl = themeSettings?.footerLogo || themeSettings?.headerLogo || ''

  // WebSocket 连接
  const socket = useChatSocket({
    onNewMessage: (data) => {
      // 更新消息列表
      if (selectedSession && data.message.sessionId === selectedSession.id) {
        setMessages((prev) => [...prev, data.message])
      }
      // 刷新会话列表
      refetchSessions()
    },
    onNewSession: () => {
      refetchSessions()
      toast({
        title: '新会话',
        description: '有新的用户会话等待接入',
      })
    },
    onSessionAccepted: (data) => {
      if (selectedSession?.id === data.session.id) {
        setSelectedSession(data.session)
      }
      refetchSessions()
    },
    onSessionClosed: (data) => {
      if (selectedSession?.id === data.sessionId) {
        setSelectedSession((prev) =>
          prev ? { ...prev, status: 'closed' as ChatSessionStatus } : null
        )
      }
      refetchSessions()
    },
    onUserTyping: (data) => {
      if (selectedSession?.id === data.sessionId) {
        setIsUserTyping(true)
        setTimeout(() => setIsUserTyping(false), 3000)
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '连接错误',
        description: error.message || '与服务器的连接出现问题',
      })
    },
  })

  // 选择会话时加载消息
  useEffect(() => {
    if (selectedSession) {
      chatApi.getSession(selectedSession.id, 100).then((session) => {
        setMessages(session.messages || [])
        socket.joinSession(selectedSession.id)
        socket.markAsRead(selectedSession.id)
      })
    }

    return () => {
      if (selectedSession) {
        socket.leaveSession(selectedSession.id)
      }
    }
  }, [selectedSession?.id])

  // 发送消息
  const handleSendMessage = useCallback(
    async (content: string, type: MessageType = 'text' as MessageType) => {
      if (!selectedSession) return

      const result = await socket.sendMessage(selectedSession.id, type, content)
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: '发送失败',
          description: result.error,
        })
      }
    },
    [selectedSession, socket, toast]
  )

  // 接入会话
  const handleAcceptSession = useCallback(async () => {
    if (!selectedSession) return

    const result = await socket.acceptSession(selectedSession.id)
    if (result.success && result.session) {
      setSelectedSession(result.session)
      toast({
        title: '接入成功',
        description: '您已成功接入该会话',
      })
    } else {
      toast({
        variant: 'destructive',
        title: '接入失败',
        description: result.error,
      })
    }
  }, [selectedSession, socket, toast])

  // 关闭会话
  const handleCloseSession = useCallback(
    async (reason?: string) => {
      if (!selectedSession) return

      const result = await socket.closeSession(selectedSession.id, reason)
      if (result.success) {
        // 立即更新当前会话状态为已结束
        setSelectedSession((prev) =>
          prev ? { ...prev, status: 'closed' as ChatSessionStatus } : null
        )
        // 添加系统消息到消息列表
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            sessionId: selectedSession.id,
            type: MessageType.TEXT,
            content: '会话已结束，感谢您的咨询',
            senderType: SenderType.SYSTEM,
            isRead: true,
            createdAt: new Date().toISOString(),
          },
        ])
        toast({
          title: '会话已结束',
          description: '用户将收到会话结束通知',
        })
        refetchSessions()
      } else {
        toast({
          variant: 'destructive',
          title: '操作失败',
          description: result.error,
        })
      }
    },
    [selectedSession, socket, toast, refetchSessions]
  )

  // 正在输入
  const handleTyping = useCallback(() => {
    if (selectedSession) {
      socket.sendTyping(selectedSession.id)
    }
  }, [selectedSession, socket])

  // 标记已读
  const handleMarkRead = useCallback(() => {
    if (selectedSession) {
      socket.markAsRead(selectedSession.id)
    }
  }, [selectedSession, socket])

  // 使用快捷回复
  const handleUseQuickReply = useCallback(
    (reply: QuickReply) => {
      quickReplyApi.recordUse(reply.id)
    },
    []
  )

  const sessions = sessionsData?.items || []

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 顶部工具栏：统计 + 连接状态 */}
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        {/* 统计信息 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">排队</span>
            <span className="font-semibold">{stats?.waiting || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">进行中</span>
            <span className="font-semibold">{stats?.chatting || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">今日完成</span>
            <span className="font-semibold">{stats?.todayClosed || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">评分</span>
            <span className="font-semibold">{stats?.avgRating?.toFixed(1) || '-'}</span>
          </div>
        </div>

        {/* 连接状态 */}
        <div className="flex items-center gap-2">
          {socket.isConnected ? (
            <Badge variant="outline" className="gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-green-500" />
              已连接
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5">
              <WifiOff className="h-3.5 w-3.5" />
              未连接
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchSessions()}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            刷新
          </Button>
        </div>
      </div>

      {/* 主内容区 - 使用 flex-1 自动填充剩余空间 */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* 会话列表 */}
        <Card className="col-span-4 overflow-hidden flex flex-col !p-0">
          <SessionList
            sessions={sessions}
            selectedId={selectedSession?.id}
            onSelect={(session) => setSelectedSession(session)}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            className="h-full"
          />
        </Card>

        {/* 聊天窗口 */}
        <Card className="col-span-8 overflow-hidden flex flex-col !p-0">
          <ChatWindow
            session={selectedSession}
            messages={messages}
            quickReplies={quickReplies}
            isTyping={isUserTyping}
            csAvatarUrl={csAvatarUrl}
            onSendMessage={handleSendMessage}
            onAcceptSession={handleAcceptSession}
            onCloseSession={handleCloseSession}
            onTyping={handleTyping}
            onMarkRead={handleMarkRead}
            onUseQuickReply={handleUseQuickReply}
            className="h-full"
          />
        </Card>
      </div>
    </div>
  )
}

export default SupportChat
