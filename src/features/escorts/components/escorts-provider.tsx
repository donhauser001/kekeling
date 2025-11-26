import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Escort } from '../data/schema'

type EscortsDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'permissions'

type EscortsContextType = {
  open: EscortsDialogType | null
  setOpen: (str: EscortsDialogType | null) => void
  currentRow: Escort | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Escort | null>>
}

const EscortsContext = React.createContext<EscortsContextType | null>(null)

export function EscortsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<EscortsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Escort | null>(null)

  return (
    <EscortsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </EscortsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEscorts = () => {
  const escortsContext = React.useContext(EscortsContext)

  if (!escortsContext) {
    throw new Error('useEscorts has to be used within <EscortsContext>')
  }

  return escortsContext
}
