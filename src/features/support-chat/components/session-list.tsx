import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageSquare, User, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ChatSession, ChatSessionStatus } from '../types'

interface SessionListProps {
    sessions: ChatSession[]
    selectedId?: string
    onSelect: (session: ChatSession) => void
    statusFilter: ChatSessionStatus | 'all'
    onStatusFilterChange: (status: ChatSessionStatus | 'all') => void
    className?: string
}

const statusConfig: Record<ChatSessionStatus, { label: string; color: string }> = {
    waiting: { label: '排队中', color: 'bg-orange-500' },
    chatting: { label: '进行中', color: 'bg-green-500' },
    closed: { label: '已结束', color: 'bg-gray-400' },
}

export function SessionList({
    sessions,
    selectedId,
    onSelect,
    statusFilter,
    onStatusFilterChange,
    className,
}: SessionListProps) {
    // 计算各状态数量
    const statusCounts = useMemo(() => {
        return sessions.reduce(
            (acc, session) => {
                acc[session.status] = (acc[session.status] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )
    }, [sessions])

    // 过滤会话
    const filteredSessions = useMemo(() => {
        if (statusFilter === 'all') return sessions
        return sessions.filter((s) => s.status === statusFilter)
    }, [sessions, statusFilter])

    // 排序：等待中优先，然后按更新时间
    const sortedSessions = useMemo(() => {
        return [...filteredSessions].sort((a, b) => {
            // 等待中的排前面
            if (a.status === 'waiting' && b.status !== 'waiting') return -1
            if (a.status !== 'waiting' && b.status === 'waiting') return 1
            // 按更新时间倒序
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
    }, [filteredSessions])

    return (
        <div className={cn('flex flex-col', className)} style={{ height: '100%', overflow: 'hidden' }}>
            {/* 状态筛选 */}
            <div className="px-3 py-2.5 border-b shrink-0 bg-muted/30">
                <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
                    <TabsList className="grid w-full grid-cols-4 h-8">
                        <TabsTrigger value="all" className="text-xs h-7">
                            全部 ({sessions.length})
                        </TabsTrigger>
                        <TabsTrigger value="waiting" className="text-xs h-7">
                            排队 ({statusCounts.waiting || 0})
                        </TabsTrigger>
                        <TabsTrigger value="chatting" className="text-xs h-7">
                            进行 ({statusCounts.chatting || 0})
                        </TabsTrigger>
                        <TabsTrigger value="closed" className="text-xs h-7">
                            结束 ({statusCounts.closed || 0})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* 会话列表 */}
            <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
                {sortedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-sm">暂无会话</p>
                    </div>
                ) : (
                    <div>
                        {sortedSessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                session={session}
                                isSelected={session.id === selectedId}
                                onClick={() => onSelect(session)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface SessionItemProps {
    session: ChatSession
    isSelected: boolean
    onClick: () => void
}

function SessionItem({ session, isSelected, onClick }: SessionItemProps) {
    const { status, user, messages, updatedAt } = session
    const lastMessage = messages?.[messages.length - 1]
    const config = statusConfig[status]

    // 计算未读消息数（简化版：管理员未读的用户消息）
    const unreadCount = messages?.filter((m) => m.senderType === 'user' && !m.isRead).length || 0

    return (
        <div
            className={cn(
                'flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-accent/50 border-b',
                isSelected && 'bg-accent'
            )}
            onClick={onClick}
        >
            {/* 头像 */}
            <div className="relative shrink-0 mt-0.5">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
                {/* 第一行：名字 + 状态 + 时间 */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">
                            {user?.nickname || user?.phone || '未知用户'}
                        </span>
                        <Badge
                            variant={status === 'waiting' ? 'destructive' : status === 'chatting' ? 'default' : 'secondary'}
                            className="text-xs h-5 shrink-0"
                        >
                            {config.label}
                        </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(updatedAt), {
                            addSuffix: true,
                            locale: zhCN,
                        })}
                    </span>
                </div>

                {/* 第二行：最后消息 + 未读数 */}
                <div className="flex items-center gap-2 mt-1.5">
                    {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate flex-1">
                            {lastMessage.senderType === 'admin' && (
                                <span className="text-primary">[客服] </span>
                            )}
                            {lastMessage.senderType === 'system' && (
                                <span className="text-green-600">[系统] </span>
                            )}
                            {lastMessage.type === 'image' ? '[图片]' : lastMessage.content}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground truncate flex-1">
                            暂无消息
                        </p>
                    )}

                    {/* 未读数量 */}
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </div>

                {/* 第三行：评分/来源标签 */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* 评分显示（已结束的会话） */}
                    {status === 'closed' && session.rating && (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'h-3 w-3',
                                        star <= session.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* 来源标签 */}
                    {session.source === 'order_detail' && session.order && (
                        <Badge variant="outline" className="text-xs h-5">
                            订单咨询
                        </Badge>
                    )}
                    {session.source === 'service_detail' && session.service && (
                        <Badge variant="outline" className="text-xs h-5">
                            服务咨询
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    )
}
