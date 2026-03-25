import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useAdminEscortWithdrawRecord, useAdminWithdrawFail } from '@/hooks/use-api'

interface WithdrawFailModalProps {
  open: boolean
  withdrawId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function WithdrawFailModal({
  open,
  withdrawId,
  onClose,
  onSuccess,
}: WithdrawFailModalProps) {
  const [reason, setReason] = useState('')
  const { data: detail, isLoading } = useAdminEscortWithdrawRecord(withdrawId || '')
  const failMutation = useAdminWithdrawFail()

  const handleClose = () => {
    if (failMutation.isPending) return
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!withdrawId) return
    if (!reason.trim()) {
      toast.error('请填写打款失败原因')
      return
    }

    try {
      await failMutation.mutateAsync({ id: withdrawId, reason: reason.trim() })
      toast.success('已标记为打款失败')
      handleClose()
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const canSubmit = ['approved', 'processing'].includes(detail?.status || '') && !failMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>标记打款失败</DialogTitle>
          <DialogDescription>失败后该笔提现金额会退回陪诊员可提现余额</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : !detail ? (
          <div className='flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <AlertTriangle className='h-10 w-10' />
            <p>暂无数据</p>
          </div>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='rounded-lg border bg-muted/40 p-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>提现单号</span>
                <span className='font-mono text-xs'>{detail.withdrawNo}</span>
              </div>
              <div className='mt-2 flex justify-between'>
                <span className='text-muted-foreground'>陪诊员</span>
                <span>{detail.escortName}</span>
              </div>
              <div className='mt-2 flex justify-between'>
                <span className='text-muted-foreground'>金额</span>
                <span className='font-medium'>¥{detail.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='withdraw-fail-reason'>
                失败原因 <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='withdraw-fail-reason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='请填写失败原因，例如银行卡信息错误、银行退票、人工打款异常等'
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={failMutation.isPending}>
            取消
          </Button>
          <Button variant='destructive' onClick={handleSubmit} disabled={!canSubmit}>
            {failMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            确认标记失败
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
