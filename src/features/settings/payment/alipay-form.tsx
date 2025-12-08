import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, ExternalLink, Copy, Check, Info } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const alipayFormSchema = z.object({
  appId: z.string().min(1, '请输入应用 APPID'),
  privateKey: z.string().min(1, '请输入应用私钥'),
  alipayPublicKey: z.string().min(1, '请输入支付宝公钥'),
  signType: z.enum(['RSA2', 'RSA']),
  notifyUrl: z.string().url('请输入有效的回调地址').or(z.string().length(0)),
  sandbox: z.boolean(),
})

type AlipayFormValues = z.infer<typeof alipayFormSchema>

const defaultValues: Partial<AlipayFormValues> = {
  appId: '',
  privateKey: '',
  alipayPublicKey: '',
  signType: 'RSA2',
  notifyUrl: '',
  sandbox: false,
}

export function AlipayForm() {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  const form = useForm<AlipayFormValues>({
    resolver: zodResolver(alipayFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // TODO: 从后端 API 获取配置
        const mockConfig = {
          appId: '',
          privateKey: '',
          alipayPublicKey: '',
          signType: 'RSA2' as const,
          notifyUrl: 'https://your-domain.com/api/payment/alipay/notify',
          sandbox: false,
        }
        form.reset(mockConfig)
        setIsConfigured(!!mockConfig.appId && !!mockConfig.privateKey)
      } catch (error) {
        console.error('获取支付宝配置失败:', error)
      }
    }
    fetchConfig()
  }, [form])

  function onSubmit(data: AlipayFormValues) {
    console.log('保存支付宝配置:', data)
    toast.success('支付宝配置已保存', {
      description: '配置将在服务重启后生效',
    })
    setIsConfigured(true)
  }

  const copyNotifyUrl = () => {
    const url = form.getValues('notifyUrl') || 'https://your-domain.com/api/payment/alipay/notify'
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('已复制到剪贴板')
  }

  return (
    <div className='space-y-6'>
      {/* 提示信息 */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertTitle>使用场景</AlertTitle>
        <AlertDescription>
          支付宝支付用于 Web 端、App 端和 H5 页面，<strong>不在微信小程序中使用</strong>。
          配置后可用于未来的 App 和网页版本。
        </AlertDescription>
      </Alert>

      {/* 状态卡片 */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>配置状态</CardTitle>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? '已配置' : '未配置'}
            </Badge>
          </div>
          <CardDescription>
            {isConfigured 
              ? '支付宝支付已配置完成，可以在 Web/App 端使用'
              : '请完成支付宝配置后才能接收支付宝付款'}
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
                <FormLabel>应用 APPID</FormLabel>
                <FormControl>
                  <Input placeholder='2021000000000000' {...field} />
                </FormControl>
                <FormDescription>
                  在支付宝开放平台 → 我的应用 → 应用详情中获取
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='signType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>签名类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='选择签名类型' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='RSA2'>RSA2 (推荐)</SelectItem>
                    <SelectItem value='RSA'>RSA</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  推荐使用 RSA2 签名算法，安全性更高
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='privateKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>应用私钥</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Textarea
                      placeholder='MIIEvgIBADANBg...'
                      className='min-h-[100px] pr-10 font-mono text-xs'
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-2 top-2 h-8 w-8 p-0'
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  使用支付宝开放平台密钥工具生成，妥善保管不要泄露
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='alipayPublicKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>支付宝公钥</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...'
                    className='min-h-[100px] font-mono text-xs'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  在支付宝开放平台 → 应用详情 → 开发设置中获取
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
                <FormLabel>异步通知地址</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Input 
                      placeholder='https://your-domain.com/api/payment/alipay/notify'
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
                  支付成功后支付宝服务器回调通知地址，需要 HTTPS
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
            <h4 className='font-medium'>1. 创建应用</h4>
            <p className='text-sm text-muted-foreground'>
              前往支付宝开放平台创建应用，选择「自研开发」→「网页/移动应用」。
            </p>
            <Button variant='link' className='h-auto p-0' asChild>
              <a href='https://open.alipay.com/' target='_blank' rel='noopener noreferrer'>
                支付宝开放平台 <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>2. 配置密钥</h4>
            <p className='text-sm text-muted-foreground'>
              下载「支付宝开放平台开发助手」生成 RSA2 密钥对，将公钥上传到应用配置。
            </p>
            <Button variant='link' className='h-auto p-0' asChild>
              <a href='https://opendocs.alipay.com/common/02kipk' target='_blank' rel='noopener noreferrer'>
                密钥配置文档 <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>3. 添加产品</h4>
            <p className='text-sm text-muted-foreground'>
              在应用中添加「电脑网站支付」或「手机网站支付」产品能力。
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>4. 提交审核</h4>
            <p className='text-sm text-muted-foreground'>
              填写应用信息并提交审核，审核通过后即可上线使用。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

