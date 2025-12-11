import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Key, Trash2, UserPen, Link, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Escort } from '../data/schema'
import { useEscorts } from './escorts-provider'

type DataTableRowActionsProps = {
  row: Row<Escort>
  onBind?: (escort: Escort) => void
  onUnbind?: (escort: Escort) => void
}

export function DataTableRowActions({ row, onBind, onUnbind }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useEscorts()
  const escort = row.original
  const hasUserId = escort.userId !== null && escort.userId !== undefined

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            编辑
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('permissions')
            }}
          >
            权限设置
            <DropdownMenuShortcut>
              <Key size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {hasUserId ? (
            <DropdownMenuItem
              onClick={() => {
                onUnbind?.(escort)
              }}
            >
              解除绑定
              <DropdownMenuShortcut>
                <Unlink size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                onBind?.(escort)
              }}
            >
              绑定用户
              <DropdownMenuShortcut>
                <Link size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            删除
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
