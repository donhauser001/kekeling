import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

/**
 * 获取列的显示名称
 * 优先级：meta.title > header 字符串 > column.id
 */
function getColumnDisplayName<TData>(
  column: ReturnType<Table<TData>['getAllColumns']>[number]
): string {
  // 优先使用 meta.title
  const meta = column.columnDef.meta as { title?: string } | undefined
  if (meta?.title) {
    return meta.title
  }

  // 如果 header 是字符串，直接使用
  const header = column.columnDef.header
  if (typeof header === 'string') {
    return header
  }

  // 最后使用 column.id
  return column.id
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ms-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='size-4' />
          显示列
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>切换显示列</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {getColumnDisplayName(column)}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
