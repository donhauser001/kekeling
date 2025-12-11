import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  Settings,
  Crown,
  Award,
  Users,
  Star,
  Shield,
  Gem,
  Medal,
  Trophy,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  distributionApi,
  type DistributionLevel,
  type DistributionLevelWithStats,
  type CreateDistributionLevelData,
  type UpdateDistributionLevelData,
} from '@/lib/api'

// 可用的图标列表
const iconOptions = [
  { value: 'Crown', label: '皇冠', icon: Crown },
  { value: 'Award', label: '奖章', icon: Award },
  { value: 'Users', label: '用户', icon: Users },
  { value: 'Star', label: '星星', icon: Star },
  { value: 'Shield', label: '盾牌', icon: Shield },
  { value: 'Gem', label: '宝石', icon: Gem },
  { value: 'Medal', label: '奖牌', icon: Medal },
  { value: 'Trophy', label: '奖杯', icon: Trophy },
  { value: 'Sparkles', label: '闪光', icon: Sparkles },
]

// 颜色预设
const colorPresets = [
  { value: '#f59e0b', label: '金色' },
  { value: '#3b82f6', label: '蓝色' },
  { value: '#6b7280', label: '灰色' },
  { value: '#10b981', label: '绿色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#ef4444', label: '红色' },
  { value: '#ec4899', label: '粉色' },
  { value: '#06b6d4', label: '青色' },
]

// 根据图标名称获取图标组件
function getIconComponent(iconName: string | null) {
  const iconOption = iconOptions.find(opt => opt.value === iconName)
  if (iconOption) {
    const IconComp = iconOption.icon
    return <IconComp className="h-5 w-5" />
  }
  return <Users className="h-5 w-5" />
}

export function DistributionSettings() {
  const queryClient = useQueryClient()

  // 对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<DistributionLevelWithStats | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState<CreateDistributionLevelData>({
    level: 1,
    name: '',
    code: '',
    icon: 'Users',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    description: '',
    commissionRate: 0,
    promotionConfig: {},
    isDefault: false,
  })

  // 获取等级统计列表
  const { data: levels, isLoading, error } = useQuery({
    queryKey: ['distribution-levels-stats'],
    queryFn: () => distributionApi.getLevelStats(),
  })

  // 初始化默认等级
  const initMutation = useMutation({
    mutationFn: () => distributionApi.initDefaultLevels(),
    onSuccess: () => {
      toast.success('初始化成功')
      queryClient.invalidateQueries({ queryKey: ['distribution-levels-stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '初始化失败')
    },
  })

  // 创建等级
  const createMutation = useMutation({
    mutationFn: (data: CreateDistributionLevelData) => distributionApi.createLevel(data),
    onSuccess: () => {
      toast.success('创建成功')
      setEditDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['distribution-levels-stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  // 更新等级
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistributionLevelData }) =>
      distributionApi.updateLevel(id, data),
    onSuccess: () => {
      toast.success('更新成功')
      setEditDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['distribution-levels-stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  // 删除等级
  const deleteMutation = useMutation({
    mutationFn: (id: string) => distributionApi.deleteLevel(id),
    onSuccess: () => {
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['distribution-levels-stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  // 打开创建对话框
  const handleCreate = () => {
    setIsCreating(true)
    setSelectedLevel(null)
    const nextLevel = levels?.length ? Math.max(...levels.map(l => l.level)) + 1 : 1
    setFormData({
      level: nextLevel,
      name: '',
      code: '',
      icon: 'Users',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      description: '',
      commissionRate: 0,
      promotionConfig: {},
      isDefault: false,
    })
    setEditDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (level: DistributionLevelWithStats) => {
    setIsCreating(false)
    setSelectedLevel(level)
    setFormData({
      level: level.level,
      name: level.name,
      code: level.code,
      icon: level.icon || 'Users',
      color: level.color,
      bgColor: level.bgColor || '#f3f4f6',
      description: level.description || '',
      commissionRate: level.commissionRate,
      promotionConfig: level.promotionConfig || {},
      isDefault: level.isDefault,
    })
    setEditDialogOpen(true)
  }

  // 提交表单
  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error('请填写等级名称和代码')
      return
    }

    // 清理空的 promotionConfig 字段
    const cleanedPromotionConfig = formData.promotionConfig
      ? Object.fromEntries(
        Object.entries(formData.promotionConfig).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
      : undefined
    const hasPromotionConfig = cleanedPromotionConfig && Object.keys(cleanedPromotionConfig).length > 0

    if (isCreating) {
      createMutation.mutate({
        ...formData,
        promotionConfig: hasPromotionConfig ? cleanedPromotionConfig : undefined,
      })
    } else if (selectedLevel) {
      updateMutation.mutate({
        id: selectedLevel.id,
        data: {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          bgColor: formData.bgColor,
          description: formData.description,
          commissionRate: formData.commissionRate,
          promotionConfig: hasPromotionConfig ? cleanedPromotionConfig : null,
          isDefault: formData.isDefault,
        },
      })
    }
  }

  // 确认删除
  const handleDelete = () => {
    if (selectedLevel) {
      deleteMutation.mutate(selectedLevel.id)
    }
  }

  return (
    <>
      <Header>
        <Search />
        <div className="ml-auto flex items-center gap-2">
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">分销设置</h1>
            <p className="text-muted-foreground">
              自定义分销等级的名称、图标、颜色和分润比例
            </p>
          </div>
          <div className="flex gap-2">
            {(!levels || levels.length === 0) && (
              <Button
                variant="outline"
                onClick={() => initMutation.mutate()}
                disabled={initMutation.isPending}
              >
                {initMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4" />
                初始化默认等级
              </Button>
            )}
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              添加等级
            </Button>
          </div>
        </div>

        {/* 等级列表 */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">加载失败</p>
              </div>
            </CardContent>
          </Card>
        ) : !levels || levels.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 flex-col items-center justify-center">
              <Settings className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">暂无分销等级</p>
              <p className="text-muted-foreground">点击上方按钮初始化默认等级或手动添加</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => (
              <Card key={level.id} className="relative overflow-hidden">
                {/* 顶部颜色条 */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: level.color }}
                />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: level.bgColor || '#f3f4f6',
                          color: level.color,
                        }}
                      >
                        {getIconComponent(level.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{level.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Level {level.level} · {level.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(level)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedLevel(level)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {level.description && (
                    <p className="mb-3 text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      分润 {level.commissionRate}%
                    </Badge>
                    <Badge variant="outline">
                      {level.memberCount} 名成员
                    </Badge>
                    {level.isDefault && (
                      <Badge variant="default">默认等级</Badge>
                    )}
                    {level.status === 'inactive' && (
                      <Badge variant="destructive">已禁用</Badge>
                    )}
                  </div>

                  {level.promotionConfig && (
                    <div className="mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">晋升条件：</p>
                      <ul className="space-y-0.5">
                        {level.promotionConfig.minOrders && (
                          <li>• 完成 {level.promotionConfig.minOrders} 单</li>
                        )}
                        {level.promotionConfig.minRating && (
                          <li>• 评分 ≥ {level.promotionConfig.minRating}</li>
                        )}
                        {level.promotionConfig.minDirectInvites && (
                          <li>• 直推 ≥ {level.promotionConfig.minDirectInvites} 人（仅注册）</li>
                        )}
                        {level.promotionConfig.minValidDirectInvites && (
                          <li>• 有效直推 ≥ {level.promotionConfig.minValidDirectInvites} 人
                            {level.promotionConfig.directInviteMinOrders && level.promotionConfig.directInviteMinOrders > 1
                              ? `（每人≥${level.promotionConfig.directInviteMinOrders}单）`
                              : '（每人≥1单）'}
                          </li>
                        )}
                        {level.promotionConfig.minActiveMonths && (
                          <li>• 活跃 ≥ {level.promotionConfig.minActiveMonths} 个月</li>
                        )}
                        {level.promotionConfig.minTeamSize && (
                          <li>• 团队 ≥ {level.promotionConfig.minTeamSize} 人</li>
                        )}
                        {level.promotionConfig.minTeamMonthlyOrders && (
                          <li>• 团队月订单 ≥ {level.promotionConfig.minTeamMonthlyOrders} 单</li>
                        )}
                        {level.promotionConfig.requireReview && (
                          <li>• 需要平台审核</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      {/* 编辑/创建对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? '添加分销等级' : '编辑分销等级'}</DialogTitle>
            <DialogDescription>
              {isCreating ? '创建一个新的分销等级' : '修改分销等级信息'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本设置</TabsTrigger>
              <TabsTrigger value="promotion">晋升条件</TabsTrigger>
            </TabsList>

            {/* 基本设置 Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">等级数值</Label>
                  <Input
                    id="level"
                    type="number"
                    min={1}
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    disabled={!isCreating}
                  />
                  <p className="text-xs text-muted-foreground">数值越小等级越高</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">等级代码</Label>
                  <Input
                    id="code"
                    placeholder="如: partner"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={!isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">等级名称</Label>
                <Input
                  id="name"
                  placeholder="如: 城市合伙人"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>图标</Label>
                  <Select
                    value={formData.icon || 'Users'}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => {
                        const IconComp = opt.icon
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <IconComp className="h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>颜色</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorPresets.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">分润比例 (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">等级描述</Label>
                <Textarea
                  id="description"
                  placeholder="描述该等级的特点和权益"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>设为默认等级</Label>
                  <p className="text-sm text-muted-foreground">
                    新成员将自动分配到此等级
                  </p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
              </div>
            </TabsContent>

            {/* 晋升条件 Tab */}
            <TabsContent value="promotion" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                设置晋升到此等级需要满足的条件，留空表示不限制
              </p>

              {/* 个人业绩 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">个人业绩要求</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="minOrders" className="text-sm">最低完成订单</Label>
                    <Input
                      id="minOrders"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minOrders || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minOrders: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minRating" className="text-sm">最低评分</Label>
                    <Input
                      id="minRating"
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minRating || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minRating: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minActiveMonths" className="text-sm">最低活跃月数</Label>
                    <Input
                      id="minActiveMonths"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minActiveMonths || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minActiveMonths: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* 直推要求 */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-medium text-muted-foreground">直推要求</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="minDirectInvites" className="text-sm">直推人数（仅注册）</Label>
                    <Input
                      id="minDirectInvites"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minDirectInvites || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minDirectInvites: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minValidDirectInvites" className="text-sm">有效直推人数</Label>
                    <Input
                      id="minValidDirectInvites"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minValidDirectInvites || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minValidDirectInvites: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="directInviteMinOrders" className="text-sm">有效直推最低订单数</Label>
                    <Input
                      id="directInviteMinOrders"
                      type="number"
                      min={1}
                      placeholder="默认1单"
                      value={formData.promotionConfig?.directInviteMinOrders || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          directInviteMinOrders: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      被邀请人完成此订单数后才算"有效直推"
                    </p>
                  </div>
                </div>
              </div>

              {/* 团队要求 */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-medium text-muted-foreground">团队要求</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="minTeamSize" className="text-sm">最低团队人数</Label>
                    <Input
                      id="minTeamSize"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minTeamSize || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minTeamSize: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minTeamMonthlyOrders" className="text-sm">团队月订单数</Label>
                    <Input
                      id="minTeamMonthlyOrders"
                      type="number"
                      min={0}
                      placeholder="不限制"
                      value={formData.promotionConfig?.minTeamMonthlyOrders || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        promotionConfig: {
                          ...formData.promotionConfig,
                          minTeamMonthlyOrders: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* 审核设置 */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="space-y-0.5">
                  <Label className="text-sm">需要平台审核</Label>
                  <p className="text-xs text-muted-foreground">
                    满足条件后需管理员审核通过才能晋升
                  </p>
                </div>
                <Switch
                  checked={formData.promotionConfig?.requireReview || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    promotionConfig: {
                      ...formData.promotionConfig,
                      requireReview: checked,
                    },
                  })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreating ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除等级 "{selectedLevel?.name}" 吗？此操作无法撤销。
              {selectedLevel && selectedLevel.memberCount > 0 && (
                <span className="mt-2 block text-destructive">
                  警告：该等级下有 {selectedLevel.memberCount} 名成员，请先调整成员等级。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
