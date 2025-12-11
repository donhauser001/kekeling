import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { escortApi } from '@/lib/api'
import { toast } from 'sonner'
import { type Escort } from '@/lib/api'

interface BindEscortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escort: Escort | null
  mode: 'bind' | 'unbind'
}

export function BindEscortDialog({
  open,
  onOpenChange,
  escort,
  mode,
}: BindEscortDialogProps) {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!escort) return

    if (mode === 'bind' && !userId.trim()) {
      toast.error('请输入用户ID')
      return
    }

    setLoading(true)
    try {
      if (mode === 'bind') {
        await escortApi.bind(escort.id, userId.trim(), reason || undefined)
        toast.success('绑定成功')
      } else {
        await escortApi.unbind(escort.id, reason || undefined)
        toast.success('解绑成功')
      }
      queryClient.invalidateQueries({ queryKey: ['escorts'] })
      onOpenChange(false)
      setUserId('')
      setReason('')
    } catch (error: any) {
      toast.error(error.message || `${mode === 'bind' ? '绑定' : '解绑'}失败`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'bind' ? '绑定用户' : '解除绑定'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'bind'
              ? `将用户绑定到陪诊员 ${escort?.name || ''}`
              : `解除陪诊员 ${escort?.name || ''} 的用户绑定`}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {mode === 'bind' && (
            <div className='space-y-2'>
              <Label htmlFor='userId'>用户ID</Label>
              <Input
                id='userId'
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder='请输入用户ID'
              />
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='reason'>原因（可选）</Label>
            <Textarea
              id='reason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='请输入操作原因'
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '处理中...' : mode === 'bind' ? '确认绑定' : '确认解绑'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
