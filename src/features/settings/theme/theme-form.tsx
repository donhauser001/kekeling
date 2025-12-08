import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { configApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '请输入有效的颜色值 (如 #1890ff)'),
  brandName: z.string().min(1, '品牌名称不能为空').max(20, '品牌名称最多20字'),
  brandSlogan: z.string().max(50, '品牌标语最多50字'),
})

type ThemeFormValues = z.infer<typeof themeFormSchema>

// 预设颜色选项
const colorOptions = [
  { value: '#1890ff', label: '蓝色' },
  { value: '#22c55e', label: '绿色' },
  { value: '#6366f1', label: '靛蓝' },
  { value: '#ec4899', label: '粉色' },
  { value: '#f97316', label: '橙色' },
  { value: '#ef4444', label: '红色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#0ea5e9', label: '天蓝' },
  { value: '#14b8a6', label: '青色' },
  { value: '#eab308', label: '黄色' },
]

export function ThemeForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      primaryColor: '#1890ff',
      brandName: '科科灵',
      brandSlogan: '让就医不再孤单',
    },
  })

  // 加载当前设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await configApi.getThemeSettings()
        if (data) {
          form.reset({
            primaryColor: data.primaryColor || '#1890ff',
            brandName: data.brandName || '科科灵',
            brandSlogan: data.brandSlogan || '让就医不再孤单',
          })
        }
      } catch (err) {
        console.error('加载主题设置失败:', err)
        toast({
          title: '加载失败',
          description: '无法加载主题设置',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: ThemeFormValues) {
    setSaving(true)
    try {
      await configApi.updateThemeSettings(data)
      toast({
        title: '保存成功',
        description: '主题设置已更新，小程序将使用新的主题色',
      })
    } catch (err) {
      console.error('保存主题设置失败:', err)
      toast({
        title: '保存失败',
        description: '无法保存主题设置',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <span className='ml-2'>加载中...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='primaryColor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>主色调</FormLabel>
              <FormDescription>
                选择小程序的主色调，将应用于页面背景、统计卡片等区域。
              </FormDescription>
              <FormMessage />
              <FormControl>
                <div className='space-y-4'>
                  {/* 预设颜色 */}
                  <div className='flex flex-wrap gap-3'>
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'group relative flex h-10 w-10 items-center justify-center rounded-full transition-all',
                          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          'hover:scale-110',
                          field.value === option.value &&
                            'ring-2 ring-ring ring-offset-2'
                        )}
                        style={{ backgroundColor: option.value }}
                        aria-label={option.label}
                        aria-pressed={field.value === option.value}
                      >
                        {field.value === option.value && (
                          <Check className='h-5 w-5 text-white drop-shadow-md' />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* 自定义颜色 */}
                  <div className='flex items-center gap-3'>
                    <Input
                      type='color'
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='h-10 w-20 cursor-pointer p-1'
                    />
                    <Input
                      type='text'
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder='#1890ff'
                      className='w-32'
                    />
                    <span className='text-muted-foreground text-sm'>
                      当前颜色: {colorOptions.find(o => o.value === field.value)?.label || '自定义'}
                    </span>
                  </div>
                  
                  {/* 预览 */}
                  <div 
                    className='rounded-lg p-4 text-white'
                    style={{ backgroundColor: field.value }}
                  >
                    <p className='font-medium'>颜色预览</p>
                    <p className='text-sm opacity-80'>这是主色调在页面上的效果</p>
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='brandName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>品牌名称</FormLabel>
              <FormDescription>
                显示在小程序首页顶部的品牌名称。
              </FormDescription>
              <FormControl>
                <Input placeholder='科科灵' {...field} className='max-w-xs' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='brandSlogan'
          render={({ field }) => (
            <FormItem>
              <FormLabel>品牌标语</FormLabel>
              <FormDescription>
                显示在品牌名称下方的标语文案。
              </FormDescription>
              <FormControl>
                <Input placeholder='让就医不再孤单' {...field} className='max-w-md' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={saving}>
          {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          保存设置
        </Button>
      </form>
    </Form>
  )
}

