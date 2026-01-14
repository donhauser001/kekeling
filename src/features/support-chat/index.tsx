import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Users,
  Clock,
  Star,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SessionList } from './components/session-list'
import { ChatWindow } from './components/chat-window'
import { useChatSocket } from './hooks/use-chat-socket'
import { chatApi, quickReplyApi } from './api'
import type {
  ChatSession,
  ChatMessage,
  QuickReply,
  ChatSessionStatus,
  MessageType,
  ChatStats,
} from './types'

export function SupportChat() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 状态
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [statusFilter, setStatusFilter] = useState<ChatSessionStatus | 'all'>('all')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isUserTyping, setIsUserTyping] = useState(false)

  // 获取会话列表
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions', statusFilter],
    queryFn: () => chatApi.getSessions({
      status: statusFilter === 'all' ? undefined : statusFilter,
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
        toast({
          title: '会话已结束',
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
    <div className="flex flex-col h-full">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="排队中"
          value={stats?.waiting || 0}
          icon={<Clock className="h-4 w-4" />}
          trend={stats?.waiting && stats.waiting > 0 ? 'up' : undefined}
        />
        <StatsCard
          title="进行中"
          value={stats?.chatting || 0}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatsCard
          title="今日完成"
          value={stats?.todayClosed || 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="平均评分"
          value={stats?.avgRating?.toFixed(1) || '-'}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* 连接状态 */}
      <div className="flex items-center gap-2 mb-4">
        {socket.isConnected ? (
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3 w-3 text-green-500" />
            已连接
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            未连接
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetchSessions()}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          刷新
        </Button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 会话列表 */}
        <Card className="col-span-4 flex flex-col overflow-hidden">
          <SessionList
            sessions={sessions}
            selectedId={selectedSession?.id}
            onSelect={(session) => setSelectedSession(session)}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            className="flex-1"
          />
        </Card>

        {/* 聊天窗口 */}
        <Card className="col-span-8 flex flex-col overflow-hidden">
          <ChatWindow
            session={selectedSession}
            messages={messages}
            quickReplies={quickReplies}
            isTyping={isUserTyping}
            onSendMessage={handleSendMessage}
            onAcceptSession={handleAcceptSession}
            onCloseSession={handleCloseSession}
            onTyping={handleTyping}
            onMarkRead={handleMarkRead}
            onUseQuickReply={handleUseQuickReply}
            className="flex-1"
          />
        </Card>
      </div>
    </div>
  )
}

// 统计卡片组件
function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: 'up' | 'down'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend === 'up' && (
            <Badge variant="destructive" className="text-xs">
              需处理
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SupportChat
