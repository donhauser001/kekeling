import { useState, useRef } from 'react'
import {
  Image as ImageIcon,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
  X,
  Settings2,
  Power,
  PowerOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import { bannerApi, type Banner, type CreateBannerData } from '@/lib/api'

// 位置选项
const positionOptions = [
  { value: 'home', label: '首页轮播图', desc: '显示在小程序首页顶部', defaultSize: { width: 750, height: 360 } },
  { value: 'services', label: '服务页轮播图', desc: '显示在服务列表页顶部', defaultSize: { width: 750, height: 280 } },
  { value: 'profile', label: '个人中心轮播图', desc: '显示在个人中心页顶部', defaultSize: { width: 750, height: 200 } },
  { value: 'service-detail', label: '服务详情轮播图', desc: '显示在服务详情页', defaultSize: { width: 750, height: 400 } },
  { value: 'cases', label: '病例页轮播图', desc: '显示在病例管理页顶部', defaultSize: { width: 750, height: 280 } },
]

// 链接类型选项
const linkTypeOptions = [
  { value: '', label: '无链接' },
  { value: 'page', label: '小程序页面' },
  { value: 'service', label: '服务详情' },
  { value: 'webview', label: '网页链接' },
]

interface FormData {
  title: string
  image: string
  link: string
  linkType: string
  position: string
  sort: number
  status: string
}

const defaultFormData: FormData = {
  title: '',
  image: '',
  link: '',
  linkType: '',
  position: 'home',
  sort: 0,
  status: 'active',
}

interface BannerAreaConfig {
  enabled: boolean
  width: number
  height: number
  title: string
  description: string
}

interface BannerSettings {
  home: BannerAreaConfig
  services: BannerAreaConfig
  profile: BannerAreaConfig
  serviceDetail: BannerAreaConfig
  cases: BannerAreaConfig
}

// 获取区域配置 API
const getBannerSettings = async (): Promise<BannerSettings> => {
  const response = await fetch('/api/config/banner/settings')
  const result = await response.json()
  return result.data
}

// 更新区域配置 API
const updateBannerAreaConfig = async (position: string, config: Partial<BannerAreaConfig>) => {
  const response = await fetch(`/api/config/banner/settings/${position}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  const result = await response.json()
  return result.data
}

// 单个区域的轮播图管理组件
function BannerAreaSection({
  position,
  config,
  onToggleEnabled,
  onUpdateSize,
}: {
  position: string
  config: BannerAreaConfig
  onToggleEnabled: (enabled: boolean) => void
  onUpdateSize: (width: number, height: number) => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExpanded, setIsExpanded] = useState(config.enabled)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<FormData>({ ...defaultFormData, position })
  const [isUploading, setIsUploading] = useState(false)
  const [sizeConfig, setSizeConfig] = useState({ width: config.width, height: config.height })

  // 获取该位置的轮播图列表
  const { data, isLoading } = useQuery({
    queryKey: ['banners', position],
    queryFn: () => bannerApi.getList({ position, pageSize: 100 }),
    enabled: config.enabled,
  })

  // 创建轮播图
  const createMutation = useMutation({
    mutationFn: (data: CreateBannerData) => bannerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', position] })
      toast.success('创建成功')
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  // 更新轮播图
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBannerData> }) =>
      bannerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', position] })
      toast.success('更新成功')
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  // 删除轮播图
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners', position] })
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setDeletingBanner(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const banners = data?.data || []
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      image: banner.image,
      link: banner.link || '',
      linkType: banner.linkType || '',
      position: position,
      sort: banner.sort,
      status: banner.status,
    })
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingBanner(null)
    setFormData({ ...defaultFormData, position })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingBanner(null)
    setFormData({ ...defaultFormData, position })
  }

  const handleSubmit = () => {
    if (!formData.image) {
      toast.error('请上传轮播图')
      return
    }

    const submitData: CreateBannerData = {
      title: formData.title || undefined,
      image: formData.image,
      link: formData.link || undefined,
      linkType: formData.linkType || undefined,
      position: position,
      sort: formData.sort,
      status: formData.status,
    }

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'banner')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()
      const url = result.data?.url || result.url
      setFormData((prev) => ({ ...prev, image: url }))
      toast.success('上传成功')
    } catch {
      toast.error('上传失败，请重试')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleToggleStatus = async (banner: Banner) => {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active'
    updateMutation.mutate({
      id: banner.id,
      data: { status: newStatus },
    })
  }

  const handleSaveSettings = () => {
    onUpdateSize(sizeConfig.width, sizeConfig.height)
    setSettingsOpen(false)
    toast.success('尺寸设置已保存')
  }

  return (
    <Card className={cn(!config.enabled && 'opacity-60')}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CollapsibleTrigger asChild>
              <button className='flex flex-1 items-center gap-3 text-left'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    {config.title}
                    <Badge variant={config.enabled ? 'default' : 'secondary'} className='text-xs'>
                      {config.enabled ? '已启用' : '已关闭'}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {banners.length} 张
                    </Badge>
                  </CardTitle>
                  <CardDescription className='mt-1'>
                    {config.description} · 建议尺寸 {config.width}×{config.height}
                  </CardDescription>
                </div>
              </button>
            </CollapsibleTrigger>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSettingsOpen(true)}
                title='尺寸设置'
              >
                <Settings2 className='h-4 w-4' />
              </Button>
              <Switch
                checked={config.enabled}
                onCheckedChange={onToggleEnabled}
                title={config.enabled ? '关闭此区域' : '启用此区域'}
              />
              {config.enabled && (
                <Button size='sm' onClick={handleCreate}>
                  <Plus className='mr-1 h-4 w-4' />
                  添加
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className='pt-0'>
            {!config.enabled ? (
              <div className='flex items-center justify-center rounded-lg border border-dashed py-8 text-muted-foreground'>
                <PowerOff className='mr-2 h-5 w-5' />
                此区域已关闭，小程序将不显示该轮播图
              </div>
            ) : isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            ) : banners.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-muted-foreground'>
                <ImageIcon className='mb-2 h-8 w-8' />
                <p>暂无轮播图</p>
                <Button className='mt-3' size='sm' variant='outline' onClick={handleCreate}>
                  <Plus className='mr-1 h-4 w-4' />
                  添加第一张
                </Button>
              </div>
            ) : (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className='group relative overflow-hidden rounded-lg border bg-muted'
                  >
                    <div
                      className='relative'
                      style={{ aspectRatio: `${config.width}/${config.height}` }}
                    >
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title || '轮播图'}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center'>
                          <ImageIcon className='h-8 w-8 text-muted-foreground/50' />
                        </div>
                      )}
                      <div className='absolute left-1 top-1'>
                        <Badge
                          variant={banner.status === 'active' ? 'default' : 'secondary'}
                          className='text-xs'
                        >
                          {banner.status === 'active' ? '显示' : '隐藏'}
                        </Badge>
                      </div>
                      <div className='absolute right-1 top-1'>
                        <Badge variant='outline' className='bg-background/80 text-xs'>
                          #{index + 1}
                        </Badge>
                      </div>
                      {/* 悬浮操作 */}
                      <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Button size='sm' variant='secondary' onClick={() => handleEdit(banner)}>
                          <Pencil className='mr-1 h-3 w-3' />
                          编辑
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setDeletingBanner(banner)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className='mr-1 h-3 w-3' />
                          删除
                        </Button>
                      </div>
                    </div>
                    <div className='p-2'>
                      <p className='truncate text-sm font-medium'>
                        {banner.title || '未命名'}
                      </p>
                      {banner.link && (
                        <p className='flex items-center gap-1 truncate text-xs text-muted-foreground'>
                          <LinkIcon className='h-3 w-3' />
                          {banner.link}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* 尺寸设置对话框 */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>尺寸设置</DialogTitle>
            <DialogDescription>设置 {config.title} 的建议尺寸</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>宽度 (px)</Label>
                <Input
                  type='number'
                  value={sizeConfig.width}
                  onChange={(e) =>
                    setSizeConfig((prev) => ({ ...prev, width: parseInt(e.target.value) || 750 }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>高度 (px)</Label>
                <Input
                  type='number'
                  value={sizeConfig.height}
                  onChange={(e) =>
                    setSizeConfig((prev) => ({ ...prev, height: parseInt(e.target.value) || 360 }))
                  }
                />
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              比例: {sizeConfig.width}:{sizeConfig.height} (
              {(sizeConfig.width / sizeConfig.height).toFixed(2)}:1)
            </p>
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => setSettingsOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSettings}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editingBanner ? '编辑轮播图' : '添加轮播图'}</DialogTitle>
            <DialogDescription>
              {config.title} · 建议尺寸 {config.width}×{config.height}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* 图片上传 */}
            <div className='space-y-2'>
              <Label>
                轮播图 <span className='text-destructive'>*</span>
              </Label>
              <div
                className={cn(
                  'relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-accent',
                  formData.image && 'border-solid'
                )}
                style={{ aspectRatio: `${config.width}/${config.height}` }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt='预览'
                      className='h-full w-full rounded-lg object-cover'
                    />
                    <Button
                      variant='destructive'
                      size='icon'
                      className='absolute right-2 top-2 h-6 w-6'
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData((prev) => ({ ...prev, image: '' }))
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    {isUploading ? (
                      <Loader2 className='h-8 w-8 animate-spin' />
                    ) : (
                      <ImageIcon className='h-8 w-8' />
                    )}
                    <span className='text-sm'>{isUploading ? '上传中...' : '点击上传图片'}</span>
                    <span className='text-xs'>
                      建议尺寸 {config.width}×{config.height}
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* 标题 */}
            <div className='space-y-2'>
              <Label htmlFor='title'>标题（可选）</Label>
              <Input
                id='title'
                placeholder='轮播图标题'
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* 链接类型 */}
            <div className='space-y-2'>
              <Label>链接类型</Label>
              <Select
                value={formData.linkType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, linkType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择链接类型' />
                </SelectTrigger>
                <SelectContent>
                  {linkTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || 'none'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 链接地址 */}
            {formData.linkType && formData.linkType !== 'none' && (
              <div className='space-y-2'>
                <Label htmlFor='link'>链接地址</Label>
                <Input
                  id='link'
                  placeholder={
                    formData.linkType === 'page'
                      ? '/pages/services/index'
                      : formData.linkType === 'service'
                        ? '服务ID'
                        : 'https://example.com'
                  }
                  value={formData.link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                />
              </div>
            )}

            {/* 排序和状态 */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sort'>排序值</Label>
                <Input
                  id='sort'
                  type='number'
                  min={0}
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>显示</SelectItem>
                    <SelectItem value='inactive'>隐藏</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !formData.image}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {editingBanner ? '保存' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这张轮播图吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => deletingBanner && deleteMutation.mutate(deletingBanner.id)}
            >
              {deleteMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default function BannersManagement() {
  const queryClient = useQueryClient()

  // 获取区域配置
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['bannerSettings'],
    queryFn: getBannerSettings,
  })

  // 更新区域配置
  const updateConfigMutation = useMutation({
    mutationFn: ({ position, config }: { position: string; config: Partial<BannerAreaConfig> }) =>
      updateBannerAreaConfig(position, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannerSettings'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const handleToggleEnabled = (position: string, enabled: boolean) => {
    updateConfigMutation.mutate({ position, config: { enabled } })
    toast.success(enabled ? '已启用该区域' : '已关闭该区域')
  }

  const handleUpdateSize = (position: string, width: number, height: number) => {
    updateConfigMutation.mutate({ position, config: { width, height } })
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

  if (error || !settings) {
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

  // 构建区域配置列表
  const areas: { position: string; config: BannerAreaConfig }[] = [
    { position: 'home', config: settings.home },
    { position: 'services', config: settings.services },
    { position: 'profile', config: settings.profile },
    { position: 'service-detail', config: settings.serviceDetail },
    { position: 'cases', config: settings.cases },
  ]

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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>轮播图管理</h1>
          <p className='text-muted-foreground'>
            管理小程序各页面的轮播图，每个区域可独立开关和设置尺寸
          </p>
        </div>

        <div className='space-y-4'>
          {areas.map(({ position, config }) => (
            <BannerAreaSection
              key={position}
              position={position}
              config={config}
              onToggleEnabled={(enabled) => handleToggleEnabled(position, enabled)}
              onUpdateSize={(width, height) => handleUpdateSize(position, width, height)}
            />
          ))}
        </div>
      </Main>
    </>
  )
}
