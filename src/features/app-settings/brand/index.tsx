import { useState, useEffect, useRef } from 'react'
import {
  Save,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Sparkles,
  Type,
  Image as ImageIcon,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useThemeSettings, useUpdateThemeSettings } from '@/hooks/use-api'
import { cn } from '@/lib/utils'
import type { ThemeSettings, BrandLayout, ThemeMode } from '@/lib/api'

// Logo 上传组件
function LogoUploader({
  value,
  onChange,
  label,
  variant = 'light',
}: {
  value: string
  onChange: (url: string) => void
  label: string
  variant?: 'light' | 'dark'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value)

  useEffect(() => {
    setPreviewUrl(value)
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'brand')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      const url = data.data?.url || data.url
      onChange(url)
      setPreviewUrl(url)
      toast.success('上传成功')
    } catch (err) {
      toast.error('上传失败，请重试')
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreviewUrl('')
  }

  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <div
        className={cn(
          'relative flex h-20 items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          variant === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        )}
      >
        {previewUrl ? (
          <div className='relative'>
            <img
              src={previewUrl}
              alt='Logo'
              className='max-h-14 max-w-[140px] object-contain'
            />
            <Button
              variant='destructive'
              size='icon'
              className='absolute -right-2 -top-2 h-5 w-5'
              onClick={handleRemove}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-1'>
            <ImageIcon
              className={cn(
                'h-5 w-5',
                variant === 'dark' ? 'text-gray-500' : 'text-gray-400'
              )}
            />
            <p
              className={cn(
                'text-xs',
                variant === 'dark' ? 'text-gray-500' : 'text-muted-foreground'
              )}
            >
              点击上传
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='absolute inset-0 cursor-pointer opacity-0'
          disabled={isUploading}
        />

        {isUploading && (
          <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/50'>
            <Loader2 className='h-6 w-6 animate-spin text-white' />
          </div>
        )}
      </div>
    </div>
  )
}

// 布局选择组件
function LayoutSelector({
  value,
  onChange,
  brandName,
  brandSlogan,
  logo,
}: {
  value: BrandLayout
  onChange: (layout: BrandLayout) => void
  brandName: string
  brandSlogan: string
  logo: string
}) {
  const layouts: { value: BrandLayout; label: string; desc?: string }[] = [
    { value: 'logo-only', label: '仅 Logo' },
    { value: 'logo-name', label: 'Logo + 名称' },
    { value: 'logo-slogan', label: 'Logo + 标语', desc: '适合 Logo 已含名称' },
    { value: 'logo-name-slogan', label: 'Logo + 名称 + 标语' },
    { value: 'name-only', label: '仅名称' },
    { value: 'name-slogan', label: '名称 + 标语' },
  ]

  const renderPreview = (layout: BrandLayout) => {
    const hasLogo = layout.includes('logo')
    // logo-slogan 不显示名称，其他包含 name 的才显示
    const hasName = layout.includes('name') && layout !== 'logo-slogan'
    const hasSlogan = layout.includes('slogan')

    return (
      <div className='flex items-center gap-2'>
        {hasLogo && (
          logo ? (
            <img src={logo} alt='' className='h-6 w-auto object-contain' />
          ) : (
            <div className='h-6 w-6 rounded bg-primary/20 flex items-center justify-center'>
              <Sparkles className='h-3 w-3 text-primary' />
            </div>
          )
        )}
        <div className='flex flex-col'>
          {hasName && (
            <span className='text-sm font-semibold leading-tight'>
              {brandName || '品牌名称'}
            </span>
          )}
          {hasSlogan && (
            <span className='text-[10px] text-muted-foreground leading-tight'>
              {brandSlogan || '品牌标语'}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-2'>
      {layouts.map((layout) => (
        <button
          key={layout.value}
          type='button'
          onClick={() => onChange(layout.value)}
          className={cn(
            'flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:bg-accent',
            value === layout.value && 'border-primary bg-primary/5'
          )}
        >
          <div className='flex-1'>{renderPreview(layout.value)}</div>
          <div className='flex items-center gap-2'>
            <div className='text-right'>
              <span className='text-xs text-muted-foreground'>{layout.label}</span>
              {layout.desc && (
                <p className='text-[10px] text-muted-foreground/60'>{layout.desc}</p>
              )}
            </div>
            {value === layout.value && (
              <Check className='h-4 w-4 text-primary' />
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// 默认值
const defaultSettings: ThemeSettings = {
  primaryColor: '#f97316',
  defaultThemeMode: 'light',
  brandName: '科科灵',
  brandSlogan: '让就医不再孤单',
  headerLogo: '',
  headerLogoDark: '',
  footerLogo: '',
  footerLogoDark: '',
  headerShowName: true,
  headerShowSlogan: false,
  footerShowName: true,
  footerShowSlogan: true,
  headerLayout: 'logo-name',
  footerLayout: 'logo-name-slogan',
}

export default function AppSettingsBrand() {
  const { data: settings, isLoading, error } = useThemeSettings()
  const updateMutation = useUpdateThemeSettings()

  const [formData, setFormData] = useState<ThemeSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({ ...defaultSettings, ...settings })
      setHasChanges(false)
    }
  }, [settings])

  const updateField = <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData)
      toast.success('品牌设置已保存')
      setHasChanges(false)
    } catch (err: any) {
      toast.error(err.message || '保存失败')
    }
  }

  const handleReset = () => {
    if (settings) {
      setFormData({ ...defaultSettings, ...settings })
      setHasChanges(false)
      toast.info('已重置为保存的设置')
    }
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center gap-4'>
            <MessageButton />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center gap-4'>
            <MessageButton />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex h-64 flex-col items-center justify-center gap-2'>
            <AlertTriangle className='h-12 w-12 text-destructive' />
            <p className='text-muted-foreground'>加载失败，请刷新重试</p>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>品牌设置</h1>
            <p className='text-muted-foreground'>
              配置小程序的品牌名称、Logo 和显示方式
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className='mr-2 h-4 w-4' />
              重置
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Save className='mr-2 h-4 w-4' />
              )}
              保存设置
            </Button>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* 左侧：基础信息 */}
          <div className='space-y-6'>
            {/* 品牌信息 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Type className='h-5 w-5' />
                  品牌信息
                </CardTitle>
                <CardDescription>设置品牌的基础信息</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='brandName'>品牌名称</Label>
                  <Input
                    id='brandName'
                    placeholder='请输入品牌名称'
                    value={formData.brandName}
                    onChange={(e) => updateField('brandName', e.target.value)}
                    maxLength={20}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='brandSlogan'>品牌标语</Label>
                  <Textarea
                    id='brandSlogan'
                    placeholder='请输入品牌标语'
                    value={formData.brandSlogan}
                    onChange={(e) => updateField('brandSlogan', e.target.value)}
                    maxLength={50}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 主题模式 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Sun className='h-5 w-5' />
                  默认主题
                </CardTitle>
                <CardDescription>设置小程序的默认主题模式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { value: 'light' as ThemeMode, label: '浅色', icon: Sun, desc: '始终使用浅色主题' },
                    { value: 'dark' as ThemeMode, label: '深色', icon: Moon, desc: '始终使用深色主题' },
                    { value: 'system' as ThemeMode, label: '跟随系统', icon: Monitor, desc: '自动跟随系统设置' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type='button'
                      onClick={() => updateField('defaultThemeMode', mode.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:bg-accent',
                        formData.defaultThemeMode === mode.value && 'border-primary bg-primary/5'
                      )}
                    >
                      <mode.icon className={cn(
                        'h-6 w-6',
                        formData.defaultThemeMode === mode.value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className='text-sm font-medium'>{mode.label}</span>
                    </button>
                  ))}
                </div>
                <p className='mt-3 text-xs text-muted-foreground'>
                  {formData.defaultThemeMode === 'light' && '小程序将始终使用浅色主题显示'}
                  {formData.defaultThemeMode === 'dark' && '小程序将始终使用深色主题显示'}
                  {formData.defaultThemeMode === 'system' && '小程序将根据用户手机系统设置自动切换主题'}
                </p>
              </CardContent>
            </Card>

            {/* 预览 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Eye className='h-5 w-5' />
                  效果预览
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {/* 顶部预览 */}
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                    <ArrowUp className='h-3 w-3' /> 顶部区域
                  </Label>
                  {/* 浅色模式 */}
                  <div className='rounded-lg border bg-white p-3'>
                    <p className='mb-2 text-[10px] text-gray-400'>浅色模式</p>
                    <BrandPreview
                      layout={formData.headerLayout}
                      logo={formData.headerLogo}
                      name={formData.brandName}
                      slogan={formData.brandSlogan}
                      variant='light'
                    />
                  </div>
                  {/* 深色模式 */}
                  <div className='rounded-lg border border-gray-700 bg-gray-900 p-3'>
                    <p className='mb-2 text-[10px] text-gray-500'>深色模式</p>
                    <BrandPreview
                      layout={formData.headerLayout}
                      logo={formData.headerLogoDark || formData.headerLogo}
                      name={formData.brandName}
                      slogan={formData.brandSlogan}
                      variant='dark'
                    />
                  </div>
                </div>

                <Separator />

                {/* 页脚预览 */}
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                    <ArrowDown className='h-3 w-3' /> 页脚区域
                  </Label>
                  {/* 浅色模式 */}
                  <div className='rounded-lg border bg-gray-50 p-3'>
                    <p className='mb-2 text-[10px] text-gray-400'>浅色模式</p>
                    <BrandPreview
                      layout={formData.footerLayout}
                      logo={formData.footerLogo || formData.headerLogo}
                      name={formData.brandName}
                      slogan={formData.brandSlogan}
                      variant='light'
                      centered
                    />
                  </div>
                  {/* 深色模式 */}
                  <div className='rounded-lg border border-gray-700 bg-gray-800 p-3'>
                    <p className='mb-2 text-[10px] text-gray-500'>深色模式</p>
                    <BrandPreview
                      layout={formData.footerLayout}
                      logo={formData.footerLogoDark || formData.footerLogo || formData.headerLogoDark || formData.headerLogo}
                      name={formData.brandName}
                      slogan={formData.brandSlogan}
                      variant='dark'
                      centered
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间和右侧：顶部和页脚设置 */}
          <div className='lg:col-span-2'>
            <Tabs defaultValue='header' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='header' className='gap-2'>
                  <ArrowUp className='h-4 w-4' />
                  顶部设置
                </TabsTrigger>
                <TabsTrigger value='footer' className='gap-2'>
                  <ArrowDown className='h-4 w-4' />
                  页脚设置
                </TabsTrigger>
              </TabsList>

              <TabsContent value='header' className='mt-4 space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>顶部 Logo</CardTitle>
                    <CardDescription>
                      显示在小程序顶部导航栏，建议尺寸 200x60 像素
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                      <LogoUploader
                        value={formData.headerLogo}
                        onChange={(url) => updateField('headerLogo', url)}
                        label='浅色模式'
                        variant='light'
                      />
                      <LogoUploader
                        value={formData.headerLogoDark}
                        onChange={(url) => updateField('headerLogoDark', url)}
                        label='深色模式'
                        variant='dark'
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>顶部布局方式</CardTitle>
                    <CardDescription>
                      选择顶部品牌信息的展示组合
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LayoutSelector
                      value={formData.headerLayout}
                      onChange={(layout) => updateField('headerLayout', layout)}
                      brandName={formData.brandName}
                      brandSlogan={formData.brandSlogan}
                      logo={formData.headerLogo}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='footer' className='mt-4 space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>页脚 Logo</CardTitle>
                    <CardDescription>
                      显示在小程序底部页脚区域，留空则使用顶部 Logo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                      <LogoUploader
                        value={formData.footerLogo}
                        onChange={(url) => updateField('footerLogo', url)}
                        label='浅色模式'
                        variant='light'
                      />
                      <LogoUploader
                        value={formData.footerLogoDark}
                        onChange={(url) => updateField('footerLogoDark', url)}
                        label='深色模式'
                        variant='dark'
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>页脚布局方式</CardTitle>
                    <CardDescription>
                      选择页脚品牌信息的展示组合
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LayoutSelector
                      value={formData.footerLayout}
                      onChange={(layout) => updateField('footerLayout', layout)}
                      brandName={formData.brandName}
                      brandSlogan={formData.brandSlogan}
                      logo={formData.footerLogo || formData.headerLogo}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 使用说明 */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Sparkles className='h-5 w-5' />
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground space-y-2 text-sm'>
              <p>
                <strong>品牌名称：</strong>
                显示在小程序各页面，建议 2-6 个字。
              </p>
              <p>
                <strong>品牌标语：</strong>
                简洁的品牌宣言，建议 6-20 个字。
              </p>
              <p>
                <strong>Logo 设置：</strong>
                建议准备浅色和深色两个版本，以适配不同主题。页脚 Logo 留空时将自动使用顶部 Logo。
              </p>
              <p>
                <strong>布局方式：</strong>
                可选择 Logo、名称、标语的不同组合方式。顶部通常简洁展示，页脚可展示更完整的品牌信息。
              </p>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

// 品牌预览组件
function BrandPreview({
  layout,
  logo,
  name,
  slogan,
  centered = false,
  variant = 'light',
}: {
  layout: BrandLayout
  logo: string
  name: string
  slogan: string
  centered?: boolean
  variant?: 'light' | 'dark'
}) {
  const hasLogo = layout.includes('logo')
  // logo-slogan 不显示名称
  const hasName = layout.includes('name') && layout !== 'logo-slogan'
  const hasSlogan = layout.includes('slogan')

  const isDark = variant === 'dark'

  return (
    <div className={cn('flex items-center gap-2', centered && 'justify-center')}>
      {hasLogo && (
        logo ? (
          <img src={logo} alt='' className='h-8 w-auto object-contain' />
        ) : (
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            isDark ? 'bg-primary/30' : 'bg-primary/20'
          )}>
            <Sparkles className='h-4 w-4 text-primary' />
          </div>
        )
      )}
      {(hasName || hasSlogan) && (
        <div className='flex flex-col'>
          {hasName && (
            <span className={cn(
              'text-sm font-bold leading-tight',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {name || '品牌名称'}
            </span>
          )}
          {hasSlogan && (
            <span className={cn(
              'text-[10px] leading-tight',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              {slogan || '品牌标语'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
