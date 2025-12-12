import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ReferralRecord } from '@/lib/api'

// 记录状态颜色映射
const recordStatusColors = new Map<string, string>([
  ['pending', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['registered', 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'],
  ['rewarded', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['invalid', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

const recordStatusLabels: Record<string, string> = {
  pending: '待注册',
  registered: '已注册',
  rewarded: '已奖励',
  invalid: '无效',
}

export function getReferralRecordsColumns(): ColumnDef<ReferralRecord>[] {
  return [
    {
      id: 'inviter',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='邀请人' />
      ),
      cell: ({ row }) => {
        const { inviter, inviterId } = row.original
        return <span>{inviter?.nickname || inviterId}</span>
      },
      meta: { title: '邀请人' },
      enableSorting: false,
    },
    {
      id: 'invitee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='被邀请人' />
      ),
      cell: ({ row }) => {
        const { invitee, inviteeId } = row.original
        return <span>{invitee?.nickname || inviteeId || '未注册'}</span>
      },
      meta: { title: '被邀请人' },
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='类型' />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return <span>{type === 'user' ? '用户邀请' : '就诊人邀请'}</span>
      },
      meta: { title: '类型' },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = recordStatusColors.get(status)
        return (
          <Badge variant='outline' className={cn(badgeColor)}>
            {recordStatusLabels[status] || status}
          </Badge>
        )
      },
      meta: { title: '状态' },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='创建时间' />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        return <span className='text-nowrap'>{new Date(createdAt).toLocaleString()}</span>
      },
      meta: { title: '创建时间' },
    },
  ]
}
