import type { Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { Patient } from '@/lib/api'

interface PatientsTableProps {
  table: Table<Patient>
  isLoading?: boolean
  onRowClick?: (patient: Patient) => void
}

export function PatientsTable({
  table,
  isLoading,
  onRowClick,
}: PatientsTableProps) {
  if (isLoading) {
    return (
      <div className='rounded-md border'>
        <UITable>
          <TableHeader>
            <TableRow>
              {table.getAllColumns().map(column => (
                <TableHead key={column.id}>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {table.getAllColumns().map(column => (
                  <TableCell key={column.id}>
                    <Skeleton className='h-4 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className='h-24 text-center'
              >
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
    </div>
  )
}
