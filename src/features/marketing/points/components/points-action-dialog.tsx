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
import { pointApi, type PointRule } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, '请输入规则名称'),
  code: z.string().min(1, '请输入规则编码'),
  type: z.string().min(1, '请选择类型'),
  points: z.coerce.number().int('必须是整数'),
  applicableScope: z.string().default('all'),
  applicableIds: z.string().optional(),
  dailyLimit: z.coerce.number().min(0).optional(),
  totalLimit: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

type PointsActionDialogProps = {
  currentRow?: PointRule
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PointsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: PointsActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'earn',
      points: 0,
      applicableScope: 'all',
      applicableIds: '',
      dailyLimit: undefined,
      totalLimit: undefined,
      description: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        code: currentRow.code,
        type: currentRow.type,
        points: currentRow.points,
        applicableScope: currentRow.applicableScope || 'all',
        applicableIds: currentRow.applicableIds?.join(',') || '',
        dailyLimit: currentRow.dailyLimit || undefined,
        totalLimit: currentRow.totalLimit || undefined,
        description: currentRow.description || '',
        isActive: currentRow.isActive ?? true,
      })
    } else if (open) {
      form.reset({
        name: '',
        code: '',
        type: 'earn',
        points: 0,
        applicableScope: 'all',
        applicableIds: '',
        dailyLimit: undefined,
        totalLimit: undefined,
        description: '',
        isActive: true,
      })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (payload: any) => pointApi.createRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
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
      pointApi.updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
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
      applicableIds: values.applicableIds
        ? values.applicableIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      dailyLimit: values.dailyLimit || undefined,
      totalLimit: values.totalLimit || undefined,
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
            <DialogTitle>{isEdit ? '编辑积分规则' : '新建积分规则'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改积分规则信息' : '创建一个新的积分规则'}
            </DialogDescription>
          </DialogHeader>

          <div className='max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
            <Form {...form}>
              <form id='points-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>规则名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='如：下单奖励' {...field} />
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
                        <FormLabel>规则编码 *</FormLabel>
                        <FormControl>
                          <Input placeholder='如：order_reward' {...field} />
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
                        <FormLabel>类型 *</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择类型'
                          items={[
                            { label: '获取积分', value: 'earn' },
                            { label: '消耗积分', value: 'spend' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='points'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>积分数 *</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormDescription>获取为正，消耗为负</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            { label: '全部', value: 'all' },
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

                <div className='grid grid-cols-2 items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='dailyLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>每日上限</FormLabel>
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
                    name='totalLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>总上限</FormLabel>
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
            <Button type='submit' form='points-form' disabled={isPending}>
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
