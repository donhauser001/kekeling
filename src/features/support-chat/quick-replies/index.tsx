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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = data?.items.filter((r) => r.category === key).length || 0
          const Icon = config.icon
          return (
            <Card
              key={key}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                setCategoryFilter(key === categoryFilter ? 'all' : (key as QuickReplyCategory))
              }
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标题或内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as any)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          新增快捷回复
        </Button>
      </div>

      {/* 列表 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">分类</TableHead>
              <TableHead className="w-[200px]">标题</TableHead>
              <TableHead>回复内容</TableHead>
              <TableHead className="w-[100px] text-center">使用次数</TableHead>
              <TableHead className="w-[80px] text-center">排序</TableHead>
              <TableHead className="w-[80px] text-center">状态</TableHead>
              <TableHead className="w-[100px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredReplies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                      <Badge variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {config?.label || reply.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{reply.title}</TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {reply.content}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">{reply.useCount}</TableCell>
                    <TableCell className="text-center">{reply.sort}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={reply.status === 'active' ? 'default' : 'secondary'}
                      >
                        {reply.status === 'active' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(reply)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(reply)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReply ? '编辑快捷回复' : '新增快捷回复'}
            </DialogTitle>
            <DialogDescription>
              快捷回复可以帮助客服快速响应用户常见问题
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>标题</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="简短描述，方便快速选择"
              />
            </div>

            <div className="space-y-2">
              <Label>回复内容</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="完整的回复内容"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sort}
                onChange={(e) =>
                  setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                }
                placeholder="数字越小越靠前"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedReply && deleteMutation.mutate(selectedReply.id)}
            >
              {deleteMutation.isPending ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default QuickReplyManagement
