/**
 * 在线客服页面
 *
 * 用户端客服聊天功能
 * 按《小程序页面改造规范》改造：
 * - 导航栏使用主色背景 + Icon 返回按钮
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放
 * - 使用 iconfont 图标，禁止 emoji
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useShareAppMessage, useDidShow, useDidHide } from '@tarojs/taro'
import {
    getOrCreateSession,
    getCurrentSession,
    getMessages,
    sendMessage as sendMessageApi,
    markMessagesRead,
    rateSession,
    getCurrentUser,
    type ChatSession,
    type ChatMessage,
} from '@/api'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import Icon from '@/components/Icon'
import './index.scss'

// 轮询间隔（毫秒）
const POLL_INTERVAL = 3000

// 小程序缩放比例
const wxScale = 1.1

// 状态栏高度（小程序）
const wxSafeAreaTop = 44

function CustomerServicePage() {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
    const [isLoading, setIsLoading] = useState(true)
    const [session, setSession] = useState<ChatSession | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isConnected, setIsConnected] = useState(false)

    // 评分相关状态
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [rating, setRating] = useState(5)
    const [ratingContent, setRatingContent] = useState('')
    const [isSubmittingRating, setIsSubmittingRating] = useState(false)
    const [hasRated, setHasRated] = useState(false) // 是否已评价

    const [scrollToView, setScrollToView] = useState('')
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const isPageVisibleRef = useRef(true)
    // 使用 ref 保存最新的 session 和 messages，解决闭包问题
    const sessionRef = useRef<ChatSession | null>(null)
    const messagesRef = useRef<ChatMessage[]>([])

    // 从 themeSettings 获取主色和 logo
    const primaryColor = themeSettings.primaryColor

    // 如果是相对路径，需要补全域名
    const getFullUrl = (url: string) => {
        if (!url) return ''
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        return `https://kkl.top${url.startsWith('/') ? '' : '/'}${url}`
    }

    // 客服头像：优先使用页脚浅色 logo，其次页头 logo，最后兜底默认头像
    const csAvatar = getFullUrl(themeSettings.footerLogo) || getFullUrl(themeSettings.headerLogo) || 'https://kkl.top/avatars/01.png'

    // 用户头像：从当前登录用户获取
    const currentUser = getCurrentUser()
    const userAvatar = getFullUrl(currentUser?.avatar || '') || 'https://kkl.top/avatars/01.png'

    // 同步更新 ref
    useEffect(() => {
        sessionRef.current = session
    }, [session])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    useEffect(() => {
        // 加载主题设置
        previewApi.getThemeSettings()
            .then((settings) => {
                if (settings) {
                    setThemeSettings({ ...defaultThemeSettings, ...settings })
                }
            })
            .catch((err) => {
                console.error('[CustomerService] 主题设置加载失败:', err)
            })

        initChat()
        return () => {
            stopPolling()
        }
    }, [])

    useDidShow(() => {
        isPageVisibleRef.current = true
        if (sessionRef.current) {
            startPolling()
        }
    })

    useDidHide(() => {
        isPageVisibleRef.current = false
        stopPolling()
    })

    const initChat = async () => {
        try {
            // 创建或获取会话
            const sessionData = await getOrCreateSession()
            setSession(sessionData)
            sessionRef.current = sessionData
            setIsConnected(true)

            // 加载历史消息
            await loadMessages(sessionData.id)

            // 开始轮询（使用 sessionData 而非 state）
            startPollingWithSession(sessionData.id)
        } catch (error) {
            console.error('[CustomerService] 初始化失败:', error)
            Taro.showToast({ title: '连接客服失败', icon: 'none' })
        } finally {
            setIsLoading(false)
        }
    }

    const loadMessages = async (sessionId: string) => {
        try {
            const result = await getMessages(sessionId, 1, 50)
            // 后端返回的已经是正序（旧到新）
            const msgs = result.items || []
            setMessages(msgs)
            messagesRef.current = msgs

            // 标记已读
            await markMessagesRead(sessionId)

            // 滚动到底部
            scrollToBottom()
        } catch (error) {
            console.error('[CustomerService] 加载消息失败:', error)
        }
    }

    const startPolling = () => {
        if (sessionRef.current) {
            startPollingWithSession(sessionRef.current.id)
        }
    }

    const startPollingWithSession = (sessionId: string) => {
        if (pollTimerRef.current) return

        console.log('[CustomerService] 开始轮询, sessionId:', sessionId)

        pollTimerRef.current = setInterval(async () => {
            if (!isPageVisibleRef.current) return

            try {
                // 同时获取消息和会话状态
                const [messagesResult, sessionResult] = await Promise.all([
                    getMessages(sessionId, 1, 50),
                    getCurrentSession(),
                ])

                // 更新会话状态（检查客服是否已接入或会话是否关闭）
                if (sessionRef.current) {
                    const oldStatus = sessionRef.current.status

                    // 当 getCurrentSession 返回 null 时，表示会话已关闭
                    // （因为后端只返回 waiting/chatting 状态的会话）
                    if (!sessionResult && oldStatus !== 'closed') {
                        console.log('[CustomerService] 会话已关闭 (API返回null)')
                        // 更新本地状态为已关闭
                        const closedSession = { ...sessionRef.current, status: 'closed' as const }
                        setSession(closedSession)
                        sessionRef.current = closedSession

                        // 更新消息列表（获取最新消息，包括后端发送的结束消息）
                        const latestMessages = messagesResult.items || []
                        // 检查是否已有系统结束消息
                        const hasEndMessage = latestMessages.some(
                            (msg) => msg.senderType === 'system' && msg.content.includes('结束')
                        )
                        if (!hasEndMessage) {
                            // 如果没有结束消息，添加一条本地系统消息
                            const endMessage: ChatMessage = {
                                id: `system-end-${Date.now()}`,
                                sessionId: sessionRef.current.id,
                                type: 'text',
                                content: '会话已结束，感谢您的咨询',
                                senderType: 'system',
                                isRead: true,
                                createdAt: new Date().toISOString(),
                            }
                            setMessages([...latestMessages, endMessage])
                            messagesRef.current = [...latestMessages, endMessage]
                        } else {
                            setMessages(latestMessages)
                            messagesRef.current = latestMessages
                        }
                        scrollToBottom()

                        // 显示提示
                        Taro.showToast({
                            title: '会话已结束',
                            icon: 'none',
                            duration: 2000,
                        })
                        // 震动反馈
                        Taro.vibrateShort({ type: 'light' }).catch(() => { })
                        // 延迟显示评分弹窗
                        if (!hasRated) {
                            setTimeout(() => {
                                setShowRatingModal(true)
                            }, 1000)
                        }
                        // 停止轮询，会话已结束
                        stopPolling()
                    } else if (sessionResult) {
                        const newStatus = sessionResult.status
                        if (oldStatus !== newStatus) {
                            console.log('[CustomerService] 会话状态变更:', oldStatus, '->', newStatus)
                            setSession(sessionResult)
                            sessionRef.current = sessionResult
                        }
                    }
                }

                // 更新消息
                const newMessages = messagesResult.items || []

                // 检查是否有新消息（比较最后一条消息的 ID）
                const currentMessages = messagesRef.current
                if (newMessages.length > 0) {
                    const lastNewId = newMessages[newMessages.length - 1].id
                    const lastCurrentId = currentMessages[currentMessages.length - 1]?.id

                    if (lastNewId !== lastCurrentId || newMessages.length !== currentMessages.length) {
                        console.log('[CustomerService] 检测到新消息')
                        setMessages(newMessages)
                        messagesRef.current = newMessages
                        await markMessagesRead(sessionId)
                        scrollToBottom()
                    }
                }
            } catch (error) {
                console.error('[CustomerService] 轮询失败:', error)
            }
        }, POLL_INTERVAL)
    }

    const stopPolling = () => {
        if (pollTimerRef.current) {
            console.log('[CustomerService] 停止轮询')
            clearInterval(pollTimerRef.current)
            pollTimerRef.current = null
        }
    }

    const scrollToBottom = () => {
        // 使用两次设置来强制触发滚动（解决相同值不触发的问题）
        setScrollToView('')
        setTimeout(() => {
            setScrollToView('scroll-anchor')
        }, 100)
    }

    useShareAppMessage(() => ({
        title: '在线客服',
        path: '/packageB/pages/customer-service/index',
    }))

    const handleBack = useCallback(() => {
        Taro.navigateBack()
    }, [])

    const handleSendMessage = async () => {
        const content = inputValue.trim()
        if (!content || !session || isSending) return

        setIsSending(true)
        setInputValue('')

        // 先添加一条本地消息（乐观更新）
        const tempMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            sessionId: session.id,
            type: 'text',
            content,
            senderType: 'user',
            isRead: true,
            createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempMessage])
        scrollToBottom()

        try {
            const newMessage = await sendMessageApi(session.id, { type: 'text', content })
            // 替换临时消息
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempMessage.id ? newMessage : msg))
            )
        } catch (error: any) {
            console.error('[CustomerService] 发送消息失败:', error)
            // 移除临时消息
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
            Taro.showToast({ title: error?.message || '发送失败', icon: 'none' })
            setInputValue(content) // 恢复输入内容
        } finally {
            setIsSending(false)
        }
    }

    const handleChooseImage = async () => {
        if (!session || isSending) return

        try {
            // 选择图片
            const res = await Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
            })

            const imagePath = res.tempFilePaths[0]
            console.log('[CustomerService] 选择图片:', imagePath)

            setIsSending(true)
            Taro.showLoading({ title: '发送中...' })

            // 上传图片到服务器
            const token = Taro.getStorageSync('kekeling_user_token')
            const uploadRes = await Taro.uploadFile({
                url: 'https://kkl.top/api/upload',
                filePath: imagePath,
                name: 'file',
                formData: {
                    folder: 'common',
                },
                header: {
                    Authorization: `Bearer ${token}`,
                },
            })

            Taro.hideLoading()

            console.log('[CustomerService] 上传响应:', uploadRes.statusCode, uploadRes.data)

            if (uploadRes.statusCode !== 200 && uploadRes.statusCode !== 201) {
                console.error('[CustomerService] 上传状态码错误:', uploadRes.statusCode)
                throw new Error(`上传失败(${uploadRes.statusCode})`)
            }

            let uploadData: any
            try {
                uploadData = JSON.parse(uploadRes.data)
            } catch (e) {
                console.error('[CustomerService] 解析上传响应失败:', uploadRes.data)
                throw new Error('解析响应失败')
            }

            // 服务器返回格式: { code: 0, message: "success", data: { url, ... } }
            if (uploadData.code !== 0 || !uploadData.data?.url) {
                console.error('[CustomerService] 上传数据异常:', uploadData)
                throw new Error(uploadData.message || '上传失败')
            }

            // 获取完整图片 URL
            const imageUrl = `https://kkl.top${uploadData.data.url}`
            console.log('[CustomerService] 图片上传成功:', imageUrl)

            // 先添加一条本地消息（乐观更新）
            const tempMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                sessionId: session.id,
                type: 'image',
                content: imageUrl,
                senderType: 'user',
                isRead: true,
                createdAt: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, tempMessage])
            scrollToBottom()

            // 发送图片消息
            const newMessage = await sendMessageApi(session.id, { type: 'image', content: imageUrl })
            // 替换临时消息
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempMessage.id ? newMessage : msg))
            )
        } catch (error: any) {
            Taro.hideLoading()
            console.error('[CustomerService] 发送图片失败:', error)
            Taro.showToast({ title: error?.message || '发送图片失败', icon: 'none' })
        } finally {
            setIsSending(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const getStatusText = () => {
        if (!isConnected) return { text: '连接中...', isOnline: false, isWaiting: false }
        if (session?.status === 'waiting') return { text: '等待客服接入', isOnline: false, isWaiting: true }
        if (session?.status === 'chatting') return { text: '客服已接入', isOnline: true, isWaiting: false }
        if (session?.status === 'closed') return { text: '会话已结束', isOnline: false, isWaiting: false }
        return { text: '在线', isOnline: true, isWaiting: false }
    }

    // 提交评价
    const handleSubmitRating = async () => {
        if (!session || isSubmittingRating) return

        setIsSubmittingRating(true)
        try {
            await rateSession(session.id, rating, ratingContent || undefined)
            setHasRated(true)
            setShowRatingModal(false)
            Taro.showToast({ title: '感谢您的评价！', icon: 'success' })
        } catch (error: any) {
            console.error('[CustomerService] 评价失败:', error)
            Taro.showToast({ title: error?.message || '评价失败', icon: 'none' })
        } finally {
            setIsSubmittingRating(false)
        }
    }

    // 跳过评价
    const handleSkipRating = () => {
        setShowRatingModal(false)
        setHasRated(true) // 标记为已处理，不再弹出
    }

    // 开始新会话
    const handleStartNewSession = async () => {
        setSession(null)
        setMessages([])
        setHasRated(false)
        setIsLoading(true)
        await initChat()
    }

    // 加载骨架屏
    if (isLoading) {
        return (
            <View
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f5f7fa',
                }}
            >
                <View
                    style={{
                        width: 32 * wxScale,
                        height: 32 * wxScale,
                        borderWidth: 3,
                        borderStyle: 'solid',
                        borderColor: '#e5e7eb',
                        borderTopColor: primaryColor,
                        borderRadius: 16 * wxScale,
                    }}
                    className='loading-spinner'
                />
            </View>
        )
    }

    const statusInfo = getStatusText()

    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: '#f5f7fa',
            }}
        >
            {/* 导航栏 - 主色背景 */}
            <View
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: wxSafeAreaTop,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingBottom: 12 * wxScale,
                    backgroundColor: primaryColor,
                    flexShrink: 0,
                }}
            >
                {/* 返回按钮 */}
                <View
                    onClick={handleBack}
                    style={{
                        width: 36 * wxScale,
                        height: 36 * wxScale,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon name='left' size={22 * wxScale} color='#fff' />
                </View>

                {/* 标题区域 */}
                <View
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginRight: 36 * wxScale,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 17 * wxScale,
                            fontWeight: 600,
                            color: '#fff',
                        }}
                    >
                        在线客服
                    </Text>
                    <Text
                        style={{
                            fontSize: 12 * wxScale,
                            color: statusInfo.isOnline
                                ? 'rgba(255, 255, 255, 0.9)'
                                : statusInfo.isWaiting
                                    ? 'rgba(255, 255, 255, 0.7)'
                                    : 'rgba(255, 255, 255, 0.6)',
                            marginTop: 2 * wxScale,
                        }}
                    >
                        {statusInfo.text}
                    </Text>
                </View>
            </View>

            {/* 消息列表 */}
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <ScrollView
                    scrollY
                    scrollIntoView={scrollToView}
                    scrollWithAnimation
                    style={{ height: '100%' }}
                >
                    <View style={{ padding: 16 * wxScale, minHeight: '100%' }}>
                        {messages.length === 0 ? (
                            <View
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 60 * wxScale,
                                    paddingBottom: 60 * wxScale,
                                }}
                            >
                                <View
                                    style={{
                                        width: 64 * wxScale,
                                        height: 64 * wxScale,
                                        borderRadius: 32 * wxScale,
                                        backgroundColor: `${primaryColor}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16 * wxScale,
                                    }}
                                >
                                    <Icon name='headset' size={32 * wxScale} color={primaryColor} />
                                </View>
                                <Text
                                    style={{
                                        display: 'block',
                                        fontSize: 14 * wxScale,
                                        color: '#6b7280',
                                        textAlign: 'center',
                                        marginBottom: 8 * wxScale,
                                    }}
                                >
                                    您好，有什么可以帮您？
                                </Text>
                                <Text
                                    style={{
                                        display: 'block',
                                        fontSize: 12 * wxScale,
                                        color: '#9ca3af',
                                        textAlign: 'center',
                                    }}
                                >
                                    工作时间：9:00-18:00
                                </Text>
                            </View>
                        ) : (
                            messages.map((msg) => (
                                <View
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: msg.senderType === 'user' ? 'row-reverse' : 'row',
                                        marginBottom: 16 * wxScale,
                                        ...(msg.senderType === 'system' && { justifyContent: 'center' }),
                                    }}
                                >
                                    {msg.senderType === 'system' ? (
                                        <Text
                                            style={{
                                                paddingTop: 8 * wxScale,
                                                paddingBottom: 8 * wxScale,
                                                paddingLeft: 16 * wxScale,
                                                paddingRight: 16 * wxScale,
                                                fontSize: 12 * wxScale,
                                                color: '#9ca3af',
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: 16 * wxScale,
                                            }}
                                        >
                                            {msg.content}
                                        </Text>
                                    ) : (
                                        <>
                                            <Image
                                                src={
                                                    msg.senderType === 'admin'
                                                        ? msg.senderAvatar || csAvatar
                                                        : userAvatar
                                                }
                                                mode='aspectFill'
                                                style={{
                                                    width: 36 * wxScale,
                                                    height: 36 * wxScale,
                                                    borderRadius: 18 * wxScale,
                                                    backgroundColor: '#e5e7eb',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <View
                                                style={{
                                                    maxWidth: '70%',
                                                    marginLeft: msg.senderType === 'user' ? 0 : 12 * wxScale,
                                                    marginRight: msg.senderType === 'user' ? 12 * wxScale : 0,
                                                }}
                                            >
                                                {msg.senderType === 'admin' && msg.senderName && (
                                                    <Text
                                                        style={{
                                                            display: 'block',
                                                            fontSize: 11 * wxScale,
                                                            color: '#9ca3af',
                                                            marginBottom: 4 * wxScale,
                                                        }}
                                                    >
                                                        {msg.senderName}
                                                    </Text>
                                                )}
                                                <View
                                                    style={{
                                                        paddingTop: 12 * wxScale,
                                                        paddingBottom: 12 * wxScale,
                                                        paddingLeft: 16 * wxScale,
                                                        paddingRight: 16 * wxScale,
                                                        fontSize: 14 * wxScale,
                                                        lineHeight: 1.5,
                                                        backgroundColor: msg.senderType === 'user' ? primaryColor : '#fff',
                                                        color: msg.senderType === 'user' ? '#fff' : '#1f2937',
                                                        borderRadius:
                                                            msg.senderType === 'user'
                                                                ? `${16 * wxScale}px ${4 * wxScale}px ${16 * wxScale}px ${16 * wxScale}px`
                                                                : `${4 * wxScale}px ${16 * wxScale}px ${16 * wxScale}px ${16 * wxScale}px`,
                                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                                    }}
                                                >
                                                    {msg.type === 'image' ? (
                                                        <Image
                                                            src={msg.content}
                                                            mode='widthFix'
                                                            style={{
                                                                maxWidth: 200 * wxScale,
                                                                borderRadius: 8 * wxScale,
                                                            }}
                                                            onClick={() => {
                                                                Taro.previewImage({
                                                                    current: msg.content,
                                                                    urls: [msg.content],
                                                                })
                                                            }}
                                                        />
                                                    ) : (
                                                        <Text>{msg.content}</Text>
                                                    )}
                                                </View>
                                                <Text
                                                    style={{
                                                        display: 'block',
                                                        fontSize: 11 * wxScale,
                                                        color: '#9ca3af',
                                                        marginTop: 4 * wxScale,
                                                        textAlign: msg.senderType === 'user' ? 'right' : 'left',
                                                    }}
                                                >
                                                    {formatTime(msg.createdAt)}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            ))
                        )}
                        {/* 滚动锚点 - 用于自动滚动到底部 */}
                        <View id='scroll-anchor' style={{ height: 1 }} />
                    </View>
                </ScrollView>
            </View>

            {/* 输入区域 - 根据会话状态显示不同内容 */}
            <View
                style={{
                    backgroundColor: '#fff',
                    paddingTop: 8 * wxScale,
                    paddingBottom: 8 * wxScale,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    flexShrink: 0,
                    borderTopWidth: 1,
                    borderTopStyle: 'solid',
                    borderTopColor: '#f3f4f6',
                }}
                className='input-area-safe'
            >
                {session?.status === 'closed' ? (
                    // 会话已结束 - 显示提示和新建会话按钮
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 8 * wxScale,
                            paddingBottom: 8 * wxScale,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14 * wxScale,
                                color: '#9ca3af',
                                marginRight: 12 * wxScale,
                            }}
                        >
                            会话已结束
                        </Text>
                        <View
                            onClick={handleStartNewSession}
                            style={{
                                paddingTop: 8 * wxScale,
                                paddingBottom: 8 * wxScale,
                                paddingLeft: 16 * wxScale,
                                paddingRight: 16 * wxScale,
                                backgroundColor: primaryColor,
                                borderRadius: 20 * wxScale,
                            }}
                        >
                            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>
                                开始新对话
                            </Text>
                        </View>
                    </View>
                ) : (
                    // 正常输入框
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            backgroundColor: '#f8f9fa',
                            borderRadius: 24 * wxScale,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: '#e9ecef',
                            paddingLeft: 4 * wxScale,
                            paddingRight: 4 * wxScale,
                            paddingTop: 4 * wxScale,
                            paddingBottom: 4 * wxScale,
                        }}
                    >
                        {/* 图片按钮 */}
                        <View
                            onClick={handleChooseImage}
                            style={{
                                width: 36 * wxScale,
                                height: 36 * wxScale,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Icon name='pic' size={22 * wxScale} color='#6b7280' />
                        </View>

                        {/* 输入框 */}
                        <View
                            style={{
                                flex: 1,
                                minHeight: 36 * wxScale,
                                maxHeight: 100 * wxScale,
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: 4 * wxScale,
                                paddingRight: 8 * wxScale,
                            }}
                        >
                            <Textarea
                                value={inputValue}
                                onInput={(e) => setInputValue(e.detail.value)}
                                placeholder='请输入您的问题...'
                                placeholderStyle={`color: #adb5bd; font-size: ${14 * wxScale}px`}
                                maxlength={500}
                                autoHeight
                                confirmType='send'
                                onConfirm={handleSendMessage}
                                style={{
                                    width: '100%',
                                    fontSize: 14 * wxScale,
                                    color: '#1f2937',
                                    backgroundColor: 'transparent',
                                    lineHeight: 1.5,
                                    maxHeight: 80 * wxScale,
                                }}
                            />
                        </View>

                        {/* 发送按钮 - 圆形图标 */}
                        <View
                            onClick={handleSendMessage}
                            style={{
                                width: 36 * wxScale,
                                height: 36 * wxScale,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: !inputValue.trim() || isSending ? '#e9ecef' : primaryColor,
                                borderRadius: 18 * wxScale,
                                flexShrink: 0,
                            }}
                        >
                            <Icon
                                name='send'
                                size={18 * wxScale}
                                color={!inputValue.trim() || isSending ? '#adb5bd' : '#fff'}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* 评分弹窗 */}
            {showRatingModal && (
                <View
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={handleSkipRating}
                >
                    <View
                        style={{
                            width: 300 * wxScale,
                            backgroundColor: '#fff',
                            borderRadius: 16 * wxScale,
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 弹窗头部 */}
                        <View
                            style={{
                                paddingTop: 24 * wxScale,
                                paddingBottom: 16 * wxScale,
                                paddingLeft: 24 * wxScale,
                                paddingRight: 24 * wxScale,
                                textAlign: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    display: 'block',
                                    fontSize: 18 * wxScale,
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: 8 * wxScale,
                                }}
                            >
                                服务评价
                            </Text>
                            <Text
                                style={{
                                    display: 'block',
                                    fontSize: 13 * wxScale,
                                    color: '#9ca3af',
                                }}
                            >
                                请对本次服务进行评价
                            </Text>
                        </View>

                        {/* 星级评分 - 使用文本星星 */}
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                paddingTop: 8 * wxScale,
                                paddingBottom: 16 * wxScale,
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((star) => (
                                <View
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{
                                        paddingLeft: 8 * wxScale,
                                        paddingRight: 8 * wxScale,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 32 * wxScale,
                                            color: star <= rating ? '#fbbf24' : '#d1d5db',
                                        }}
                                    >
                                        {star <= rating ? '★' : '☆'}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* 评分描述 */}
                        <View style={{ textAlign: 'center', marginBottom: 16 * wxScale }}>
                            <Text style={{ fontSize: 14 * wxScale, color: '#6b7280' }}>
                                {rating === 5 ? '非常满意' :
                                    rating === 4 ? '满意' :
                                        rating === 3 ? '一般' :
                                            rating === 2 ? '不满意' : '非常不满意'}
                            </Text>
                        </View>

                        {/* 评价内容输入框 */}
                        <View
                            style={{
                                marginLeft: 24 * wxScale,
                                marginRight: 24 * wxScale,
                                marginBottom: 20 * wxScale,
                            }}
                        >
                            <Textarea
                                value={ratingContent}
                                onInput={(e) => setRatingContent(e.detail.value)}
                                placeholder='请输入您的建议或意见（选填）'
                                placeholderStyle={`color: #adb5bd; font-size: ${13 * wxScale}px`}
                                maxlength={200}
                                style={{
                                    width: '100%',
                                    height: 80 * wxScale,
                                    fontSize: 13 * wxScale,
                                    color: '#1f2937',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 8 * wxScale,
                                    paddingTop: 12 * wxScale,
                                    paddingBottom: 12 * wxScale,
                                    paddingLeft: 12 * wxScale,
                                    paddingRight: 12 * wxScale,
                                    boxSizing: 'border-box',
                                }}
                            />
                        </View>

                        {/* 按钮区域 */}
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                borderTopWidth: 1,
                                borderTopStyle: 'solid',
                                borderTopColor: '#f3f4f6',
                            }}
                        >
                            <View
                                onClick={handleSkipRating}
                                style={{
                                    flex: 1,
                                    paddingTop: 14 * wxScale,
                                    paddingBottom: 14 * wxScale,
                                    textAlign: 'center',
                                    borderRightWidth: 1,
                                    borderRightStyle: 'solid',
                                    borderRightColor: '#f3f4f6',
                                }}
                            >
                                <Text style={{ fontSize: 15 * wxScale, color: '#6b7280' }}>
                                    跳过
                                </Text>
                            </View>
                            <View
                                onClick={handleSubmitRating}
                                style={{
                                    flex: 1,
                                    paddingTop: 14 * wxScale,
                                    paddingBottom: 14 * wxScale,
                                    textAlign: 'center',
                                    backgroundColor: isSubmittingRating ? '#f3f4f6' : '#fff',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 15 * wxScale,
                                        color: isSubmittingRating ? '#9ca3af' : primaryColor,
                                        fontWeight: 500,
                                    }}
                                >
                                    {isSubmittingRating ? '提交中...' : '提交评价'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

export default CustomerServicePage
