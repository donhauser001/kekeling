import { Loader2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Patient } from '@/lib/api'

interface PatientDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function PatientDeleteDialog({
  open,
  onOpenChange,
  patient,
  onConfirm,
  isLoading,
}: PatientDeleteDialogProps) {
  if (!patient) return null

  const hasOrders = (patient.orderCount || 0) > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            确认删除就诊人
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-2'>
              <p>
                您确定要删除就诊人 <span className='font-medium'>{patient.name}</span> 吗？
              </p>
              {hasOrders ? (
                <p className='text-destructive'>
                  该就诊人已有 {patient.orderCount} 条订单记录，无法删除。
                </p>
              ) : (
                <p>此操作无法撤销。</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={async e => {
              e.preventDefault()
              await onConfirm()
            }}
            disabled={isLoading || hasOrders}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
