/**
 * 提现操作日志时间轴（P2）
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - FE-WD-P2-03
 *
 * 验收标准：
 * - 日志时间轴正确（倒序）
 * - `failed` 显示失败原因
 * - `completed` 显示交易号
 * - 状态时间轴可视化
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  ThumbsUp,
  ThumbsDown,
  Banknote,
  AlertCircle,
} from 'lucide-react'
import type { AdminWithdrawLog } from '@/lib/api'
import { cn } from '@/lib/utils'

// 操作 action 配置
const logActionConfig: Record<
  string,
  {
    label: string
    color: string
    bgColor: string
    icon: React.ReactNode
  }
> = {
  create: {
    label: '提交申请',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Send className='h-4 w-4' />,
  },
  approve: {
    label: '审核通过',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <ThumbsUp className='h-4 w-4' />,
  },
  reject: {
    label: '审核驳回',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <ThumbsDown className='h-4 w-4' />,
  },
  payout: {
    label: '发起打款',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <Banknote className='h-4 w-4' />,
  },
  complete: {
    label: '打款成功',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className='h-4 w-4' />,
  },
  fail: {
    label: '打款失败',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <XCircle className='h-4 w-4' />,
  },
}

interface WithdrawLogsTimelineProps {
  logs: AdminWithdrawLog[]
  isLoading?: boolean
  className?: string
}

export function WithdrawLogsTimeline({
  logs,
  isLoading = false,
  className,
}: WithdrawLogsTimelineProps) {
  // 格式化时间
  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MM-dd HH:mm:ss', { locale: zhCN })
    } catch {
      return dateStr
    }
  }

  // 按时间倒序排列
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (isLoading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className='flex h-32 flex-col items-center justify-center gap-2'>
        <Clock className='h-8 w-8 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>暂无操作日志</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {sortedLogs.map((log, index) => {
        const config = logActionConfig[log.action] || {
          label: log.action,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <AlertCircle className='h-4 w-4' />,
        }

        const isLast = index === sortedLogs.length - 1

        return (
          <div key={log.id} className='flex gap-4'>
            {/* 时间轴指示器 */}
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  config.bgColor,
                  config.color
                )}
              >
                {config.icon}
              </div>
              {!isLast && (
                <div className='w-0.5 flex-1 bg-border min-h-[2rem]' />
              )}
            </div>

            {/* 日志内容 */}
            <div className='flex-1 pb-6'>
              <div className='flex items-center justify-between'>
                <span className={cn('font-medium', config.color)}>
                  {config.label}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {formatTime(log.createdAt)}
                </span>
              </div>

              {/* 操作人 */}
              <p className='mt-1 text-sm text-muted-foreground'>
                操作人：{log.operatorName || (log.operator === 'system' ? '系统' : '管理员')}
              </p>

              {/* 备注/消息 */}
              {log.message && (
                <p className='mt-1 text-sm text-muted-foreground'>
                  {log.message}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * 状态时间轴（简化版，用于显示当前状态进度）
 */
interface StatusTimelineProps {
  currentStatus: string
  className?: string
}

const statusSteps = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已审核' },
  { key: 'processing', label: '处理中' },
  { key: 'completed', label: '已完成' },
]

const failedStatuses = ['rejected', 'failed']

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  // 查找当前状态的索引
  const currentIndex = statusSteps.findIndex((s) => s.key === currentStatus)
  const isFailed = failedStatuses.includes(currentStatus)

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {statusSteps.map((step, index) => {
        const isActive = index <= currentIndex && !isFailed
        const isCurrent = step.key === currentStatus

        return (
          <div key={step.key} className='flex items-center'>
            {/* 节点 */}
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isActive
                    ? 'bg-green-500 text-white'
                    : isFailed && index === currentIndex + 1
                      ? 'bg-red-500 text-white'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {isActive ? (
                  <CheckCircle className='h-4 w-4' />
                ) : isFailed && index === 1 ? (
                  <XCircle className='h-4 w-4' />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs',
                  isCurrent ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* 连接线 */}
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 mx-2',
                  index < currentIndex && !isFailed
                    ? 'bg-green-500'
                    : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}

      {/* 失败状态显示 */}
      {isFailed && (
        <div className='ml-4 flex items-center'>
          <div className='flex flex-col items-center'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white'>
              <XCircle className='h-4 w-4' />
            </div>
            <span className='mt-1 text-xs font-medium text-red-600'>
              {currentStatus === 'rejected' ? '已驳回' : '已失败'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
