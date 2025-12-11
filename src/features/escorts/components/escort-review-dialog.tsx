import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useReviewEscort } from '@/hooks/use-api'
import type { Escort } from '@/lib/api'

interface EscortReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escort: Escort | null
  onSuccess: () => void
}

export function EscortReviewDialog({
  open,
  onOpenChange,
  escort,
  onSuccess,
}: EscortReviewDialogProps) {
  const [note, setNote] = useState('')
  const reviewMutation = useReviewEscort()

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!escort) return

    if (action === 'reject' && !note.trim()) {
      toast.error('拒绝时请填写原因')
      return
    }

    try {
      await reviewMutation.mutateAsync({
        id: escort.id,
        action,
        note: note.trim() || undefined,
      })
      toast.success(action === 'approve' ? '审核通过' : '已拒绝申请')
      setNote('')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const levelLabels: Record<string, string> = {
    senior: '资深',
    intermediate: '中级',
    junior: '初级',
    trainee: '实习',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>陪诊员审核</DialogTitle>
          <DialogDescription>审核陪诊员入驻申请</DialogDescription>
        </DialogHeader>

        {escort && (
          <div className='space-y-4 py-4'>
            {/* 基本信息 */}
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={escort.avatar || undefined} />
                <AvatarFallback className='bg-primary text-primary-foreground text-lg'>
                  {escort.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-semibold'>{escort.name}</span>
                  <Badge variant='secondary'>{levelLabels[escort.level] || escort.level}</Badge>
                </div>
                <div className='text-muted-foreground text-sm'>{escort.phone}</div>
                <div className='text-muted-foreground text-xs'>
                  申请时间：{new Date(escort.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <Separator />

            {/* 详细信息 */}
            <div className='grid gap-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>性别</span>
                <span>{escort.gender === 'male' ? '男' : '女'}</span>
              </div>
              {escort.idCard && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>身份证</span>
                  <span>{escort.idCard.replace(/^(.{6})(.+)(.{4})$/, '$1****$3')}</span>
                </div>
              )}
              {escort.experience && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>从业经验</span>
                  <span>{escort.experience}</span>
                </div>
              )}
              {escort.hospitals.length > 0 && (
                <div>
                  <span className='text-muted-foreground'>关联医院</span>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {escort.hospitals.map(h => (
                      <Badge key={h.id} variant='outline' className='text-xs'>
                        {h.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {escort.introduction && (
                <div>
                  <span className='text-muted-foreground'>个人简介</span>
                  <p className='mt-1 text-sm'>{escort.introduction}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* 审核备注 */}
            <div className='space-y-2'>
              <Label htmlFor='note'>审核备注</Label>
              <Textarea
                id='note'
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder='输入审核备注（拒绝时必填）...'
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={reviewMutation.isPending}
          >
            取消
          </Button>
          <Button
            variant='destructive'
            onClick={() => handleReview('reject')}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <XCircle className='mr-2 h-4 w-4' />
            )}
            拒绝
          </Button>
          <Button
            onClick={() => handleReview('approve')}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <CheckCircle className='mr-2 h-4 w-4' />
            )}
            通过
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
