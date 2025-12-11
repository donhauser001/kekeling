import { ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceFormData } from '../types'

interface PurchaseLimitCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function PurchaseLimitCard({ formData, onFormChange }: PurchaseLimitCardProps) {
    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <ShoppingBag className='h-5 w-5' />
                    购买限制
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label>最小数量</Label>
                        <Input
                            type='number'
                            value={formData.minQuantity}
                            onChange={e =>
                                onFormChange({ ...formData, minQuantity: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>最大数量</Label>
                        <Input
                            type='number'
                            value={formData.maxQuantity}
                            onChange={e =>
                                onFormChange({ ...formData, maxQuantity: e.target.value })
                            }
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
