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
import { referralApi, type ReferralRule } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, '请输入规则名称'),
  type: z.string().min(1, '请选择类型'),
  rewardType: z.string().min(1, '请选择奖励类型'),
  rewardValue: z.coerce.number().min(0, '奖励值不能为负'),
  inviterReward: z.coerce.number().min(0).default(0),
  inviterRewardType: z.string().default('points'),
  validDays: z.coerce.number().min(0).optional(),
  maxInvites: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

type ReferralRulesActionDialogProps = {
  currentRow?: ReferralRule
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReferralRulesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ReferralRulesActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'register',
      rewardType: 'points',
      rewardValue: 0,
      inviterReward: 0,
      inviterRewardType: 'points',
      validDays: undefined,
      maxInvites: undefined,
      description: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        type: currentRow.type,
        rewardType: currentRow.rewardType,
        rewardValue: currentRow.rewardValue,
        inviterReward: currentRow.inviterReward || 0,
        inviterRewardType: currentRow.inviterRewardType || 'points',
        validDays: currentRow.validDays || undefined,
        maxInvites: currentRow.maxInvites || undefined,
        description: currentRow.description || '',
        isActive: currentRow.isActive ?? true,
      })
    } else if (open) {
      form.reset({
        name: '',
        type: 'register',
        rewardType: 'points',
        rewardValue: 0,
        inviterReward: 0,
        inviterRewardType: 'points',
        validDays: undefined,
        maxInvites: undefined,
        description: '',
        isActive: true,
      })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (payload: any) => referralApi.createRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
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
      referralApi.updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
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
      ...values,
      validDays: values.validDays || undefined,
      maxInvites: values.maxInvites || undefined,
      description: values.description || undefined,
    }

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

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
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader className='text-start'>
            <DialogTitle>{isEdit ? '编辑邀请规则' : '新建邀请规则'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改邀请规则信息' : '创建一个新的邀请规则'}
            </DialogDescription>
          </DialogHeader>

          <div className='max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
            <Form {...form}>
              <form id='referral-rules-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>规则名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder='如：新用户注册奖励' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>触发类型 *</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择类型'
                          items={[
                            { label: '注册', value: 'register' },
                            { label: '首单', value: 'first_order' },
                            { label: '累计消费', value: 'total_spent' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='rewardType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>被邀请人奖励类型 *</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择奖励类型'
                          items={[
                            { label: '积分', value: 'points' },
                            { label: '优惠券', value: 'coupon' },
                            { label: '现金', value: 'cash' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='rewardValue'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>被邀请人奖励值 *</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormDescription>积分/金额数值</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='inviterRewardType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邀请人奖励类型</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择奖励类型'
                          items={[
                            { label: '积分', value: 'points' },
                            { label: '优惠券', value: 'coupon' },
                            { label: '现金', value: 'cash' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='inviterReward'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邀请人奖励值</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormDescription>邀请成功后邀请人获得的奖励</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='validDays'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>有效天数</FormLabel>
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
                    name='maxInvites'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最大邀请数</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>启用规则</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
              </form>
            </Form>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChangeWrapper(false)} disabled={isPending}>
              取消
            </Button>
            <Button type='submit' form='referral-rules-form' disabled={isPending}>
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
