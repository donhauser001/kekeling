'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { configApi } from '@/lib/api/config'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const miniappFormSchema = z.object({
  devMode: z.boolean().default(false),
  skipWorkbenchLogin: z.boolean().default(false),
  devEscortId: z.string().optional().default(''),
})

type MiniappFormValues = z.infer<typeof miniappFormSchema>

const defaultValues: Partial<MiniappFormValues> = {
  devMode: false,
  skipWorkbenchLogin: false,
  devEscortId: '',
}

export function MiniappForm() {
  const [loading, setLoading] = useState(true)

  const form = useForm<MiniappFormValues>({
    resolver: zodResolver(miniappFormSchema),
    defaultValues,
  })

  // 加载配置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await configApi.getMiniappSettings()
        form.reset({
          devMode: data.devMode ?? false,
          skipWorkbenchLogin: data.skipWorkbenchLogin ?? false,
          devEscortId: data.devEscortId ?? '',
        })
      } catch (error) {
        console.error('加载小程序配置失败:', error)
        toast.error('加载配置失败')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: MiniappFormValues) {
    try {
      await configApi.updateMiniappSettings(data)
      toast.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    }
  }

  const devMode = form.watch('devMode')
  const skipWorkbenchLogin = form.watch('skipWorkbenchLogin')

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <span className='ml-2'>加载配置中...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* 开发模式开关 */}
        <FormField
          control={form.control}
          name='devMode'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>开发模式</FormLabel>
                <FormDescription>
                  启用后可使用下方的开发便捷功能，生产环境请关闭
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {devMode && (
          <Alert variant='destructive' className='border-orange-500 bg-orange-50 dark:bg-orange-950/20'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <span className='font-semibold'>警告：</span>开发模式已启用，请勿在生产环境使用。
              开发模式下用户可以跳过短信验证直接进入工作台。
            </AlertDescription>
          </Alert>
        )}

        {/* 跳过工作台登录验证 */}
        <FormField
          control={form.control}
          name='skipWorkbenchLogin'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>跳过工作台登录</FormLabel>
                <FormDescription>
                  启用后，陪诊员进入工作台时无需短信验证登录
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!devMode}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 默认陪诊员ID */}
        <FormField
          control={form.control}
          name='devEscortId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>默认陪诊员 ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='留空则使用测试数据'
                  disabled={!devMode || !skipWorkbenchLogin}
                />
              </FormControl>
              <FormDescription>
                跳过登录时使用的默认陪诊员 ID，用于加载真实数据（可选）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>保存配置</Button>
      </form>
    </Form>
  )
}
