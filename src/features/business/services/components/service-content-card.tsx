import { AlignLeft, Code, FileText } from 'lucide-react'
import { RichEditor } from '@/components/rich-editor'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ServiceFormData, ContentType } from '../types'

interface ServiceContentCardProps {
    formData: ServiceFormData
    onFormChange: (data: ServiceFormData) => void
}

export function ServiceContentCard({ formData, onFormChange }: ServiceContentCardProps) {
    const handleContentTypeChange = (value: string) => {
        onFormChange({ ...formData, contentType: value as ContentType })
    }

    return (
        <Card>
            <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <AlignLeft className='h-5 w-5' />
                    服务内容
                </CardTitle>
                <CardDescription>
                    详细介绍服务内容，可选择富文本编辑器或直接编写 HTML 代码
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs
                    value={formData.contentType || 'richtext'}
                    onValueChange={handleContentTypeChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="richtext" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            富文本编辑器
                        </TabsTrigger>
                        <TabsTrigger value="html" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            HTML 代码
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="richtext" className="mt-0">
                        <RichEditor
                            value={formData.content}
                            onChange={value =>
                                onFormChange({ ...formData, content: value })
                            }
                            placeholder='请输入服务的详细介绍...'
                            minHeight={300}
                            maxHeight={500}
                        />
                    </TabsContent>

                    <TabsContent value="html" className="mt-0 space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="html-content" className="text-sm text-muted-foreground">
                                直接输入 HTML 代码，支持完整的 HTML 标签和样式
                            </Label>
                            <Textarea
                                id="html-content"
                                value={formData.content}
                                onChange={(e) =>
                                    onFormChange({ ...formData, content: e.target.value })
                                }
                                placeholder={`<div class="service-content">
  <h3>服务流程</h3>
  <p><strong>第一步：</strong>预约挂号...</p>
  <p><strong>第二步：</strong>陪同就诊...</p>
</div>`}
                                className="min-h-[300px] font-mono text-sm"
                            />
                        </div>

                        {/* HTML 预览 */}
                        {formData.content && (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    预览效果
                                </Label>
                                <div
                                    className="border rounded-md p-4 bg-white min-h-[100px] prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: formData.content }}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
