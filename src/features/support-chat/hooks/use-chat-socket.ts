import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'
import type {
  ChatMessage,
  ChatSession,
  MessageType,
  WsNewMessageEvent,
  WsSessionAcceptedEvent,
  WsSessionClosedEvent,
  WsTypingEvent,
} from '../types'

interface UseChatSocketOptions {
  onNewMessage?: (data: WsNewMessageEvent) => void
  onNewSession?: (data: { session: ChatSession }) => void
  onSessionAccepted?: (data: WsSessionAcceptedEvent) => void
  onSessionClosed?: (data: WsSessionClosedEvent) => void
  onSessionTransferred?: (data: { session: ChatSession }) => void
  onUserTyping?: (data: WsTypingEvent) => void
  onAdminTyping?: (data: WsTypingEvent) => void
  onUserRead?: (data: { sessionId: string; messageId?: string }) => void
  onAdminRead?: (data: { sessionId: string; messageId?: string }) => void
  onError?: (error: any) => void
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { accessToken } = useAuthStore()

  // 建立连接
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const wsUrl = apiUrl.replace(/^http/, 'ws')

    socketRef.current = io(`${wsUrl}/chat`, {
      query: {
        token: accessToken,
        type: 'admin',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('[ChatSocket] 连接成功')
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('disconnect', (reason) => {
      console.log('[ChatSocket] 断开连接:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[ChatSocket] 连接错误:', error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    socket.on('error', (error) => {
      console.error('[ChatSocket] 错误:', error)
      options.onError?.(error)
    })

    // 业务事件
    socket.on('new_message', (data: WsNewMessageEvent) => {
      options.onNewMessage?.(data)
    })

    socket.on('new_session', (data: { session: ChatSession }) => {
      options.onNewSession?.(data)
    })

    socket.on('session_accepted', (data: WsSessionAcceptedEvent) => {
      options.onSessionAccepted?.(data)
    })

    socket.on('session_closed', (data: WsSessionClosedEvent) => {
      options.onSessionClosed?.(data)
    })

    socket.on('session_transferred', (data: { session: ChatSession }) => {
      options.onSessionTransferred?.(data)
    })

    socket.on('user_typing', (data: WsTypingEvent) => {
      options.onUserTyping?.(data)
    })

    socket.on('admin_typing', (data: WsTypingEvent) => {
      options.onAdminTyping?.(data)
    })

    socket.on('user_read', (data: { sessionId: string; messageId?: string }) => {
      options.onUserRead?.(data)
    })

    socket.on('admin_read', (data: { sessionId: string; messageId?: string }) => {
      options.onAdminRead?.(data)
    })
  }, [accessToken, options])

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  // 发送消息
  const sendMessage = useCallback(
    async (
      sessionId: string,
      type: MessageType,
      content: string,
      extra?: Record<string, any>
    ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: '未连接' }
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'send_message',
          { sessionId, type, content, extra },
          (response: { success: boolean; message?: ChatMessage; error?: string }) => {
            resolve(response)
          }
        )
      })
    },
    []
  )

  // 接入会话
  const acceptSession = useCallback(
    async (sessionId: string): Promise<{ success: boolean; session?: ChatSession; error?: string }> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: '未连接' }
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'accept_session',
          { sessionId },
          (response: { success: boolean; session?: ChatSession; error?: string }) => {
            resolve(response)
          }
        )
      })
    },
    []
  )

  // 关闭会话
  const closeSession = useCallback(
    async (sessionId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: '未连接' }
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'close_session',
          { sessionId, reason },
          (response: { success: boolean; error?: string }) => {
            resolve(response)
          }
        )
      })
    },
    []
  )

  // 转接会话
  const transferSession = useCallback(
    async (sessionId: string, targetAdminId: string): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current?.connected) {
        return { success: false, error: '未连接' }
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'transfer_session',
          { sessionId, targetAdminId },
          (response: { success: boolean; error?: string }) => {
            resolve(response)
          }
        )
      })
    },
    []
  )

  // 发送正在输入状态
  const sendTyping = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { sessionId })
    }
  }, [])

  // 标记已读
  const markAsRead = useCallback(
    async (sessionId: string, messageId?: string): Promise<{ success: boolean; count?: number }> => {
      if (!socketRef.current?.connected) {
        return { success: false }
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'read',
          { sessionId, messageId },
          (response: { success: boolean; count?: number }) => {
            resolve(response)
          }
        )
      })
    },
    []
  )

  // 加入会话房间
  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_session', { sessionId })
    }
  }, [])

  // 离开会话房间
  const leaveSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_session', { sessionId })
    }
  }, [])

  // 心跳
  const heartbeat = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('heartbeat')
    }
  }, [])

  // 自动连接和心跳
  useEffect(() => {
    if (accessToken) {
      connect()

      // 心跳间隔 2 分钟
      const heartbeatInterval = setInterval(heartbeat, 2 * 60 * 1000)

      return () => {
        clearInterval(heartbeatInterval)
        disconnect()
      }
    }
  }, [accessToken, connect, disconnect, heartbeat])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    acceptSession,
    closeSession,
    transferSession,
    sendTyping,
    markAsRead,
    joinSession,
    leaveSession,
  }
}
