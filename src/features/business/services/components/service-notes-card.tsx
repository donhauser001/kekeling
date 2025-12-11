import { ClipboardList, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceFormData } from '../types'

interface ServiceNotesCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function ServiceNotesCard({ formData, onFormChange }: ServiceNotesCardProps) {
    const addServiceNote = () => {
        onFormChange({
            ...formData,
            serviceNotes: [...formData.serviceNotes, { title: '', content: '' }],
        })
    }

    const removeServiceNote = (index: number) => {
        onFormChange({
            ...formData,
            serviceNotes: formData.serviceNotes.filter((_, i) => i !== index),
        })
    }

    const updateServiceNote = (index: number, field: 'title' | 'content', value: string) => {
        onFormChange({
            ...formData,
            serviceNotes: formData.serviceNotes.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        })
    }

    return (
        <Card>
            <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <ClipboardList className='h-5 w-5' />
                            服务须知
                        </CardTitle>
                        <CardDescription>用户购买前需要了解的注意事项</CardDescription>
                    </div>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={addServiceNote}
                    >
                        <Plus className='mr-1 h-4 w-4' />
                        添加
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    {formData.serviceNotes.map((item, index) => (
                        <div key={index} className='space-y-3 rounded-lg border p-4'>
                            <div className='flex items-center gap-3'>
                                <Input
                                    placeholder='标题，如：服务时间'
                                    value={item.title}
                                    onChange={e =>
                                        updateServiceNote(index, 'title', e.target.value)
                                    }
                                    className='flex-1'
                                />
                                {formData.serviceNotes.length > 1 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => removeServiceNote(index)}
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                placeholder='内容，如：服务时间为当日8:00-17:00'
                                value={item.content}
                                onChange={e =>
                                    updateServiceNote(index, 'content', e.target.value)
                                }
                                rows={2}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
