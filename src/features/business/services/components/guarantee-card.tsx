import { Shield } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceGuarantee } from '@/lib/api'
import type { ServiceFormData } from '../types'
import { GuaranteeSelector } from './guarantee-selector'

interface GuaranteeCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
    guarantees: ServiceGuarantee[] | undefined
    onNavigate: () => void
}

export function GuaranteeCard({
    formData,
    onFormChange,
    guarantees,
    onNavigate,
}: GuaranteeCardProps) {
    const toggleGuarantee = (guaranteeId: string) => {
        onFormChange({
            ...formData,
            guaranteeIds: formData.guaranteeIds.includes(guaranteeId)
                ? formData.guaranteeIds.filter(id => id !== guaranteeId)
                : [...formData.guaranteeIds, guaranteeId],
        })
    }

    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <Shield className='h-5 w-5' />
                    服务保障
                </CardTitle>
                <CardDescription>
                    选择要展示的服务保障项
                    {formData.guaranteeIds.length > 0 && (
                        <span className='ml-2 text-primary'>
                            （已选 {formData.guaranteeIds.length} 项）
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <GuaranteeSelector
                    guarantees={guarantees || []}
                    selectedIds={formData.guaranteeIds}
                    onToggle={toggleGuarantee}
                    onNavigate={onNavigate}
                />
            </CardContent>
        </Card>
    )
}
