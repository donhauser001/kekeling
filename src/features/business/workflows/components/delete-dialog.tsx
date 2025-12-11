import { Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Workflow } from '@/lib/api'

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workflow: Workflow | null
    onConfirm: () => void
    isPending: boolean
}

export function DeleteDialog({
    open,
    onOpenChange,
    workflow,
    onConfirm,
    isPending,
}: DeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                        确定要删除流程「{workflow?.name}」吗？此操作无法撤销。
                        {workflow?._count?.services ? (
                            <span className='block mt-2 text-destructive'>
                                ⚠️ 该流程关联了 {workflow._count.services} 个服务，删除后将解除关联。
                            </span>
                        ) : null}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        删除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
