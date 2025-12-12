/**
 * 审核 Drawer（P2）
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - FE-WD-P2-01
 * @see docs/资金安全提现体系/04-P2审核打款设计.md
 *
 * 验收标准：
 * - 非 `pending` 不显示审核按钮
 * - `reject` 未填原因不可提交
 * - 提交后状态即时刷新
 * - 信息全只读，无编辑能力
 * - 二次确认文案明确
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminEscortWithdrawRecord, useAdminWithdrawReview } from '@/hooks/use-api'
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

interface WithdrawReviewDrawerProps {
  open: boolean
  withdrawId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function WithdrawReviewDrawer({
  open,
  withdrawId,
  onClose,
  onSuccess,
}: WithdrawReviewDrawerProps) {
  // 表单状态
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve')
  const [rejectReason, setRejectReason] = useState('')

  // 详情查询
  const { data: detail, isLoading } = useAdminEscortWithdrawRecord(withdrawId || '')

  // 审核 mutation
  const reviewMutation = useAdminWithdrawReview()

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
    setDecision('approve')
    setRejectReason('')
  }

  // 处理关闭
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // 处理提交
  const handleSubmit = async () => {
    if (!withdrawId || !detail) return

    // 驳回时必须填写原因
    if (decision === 'reject' && !rejectReason.trim()) {
      toast.error('请填写驳回原因')
      return
    }

    try {
      await reviewMutation.mutateAsync({
        id: withdrawId,
        data: {
          action: decision,
          rejectReason: decision === 'reject' ? rejectReason.trim() : undefined,
        },
      })

      toast.success(decision === 'approve' ? '审核通过' : '已驳回申请')
      handleClose()
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  // 是否可以提交
  const canSubmit =
    detail?.status === 'pending' &&
    !reviewMutation.isPending &&
    (decision === 'approve' || rejectReason.trim())

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className='w-full sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>审核提现申请</SheetTitle>
          <SheetDescription>
            审核通过后将进入打款阶段，驳回将释放冻结金额
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : !detail ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-muted-foreground' />
            <p className='text-muted-foreground'>暂无数据</p>
          </div>
        ) : detail.status !== 'pending' ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-yellow-500' />
            <p className='text-muted-foreground'>该提现申请当前状态不可审核</p>
          </div>
        ) : (
          <ScrollArea className='h-[calc(100vh-16rem)] pr-4'>
            <div className='space-y-6 py-4'>
              {/* A. 信息只读区 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  申请信息
                </h4>
                <div className='ml-6 grid gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>陪诊员</span>
                    <span>{detail.escortName} (ID: {detail.escortId})</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>手机号</span>
                    <span>{detail.escortPhoneMasked}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>提现金额</span>
                    <span className='font-medium'>¥{detail.amount.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>实际到账</span>
                    <span className='font-medium text-green-600'>
                      ¥{detail.netAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>到账账户</span>
                    <div className='flex items-center gap-1.5'>
                      {methodInfo?.icon}
                      <span>{methodInfo?.label}</span>
                      <span className='font-mono'>{detail.accountMasked}</span>
                    </div>
                  </div>
                  {detail.bankName && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>银行名称</span>
                      <span>{detail.bankName}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>提交时间</span>
                    <span>{formatTime(detail.createdAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* B. 风险提示区（预留） */}
              {/* TODO: 后端返回风控信息后展示 */}

              {/* C. 审核动作区 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Wallet className='h-4 w-4 text-muted-foreground' />
                  审核决定
                </h4>
                <div className='ml-6 space-y-4'>
                  <RadioGroup
                    value={decision}
                    onValueChange={(v) => setDecision(v as 'approve' | 'reject')}
                    className='space-y-3'
                  >
                    <div className='flex items-center space-x-3'>
                      <RadioGroupItem value='approve' id='approve' />
                      <Label
                        htmlFor='approve'
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        审核通过
                      </Label>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <RadioGroupItem value='reject' id='reject' />
                      <Label
                        htmlFor='reject'
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <XCircle className='h-4 w-4 text-red-600' />
                        驳回申请
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* 驳回原因输入框 */}
                  {decision === 'reject' && (
                    <div className='space-y-2'>
                      <Label htmlFor='rejectReason'>
                        驳回原因 <span className='text-red-500'>*</span>
                      </Label>
                      <Textarea
                        id='rejectReason'
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder='请输入驳回原因，将通知陪诊员...'
                        rows={3}
                        className={cn(
                          !rejectReason.trim() && 'border-red-300'
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* D. 二次确认 */}
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  {decision === 'approve'
                    ? '确认后将进入打款阶段，需财务人员执行打款操作'
                    : '驳回后冻结金额将释放，陪诊员可重新申请提现'}
                </AlertDescription>
              </Alert>
            </div>
          </ScrollArea>
        )}

        <SheetFooter className='flex gap-2 sm:justify-end'>
          <Button variant='outline' onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant={decision === 'reject' ? 'destructive' : 'default'}
          >
            {reviewMutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {decision === 'approve' ? '确认审核通过' : '确认驳回'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
