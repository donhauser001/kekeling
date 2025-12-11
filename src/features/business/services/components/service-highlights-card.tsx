import { Sparkles, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceFormData } from '../types'

interface ServiceHighlightsCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function ServiceHighlightsCard({ formData, onFormChange }: ServiceHighlightsCardProps) {
    const addServiceInclude = () => {
        onFormChange({
            ...formData,
            serviceIncludes: [...formData.serviceIncludes, { text: '', icon: 'check' }],
        })
    }

    const removeServiceInclude = (index: number) => {
        onFormChange({
            ...formData,
            serviceIncludes: formData.serviceIncludes.filter((_, i) => i !== index),
        })
    }

    const updateServiceInclude = (index: number, text: string) => {
        onFormChange({
            ...formData,
            serviceIncludes: formData.serviceIncludes.map((item, i) =>
                i === index ? { ...item, text } : item
            ),
        })
    }

    return (
        <Card>
            <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <Sparkles className='h-5 w-5' />
                            服务亮点
                        </CardTitle>
                        <CardDescription>突出服务的核心特色</CardDescription>
                    </div>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={addServiceInclude}
                    >
                        <Plus className='mr-1 h-3 w-3' />
                        添加
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-2'>
                    {formData.serviceIncludes.map((item, index) => (
                        <div key={index} className='flex items-center gap-2'>
                            <Check className='h-4 w-4 text-primary shrink-0' />
                            <Input
                                placeholder='如：专业陪诊师全程陪同'
                                value={item.text}
                                onChange={e =>
                                    updateServiceInclude(index, e.target.value)
                                }
                                className='flex-1 h-8 text-sm'
                            />
                            {formData.serviceIncludes.length > 1 && (
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => removeServiceInclude(index)}
                                >
                                    <X className='h-3 w-3' />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
