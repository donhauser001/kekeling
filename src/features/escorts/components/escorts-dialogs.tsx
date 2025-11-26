import { EscortsActionDialog } from './escorts-action-dialog'
import { EscortsDeleteDialog } from './escorts-delete-dialog'
import { EscortsInviteDialog } from './escorts-invite-dialog'
import { EscortsPermissionsDialog } from './escorts-permissions-dialog'
import { useEscorts } from './escorts-provider'

export function EscortsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEscorts()
  return (
    <>
      <EscortsActionDialog
        key='escort-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <EscortsInviteDialog
        key='escort-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <EscortsActionDialog
            key={`escort-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EscortsDeleteDialog
            key={`escort-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EscortsPermissionsDialog
            key={`escort-permissions-${currentRow.id}`}
            open={open === 'permissions'}
            onOpenChange={() => {
              setOpen('permissions')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
