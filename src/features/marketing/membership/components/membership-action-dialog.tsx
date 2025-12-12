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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { membershipApi, type MembershipLevel } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, '请输入等级名称'),
  level: z.coerce.number().min(1, '等级必须大于0'),
  discount: z.coerce.number().min(0).max(100, '折扣不能超过100%'),
  price: z.coerce.number().min(0, '价格不能为负'),
  duration: z.coerce.number().min(1, '时长必须大于0天'),
  bonusDays: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  benefits: z.string().optional(),
  status: z.string().default('active'),
})

type FormValues = z.infer<typeof formSchema>

type MembershipActionDialogProps = {
  currentRow?: MembershipLevel
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MembershipActionDialog({
  currentRow,
  open,
  onOpenChange,
}: MembershipActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      level: 1,
      discount: 0,
      price: 0,
      duration: 30,
      bonusDays: 0,
      description: '',
      benefits: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        level: currentRow.level,
        discount: currentRow.discount,
        price: currentRow.price,
        duration: currentRow.duration,
        bonusDays: currentRow.bonusDays || 0,
        description: currentRow.description || '',
        benefits: currentRow.benefits?.join('\n') || '',
        status: currentRow.status || 'active',
      })
    } else if (open) {
      form.reset({
        name: '',
        level: 1,
        discount: 0,
        price: 0,
        duration: 30,
        bonusDays: 0,
        description: '',
        benefits: '',
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
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      benefits: values.benefits ? values.benefits.split('\n').filter(Boolean) : [],
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
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑会员等级' : '新建会员等级'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改会员等级信息' : '创建一个新的会员等级'}
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-y-auto py-1 px-1'>
          <Form {...form}>
            <form id='membership-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>等级名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder='如：黄金会员' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='level'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>等级 *</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='数值越大等级越高' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='discount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>折扣 (%) *</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='如：90 表示 9 折' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>价格 (元) *</FormLabel>
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
                  name='duration'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>时长 (天) *</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='bonusDays'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>赠送天数</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
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

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
            取消
          </Button>
          <Button type='submit' form='membership-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
