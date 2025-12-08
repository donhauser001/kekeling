import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, ExternalLink, Copy, Check } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const paymentFormSchema = z.object({
  appId: z.string().min(1, '请输入小程序 AppID'),
  mchId: z.string().min(1, '请输入商户号'),
  apiKey: z.string().min(1, '请输入 API 密钥'),
  notifyUrl: z.string().url('请输入有效的回调地址').or(z.string().length(0)),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

// 默认值（从环境变量读取，实际项目中应该从后端 API 获取）
const defaultValues: Partial<PaymentFormValues> = {
  appId: '',
  mchId: '',
  apiKey: '',
  notifyUrl: '',
}

export function PaymentForm() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // 模拟从后端获取配置
  useEffect(() => {
    // TODO: 实际项目中应该从后端 API 获取配置
    const fetchConfig = async () => {
      try {
        // 这里模拟获取配置，实际应该调用 API
        const mockConfig = {
          appId: 'wx6e10ab2c3b2c8c73',
          mchId: '',
          apiKey: '',
          notifyUrl: 'https://your-domain.com/api/payment/notify',
        }
        form.reset(mockConfig)
        setIsConfigured(!!mockConfig.mchId && !!mockConfig.apiKey)
      } catch (error) {
        console.error('获取支付配置失败:', error)
      }
    }
    fetchConfig()
  }, [form])

  function onSubmit(data: PaymentFormValues) {
    // TODO: 调用后端 API 保存配置
    console.log('保存支付配置:', data)
    toast.success('支付配置已保存', {
      description: '配置将在服务重启后生效',
    })
    setIsConfigured(true)
  }

  const copyNotifyUrl = () => {
    const url = form.getValues('notifyUrl') || 'https://your-domain.com/api/payment/notify'
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('已复制到剪贴板')
  }

  return (
    <div className='space-y-6'>
      {/* 状态卡片 */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>支付状态</CardTitle>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? '已配置' : '未配置'}
            </Badge>
          </div>
          <CardDescription>
            {isConfigured 
              ? '微信支付已配置完成，可以正常使用'
              : '请完成微信支付配置后才能接收小程序支付'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 配置表单 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='appId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>小程序 AppID</FormLabel>
                <FormControl>
                  <Input placeholder='wx1234567890abcdef' {...field} />
                </FormControl>
                <FormDescription>
                  在微信公众平台 → 开发管理 → 开发设置中获取
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='mchId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>商户号 (Mch ID)</FormLabel>
                <FormControl>
                  <Input placeholder='1234567890' {...field} />
                </FormControl>
                <FormDescription>
                  在微信支付商户平台 → 账户中心 → 商户信息中获取
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='apiKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>API 密钥</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input 
                      type={showApiKey ? 'text' : 'password'}
                      placeholder='32位密钥'
                      className='pr-10'
                      {...field} 
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  在微信支付商户平台 → 账户中心 → API安全 中设置
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='notifyUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>支付回调地址</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Input 
                      placeholder='https://your-domain.com/api/payment/notify'
                      {...field} 
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={copyNotifyUrl}
                    >
                      {copied ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  微信支付成功后的回调通知地址，需要 HTTPS
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>保存配置</Button>
        </form>
      </Form>

      <Separator />

      {/* 帮助文档 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>配置指南</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <h4 className='font-medium'>1. 开通微信支付</h4>
            <p className='text-sm text-muted-foreground'>
              前往微信支付商户平台申请商户号，需要企业营业执照。
            </p>
            <Button variant='link' className='h-auto p-0' asChild>
              <a href='https://pay.weixin.qq.com/' target='_blank' rel='noopener noreferrer'>
                微信支付商户平台 <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>2. 关联小程序</h4>
            <p className='text-sm text-muted-foreground'>
              在微信支付商户平台 → 产品中心 → AppID账号管理，关联您的小程序。
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>3. 设置 API 密钥</h4>
            <p className='text-sm text-muted-foreground'>
              在微信支付商户平台 → 账户中心 → API安全，设置32位API密钥。
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>4. 配置回调地址</h4>
            <p className='text-sm text-muted-foreground'>
              确保您的服务器域名已完成 ICP 备案并配置 HTTPS 证书。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

