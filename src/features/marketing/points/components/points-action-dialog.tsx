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
import { TerminalPreview, type MarketingDataOverride } from '@/components/terminal-preview'

const formSchema = z.object({
  name: z.string().min(1, '请输入规则名称'),
  code: z.string().min(1, '请输入规则编码'),
  type: z.string().min(1, '请选择类型'),
  calcMode: z.enum(['fixed', 'rate']).default('fixed'), // 计算方式：固定积分 / 按比例
  points: z.coerce.number().int('必须是整数').optional(),
  pointsRate: z.coerce.number().min(0).max(1, '比例不能超过1').optional(),
  applicableScope: z.string().default('all'),
  applicableIds: z.string().optional(),
  dailyLimit: z.coerce.number().min(0).optional(),
  totalLimit: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.calcMode === 'fixed') {
      return data.points !== undefined && data.points !== null
    }
    if (data.calcMode === 'rate') {
      return data.pointsRate !== undefined && data.pointsRate !== null && data.pointsRate > 0
    }
    return true
  },
  {
    message: '请填写积分数或积分比例',
    path: ['points'],
  }
)

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
    resolver: zodResolver(formSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      name: '',
      code: '',
      type: 'earn',
      calcMode: 'fixed',
      points: 0,
      pointsRate: undefined,
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
      // 根据现有数据判断计算方式
      const hasRate = currentRow.pointsRate !== undefined && currentRow.pointsRate !== null && Number(currentRow.pointsRate) > 0
      const calcMode = hasRate ? 'rate' : 'fixed'
      
      form.reset({
        name: currentRow.name,
        code: currentRow.code,
        type: currentRow.type,
        calcMode,
        points: currentRow.points ?? 0,
        pointsRate: hasRate ? Number(currentRow.pointsRate) : undefined,
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
        calcMode: 'fixed',
        points: 0,
        pointsRate: undefined,
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
    // 根据计算方式设置积分字段
    const payload: any = {
      name: values.name,
      code: values.code,
      type: values.type,
      applicableScope: values.applicableScope,
      applicableIds: values.applicableIds
        ? values.applicableIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      dailyLimit: values.dailyLimit || undefined,
      totalLimit: values.totalLimit || undefined,
      description: values.description || undefined,
      isActive: values.isActive,
    }

    // 根据计算方式设置积分或比例
    if (values.calcMode === 'fixed') {
      payload.points = values.points || 0
      payload.pointsRate = null // 清空比例
    } else {
      payload.points = 0 // 固定积分设为0
      payload.pointsRate = values.pointsRate
    }

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // 构建预览数据
  const watchedValues = form.watch()
  const marketingData = useMemo<MarketingDataOverride>(() => ({
    points: {
      balance: 1000, // 示例余额
      rules: [{
        id: currentRow?.id || 'preview-rule',
        name: watchedValues.name || '新规则',
        code: watchedValues.code,
        type: (watchedValues.type as 'earn' | 'spend') || 'earn',
        points: watchedValues.calcMode === 'fixed' ? (watchedValues.points || 0) : 0,
        pointsRate: watchedValues.calcMode === 'rate' ? watchedValues.pointsRate : undefined,
        description: watchedValues.description || (watchedValues.calcMode === 'rate' ? `按订单金额 ${(watchedValues.pointsRate || 0) * 100}% 发放` : undefined),
        isActive: watchedValues.isActive,
      }],
    },
  }), [watchedValues.name, watchedValues.code, watchedValues.type, watchedValues.calcMode, watchedValues.points, watchedValues.pointsRate, watchedValues.description, watchedValues.isActive, currentRow?.id])

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
            <DialogTitle>{isEdit ? '编辑积分规则' : '新建积分规则'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改积分规则信息' : '创建一个新的积分规则'}
            </DialogDescription>
          </DialogHeader>

          <div className='flex gap-6'>
            {/* 左侧：表单 */}
            <div className='flex-1 max-h-[60vh] min-h-[300px] overflow-y-auto py-1 px-1'>
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
                      name='calcMode'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>计算方式 *</FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='请选择计算方式'
                            items={[
                              { label: '固定积分', value: 'fixed' },
                              { label: '按金额比例', value: 'rate' },
                            ]}
                          />
                          <FormDescription>
                            {field.value === 'rate' ? '按订单金额计算积分' : '发放固定数量积分'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-2 items-start gap-4'>
                    {watchedValues.calcMode === 'fixed' ? (
                      <FormField
                        control={form.control}
                        name='points'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>积分数 *</FormLabel>
                            <FormControl>
                              <Input 
                                type='number' 
                                placeholder='如：100'
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                              />
                            </FormControl>
                            <FormDescription>获取为正，消耗为负</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name='pointsRate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>积分比例 *</FormLabel>
                            <FormControl>
                              <Input 
                                type='number' 
                                step='0.01'
                                placeholder='如：0.01'
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              如 0.01 表示订单金额的 1%，100元订单获得 1 积分
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div className='text-sm text-muted-foreground pt-8'>
                      {watchedValues.calcMode === 'rate' && (
                        <div className='rounded-md bg-muted p-3'>
                          <div className='font-medium mb-1'>计算示例</div>
                          <div>订单金额 ¥100</div>
                          <div>比例 {watchedValues.pointsRate || 0.01}</div>
                          <div className='font-medium text-primary'>
                            = {Math.floor(100 * (watchedValues.pointsRate || 0.01))} 积分
                          </div>
                        </div>
                      )}
                    </div>
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

            {/* 右侧：预览器 */}
            <div className='w-[375px] flex-shrink-0'>
              <TerminalPreview
                page='points'
                height={600}
                showFrame={false}
                autoLoad={false}
                marketingData={marketingData}
              />
            </div>
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
