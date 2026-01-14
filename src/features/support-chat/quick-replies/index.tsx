import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Zap,
  MessageSquare,
  CreditCard,
  Package,
  MoreHorizontal,
  Star,
  StarOff,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { quickReplyApi } from '../api'
import { QuickReplyCategory, type QuickReply } from '../types'

// 分类配置
const categoryConfig: Record<
  QuickReplyCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  [QuickReplyCategory.GREETING]: {
    label: '问候语',
    icon: MessageSquare,
    color: 'bg-blue-500',
  },
  [QuickReplyCategory.ORDER]: {
    label: '订单相关',
    icon: Package,
    color: 'bg-green-500',
  },
  [QuickReplyCategory.PAYMENT]: {
    label: '支付相关',
    icon: CreditCard,
    color: 'bg-yellow-500',
  },
  [QuickReplyCategory.SERVICE]: {
    label: '服务相关',
    icon: Zap,
    color: 'bg-purple-500',
  },
  [QuickReplyCategory.OTHER]: {
    label: '其他',
    icon: MoreHorizontal,
    color: 'bg-gray-500',
  },
}

// 表格骨架屏
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className='h-5 w-16' /></TableCell>
          <TableCell><Skeleton className='h-5 w-32' /></TableCell>
          <TableCell><Skeleton className='h-10 w-full' /></TableCell>
          <TableCell className='text-center'><Skeleton className='h-5 w-8 mx-auto' /></TableCell>
          <TableCell className='text-center'><Skeleton className='h-5 w-8 mx-auto' /></TableCell>
          <TableCell className='text-center'><Skeleton className='h-5 w-12 mx-auto' /></TableCell>
          <TableCell className='text-center'><Skeleton className='h-8 w-8 mx-auto' /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function QuickReplyManagement() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 状态
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<QuickReplyCategory | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReply, setSelectedReply] = useState<QuickReply | null>(null)
  const [formData, setFormData] = useState({
    category: QuickReplyCategory.OTHER as QuickReplyCategory,
    title: '',
    content: '',
    sort: 0,
  })

  // 获取快捷回复列表
  const { data, isLoading } = useQuery({
    queryKey: ['quick-replies', categoryFilter],
    queryFn: () =>
      quickReplyApi.getList({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        pageSize: 100,
      }),
  })

  // 创建
  const createMutation = useMutation({
    mutationFn: quickReplyApi.create,
    onSuccess: () => {
      toast({ title: '创建成功' })
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error.message,
      })
    },
  })

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      quickReplyApi.update(id, data),
    onSuccess: () => {
      toast({ title: '更新成功' })
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] })
      setDialogOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error.message,
      })
    },
  })

  // 删除
  const deleteMutation = useMutation({
    mutationFn: quickReplyApi.delete,
    onSuccess: () => {
      toast({ title: '删除成功' })
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] })
      setDeleteDialogOpen(false)
      setSelectedReply(null)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message,
      })
    },
  })

  // 设置自动问候语
  const setAutoGreetingMutation = useMutation({
    mutationFn: quickReplyApi.setAutoGreeting,
    onSuccess: () => {
      toast({ title: '已设置为自动问候语' })
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '设置失败',
        description: error.message,
      })
    },
  })

  // 取消自动问候语
  const cancelAutoGreetingMutation = useMutation({
    mutationFn: quickReplyApi.cancelAutoGreeting,
    onSuccess: () => {
      toast({ title: '已取消自动问候语' })
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '取消失败',
        description: error.message,
      })
    },
  })

  // 重置表单
  const resetForm = () => {
    setFormData({
      category: QuickReplyCategory.OTHER,
      title: '',
      content: '',
      sort: 0,
    })
    setSelectedReply(null)
  }

  // 打开编辑对话框
  const handleEdit = (reply: QuickReply) => {
    setSelectedReply(reply)
    setFormData({
      category: reply.category,
      title: reply.title,
      content: reply.content,
      sort: reply.sort,
    })
    setDialogOpen(true)
  }

  // 打开删除确认
  const handleDelete = (reply: QuickReply) => {
    setSelectedReply(reply)
    setDeleteDialogOpen(true)
  }

  // 切换自动问候语
  const handleToggleAutoGreeting = (reply: QuickReply) => {
    if (reply.isAutoGreeting) {
      cancelAutoGreetingMutation.mutate(reply.id)
    } else {
      setAutoGreetingMutation.mutate(reply.id)
    }
  }

  // 提交表单
  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写完整信息',
      })
      return
    }

    if (selectedReply) {
      updateMutation.mutate({
        id: selectedReply.id,
        data: formData,
      })
    } else {
      createMutation.mutate(formData)
    }
  }

  // 过滤数据
  const filteredReplies =
    data?.items.filter((reply) => {
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          reply.title.toLowerCase().includes(searchLower) ||
          reply.content.toLowerCase().includes(searchLower)
        )
      }
      return true
    }) || []

  // 当前自动问候语
  const autoGreeting = data?.items.find((r) => r.isAutoGreeting)

  return (
    <>
      {/* 标题区 */}
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>快捷回复管理</h2>
          <p className='text-muted-foreground'>配置客服常用的快捷回复，提高服务效率</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          新增快捷回复
        </Button>
      </div>

      {/* 自动问候语提示 */}
      {autoGreeting && (
        <div className='flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg'>
          <Star className='h-5 w-5 text-amber-500 shrink-0' />
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
              当前自动问候语：{autoGreeting.title}
            </p>
            <p className='text-xs text-amber-600 dark:text-amber-400 truncate'>
              {autoGreeting.content}
            </p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900'
            onClick={() => cancelAutoGreetingMutation.mutate(autoGreeting.id)}
          >
            <StarOff className='h-4 w-4 mr-1' />
            取消
          </Button>
        </div>
      )}

      {/* 统计卡片 */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = data?.items.filter((r) => r.category === key).length || 0
          const Icon = config.icon
          const isActive = key === categoryFilter
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary' : ''}`}
              onClick={() =>
                setCategoryFilter(key === categoryFilter ? 'all' : (key as QuickReplyCategory))
              }
            >
              <CardContent className='pt-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>{config.label}</p>
                    <p className='text-2xl font-bold'>{count}</p>
                  </div>
                  <div className={`p-2 rounded-full ${config.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 工具栏 */}
      <div className='flex flex-wrap items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='搜索标题或内容...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as any)}
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='选择分类' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部分类</SelectItem>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 表格 - 不使用 Card 包裹 */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[120px]'>分类</TableHead>
              <TableHead className='w-[200px]'>标题</TableHead>
              <TableHead>回复内容</TableHead>
              <TableHead className='w-[100px] text-center'>使用次数</TableHead>
              <TableHead className='w-[80px] text-center'>排序</TableHead>
              <TableHead className='w-[80px] text-center'>状态</TableHead>
              <TableHead className='w-[80px] text-center'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : filteredReplies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center text-muted-foreground'>
                  暂无快捷回复
                </TableCell>
              </TableRow>
            ) : (
              filteredReplies.map((reply) => {
                const config = categoryConfig[reply.category]
                const Icon = config?.icon || MoreHorizontal
                return (
                  <TableRow key={reply.id}>
                    <TableCell>
                      <Badge variant='outline' className='gap-1'>
                        <Icon className='h-3 w-3' />
                        {config?.label || reply.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{reply.title}</span>
                        {reply.isAutoGreeting && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Star className='h-4 w-4 text-amber-500 fill-amber-500' />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>自动问候语</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className='line-clamp-2 text-sm text-muted-foreground max-w-md'>
                        {reply.content}
                      </p>
                    </TableCell>
                    <TableCell className='text-center font-mono'>{reply.useCount}</TableCell>
                    <TableCell className='text-center font-mono'>{reply.sort}</TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant={reply.status === 'active' ? 'default' : 'secondary'}
                        className={reply.status === 'active' ? 'bg-teal-500 hover:bg-teal-600' : ''}
                      >
                        {reply.status === 'active' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(reply)}>
                            <Pencil className='h-4 w-4 mr-2' />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAutoGreeting(reply)}>
                            {reply.isAutoGreeting ? (
                              <>
                                <StarOff className='h-4 w-4 mr-2' />
                                取消自动问候
                              </>
                            ) : (
                              <>
                                <Star className='h-4 w-4 mr-2' />
                                设为自动问候
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => handleDelete(reply)}
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>
              {selectedReply ? '编辑快捷回复' : '新增快捷回复'}
            </DialogTitle>
            <DialogDescription>
              快捷回复可以帮助客服快速响应用户常见问题
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>分类</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({ ...formData, category: v as QuickReplyCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='简短描述，方便快速选择'
              />
            </div>

            <div className='space-y-2'>
              <Label>回复内容</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder='完整的回复内容'
                rows={4}
              />
            </div>

            <div className='space-y-2'>
              <Label>排序</Label>
              <Input
                type='number'
                value={formData.sort}
                onChange={(e) =>
                  setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                }
                placeholder='数字越小越靠前'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除快捷回复「{selectedReply?.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => selectedReply && deleteMutation.mutate(selectedReply.id)}
            >
              {deleteMutation.isPending ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default QuickReplyManagement
