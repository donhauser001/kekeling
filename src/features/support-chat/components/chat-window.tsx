import { useState, useRef, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
    Send,
    Image as ImageIcon,
    MoreVertical,
    Phone,
    MessageSquare,
    X,
    Zap,
    ShoppingBag,
    Check,
    CheckCheck,
    Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'
import type { ChatSession, ChatMessage, QuickReply, MessageType, ChatUser, ChatAdmin } from '../types'

interface ChatWindowProps {
    session: ChatSession | null
    messages: ChatMessage[]
    quickReplies: QuickReply[]
    isTyping?: boolean
    csAvatarUrl?: string  // 客服头像（从品牌设置获取）
    onSendMessage: (content: string, type?: MessageType) => void
    onAcceptSession: () => void
    onCloseSession: (reason?: string) => void
    onTransferSession?: (targetAdminId: string) => void
    onTyping: () => void
    onMarkRead: () => void
    onUseQuickReply: (reply: QuickReply) => void
    className?: string
}

export function ChatWindow({
    session,
    messages,
    quickReplies,
    isTyping,
    csAvatarUrl,
    onSendMessage,
    onAcceptSession,
    onCloseSession,
    onTransferSession,
    onTyping,
    onMarkRead,
    onUseQuickReply,
    className,
}: ChatWindowProps) {
    const accessToken = useAuthStore((state) => state.auth.accessToken)
    const [inputValue, setInputValue] = useState('')
    const [showQuickReplies, setShowQuickReplies] = useState(false)
    const [closeDialogOpen, setCloseDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 滚动到底部
    const scrollToBottom = useCallback((smooth = true) => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'instant',
            })
        }
        // 备用方案
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
    }, [])

    // 新消息时滚动到底部
    useEffect(() => {
        // 使用 setTimeout 确保 DOM 更新完成后再滚动
        const timer = setTimeout(() => {
            scrollToBottom(false)
        }, 50)
        return () => clearTimeout(timer)
    }, [messages, scrollToBottom])

    // 会话切换时滚动到底部
    useEffect(() => {
        if (session) {
            const timer = setTimeout(() => {
                scrollToBottom(false)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [session?.id, scrollToBottom])

    // 发送消息
    const handleSend = () => {
        if (!inputValue.trim() || !session || session.status === 'closed') return
        onSendMessage(inputValue.trim())
        setInputValue('')
        inputRef.current?.focus()
    }

    // 处理图片上传
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !session || session.status !== 'chatting') return

        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            alert('只支持 JPG、PNG、GIF、WebP 格式的图片')
            return
        }

        // 检查文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过 5MB')
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'common')

            // 使用相对路径，让 Nginx 代理处理
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            })

            const result = await response.json()

            // 后端返回格式: {code: 0, message: 'success', data: {...}}
            if ((result.code === 0 || result.success) && result.data?.url) {
                // 发送图片消息
                const imageUrl = result.data.url.startsWith('http')
                    ? result.data.url
                    : `${window.location.origin}${result.data.url}`
                onSendMessage(imageUrl, 'image' as any)
            } else {
                alert(result.message || '图片上传失败')
            }
        } catch (error) {
            console.error('[Upload] Error:', error)
            alert('图片上传失败，请重试')
        } finally {
            setIsUploading(false)
            // 清空文件输入
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // 键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // 输入时触发 typing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
        onTyping()
    }

    // 使用快捷回复
    const handleQuickReply = (reply: QuickReply) => {
        setInputValue(reply.content)
        setShowQuickReplies(false)
        onUseQuickReply(reply)
        inputRef.current?.focus()
    }

    // 无选中会话
    if (!session) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center h-full text-muted-foreground',
                    className
                )}
            >
                <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg">选择一个会话开始聊天</p>
                <p className="text-sm mt-2">从左侧列表选择用户会话</p>
            </div>
        )
    }

    const isWaiting = session.status === 'waiting'
    const isClosed = session.status === 'closed'

    return (
        <div className={cn('flex flex-col', className)} style={{ height: '100%', overflow: 'hidden' }}>
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.avatar} />
                        <AvatarFallback className="text-sm">
                            {session.user?.nickname?.slice(0, 1) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">
                                {session.user?.nickname || session.user?.phone || '未知用户'}
                            </span>
                            <Badge
                                variant={
                                    session.status === 'waiting'
                                        ? 'destructive'
                                        : session.status === 'chatting'
                                            ? 'default'
                                            : 'secondary'
                                }
                                className="h-5 text-xs"
                            >
                                {session.status === 'waiting'
                                    ? '排队中'
                                    : session.status === 'chatting'
                                        ? '进行中'
                                        : '已结束'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>会话编号: {session.sessionNo}</span>
                            {session.user?.phone && (
                                <>
                                    <span>·</span>
                                    <Phone className="h-3 w-3" />
                                    <span>{session.user.phone}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* 接入按钮 */}
                    {isWaiting && (
                        <Button size="sm" onClick={onAcceptSession}>接入会话</Button>
                    )}

                    {/* 操作菜单 */}
                    {!isClosed && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[120px]">
                                {onTransferSession && (
                                    <DropdownMenuItem>
                                        转接会话
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setCloseDialogOpen(true)}
                                >
                                    结束会话
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* 上下文信息 */}
            {(session.order || session.service) && (
                <div className="px-4 py-2 border-b bg-blue-50/50 dark:bg-blue-950/20 shrink-0">
                    {session.order && (
                        <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">咨询订单:</span>
                            <Badge variant="outline">{session.order.orderNo}</Badge>
                            <span className="text-muted-foreground truncate">
                                {session.order.service?.name}
                            </span>
                        </div>
                    )}
                    {session.service && !session.order && (
                        <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">咨询服务:</span>
                            <span className="font-medium">{session.service.name}</span>
                            <span className="text-muted-foreground">
                                ¥{session.service.price}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* 消息区域 - 使用原生滚动条 */}
            <div
                ref={scrollAreaRef}
                className="p-4"
                style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}
                onScroll={onMarkRead}
            >
                <div className="space-y-4">
                    {messages.map((message, index) => {
                        // 日期分隔
                        const showDateSeparator =
                            index === 0 ||
                            new Date(message.createdAt).toDateString() !==
                            new Date(messages[index - 1].createdAt).toDateString()

                        return (
                            <div key={message.id}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                                            {format(new Date(message.createdAt), 'yyyy年M月d日', {
                                                locale: zhCN,
                                            })}
                                        </span>
                                    </div>
                                )}
                                <MessageBubble
                                    message={message}
                                    user={session?.user}
                                    admin={session?.admin}
                                    csAvatarUrl={csAvatarUrl}
                                />
                            </div>
                        )
                    })}

                    {/* 正在输入提示 */}
                    {isTyping && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex gap-1">
                                <span className="animate-bounce">·</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                            </div>
                            <span>对方正在输入</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* 输入区域 */}
            <div className="border-t bg-card shrink-0">
                {/* 快捷回复面板 */}
                {showQuickReplies && (
                    <div className="border-b px-4 py-3 max-h-40 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">快捷回复</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setShowQuickReplies(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {quickReplies.map((reply) => (
                                <Button
                                    key={reply.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickReply(reply)}
                                >
                                    {reply.title}
                                </Button>
                            ))}
                            {quickReplies.length === 0 && (
                                <p className="text-sm text-muted-foreground">暂无快捷回复</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 输入框 */}
                <div className="px-4 py-3">
                    {isClosed ? (
                        <div className="py-2">
                            <div className="text-center text-sm text-muted-foreground mb-2">
                                会话已结束
                            </div>
                            {/* 显示用户评价 */}
                            {session.rating && (
                                <div className="flex flex-col items-center gap-1.5 p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-muted-foreground mr-1">用户评价:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    'h-4 w-4',
                                                    star <= session.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                                )}
                                            />
                                        ))}
                                        <span className="text-sm text-muted-foreground ml-1">
                                            ({session.rating}分)
                                        </span>
                                    </div>
                                    {session.ratingContent && (
                                        <p className="text-sm text-muted-foreground text-center">
                                            "{session.ratingContent}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : isWaiting ? (
                        <div className="text-center text-sm text-muted-foreground py-2">
                            请先接入会话
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* 隐藏的文件输入 */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleImageUpload}
                            />

                            {/* 工具按钮 */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowQuickReplies(!showQuickReplies)}
                                        >
                                            <Zap className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>快捷回复</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isUploading}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className={cn("h-5 w-5", isUploading && "animate-pulse")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isUploading ? '上传中...' : '发送图片'}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* 输入框 */}
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="输入消息..."
                                className="flex-1"
                            />

                            {/* 发送按钮 */}
                            <Button onClick={handleSend} disabled={!inputValue.trim()}>
                                <Send className="h-4 w-4 mr-1.5" />
                                发送
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* 关闭会话确认 */}
            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>结束会话</DialogTitle>
                        <DialogDescription>
                            确定要结束与 {session.user?.nickname || '用户'} 的会话吗？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onCloseSession('admin_close')
                                setCloseDialogOpen(false)
                            }}
                        >
                            确定结束
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// 消息气泡组件
function MessageBubble({
    message,
    user,
    admin,
    csAvatarUrl,
}: {
    message: ChatMessage
    user?: ChatUser
    admin?: ChatAdmin
    csAvatarUrl?: string
}) {
    const isAdmin = message.senderType === 'admin'
    const isSystem = message.senderType === 'system'

    // 系统消息
    if (isSystem) {
        return (
            <div className="flex justify-center">
                <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                    {message.content}
                </span>
            </div>
        )
    }

    // 获取头像和名称
    // 客服头像优先使用品牌 logo（与小程序保持一致），其次使用管理员头像
    const avatarUrl = isAdmin ? (csAvatarUrl || admin?.avatar) : user?.avatar
    const avatarName = isAdmin ? (admin?.name || '客服') : (user?.nickname || '用户')
    const fallbackText = isAdmin ? '客' : avatarName?.slice(0, 1) || 'U'

    return (
        <div
            className={cn('flex gap-2', isAdmin ? 'flex-row-reverse' : 'flex-row')}
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={avatarUrl} alt={avatarName} />
                <AvatarFallback className={isAdmin ? 'bg-primary text-primary-foreground' : ''}>
                    {fallbackText}
                </AvatarFallback>
            </Avatar>

            <div
                className={cn(
                    'flex flex-col max-w-[70%]',
                    isAdmin ? 'items-end' : 'items-start'
                )}
            >
                <div
                    className={cn(
                        'rounded-lg px-3 py-2 text-sm',
                        isAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                    )}
                >
                    {message.type === 'image' ? (
                        <img
                            src={message.content}
                            alt="图片"
                            className="max-w-xs rounded"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                </div>

                {/* 时间和已读状态 */}
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <span>
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                    {isAdmin && (
                        message.isRead ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                        ) : (
                            <Check className="h-3 w-3" />
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
