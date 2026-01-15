'use client'

import { useEffect, useState, useMemo } from 'react'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { membershipApi, type MembershipLevel } from '@/lib/api'
import { TerminalPreview, type MarketingDataOverride } from '@/components/terminal-preview'

const formSchema = z.object({
  name: z.string().min(1, '请输入会员卡名称'),
  price: z.coerce.number().min(0, '价格不能为负'),
  originalPrice: z.coerce.number().min(0).optional(), // 原价（划线价）
  duration: z.coerce.number().min(1, '时长必须大于0天'),
  discount: z.coerce.number().min(0).max(100, '折扣不能超过100%'),
  description: z.string().optional(),
  benefits: z.string().optional(),
  recommended: z.boolean().default(false),
  status: z.string().default('active'),
})

type FormValues = z.infer<typeof formSchema>

type MembershipActionDialogProps = {
  currentRow?: MembershipLevel
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MembershipActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: MembershipActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      originalPrice: undefined,
      duration: 30,
      discount: 100, // 默认无折扣
      description: '',
      benefits: '',
      recommended: false,
      status: 'active',
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        price: Number(currentRow.price) || 0,
        originalPrice: currentRow.originalPrice ? Number(currentRow.originalPrice) : undefined,
        duration: currentRow.duration || 30,
        discount: currentRow.discount || 100,
        description: currentRow.description || '',
        benefits: Array.isArray(currentRow.benefits) 
          ? currentRow.benefits.join('\n') 
          : (typeof currentRow.benefits === 'object' && currentRow.benefits?.list 
              ? (currentRow.benefits as any).list.join('\n') 
              : ''),
        recommended: currentRow.recommended || false,
        status: currentRow.status || 'active',
      })
    } else if (open) {
      form.reset({
        name: '',
        price: 0,
        originalPrice: undefined,
        duration: 30,
        discount: 100,
        description: '',
        benefits: '',
        recommended: false,
        status: 'active',
      })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (payload: any) => membershipApi.createLevel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
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
      membershipApi.updateLevel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
      onOpenChange(false)
      toast.success('更新成功')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      originalPrice: values.originalPrice || undefined,
      duration: values.duration,
      discount: values.discount,
      description: values.description || undefined,
      benefits: values.benefits ? { list: values.benefits.split('\n').filter(Boolean) } : undefined,
      recommended: values.recommended,
      status: values.status,
    }

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // 监听表单值变化，用于预览器实时显示
  const watchedValues = form.watch()

  // 将表单数据映射为预览器 marketingData
  const marketingData = useMemo<MarketingDataOverride>(() => {
    const { name, price, originalPrice, duration, description, recommended } = watchedValues
    // 计算过期时间（从今天算起）
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + (duration || 30))
    const expireAt = expireDate.toISOString().split('T')[0]

    return {
      // 模拟已开通会员，显示当前编辑的会员卡
      membership: {
        id: currentRow?.id ?? 'preview-membership',
        level: currentRow?.code ?? 'preview',
        levelName: name || '会员卡',
        expireAt,
        points: 1000, // 默认积分
      },
      // 会员卡预览（单个卡）
      membershipPlans: [
        {
          id: currentRow?.id ?? 'preview-plan',
          name: name || '会员卡',
          description: description || '',
          price: price || 0,
          originalPrice: originalPrice,
          durationDays: duration || 30,
          isRecommended: recommended || false,
        },
      ],
    }
  }, [watchedValues, currentRow?.id, currentRow?.code])

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
        <DialogContent className='sm:max-w-[900px]'>
          <DialogHeader className='text-start'>
            <DialogTitle>{isEdit ? '编辑会员卡' : '新建会员卡'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改会员卡信息' : '创建一个新的会员卡'}，右侧预览器实时显示效果
            </DialogDescription>
          </DialogHeader>

          <div className='flex gap-6'>
            {/* 左侧：表单区域 */}
            <div className='flex-1 max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
              <Form {...form}>
                <form id='membership-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  {/* 会员卡名称 */}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>会员卡名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='如：黄金月卡、铂金季卡' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 价格和原价 */}
                  <div className='grid grid-cols-2 items-start gap-4'>
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>售价 (元) *</FormLabel>
                          <FormControl>
                            <Input type='number' placeholder='实际售价' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='originalPrice'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>原价 (元)</FormLabel>
                          <FormControl>
                            <Input 
                              type='number' 
                              placeholder='可选，划线价' 
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 时长和折扣 */}
                  <div className='grid grid-cols-2 items-start gap-4'>
                    <FormField
                      control={form.control}
                      name='duration'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>有效期 (天) *</FormLabel>
                          <FormControl>
                            <Input type='number' placeholder='如：30、90、365' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='discount'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>服务折扣 (%)</FormLabel>
                          <FormControl>
                            <Input type='number' placeholder='100=无折扣，90=9折' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    name='benefits'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>权益（每行一个）</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='如：&#10;专属客服&#10;优先预约&#10;生日礼券'
                            className='resize-none'
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            {/* 右侧：预览器 */}
            <div className='w-[375px] flex-shrink-0'>
              <TerminalPreview
                page='membership'
                marketingData={marketingData}
                height={500}
                showFrame={false}
                autoLoad={false}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChangeWrapper(false)} disabled={isPending}>
              取消
            </Button>
            <Button type='submit' form='membership-form' disabled={isPending}>
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
