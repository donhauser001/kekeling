/**
 * 打款确认 Modal（P2 - 高危）
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - FE-WD-P2-02
 * @see docs/资金安全提现体系/04-P2审核打款设计.md
 *
 * ⚠️ 提现打款为高危操作
 *
 * 红线规则：
 * 1. 禁止批量操作
 * 2. 禁止跳状态（必须 pending → approved → processing）
 * 3. 禁止前端拼状态（必须走后端状态机）
 * 4. 禁止无审计日志
 * 5. 禁止无 Ledger 记录
 *
 * 验收标准：
 * - 未输入 `CONFIRM` 禁止提交
 * - 打款中 loading 锁死按钮
 * - 成功/失败提示明确
 * - 禁止复制粘贴 `CONFIRM`
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Building2,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAdminEscortWithdrawRecord, useAdminWithdrawPayout } from '@/hooks/use-api'
import type { AdminWithdrawMethod } from '@/lib/api'
import { cn } from '@/lib/utils'

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

interface WithdrawPayoutModalProps {
  open: boolean
  withdrawId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function WithdrawPayoutModal({
  open,
  withdrawId,
  onClose,
  onSuccess,
}: WithdrawPayoutModalProps) {
  // 表单状态
  const [payoutMethod, setPayoutMethod] = useState<'manual' | 'channel'>('manual')
  const [transactionNo, setTransactionNo] = useState('')
  const [confirmInput, setConfirmInput] = useState('')

  // 详情查询
  const { data: detail, isLoading } = useAdminEscortWithdrawRecord(withdrawId || '')

  // 打款 mutation
  const payoutMutation = useAdminWithdrawPayout()

  // 格式化时间
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--'
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
    } catch {
      return dateStr
    }
  }

  const methodInfo = detail ? methodConfig[detail.method] : null

  // 重置表单
  const resetForm = () => {
    setPayoutMethod('manual')
    setTransactionNo('')
    setConfirmInput('')
  }

  // 处理关闭
  const handleClose = () => {
    if (payoutMutation.isPending) return // 打款中禁止关闭
    resetForm()
    onClose()
  }

  // 处理提交
  const handleSubmit = async () => {
    if (!withdrawId || !detail) return

    // 验证 CONFIRM
    if (confirmInput !== 'CONFIRM') {
      toast.error('请输入 CONFIRM 确认打款')
      return
    }

    // 手动打款时建议填写交易号
    if (payoutMethod === 'manual' && !transactionNo.trim()) {
      const confirmed = window.confirm('未填写交易号，确定继续吗？')
      if (!confirmed) return
    }

    try {
      await payoutMutation.mutateAsync({
        id: withdrawId,
        data: {
          payoutMethod,
          operatorConfirmText: 'CONFIRM',
          transactionNo: transactionNo.trim() || undefined,
        },
      })

      toast.success('打款成功', {
        description: '提现状态已更新为已完成',
      })
      handleClose()
      onSuccess?.()
    } catch (error) {
      toast.error('打款失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }

  // 禁止粘贴 CONFIRM
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    toast.warning('请手动输入 CONFIRM')
  }

  // 是否可以提交
  const canSubmit =
    detail?.status === 'approved' &&
    !payoutMutation.isPending &&
    confirmInput === 'CONFIRM'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>确认打款操作</DialogTitle>
          <DialogDescription>
            本操作将真实发生资金打款，请仔细核对信息
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-48 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : !detail ? (
          <div className='flex h-48 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-muted-foreground' />
            <p className='text-muted-foreground'>暂无数据</p>
          </div>
        ) : detail.status !== 'approved' ? (
          <div className='flex h-48 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-yellow-500' />
            <p className='text-muted-foreground'>该提现申请当前状态不可打款</p>
            <p className='text-sm text-muted-foreground'>
              仅已审核通过的申请可执行打款
            </p>
          </div>
        ) : (
          <div className='space-y-6 py-2'>
            {/* ① 高危提示（红色背景） */}
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>高危操作警告</AlertTitle>
              <AlertDescription>
                本操作将真实发生资金打款，请确认以下信息无误
              </AlertDescription>
            </Alert>

            {/* ② 关键信息复核（加粗） */}
            <div className='rounded-lg border bg-muted/50 p-4 space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>提现金额</span>
                <span className='font-bold text-lg'>¥{detail.amount.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>实际到账</span>
                <span className='font-bold text-lg text-green-600'>
                  ¥{detail.netAmount.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>到账账户</span>
                <div className='flex items-center gap-1.5'>
                  {methodInfo?.icon}
                  <span className='font-medium'>{methodInfo?.label}</span>
                  <span className='font-mono'>{detail.accountMasked}</span>
                </div>
              </div>
              {detail.bankName && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>银行名称</span>
                  <span className='font-medium'>{detail.bankName}</span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>陪诊员 ID</span>
                <span className='font-mono text-sm'>{detail.escortId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>当前状态</span>
                <Badge className='bg-green-100 text-green-800'>
                  <CheckCircle className='mr-1 h-3 w-3' />
                  已审核通过
                </Badge>
              </div>
            </div>

            {/* ③ 打款方式选择 */}
            <div className='space-y-3'>
              <Label>打款方式</Label>
              <RadioGroup
                value={payoutMethod}
                onValueChange={(v) => setPayoutMethod(v as 'manual' | 'channel')}
                className='space-y-2'
              >
                <div className='flex items-center space-x-3'>
                  <RadioGroupItem value='manual' id='manual' />
                  <Label htmlFor='manual' className='cursor-pointer'>
                    手动打款（线下）
                  </Label>
                </div>
                <div className='flex items-center space-x-3'>
                  <RadioGroupItem value='channel' id='channel' disabled />
                  <Label htmlFor='channel' className='cursor-pointer text-muted-foreground'>
                    支付通道打款（预留）
                  </Label>
                </div>
              </RadioGroup>

              {payoutMethod === 'manual' && (
                <div className='space-y-2'>
                  <Label htmlFor='transactionNo'>
                    交易单号 <span className='text-muted-foreground text-xs'>（建议填写）</span>
                  </Label>
                  <Input
                    id='transactionNo'
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                    placeholder='请输入银行/支付宝/微信转账单号...'
                  />
                </div>
              )}
            </div>

            {/* ④ 二次确认输入 */}
            <div className='space-y-3'>
              <Label htmlFor='confirmInput'>
                请输入 <span className='font-mono font-bold'>CONFIRM</span> 确认打款
              </Label>
              <Input
                id='confirmInput'
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                onPaste={handlePaste}
                placeholder='请手动输入 CONFIRM（不可粘贴）'
                className={cn(
                  'font-mono',
                  confirmInput && confirmInput !== 'CONFIRM' && 'border-red-300'
                )}
                autoComplete='off'
                disabled={payoutMutation.isPending}
              />
              <p className='text-xs text-muted-foreground'>
                为防止误操作，请手动输入 CONFIRM（禁止复制粘贴）
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={payoutMutation.isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant='destructive'
          >
            {payoutMutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            确认打款并记录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
