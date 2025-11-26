import { EmployeesActionDialog } from './employees-action-dialog'
import { EmployeesDeleteDialog } from './employees-delete-dialog'
import { EmployeesInviteDialog } from './employees-invite-dialog'
import { EmployeesPermissionsDialog } from './employees-permissions-dialog'
import { useEmployees } from './employees-provider'

export function EmployeesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEmployees()
  return (
    <>
      <EmployeesActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <EmployeesInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <EmployeesActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EmployeesDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EmployeesPermissionsDialog
            key={`user-permissions-${currentRow.id}`}
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
