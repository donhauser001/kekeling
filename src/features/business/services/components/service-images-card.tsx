import { Image as ImageIcon } from 'lucide-react'
import { ImageUpload } from '@/components/image-upload'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ServiceFormData } from '../types'

interface ServiceImagesCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function ServiceImagesCard({ formData, onFormChange }: ServiceImagesCardProps) {
    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <ImageIcon className='h-5 w-5' />
                    服务图片
                </CardTitle>
                <CardDescription>
                    建议尺寸 750×500，第一张将作为列表封面图
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ImageUpload
                    value={formData.coverImages}
                    onChange={value =>
                        onFormChange({ ...formData, coverImages: value as string[] })
                    }
                    multiple
                    maxCount={6}
                    folder='service'
                    itemSize='lg'
                />
            </CardContent>
        </Card>
    )
}
