import { CircleDollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { ServiceFormData } from '../types'
import { UNIT_OPTIONS } from '../constants'

interface PriceConfigCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function PriceConfigCard({ formData, onFormChange }: PriceConfigCardProps) {
    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <CircleDollarSign className='h-5 w-5' />
                    价格配置
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                        <Label>
                            销售价格 <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            type='number'
                            placeholder='0'
                            value={formData.price}
                            onChange={e =>
                                onFormChange({ ...formData, price: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>原价（划线价）</Label>
                        <Input
                            type='number'
                            placeholder='可选'
                            value={formData.originalPrice}
                            onChange={e =>
                                onFormChange({ ...formData, originalPrice: e.target.value })
                            }
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>计价单位</Label>
                        <Select
                            value={formData.unit}
                            onValueChange={v =>
                                onFormChange({ ...formData, unit: v })
                            }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UNIT_OPTIONS.map(u => (
                                    <SelectItem key={u} value={u}>
                                        {u}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
