import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
    useService,
    useActiveServiceCategories,
    useCreateService,
    useUpdateService,
    useActiveWorkflows,
    useActiveServiceGuarantees,
    useActiveOperationGuides,
} from '@/hooks/use-api'
import type { CustomField } from '@/lib/api'

import type { ServiceFormData, CustomFieldFormData } from './types'
import { DEFAULT_FORM_DATA, DEFAULT_FIELD_ORDER } from './constants'
import {
    BasicInfoCard,
    PriceConfigCard,
    ServiceImagesCard,
    ServiceContentCard,
    ServiceNotesCard,
    ServiceHighlightsCard,
    GuaranteeCard,
    BusinessConfigCard,
    PurchaseLimitCard,
    CustomFieldDialog,
    EscortConfigCard,
} from './components'

export function ServiceEdit() {
    const navigate = useNavigate()
    const { id } = useParams({ strict: false })
    const isEdit = id && id !== 'new'

    const [formData, setFormData] = useState<ServiceFormData>(DEFAULT_FORM_DATA)

    // 自定义字段对话框状态
    const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false)
    const [editingCustomField, setEditingCustomField] = useState<CustomField | null>(null)
    const [customFieldForm, setCustomFieldForm] = useState<CustomFieldFormData>({
        label: '',
        type: 'text',
        placeholder: '',
        required: false,
        options: '',
    })

    // API hooks
    const { data: service, isLoading: isLoadingService } = useService(isEdit ? id : undefined)
    const { data: categories } = useActiveServiceCategories()
    const { data: activeWorkflows } = useActiveWorkflows()
    const { data: activeGuarantees } = useActiveServiceGuarantees()
    const { data: activeOperationGuides } = useActiveOperationGuides()
    const createMutation = useCreateService()
    const updateMutation = useUpdateService()

    // 加载服务数据
    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name,
                categoryId: service.categoryId,
                description: service.description || '',
                content: service.content || '',
                price: service.price.toString(),
                originalPrice: service.originalPrice?.toString() || '',
                unit: service.unit,
                coverImages: service.detailImages?.length
                    ? service.detailImages
                    : (service.coverImage ? [service.coverImage] : []),
                serviceIncludes: service.serviceIncludes?.length
                    ? service.serviceIncludes
                    : [{ text: '', icon: 'check' }],
                serviceNotes: service.serviceNotes?.length
                    ? service.serviceNotes
                    : [{ title: '', content: '' }],
                guaranteeIds: service.guarantees?.map(g => g.id) || [],
                needPatient: service.needPatient,
                needHospital: service.needHospital,
                needDepartment: service.needDepartment,
                needDoctor: service.needDoctor,
                needAppointment: service.needAppointment,
                needIdCard: service.needIdCard,
                needGender: service.needGender,
                needEmergencyContact: service.needEmergencyContact,
                allowPostOrder: service.allowPostOrder,
                customFields: service.customFields || [],
                fieldOrder: service.fieldOrder?.length ? service.fieldOrder : [...DEFAULT_FIELD_ORDER],
                minQuantity: service.minQuantity.toString(),
                maxQuantity: service.maxQuantity.toString(),
                tags: service.tags?.join('、') || '',
                sort: service.sort.toString(),
                status: service.status,
                workflowId: service.workflowId || '',
                // 陪诊员配置
                commissionRate: service.commissionRate?.toString() || '70',
                commissionNote: service.commissionNote || '',
                operationGuideIds: service.operationGuides?.map(g => g.id) || [],
            })
        } else if (!isEdit && categories?.length) {
            setFormData(prev => ({
                ...prev,
                categoryId: categories[0]?.id || '',
            }))
        }
    }, [service, isEdit, categories])

    // 保存服务
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入服务名称')
            return
        }
        if (!formData.categoryId) {
            toast.error('请选择服务分类')
            return
        }
        if (!formData.price || parseFloat(formData.price) < 0) {
            toast.error('请输入有效的价格')
            return
        }

        const serviceIncludes = formData.serviceIncludes
            .filter(item => item.text.trim())
            .map(item => ({ text: item.text.trim(), icon: item.icon || 'check' }))

        const serviceNotes = formData.serviceNotes
            .filter(item => item.title.trim() || item.content.trim())
            .map(item => ({ title: item.title.trim(), content: item.content.trim() }))

        const tags = formData.tags
            .split(/[,，、]/)
            .map(t => t.trim())
            .filter(Boolean)

        const submitData = {
            name: formData.name.trim(),
            categoryId: formData.categoryId,
            description: formData.description.trim() || undefined,
            content: formData.content.trim() || undefined,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            unit: formData.unit,
            coverImage: formData.coverImages[0] || undefined,
            detailImages: formData.coverImages.length ? formData.coverImages : undefined,
            serviceIncludes: serviceIncludes.length ? serviceIncludes : undefined,
            serviceNotes: serviceNotes.length ? serviceNotes : undefined,
            guaranteeIds: formData.guaranteeIds,
            needPatient: formData.needPatient,
            needHospital: formData.needHospital,
            needDepartment: formData.needDepartment,
            needDoctor: formData.needDoctor,
            needAppointment: formData.needAppointment,
            needIdCard: formData.needIdCard,
            needGender: formData.needGender,
            needEmergencyContact: formData.needEmergencyContact,
            allowPostOrder: formData.allowPostOrder,
            customFields: formData.customFields.length ? formData.customFields : undefined,
            fieldOrder: formData.fieldOrder,
            minQuantity: parseInt(formData.minQuantity) || 1,
            maxQuantity: parseInt(formData.maxQuantity) || 99,
            tags: tags.length ? tags : undefined,
            sort: parseInt(formData.sort) || 0,
            status: formData.status as 'active' | 'inactive' | 'draft',
            workflowId: formData.workflowId || undefined,
            // 陪诊员配置
            commissionRate: parseInt(formData.commissionRate) || 70,
            commissionNote: formData.commissionNote.trim() || undefined,
            operationGuideIds: formData.operationGuideIds,
        }

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id, data: submitData })
                toast.success('保存成功')
            } else {
                const newService = await createMutation.mutateAsync(submitData)
                toast.success('创建成功')
                navigate({ to: '/services/$id', params: { id: newService.id } })
            }
        } catch (err: any) {
            toast.error(err.message || '操作失败')
        }
    }

    // 打开添加自定义字段对话框
    const openAddCustomFieldDialog = () => {
        setEditingCustomField(null)
        setCustomFieldForm({
            label: '',
            type: 'text',
            placeholder: '',
            required: false,
            options: '',
        })
        setCustomFieldDialogOpen(true)
    }

    // 打开编辑自定义字段对话框
    const openEditCustomFieldDialog = (field: CustomField) => {
        setEditingCustomField(field)
        setCustomFieldForm({
            label: field.label,
            type: field.type,
            placeholder: field.placeholder || '',
            required: field.required,
            options: field.options?.join('\n') || '',
        })
        setCustomFieldDialogOpen(true)
    }

    // 保存自定义字段
    const saveCustomField = () => {
        if (!customFieldForm.label.trim()) {
            toast.error('请输入字段名称')
            return
        }

        const options = ['select', 'checkbox', 'radio'].includes(customFieldForm.type)
            ? customFieldForm.options.split('\n').map(o => o.trim()).filter(Boolean)
            : undefined

        if (['select', 'checkbox', 'radio'].includes(customFieldForm.type) && (!options || options.length === 0)) {
            toast.error('请输入选项（每行一个）')
            return
        }

        if (editingCustomField) {
            setFormData(prev => ({
                ...prev,
                customFields: prev.customFields.map(f =>
                    f.id === editingCustomField.id
                        ? {
                            ...f,
                            label: customFieldForm.label.trim(),
                            type: customFieldForm.type,
                            placeholder: customFieldForm.placeholder.trim() || undefined,
                            required: customFieldForm.required,
                            options,
                        }
                        : f
                ),
            }))
        } else {
            const newFieldId = `custom_${Date.now()}`
            const newField: CustomField = {
                id: newFieldId,
                label: customFieldForm.label.trim(),
                type: customFieldForm.type,
                placeholder: customFieldForm.placeholder.trim() || undefined,
                required: customFieldForm.required,
                options,
            }
            setFormData(prev => ({
                ...prev,
                customFields: [...prev.customFields, newField],
                fieldOrder: [...prev.fieldOrder, newFieldId],
            }))
        }
        setCustomFieldDialogOpen(false)
    }

    // 删除自定义字段
    const deleteCustomField = (fieldId: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.filter(f => f.id !== fieldId),
            fieldOrder: prev.fieldOrder.filter(id => id !== fieldId),
        }))
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    if (isEdit && isLoadingService) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    return (
        <>
            <Header>
                <div className='flex items-center gap-4'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => navigate({ to: '/services' })}
                    >
                        <ArrowLeft className='h-5 w-5' />
                    </Button>
                    <div>
                        <h1 className='text-lg font-semibold'>
                            {isEdit ? '编辑服务' : '添加服务'}
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            {isEdit ? '修改服务信息' : '添加新的服务项目'}
                        </p>
                    </div>
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <Button
                        variant='outline'
                        onClick={() => navigate({ to: '/services' })}
                        disabled={isPending}
                    >
                        取消
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        <Save className='mr-2 h-4 w-4' />
                        {isEdit ? '保存修改' : '创建服务'}
                    </Button>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='pb-8'>
                <div className='flex gap-6'>
                    {/* 左侧：编辑区域 */}
                    <div className='flex-1'>
                        <div className='space-y-6'>
                            <BasicInfoCard
                                formData={formData}
                                onFormChange={setFormData}
                                categories={categories}
                                activeWorkflows={activeWorkflows}
                            />
                            <PriceConfigCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                            <ServiceImagesCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                            <ServiceContentCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                            <ServiceNotesCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                        </div>
                    </div>

                    {/* 右侧：设置区域 */}
                    <div className='w-[380px] shrink-0'>
                        <div className='space-y-6'>
                            <ServiceHighlightsCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                            <GuaranteeCard
                                formData={formData}
                                onFormChange={setFormData}
                                guarantees={activeGuarantees}
                                onNavigate={() => navigate({ to: '/service-guarantees' })}
                            />
                            <EscortConfigCard
                                formData={formData}
                                onFormChange={setFormData}
                                operationGuides={activeOperationGuides}
                                onNavigate={() => navigate({ to: '/operation-guides' })}
                            />
                            <BusinessConfigCard
                                formData={formData}
                                onFormChange={setFormData}
                                onAddCustomField={openAddCustomFieldDialog}
                                onEditCustomField={openEditCustomFieldDialog}
                                onDeleteCustomField={deleteCustomField}
                            />
                            <PurchaseLimitCard
                                formData={formData}
                                onFormChange={setFormData}
                            />
                        </div>
                    </div>
                </div>
            </Main>

            <CustomFieldDialog
                open={customFieldDialogOpen}
                onOpenChange={setCustomFieldDialogOpen}
                editingField={editingCustomField}
                formData={customFieldForm}
                onFormChange={setCustomFieldForm}
                onSave={saveCustomField}
            />
        </>
    )
}
