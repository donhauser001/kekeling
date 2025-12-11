import { useState, useEffect } from 'react'
import {
  BarChart3,
  Loader2,
  AlertTriangle,
  Save,
  ChevronUp,
  ChevronDown,
  Code,
  RotateCcw,
  Star,
  Flame,
  ThumbsUp,
  Sparkles,
  Plus,
  Search as SearchIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TerminalPreview } from '@/components/terminal-preview'
import { cn } from '@/lib/utils'

// 统计项配置
interface StatsItemConfig {
  key: string
  label: string
  suffix: string
  enabled: boolean
  customValue?: string  // 自定义值
}

// 服务推荐选项卡类型
type ServiceTabType = 'recommended' | 'hot' | 'rating' | 'custom'

// 服务推荐选项卡配置
interface ServiceTabConfig {
  key: ServiceTabType
  title: string
  enabled: boolean
  limit: number
  serviceIds?: string[]
}

// 服务推荐设置
interface ServiceRecommendSettings {
  enabled: boolean
  tabs: ServiceTabConfig[]
}

// 首页设置类型
interface HomePageSettings {
  statsEnabled: boolean
  statsItems: StatsItemConfig[]
  contentEnabled: boolean
  contentCode: string
  serviceRecommend: ServiceRecommendSettings
}

// 服务分类
interface ServiceCategory {
  id: string
  name: string
  icon?: string
}

// 服务项（用于选择器）
interface ServiceItem {
  id: string
  name: string
  price: number
  coverImage?: string
  category?: ServiceCategory
}

// 默认内容区 HTML 代码
const defaultContentCode = `<div class="content-section">
  <div class="content-item">
    <div class="icon-wrapper">❤️</div>
    <h3>用心服务</h3>
    <p>每一位陪诊员都经过专业培训，用心对待每一次服务</p>
  </div>
  <div class="content-item">
    <div class="icon-wrapper">👥</div>
    <h3>专业团队</h3>
    <p>护理、医疗背景的专业团队，熟悉各大医院流程</p>
  </div>
  <div class="content-item">
    <div class="icon-wrapper">✅</div>
    <h3>品质保障</h3>
    <p>服务全程可追踪，不满意可申请退款</p>
  </div>
</div>`

// 可用统计项选项
const availableStatsKeys = [
  { key: 'userCount', label: '服务用户数' },
  { key: 'hospitalCount', label: '合作医院数' },
  { key: 'rating', label: '好评率' },
  { key: 'orderCount', label: '完成订单数' },
  { key: 'escortCount', label: '陪诊员数量' },
  { key: 'custom', label: '自定义' },
]

// 服务推荐选项卡图标映射
const tabIcons: Record<ServiceTabType, React.ReactNode> = {
  recommended: <Star className='h-4 w-4' />,
  hot: <Flame className='h-4 w-4' />,
  rating: <ThumbsUp className='h-4 w-4' />,
  custom: <Sparkles className='h-4 w-4' />,
}

// 默认服务推荐设置
const defaultServiceRecommend: ServiceRecommendSettings = {
  enabled: true,
  tabs: [
    { key: 'recommended', title: '推荐服务', enabled: true, limit: 5 },
    { key: 'hot', title: '热门服务', enabled: true, limit: 5 },
    { key: 'rating', title: '好评榜', enabled: true, limit: 5 },
    { key: 'custom', title: '精选服务', enabled: false, limit: 5, serviceIds: [] },
  ],
}

// 获取服务列表
const getServices = async (): Promise<ServiceItem[]> => {
  try {
    const response = await fetch('/api/services?pageSize=100')
    const result = await response.json()
    return result.data?.data || []
  } catch {
    return []
  }
}

// 获取首页设置
const getHomePageSettings = async (): Promise<HomePageSettings> => {
  const response = await fetch('/api/config/homepage/settings')
  const result = await response.json()
  return result.data
}

// 更新首页设置
const updateHomePageSettings = async (settings: Partial<HomePageSettings>) => {
  const response = await fetch('/api/config/homepage/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  const result = await response.json()
  return result.data
}

export default function HomepageManagement() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<HomePageSettings | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false)
  const [serviceSearch, setServiceSearch] = useState('')
  const [selectedTabIndex, setSelectedTabIndex] = useState<number | null>(null)

  // 获取设置
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['homepageSettings'],
    queryFn: getHomePageSettings,
  })

  // 获取服务列表
  const { data: services = [] } = useQuery({
    queryKey: ['servicesList'],
    queryFn: getServices,
  })

  // 更新设置
  const updateMutation = useMutation({
    mutationFn: updateHomePageSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSettings'] })
      toast.success('保存成功')
      setHasChanges(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || '保存失败')
    },
  })

  // 初始化表单数据
  useEffect(() => {
    if (settings && !formData) {
      setFormData({
        ...settings,
        serviceRecommend: settings.serviceRecommend || defaultServiceRecommend,
      })
    }
  }, [settings])

  // 更新表单字段
  const updateField = <K extends keyof HomePageSettings>(
    field: K,
    value: HomePageSettings[K]
  ) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
    setHasChanges(true)
  }

  // 更新统计项
  const updateStatsItem = (index: number, updates: Partial<StatsItemConfig>) => {
    if (!formData) return
    const newItems = [...formData.statsItems]
    newItems[index] = { ...newItems[index], ...updates }
    updateField('statsItems', newItems)
  }

  // 移动统计项（上下排序）
  const moveStatsItem = (index: number, direction: 'up' | 'down') => {
    if (!formData) return
    const newItems = [...formData.statsItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
      // 交换位置
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
    updateField('statsItems', newItems)
  }

  // 保存
  const handleSave = () => {
    if (!formData) return
    updateMutation.mutate(formData)
  }

  // 重置内容区代码
  const handleResetCode = () => {
    if (!formData) return
    updateField('contentCode', defaultContentCode)
    setResetDialogOpen(false)
    toast.success('已重置为默认代码')
  }

  // 更新服务推荐设置
  const updateServiceRecommend = (updates: Partial<ServiceRecommendSettings>) => {
    if (!formData) return
    updateField('serviceRecommend', { ...formData.serviceRecommend, ...updates })
  }

  // 更新服务推荐选项卡
  const updateServiceTab = (index: number, updates: Partial<ServiceTabConfig>) => {
    if (!formData) return
    const newTabs = [...formData.serviceRecommend.tabs]
    newTabs[index] = { ...newTabs[index], ...updates }
    updateServiceRecommend({ tabs: newTabs })
  }

  // 添加服务到自定义选项卡
  const addServiceToTab = (tabIndex: number, serviceId: string) => {
    if (!formData) return
    const tab = formData.serviceRecommend.tabs[tabIndex]
    if (tab.serviceIds?.includes(serviceId)) return
    const newServiceIds = [...(tab.serviceIds || []), serviceId]
    updateServiceTab(tabIndex, { serviceIds: newServiceIds })
  }

  // 从自定义选项卡移除服务
  const removeServiceFromTab = (tabIndex: number, serviceId: string) => {
    if (!formData) return
    const tab = formData.serviceRecommend.tabs[tabIndex]
    const newServiceIds = (tab.serviceIds || []).filter((id) => id !== serviceId)
    updateServiceTab(tabIndex, { serviceIds: newServiceIds })
  }

  // 过滤服务列表
  const filteredServices = services.filter(
    (s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  // 按分类分组服务
  const groupedServices = filteredServices.reduce((groups, service) => {
    const categoryName = service.category?.name || '未分类'
    const categoryId = service.category?.id || 'uncategorized'
    if (!groups[categoryId]) {
      groups[categoryId] = {
        id: categoryId,
        name: categoryName,
        icon: service.category?.icon,
        services: []
      }
    }
    groups[categoryId].services.push(service)
    return groups
  }, {} as Record<string, { id: string; name: string; icon?: string; services: ServiceItem[] }>)

  // 转换为数组并排序
  const categorizedServices = Object.values(groupedServices).sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN')
  )

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

  if (error || !formData) {
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
            <h1 className='text-2xl font-bold tracking-tight'>首页管理</h1>
            <p className='text-muted-foreground'>配置小程序首页的统计卡片和内容区域</p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Save className='mr-2 h-4 w-4' />
            保存更改
          </Button>
        </div>

        {/* 左右分栏布局 */}
        <div className='flex gap-6'>
          {/* 左侧：设置区域 */}
          <div className='flex-1 space-y-6'>
            {/* 统计卡片配置 */}
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <BarChart3 className='h-4 w-4' />
                      统计卡片
                    </CardTitle>
                  </div>
                  <Switch
                    checked={formData.statsEnabled}
                    onCheckedChange={(checked) => updateField('statsEnabled', checked)}
                  />
                </div>
              </CardHeader>
              {formData.statsEnabled && (
                <CardContent className='pt-0'>
                  <div className='space-y-2'>
                    {formData.statsItems.map((item, index) => (
                      <div
                        key={`${item.key}-${index}`}
                        className='flex items-center gap-2 rounded-lg border p-2'
                      >
                        <div className='flex flex-col'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-4 w-4'
                            onClick={() => moveStatsItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-4 w-4'
                            onClick={() => moveStatsItem(index, 'down')}
                            disabled={index === formData.statsItems.length - 1}
                          >
                            <ChevronDown className='h-3 w-3' />
                          </Button>
                        </div>
                        <div className='flex flex-1 flex-wrap items-center gap-2'>
                          <select
                            className='h-8 rounded-md border bg-background px-2 text-xs'
                            value={item.key}
                            onChange={(e) => {
                              const selectedKey = e.target.value
                              const keyInfo = availableStatsKeys.find((k) => k.key === selectedKey)
                              updateStatsItem(index, {
                                key: selectedKey,
                                label: selectedKey === 'custom' ? '自定义项' : (keyInfo?.label || item.label),
                                customValue: selectedKey === 'custom' ? (item.customValue || '100') : undefined,
                              })
                            }}
                          >
                            {availableStatsKeys.map((k) => (
                              <option
                                key={k.key}
                                value={k.key}
                                disabled={
                                  k.key !== 'custom' &&
                                  formData.statsItems.some((i) => i.key === k.key) &&
                                  item.key !== k.key
                                }
                              >
                                {k.label}
                              </option>
                            ))}
                          </select>
                          {item.key === 'custom' && (
                            <Input
                              className='h-8 w-16 text-xs'
                              placeholder='数值'
                              value={item.customValue || ''}
                              onChange={(e) => updateStatsItem(index, { customValue: e.target.value })}
                            />
                          )}
                          <Input
                            className='h-8 w-20 text-xs'
                            placeholder='标签'
                            value={item.label}
                            onChange={(e) => updateStatsItem(index, { label: e.target.value })}
                          />
                          <Input
                            className='h-8 w-12 text-xs'
                            placeholder='后缀'
                            value={item.suffix}
                            onChange={(e) => updateStatsItem(index, { suffix: e.target.value })}
                          />
                          <Switch
                            checked={item.enabled}
                            onCheckedChange={(checked) => updateStatsItem(index, { enabled: checked })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 服务推荐配置 */}
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Star className='h-4 w-4' />
                      服务推荐
                    </CardTitle>
                  </div>
                  <Switch
                    checked={formData.serviceRecommend?.enabled ?? true}
                    onCheckedChange={(checked) => updateServiceRecommend({ enabled: checked })}
                  />
                </div>
              </CardHeader>
              {formData.serviceRecommend?.enabled && (
                <CardContent className='pt-0'>
                  <div className='space-y-2'>
                    {formData.serviceRecommend.tabs.map((tab, index) => (
                      <div key={tab.key} className='rounded-lg border p-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary'>
                              {tabIcons[tab.key]}
                            </div>
                            <Input
                              className='h-7 w-24 text-xs font-medium'
                              value={tab.title}
                              onChange={(e) => updateServiceTab(index, { title: e.target.value })}
                            />
                          </div>
                          <div className='flex items-center gap-2'>
                            <Input
                              type='number'
                              className='h-7 w-12 text-xs'
                              min={1}
                              max={20}
                              value={tab.limit}
                              onChange={(e) => updateServiceTab(index, { limit: parseInt(e.target.value) || 5 })}
                            />
                            <Switch
                              checked={tab.enabled}
                              onCheckedChange={(checked) => updateServiceTab(index, { enabled: checked })}
                            />
                          </div>
                        </div>
                        {tab.key === 'custom' && tab.enabled && (
                          <div className='mt-2 space-y-2'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>
                                已选 {tab.serviceIds?.length || 0} 个服务
                              </span>
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-6 text-xs'
                                onClick={() => {
                                  setSelectedTabIndex(index)
                                  setServiceSearchOpen(true)
                                }}
                              >
                                <Plus className='mr-1 h-3 w-3' />
                                选择服务
                              </Button>
                            </div>
                            {tab.serviceIds && tab.serviceIds.length > 0 && (
                              <div className='flex flex-wrap gap-1'>
                                {tab.serviceIds.map((serviceId) => {
                                  const service = services.find((s) => s.id === serviceId)
                                  return service ? (
                                    <Badge
                                      key={serviceId}
                                      variant='secondary'
                                      className='cursor-pointer text-xs'
                                      onClick={() => removeServiceFromTab(index, serviceId)}
                                    >
                                      {service.name} ×
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 内容区配置 */}
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Code className='h-4 w-4' />
                      内容区（HTML）
                    </CardTitle>
                  </div>
                  <Switch
                    checked={formData.contentEnabled}
                    onCheckedChange={(checked) => updateField('contentEnabled', checked)}
                  />
                </div>
              </CardHeader>
              {formData.contentEnabled && (
                <CardContent className='pt-0 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-xs'>HTML 代码</Label>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 text-xs'
                      onClick={() => setResetDialogOpen(true)}
                    >
                      <RotateCcw className='mr-1 h-3 w-3' />
                      重置
                    </Button>
                  </div>
                  <Textarea
                    className='min-h-[200px] font-mono text-xs'
                    placeholder='输入 HTML 代码...'
                    value={formData.contentCode}
                    onChange={(e) => updateField('contentCode', e.target.value)}
                  />
                </CardContent>
              )}
            </Card>
          </div>

          {/* 右侧：终端预览器 */}
          <div className='sticky top-4'>
            <TerminalPreview
              page='home'
              homeSettings={{
                stats: {
                  enabled: formData.statsEnabled,
                  items: formData.statsItems,
                },
                content: {
                  enabled: formData.contentEnabled,
                  code: formData.contentCode,
                },
                serviceRecommend: formData.serviceRecommend,
              }}
              autoLoad={true}
            />
          </div>
        </div>
      </Main>

      {/* 重置确认对话框 */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置代码</AlertDialogTitle>
            <AlertDialogDescription>
              确定要重置为默认代码吗？当前的代码将会丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCode}>重置</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 服务选择对话框 */}
      <AlertDialog open={serviceSearchOpen} onOpenChange={setServiceSearchOpen}>
        <AlertDialogContent className='max-w-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>选择服务</AlertDialogTitle>
            <AlertDialogDescription>
              搜索并选择要添加到精选服务的服务项目
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4'>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                className='pl-9'
                placeholder='搜索服务名称...'
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
            </div>
            <div className='max-h-[400px] space-y-4 overflow-y-auto pr-2'>
              {categorizedServices.length > 0 ? (
                categorizedServices.map((category) => (
                  <div key={category.id} className='space-y-2'>
                    <div className='sticky top-0 z-10 flex items-center gap-2 bg-background py-1'>
                      <span className='text-sm font-medium text-foreground'>{category.name}</span>
                      <span className='text-xs text-muted-foreground'>({category.services.length})</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      {category.services.map((service) => {
                        const isSelected = selectedTabIndex !== null &&
                          formData?.serviceRecommend.tabs[selectedTabIndex]?.serviceIds?.includes(service.id)
                        return (
                          <div
                            key={service.id}
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-md border p-2.5 transition-colors hover:bg-muted',
                              isSelected && 'border-primary bg-primary/5'
                            )}
                            onClick={() => {
                              if (selectedTabIndex !== null) {
                                if (isSelected) {
                                  removeServiceFromTab(selectedTabIndex, service.id)
                                } else {
                                  addServiceToTab(selectedTabIndex, service.id)
                                }
                              }
                            }}
                          >
                            <div className='flex min-w-0 flex-1 items-center gap-2'>
                              {service.coverImage && (
                                <img
                                  src={service.coverImage}
                                  alt={service.name}
                                  className='h-8 w-8 flex-shrink-0 rounded object-cover'
                                />
                              )}
                              <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-medium'>{service.name}</p>
                                <p className='text-xs text-muted-foreground'>¥{service.price}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <Badge variant='default' className='ml-2 flex-shrink-0 text-xs'>已选</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  {serviceSearch ? '未找到匹配的服务' : '暂无可用服务'}
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setServiceSearch('')
              setSelectedTabIndex(null)
            }}>
              完成
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
