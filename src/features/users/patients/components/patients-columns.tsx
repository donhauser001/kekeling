import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, Star } from 'lucide-react'
import type { Patient } from '@/lib/api'

interface PatientsColumnsOptions {
  onView?: (patient: Patient) => void
  onEdit?: (patient: Patient) => void
  onDelete?: (patient: Patient) => void
  onSetDefault?: (patient: Patient) => void
}

export function getPatientsColumns(options: PatientsColumnsOptions = {}): ColumnDef<Patient>[] {
  const { onView, onEdit, onDelete, onSetDefault } = options

  return [
    {
      accessorKey: 'name',
      header: '姓名',
      cell: ({ row }) => {
        const patient = row.original
        return (
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{patient.name}</span>
            {patient.isDefault && (
              <Badge variant='secondary' className='bg-amber-50 text-amber-700'>
                <Star className='mr-1 h-3 w-3' />
                默认
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'gender',
      header: '性别',
      cell: ({ row }) => {
        const gender = row.getValue('gender') as string
        return (
          <Badge variant='outline' className={gender === 'male' ? 'border-blue-200 text-blue-700' : 'border-pink-200 text-pink-700'}>
            {gender === 'male' ? '男' : '女'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'age',
      header: '年龄',
      cell: ({ row }) => {
        const age = row.original.age
        return age != null ? <span>{age}岁</span> : <span className='text-muted-foreground'>-</span>
      },
    },
    {
      accessorKey: 'phone',
      header: '手机号',
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.getValue('phone')}</span>
      ),
    },
    {
      accessorKey: 'relation',
      header: '与用户关系',
      cell: ({ row }) => (
        <Badge variant='outline'>{row.getValue('relation')}</Badge>
      ),
    },
    {
      accessorKey: 'user',
      header: '所属用户',
      cell: ({ row }) => {
        const user = row.original.user
        if (!user) return <span className='text-muted-foreground'>-</span>
        return (
          <div className='flex flex-col'>
            <span className='text-sm'>{user.nickname || '微信用户'}</span>
            <span className='text-muted-foreground text-xs font-mono'>{user.phone || '-'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'orderCount',
      header: '订单数',
      cell: ({ row }) => {
        const count = row.original.orderCount || 0
        return <span className='font-medium'>{count}</span>
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const patient = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>打开菜单</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView?.(patient)}>
                <Eye className='mr-2 h-4 w-4' />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(patient)}>
                <Edit className='mr-2 h-4 w-4' />
                编辑
              </DropdownMenuItem>
              {!patient.isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault?.(patient)}>
                  <Star className='mr-2 h-4 w-4' />
                  设为默认
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(patient)}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
