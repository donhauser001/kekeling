/**
 * 提现详情抽屉（只读）
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - CARD ADMIN-WD-02
 *
 * 验收标准：
 * - Drawer 打开/关闭不刷新列表页
 * - `failed` 状态才展示 `failReason` 区块
 * - 日志按时间倒序展示
 * - 敏感字段已脱敏（手机、账户）
 * - 仅 Admin 可访问
 * - 无 approve/reject/payout 按钮
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Loader2,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  CreditCard,
  Smartphone,
  User,
  Hash,
  Phone,
  AlertCircle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminEscortWithdrawRecord } from '@/hooks/use-api'
import type { AdminWithdrawStatus, AdminWithdrawMethod } from '@/lib/api'
import { cn } from '@/lib/utils'

// 状态配置
const statusConfig: Record<
  AdminWithdrawStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: '待处理',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className='h-3.5 w-3.5' />,
  },
  processing: {
    label: '处理中',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Loader2 className='h-3.5 w-3.5 animate-spin' />,
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className='h-3.5 w-3.5' />,
  },
  failed: {
    label: '已失败',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className='h-3.5 w-3.5' />,
  },
}

// 提现方式配置
const methodConfig: Record<
  AdminWithdrawMethod,
  { label: string; icon: React.ReactNode }
> = {
  bank: {
    label: '银行卡',
    icon: <Building2 className='h-4 w-4 text-muted-foreground' />,
  },
  alipay: {
    label: '支付宝',
    icon: <CreditCard className='h-4 w-4 text-blue-500' />,
  },
  wechat: {
    label: '微信',
    icon: <Smartphone className='h-4 w-4 text-green-500' />,
  },
}

// 操作日志 action 配置
const logActionConfig: Record<
  string,
  { label: string; color: string }
> = {
  create: { label: '提交申请', color: 'text-blue-600' },
  submit: { label: '提交申请', color: 'text-blue-600' },
  processing: { label: '发起打款', color: 'text-purple-600' },
  success: { label: '打款成功', color: 'text-green-600' },
  fail: { label: '打款失败', color: 'text-red-600' },
  approve: { label: '审核通过', color: 'text-green-600' },
  reject: { label: '审核驳回', color: 'text-red-600' },
}

interface WithdrawDetailDrawerProps {
  open: boolean
  withdrawId: string | null
  onClose: () => void
}

export function WithdrawDetailDrawer({
  open,
  withdrawId,
  onClose,
}: WithdrawDetailDrawerProps) {
  // 详情查询
  const { data: detail, isLoading } = useAdminEscortWithdrawRecord(
    withdrawId || ''
  )

  // 格式化时间
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--'
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
    } catch {
      return dateStr
    }
  }

  // 格式化简短时间（用于日志）
  const formatShortTime = (dateStr?: string) => {
    if (!dateStr) return '--'
    try {
      return format(new Date(dateStr), 'MM-dd HH:mm', { locale: zhCN })
    } catch {
      return dateStr
    }
  }

  const statusInfo = detail ? statusConfig[detail.status] : null
  const methodInfo = detail ? methodConfig[detail.method] : null

  // 模拟操作日志（后端暂时可能没有此字段，先用静态数据占位）
  // TODO: 后端扩展详情接口返回 logs 字段后替换
  const logs = detail
    ? [
      {
        id: '1',
        action: detail.status === 'completed' ? 'success' : detail.status === 'failed' ? 'fail' : 'create',
        operator: 'system',
        operatorName: '系统',
        message: detail.status === 'completed'
          ? '打款成功'
          : detail.status === 'failed'
            ? detail.failReason || '打款失败'
            : '陪诊员提交提现申请',
        createdAt: detail.paidAt || detail.createdAt,
      },
      ...(detail.status !== 'pending'
        ? [
          {
            id: '2',
            action: 'create',
            operator: 'system',
            operatorName: '系统',
            message: '陪诊员提交提现申请',
            createdAt: detail.createdAt,
          },
        ]
        : []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    : []

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className='w-full sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>提现详情</SheetTitle>
          <SheetDescription>提现记录详细信息（只读）</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : !detail ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <Wallet className='h-12 w-12 text-muted-foreground' />
            <p className='text-muted-foreground'>暂无数据</p>
          </div>
        ) : (
          <ScrollArea className='h-[calc(100vh-8rem)] pr-4'>
            <div className='space-y-6 py-4'>
              {/* 状态标签 */}
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>当前状态</span>
                <Badge className={cn('gap-1', statusInfo?.color)}>
                  {statusInfo?.icon}
                  {statusInfo?.label || detail.status}
                </Badge>
              </div>

              <Separator />

              {/* 基础信息 */}
              <div className='space-y-1'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Hash className='h-4 w-4 text-muted-foreground' />
                  基础信息
                </h4>
                <div className='ml-6 grid gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>提现单号</span>
                    <span className='font-mono'>{detail.withdrawNo}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>陪诊员</span>
                    <span>{detail.escortName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>陪诊员ID</span>
                    <span className='font-mono text-xs'>{detail.escortId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>手机号</span>
                    <span>{detail.escortPhoneMasked}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 金额信息 */}
              <div className='space-y-1'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Wallet className='h-4 w-4 text-muted-foreground' />
                  金额信息
                </h4>
                <div className='ml-6 grid gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>提现金额</span>
                    <span className='font-medium'>¥{detail.amount.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>手续费</span>
                    <span>¥{detail.fee.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>实际到账</span>
                    <span className='font-medium text-green-600'>
                      ¥{detail.netAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 账户信息 */}
              <div className='space-y-1'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <CreditCard className='h-4 w-4 text-muted-foreground' />
                  账户信息
                </h4>
                <div className='ml-6 grid gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>提现方式</span>
                    <div className='flex items-center gap-1.5'>
                      {methodInfo?.icon}
                      <span>{methodInfo?.label || detail.method}</span>
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>收款账户</span>
                    <span className='font-mono'>{detail.accountMasked}</span>
                  </div>
                  {detail.bankName && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>银行名称</span>
                      <span>{detail.bankName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 状态信息 */}
              <div className='space-y-1'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  状态信息
                </h4>
                <div className='ml-6 grid gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>申请时间</span>
                    <span>{formatTime(detail.createdAt)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>打款时间</span>
                    <span>{formatTime(detail.paidAt)}</span>
                  </div>
                </div>
              </div>

              {/* 失败原因 - 仅 failed 状态显示 */}
              {detail.status === 'failed' && detail.failReason && (
                <>
                  <Separator />
                  <div className='space-y-1'>
                    <h4 className='flex items-center gap-2 text-sm font-medium text-red-600'>
                      <AlertCircle className='h-4 w-4' />
                      失败原因
                    </h4>
                    <div className='ml-6'>
                      <p className='rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20'>
                        {detail.failReason}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* 操作日志 */}
              <div className='space-y-1'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  操作日志
                </h4>
                <div className='ml-6'>
                  {logs.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>暂无日志</p>
                  ) : (
                    <div className='space-y-3'>
                      {logs.map((log) => {
                        const actionInfo = logActionConfig[log.action] || {
                          label: log.action,
                          color: 'text-gray-600',
                        }
                        return (
                          <div
                            key={log.id}
                            className='flex items-start gap-3 text-sm'
                          >
                            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted'>
                              <div className='h-2 w-2 rounded-full bg-primary' />
                            </div>
                            <div className='flex-1 space-y-1'>
                              <div className='flex items-center justify-between'>
                                <span className={cn('font-medium', actionInfo.color)}>
                                  {actionInfo.label}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {formatShortTime(log.createdAt)}
                                </span>
                              </div>
                              <p className='text-muted-foreground'>
                                {log.message || '--'}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                操作人: {log.operatorName || log.operator}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
