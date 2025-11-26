'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Escort } from '../data/schema'

type EscortDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Escort
}

export function EscortsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: EscortDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following escort has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          删除陪诊员
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除陪诊员{' '}
            <span className='font-bold'>{currentRow.username}</span> 吗？
            <br />
            此操作将永久删除该陪诊员，且无法恢复。
          </p>

          <Label className='my-2'>
            用户名：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='请输入用户名以确认删除'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              请谨慎操作，此操作无法撤销。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
