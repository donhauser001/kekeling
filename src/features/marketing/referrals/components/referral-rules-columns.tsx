import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ReferralRule } from '@/lib/api'

// 状态颜色映射
const statusColors = new Map<string, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

interface ReferralRulesColumnsProps {
  onView: (rule: ReferralRule) => void
  onEdit: (rule: ReferralRule) => void
  onDelete: (rule: ReferralRule) => void
}

export function getReferralRulesColumns({ onView, onEdit, onDelete }: ReferralRulesColumnsProps): ColumnDef<ReferralRule>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='规则名称' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
      meta: { title: '规则名称' },
      enableHiding: false,
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
      id: 'inviterReward',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='邀请人奖励' />
      ),
      cell: ({ row }) => {
        const { inviterPoints, inviterCouponId } = row.original
        const parts = []
        if ((inviterPoints ?? 0) > 0) parts.push(`${inviterPoints}积分`)
        if (inviterCouponId) parts.push(`券ID:${inviterCouponId}`)
        return <span>{parts.length ? parts.join(' / ') : '-'}</span>
      },
      meta: { title: '邀请人奖励' },
      enableSorting: false,
    },
    {
      id: 'inviteeReward',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='被邀请人奖励' />
      ),
      cell: ({ row }) => {
        const { inviteePoints, inviteeCouponId } = row.original
        const parts = []
        if ((inviteePoints ?? 0) > 0) parts.push(`${inviteePoints}积分`)
        if (inviteeCouponId) parts.push(`券ID:${inviteeCouponId}`)
        return <span>{parts.length ? parts.join(' / ') : '-'}</span>
      },
      meta: { title: '被邀请人奖励' },
      enableSorting: false,
    },
    {
      accessorKey: 'requireFirstOrder',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='需首单' />
      ),
      cell: ({ row }) => (
        <span>{row.getValue('requireFirstOrder') ? '是' : '否'}</span>
      ),
      meta: { title: '需首单' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = statusColors.get(status)
        return (
          <Badge variant='outline' className={cn(badgeColor)}>
            {status === 'active' ? '启用' : '禁用'}
          </Badge>
        )
      },
      meta: { title: '状态' },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const rule = row.original
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant='ghost'
                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
              >
                <DotsHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuItem onClick={() => onView(rule)}>
                查看详情
                <DropdownMenuShortcut>
                  <Eye size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(rule)}>
                编辑
                <DropdownMenuShortcut>
                  <Pencil size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(rule)}
                className='text-destructive focus:text-destructive focus:bg-destructive/10'
              >
                删除
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
