'use client'

import { useEffect, useState } from 'react'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { campaignApi, type Campaign } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, '请输入活动名称'),
  code: z.string().optional(),
  type: z.string().min(1, '请选择活动类型'),
  status: z.string().default('pending'),
  startAt: z.string().min(1, '请选择开始时间'),
  endAt: z.string().min(1, '请选择结束时间'),
  discountType: z.string().min(1, '请选择优惠类型'),
  discountValue: z.coerce.number().min(0, '优惠值不能为负'),
  minAmount: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  applicableScope: z.string().default('all'),
  applicableIds: z.string().optional(),
  totalQuantity: z.coerce.number().min(0).optional(),
  perUserLimit: z.coerce.number().min(0).default(1),
  sort: z.coerce.number().default(0),
  stackWithMember: z.boolean().default(true),
  bannerUrl: z.string().optional(),
  detailUrl: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type CampaignsActionDialogProps = {
  currentRow?: Campaign
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CampaignsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: CampaignsActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

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
      type: 'flash_sale',
      status: 'pending',
      startAt: '',
      endAt: '',
      discountType: 'amount',
      discountValue: 0,
      minAmount: 0,
      maxDiscount: undefined,
      applicableScope: 'all',
      applicableIds: '',
      totalQuantity: undefined,
      perUserLimit: 1,
      sort: 0,
      stackWithMember: true,
      bannerUrl: '',
      detailUrl: '',
      description: '',
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        code: currentRow.code || '',
        type: currentRow.type,
        status: currentRow.status,
        startAt: toDatetimeLocal(currentRow.startAt),
        endAt: toDatetimeLocal(currentRow.endAt),
        discountType: currentRow.discountType,
        discountValue: currentRow.discountValue,
        minAmount: currentRow.minAmount || 0,
        maxDiscount: currentRow.maxDiscount || undefined,
        applicableScope: currentRow.applicableScope || 'all',
        applicableIds: currentRow.applicableIds?.join(',') || '',
        totalQuantity: currentRow.totalQuantity || undefined,
        perUserLimit: currentRow.perUserLimit || 1,
        sort: currentRow.sort || 0,
        stackWithMember: currentRow.stackWithMember ?? true,
        bannerUrl: currentRow.bannerUrl || '',
        detailUrl: currentRow.detailUrl || '',
        description: currentRow.description || '',
      })
    } else if (open) {
      form.reset({
        name: '',
        code: '',
        type: 'flash_sale',
        status: 'pending',
        startAt: '',
        endAt: '',
        discountType: 'amount',
        discountValue: 0,
        minAmount: 0,
        maxDiscount: undefined,
        applicableScope: 'all',
        applicableIds: '',
        totalQuantity: undefined,
        perUserLimit: 1,
        sort: 0,
        stackWithMember: true,
        bannerUrl: '',
        detailUrl: '',
        description: '',
      })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (payload: any) => campaignApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      onOpenChange(false)
      toast.success('创建成功')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      campaignApi.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      onOpenChange(false)
      toast.success('更新成功')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  // 脏表单关闭拦截
  const onOpenChangeWrapper = (open: boolean) => {
    if (!open && form.formState.isDirty && !isPending) {
      setConfirmCloseOpen(true)
      return
    }
    if (!isPending) {
      onOpenChange(open)
    }
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      applicableIds: values.applicableIds
        ? values.applicableIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      code: values.code || undefined,
      maxDiscount: values.maxDiscount || undefined,
      totalQuantity: values.totalQuantity || undefined,
      bannerUrl: values.bannerUrl || undefined,
      detailUrl: values.detailUrl || undefined,
      description: values.description || undefined,
    }

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>{isEdit ? '编辑活动' : '新建活动'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改活动基础信息' : '创建一个新的营销活动'}
            </DialogDescription>
          </DialogHeader>

          <div className='max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
            <Form {...form}>
              <form id='campaign-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                {/* 基础信息 */}
                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活动名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入活动名称' {...field} />
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
                        <FormLabel>活动编码</FormLabel>
                        <FormControl>
                          <Input placeholder='可选' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活动类型 *</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择类型'
                          items={[
                            { label: '限时特惠', value: 'flash_sale' },
                            { label: '秒杀', value: 'seckill' },
                            { label: '满减', value: 'threshold' },
                            { label: '新人专享', value: 'newcomer' },
                          ]}
                        />
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
                            { label: '未开始', value: 'pending' },
                            { label: '进行中', value: 'active' },
                            { label: '已结束', value: 'ended' },
                            { label: '已取消', value: 'cancelled' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 时间设置 */}
                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='startAt'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>开始时间 *</FormLabel>
                        <FormControl>
                          <Input type='datetime-local' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='endAt'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>结束时间 *</FormLabel>
                        <FormControl>
                          <Input type='datetime-local' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 优惠设置 */}
                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='discountType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>优惠类型 *</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择优惠类型'
                          items={[
                            { label: '减免金额', value: 'amount' },
                            { label: '折扣比例', value: 'percent' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='discountValue'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>优惠值 *</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='金额或百分比' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='minAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>门槛金额（元）</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='0 表示无门槛' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='maxDiscount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最高优惠（元）</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='留空表示不限制'
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 适用范围 */}
                <div className='grid grid-cols-2 items-start gap-4'>
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

                {/* 限制设置 */}
                <div className='grid grid-cols-3 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='totalQuantity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>总库存</FormLabel>
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
                        <FormLabel>每人限购</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sort'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>排序</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 开关设置 */}
                <FormField
                  control={form.control}
                  name='stackWithMember'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>允许与会员叠加</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 图片链接 */}
                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='bannerUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner URL</FormLabel>
                        <FormControl>
                          <Input placeholder='可选' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='detailUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>详情 URL</FormLabel>
                        <FormControl>
                          <Input placeholder='可选' {...field} />
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
                      <FormLabel>活动说明</FormLabel>
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
            <Button type='button' variant='outline' onClick={() => onOpenChangeWrapper(false)} disabled={isPending}>
              取消
            </Button>
            <Button type='submit' form='campaign-form' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        handleConfirm={() => {
          setConfirmCloseOpen(false)
          onOpenChange(false)
        }}
        title='放弃修改？'
        desc='您有未保存的修改，确定要关闭吗？'
        confirmText='放弃'
        destructive
      />
    </>
  )
}
