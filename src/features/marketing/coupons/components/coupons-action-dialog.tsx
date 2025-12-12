'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { couponApi, type CouponTemplate } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, '请输入模板名称'),
  code: z.string().optional(),
  type: z.string().min(1, '请选择类型'),
  value: z.coerce.number().min(0, '面值不能为负'),
  minAmount: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  applicableScope: z.string().default('all'),
  applicableIds: z.string().optional(),
  memberOnly: z.boolean().default(false),
  memberLevelIds: z.string().optional(),
  totalQuantity: z.coerce.number().min(0).optional(),
  perUserLimit: z.coerce.number().min(0).default(1),
  validityType: z.string().default('fixed'),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  validDays: z.coerce.number().min(0).optional(),
  stackWithMember: z.boolean().default(true),
  stackWithCampaign: z.boolean().default(true),
  description: z.string().optional(),
  tips: z.string().optional(),
  status: z.string().default('active'),
})

type FormValues = z.infer<typeof formSchema>

type CouponsActionDialogProps = {
  currentRow?: CouponTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CouponsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CouponsActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const toDatetimeLocal = (value?: string | null) => {
    if (!value) return ''
    const d = new Date(value)
    const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16)
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'amount',
      value: 0,
      minAmount: 0,
      maxDiscount: undefined,
      applicableScope: 'all',
      applicableIds: '',
      memberOnly: false,
      memberLevelIds: '',
      totalQuantity: undefined,
      perUserLimit: 1,
      validityType: 'fixed',
      startAt: '',
      endAt: '',
      validDays: undefined,
      stackWithMember: true,
      stackWithCampaign: true,
      description: '',
      tips: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        code: currentRow.code || '',
        type: currentRow.type,
        value: currentRow.value,
        minAmount: currentRow.minAmount || 0,
        maxDiscount: currentRow.maxDiscount || undefined,
        applicableScope: currentRow.applicableScope || 'all',
        applicableIds: currentRow.applicableIds?.join(',') || '',
        memberOnly: currentRow.memberOnly ?? false,
        memberLevelIds: currentRow.memberLevelIds?.join(',') || '',
        totalQuantity: currentRow.totalQuantity || undefined,
        perUserLimit: currentRow.perUserLimit || 1,
        validityType: currentRow.validityType || 'fixed',
        startAt: toDatetimeLocal(currentRow.startAt),
        endAt: toDatetimeLocal(currentRow.endAt),
        validDays: currentRow.validDays || undefined,
        stackWithMember: currentRow.stackWithMember ?? true,
        stackWithCampaign: currentRow.stackWithCampaign ?? true,
        description: currentRow.description || '',
        tips: currentRow.tips || '',
        status: currentRow.status || 'active',
      })
    } else if (open) {
      form.reset({
        name: '',
        code: '',
        type: 'amount',
        value: 0,
        minAmount: 0,
        maxDiscount: undefined,
        applicableScope: 'all',
        applicableIds: '',
        memberOnly: false,
        memberLevelIds: '',
        totalQuantity: undefined,
        perUserLimit: 1,
        validityType: 'fixed',
        startAt: '',
        endAt: '',
        validDays: undefined,
        stackWithMember: true,
        stackWithCampaign: true,
        description: '',
        tips: '',
        status: 'active',
      })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (payload: any) => couponApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-templates'] })
      onOpenChange(false)
      toast.success('创建成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      couponApi.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-templates'] })
      onOpenChange(false)
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      startAt: values.validityType === 'fixed' && values.startAt ? new Date(values.startAt).toISOString() : undefined,
      endAt: values.validityType === 'fixed' && values.endAt ? new Date(values.endAt).toISOString() : undefined,
      validDays: values.validityType === 'relative' ? values.validDays : undefined,
      applicableIds: values.applicableIds
        ? values.applicableIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      memberLevelIds: values.memberLevelIds
        ? values.memberLevelIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      code: values.code || undefined,
      maxDiscount: values.maxDiscount || undefined,
      totalQuantity: values.totalQuantity || undefined,
      description: values.description || undefined,
      tips: values.tips || undefined,
    }

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const validityType = form.watch('validityType')

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑优惠券模板' : '新建优惠券模板'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改模板基础信息' : '创建一个新的优惠券模板'}
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-y-auto py-1 px-1'>
          <Form {...form}>
            <form id='coupon-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {/* 基础信息 */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>模板名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入模板名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>兑换码</FormLabel>
                      <FormControl>
                        <Input placeholder='可选' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>类型 *</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择类型'
                        items={[
                          { label: '满减', value: 'amount' },
                          { label: '折扣', value: 'percent' },
                          { label: '免费', value: 'free' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>面值/折扣 *</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='minAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>门槛金额（元）</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='maxDiscount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最高折扣金额（元）</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='留空不限制'
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择状态'
                        items={[
                          { label: '启用', value: 'active' },
                          { label: '禁用', value: 'inactive' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 适用范围 */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='applicableScope'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>适用范围</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择适用范围'
                        items={[
                          { label: '全场', value: 'all' },
                          { label: '分类', value: 'category' },
                          { label: '服务', value: 'service' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='applicableIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>适用ID（逗号分隔）</FormLabel>
                      <FormControl>
                        <Input placeholder='如：cat_1,cat_2' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 数量限制 */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='totalQuantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>总发行量</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='留空不限制'
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='perUserLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>每人限领</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='validityType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>有效期类型</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择有效期类型'
                        items={[
                          { label: '固定时间', value: 'fixed' },
                          { label: '领取后 N 天', value: 'relative' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 有效期设置 */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='startAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开始时间</FormLabel>
                      <FormControl>
                        <Input type='datetime-local' disabled={validityType !== 'fixed'} {...field} />
                      </FormControl>
                      <FormDescription>固定时间类型可用</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>结束时间</FormLabel>
                      <FormControl>
                        <Input type='datetime-local' disabled={validityType !== 'fixed'} {...field} />
                      </FormControl>
                      <FormDescription>固定时间类型可用</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='validDays'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>有效天数</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          disabled={validityType !== 'relative'}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>相对时间类型可用</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 开关设置 */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='stackWithMember'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>与会员折扣叠加</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='stackWithCampaign'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>与活动叠加</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='memberOnly'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>仅会员可用</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='memberLevelIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会员等级ID（逗号分隔）</FormLabel>
                      <FormControl>
                        <Input placeholder='如：level_1,level_2' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 描述 */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder='可选' className='resize-none' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tips'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>使用提示</FormLabel>
                    <FormControl>
                      <Textarea placeholder='可选' className='resize-none' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
            取消
          </Button>
          <Button type='submit' form='coupon-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
