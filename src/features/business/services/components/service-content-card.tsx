import { AlignLeft } from 'lucide-react'
import { RichEditor } from '@/components/rich-editor'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceFormData } from '../types'

interface ServiceContentCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function ServiceContentCard({ formData, onFormChange }: ServiceContentCardProps) {
    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <AlignLeft className='h-5 w-5' />
                    服务内容
                </CardTitle>
                <CardDescription>
                    详细介绍服务内容，支持文字格式和插入图片
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RichEditor
                    value={formData.content}
                    onChange={value =>
                        onFormChange({ ...formData, content: value })
                    }
                    placeholder='请输入服务的详细介绍...'
                    minHeight={300}
                    maxHeight={500}
                />
            </CardContent>
        </Card>
    )
}
