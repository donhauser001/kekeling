import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, ExternalLink, Send, Loader2 } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { configApi, request } from '@/lib/api'

const smsFormSchema = z.object({
  enabled: z.boolean(),
  accessKeyId: z.string().min(1, '请输入 AccessKey ID'),
  accessKeySecret: z.string().optional(),
  signName: z.string().min(1, '请输入短信签名'),
  templateCode: z.string().min(1, '请输入模板编码'),
  devMode: z.boolean(),
  devCode: z.string().default('123456'),
  // 频控配置
  rateLimitPhone60s: z.number().min(10, '最小10秒').max(300, '最大300秒'),
  rateLimitIpHour: z.number().min(1, '最小1次').max(100, '最大100次'),
  rateLimitPhoneDay: z.number().min(1, '最小1次').max(50, '最大50次'),
  codeLength: z.number().min(4, '最小4位').max(8, '最大8位'),
  codeTtl: z.number().min(60, '最小60秒').max(600, '最大600秒'),
})

type SmsFormValues = z.infer<typeof smsFormSchema>

const defaultValues: SmsFormValues = {
  enabled: false,
  accessKeyId: '',
  accessKeySecret: '',
  signName: '',
  templateCode: '',
  devMode: true,
  devCode: '123456',
  // 频控配置默认值
  rateLimitPhone60s: 60,
  rateLimitIpHour: 20,
  rateLimitPhoneDay: 10,
  codeLength: 6,
  codeTtl: 300,
}

export function AliyunSmsForm() {
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<SmsFormValues, any>({
    resolver: zodResolver(smsFormSchema) as any,
    defaultValues,
  })

  const devMode = form.watch('devMode')
  const enabled = form.watch('enabled')

  // 从后端获取配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true)
        const config = await configApi.getSmsSettings()
        form.reset({
          enabled: config.enabled ?? false,
          accessKeyId: config.accessKeyId ?? '',
          accessKeySecret: '', // 密钥不回显完整值
          signName: config.signName ?? '',
          templateCode: config.templateCode ?? '',
          devMode: config.devMode ?? true,
          devCode: config.devCode ?? '123456',
          // 频控配置
          rateLimitPhone60s: config.rateLimitPhone60s ?? 60,
          rateLimitIpHour: config.rateLimitIpHour ?? 20,
          rateLimitPhoneDay: config.rateLimitPhoneDay ?? 10,
          codeLength: config.codeLength ?? 6,
          codeTtl: config.codeTtl ?? 300,
        })
        setIsConfigured(
          !!config.accessKeyId &&
          !!config.signName &&
          !!config.templateCode
        )
      } catch (error) {
        console.error('获取短信配置失败:', error)
        toast.error('获取短信配置失败')
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [form])

  async function onSubmit(data: SmsFormValues) {
    try {
      setIsSaving(true)

      // 如果密钥字段为空，不提交（保持原值）
      const submitData: Record<string, unknown> = {
        enabled: data.enabled,
        accessKeyId: data.accessKeyId,
        signName: data.signName,
        templateCode: data.templateCode,
        devMode: data.devMode,
        devCode: data.devCode,
        // 频控配置
        rateLimitPhone60s: data.rateLimitPhone60s,
        rateLimitIpHour: data.rateLimitIpHour,
        rateLimitPhoneDay: data.rateLimitPhoneDay,
        codeLength: data.codeLength,
        codeTtl: data.codeTtl,
      }

      // 只有当密钥不为空且不是脱敏值时才提交
      if (data.accessKeySecret && !data.accessKeySecret.includes('****')) {
        submitData.accessKeySecret = data.accessKeySecret
      }

      await configApi.updateSmsSettings(submitData)
      toast.success('短信配置已保存')
      setIsConfigured(
        !!data.accessKeyId &&
        !!data.signName &&
        !!data.templateCode
      )
    } catch (error) {
      console.error('保存短信配置失败:', error)
      toast.error('保存短信配置失败')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTestSms() {
    if (!testPhone || !/^1\d{10}$/.test(testPhone)) {
      toast.error('请输入正确的手机号')
      return
    }

    try {
      setIsTesting(true)
      // 调用测试短信接口（不需要手机号是已注册陪诊员）
      const result = await request<{ success: boolean; devMode: boolean; code?: string }>('/config/sms/test', {
        method: 'POST',
        data: { phone: testPhone },
      })
      toast.success('测试短信已发送', {
        description: result.devMode
          ? `开发模式，验证码为: ${result.code || form.getValues('devCode')}`
          : '请查收手机短信',
      })
    } catch (error: unknown) {
      console.error('发送测试短信失败:', error)
      toast.error('发送测试短信失败', {
        description: error instanceof Error ? error.message : '请检查配置是否正确',
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 状态卡片 */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>短信服务状态</CardTitle>
            <div className="flex items-center gap-2">
              {devMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  开发模式
                </Badge>
              )}
              <Badge variant={enabled && isConfigured ? 'default' : 'secondary'}>
                {enabled && isConfigured ? '已启用' : enabled ? '配置不完整' : '未启用'}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {enabled && isConfigured
              ? devMode
                ? '短信服务已启用（开发模式），验证码不会真实发送'
                : '短信服务已启用，可以正常发送验证码'
              : enabled
                ? '请完善短信配置后才能正常使用'
                : '短信服务未启用，请先启用并完成配置'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 配置表单 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error('表单验证失败:', errors)
          toast.error('请检查表单填写是否正确')
        })} className='space-y-6'>
          {/* 启用开关 */}
          <FormField
            control={form.control as any}
            name='enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>启用短信服务</FormLabel>
                  <FormDescription>
                    启用后可以发送短信验证码
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

          {/* 开发模式开关 */}
          <FormField
            control={form.control as any}
            name='devMode'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>开发模式</FormLabel>
                  <FormDescription>
                    开启后不调用真实接口，使用固定验证码
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

          {/* 开发模式验证码 */}
          {devMode && (
            <FormField
              control={form.control as any}
              name='devCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>开发模式验证码</FormLabel>
                  <FormControl>
                    <Input placeholder='123456' maxLength={6} {...field} />
                  </FormControl>
                  <FormDescription>
                    开发模式下使用的固定验证码（4-6位数字）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Separator />

          {/* 阿里云配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">阿里云短信配置</h3>

            <FormField
              control={form.control as any}
              name='accessKeyId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AccessKey ID</FormLabel>
                  <FormControl>
                    <Input placeholder='LTAI5t...' {...field} />
                  </FormControl>
                  <FormDescription>
                    在阿里云控制台 → AccessKey 管理中获取
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name='accessKeySecret'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AccessKey Secret</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showSecret ? 'text' : 'password'}
                        placeholder='留空表示不修改'
                        className='pr-10'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? (
                          <EyeOff className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <Eye className='h-4 w-4 text-muted-foreground' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    留空表示保持原有密钥不变
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name='signName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>短信签名</FormLabel>
                  <FormControl>
                    <Input placeholder='科科灵' {...field} />
                  </FormControl>
                  <FormDescription>
                    在阿里云短信服务控制台申请的签名名称
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name='templateCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模板编码</FormLabel>
                  <FormControl>
                    <Input placeholder='SMS_123456789' {...field} />
                  </FormControl>
                  <FormDescription>
                    验证码短信模板的编码，模板内容需包含 {'${code}'} 变量
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* 频控配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">发送频率限制</h3>
            <p className="text-sm text-muted-foreground">
              配置短信验证码的发送频率限制，防止滥用
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name='rateLimitPhone60s'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发送间隔（秒）</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={10}
                        max={300}
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 60)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      同一手机号两次发送的最小间隔
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name='rateLimitIpHour'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP 每小时上限（次）</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={100}
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 20)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      同一 IP 每小时最多发送次数
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name='rateLimitPhoneDay'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号每日上限（次）</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={50}
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      同一手机号每天最多发送次数
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name='codeTtl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>验证码有效期（秒）</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={60}
                        max={600}
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 300)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      验证码的有效时长（60-600秒）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name='codeLength'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>验证码长度（位）</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={4}
                        max={8}
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 6)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      验证码的位数（4-8位）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type='submit' disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存配置
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      {/* 测试发送 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>测试短信发送</CardTitle>
          <CardDescription>
            输入手机号测试短信是否能正常发送
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='请输入手机号'
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="max-w-[200px]"
            />
            <Button
              variant="outline"
              onClick={handleTestSms}
              disabled={isTesting || !enabled}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              发送测试
            </Button>
          </div>
          {!enabled && (
            <p className="text-sm text-muted-foreground mt-2">
              请先启用短信服务并保存配置
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* 帮助文档 */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>配置指南</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <h4 className='font-medium'>1. 开通阿里云短信服务</h4>
            <p className='text-sm text-muted-foreground'>
              前往阿里云控制台开通短信服务，需要完成实名认证。
            </p>
            <Button variant='link' className='h-auto p-0' asChild>
              <a href='https://dysms.console.aliyun.com/' target='_blank' rel='noopener noreferrer'>
                阿里云短信服务控制台 <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>2. 创建 AccessKey</h4>
            <p className='text-sm text-muted-foreground'>
              在阿里云控制台创建 AccessKey，建议使用子账号并只授予短信服务权限。
            </p>
            <Button variant='link' className='h-auto p-0' asChild>
              <a href='https://ram.console.aliyun.com/manage/ak' target='_blank' rel='noopener noreferrer'>
                AccessKey 管理 <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>3. 添加短信签名</h4>
            <p className='text-sm text-muted-foreground'>
              在短信服务控制台添加签名，签名需要审核通过才能使用。
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>4. 创建短信模板</h4>
            <p className='text-sm text-muted-foreground'>
              创建验证码短信模板，模板内容示例：您的验证码为：{'${code}'}，5分钟内有效。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
