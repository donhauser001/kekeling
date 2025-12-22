import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { RefreshCw, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type Order } from '../data/schema'
import { AssignEscortDialog } from './assign-escort-dialog'

interface EscortCellProps {
  row: Row<Order>
}

export function EscortCell({ row }: EscortCellProps) {
  const order = row.original
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const escortName = order.escortName
  const hasEscort = !!escortName

  // 可以指派/换人的状态
  const canAssign = ['paid', 'assigned', 'confirmed'].includes(order.status)

  return (
    <>
      <div
        className='flex items-center gap-2'
        onClick={(e) => e.stopPropagation()}
      >
        {hasEscort ? (
          <>
            <div className='flex-1 min-w-0'>
              <div className='truncate'>{escortName}</div>
              <div className='text-muted-foreground text-xs truncate'>
                {order.escortPhone}
              </div>
            </div>
            {canAssign && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 flex-shrink-0'
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <RefreshCw className='h-3.5 w-3.5 text-muted-foreground hover:text-primary' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>换人</TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            {canAssign ? (
              <Button
                variant='outline'
                size='sm'
                className='h-7 px-2 text-xs bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary'
                onClick={() => setAssignDialogOpen(true)}
              >
                <UserPlus className='h-3.5 w-3.5 mr-1' />
                指派
              </Button>
            ) : (
              <span className='text-muted-foreground text-sm'>待分配</span>
            )}
          </>
        )}
      </div>

      {/* 派单对话框 */}
      <AssignEscortDialog
        orderId={order.id}
        orderNo={order.orderNo}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </>
  )
}

