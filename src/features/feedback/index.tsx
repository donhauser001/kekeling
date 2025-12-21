import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SimplePagination } from '@/components/simple-pagination'
import { request } from '@/lib/api'

// 类型定义
interface Feedback {
  id: string
  type: string
  typeLabel: string
  content: string
  contact?: string
  images: string[]
  status: string
  statusLabel: string
  handleNote?: string
  handlerName?: string
  handledAt?: string
  createdAt: string
  user?: {
    id: string
    nickname?: string
    avatar?: string
    phone?: string
  }
}

interface FeedbackStats {
  total: number
  pending: number
  processing: number
  resolved: number
  closed: number
}

// API 函数
const feedbackApi = {
  getList: async (params: { page?: number; pageSize?: number; status?: string; type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    if (params.status) searchParams.set('status', params.status)
    if (params.type) searchParams.set('type', params.type)
    // request 已经返回 result.data，不需要再取 .data
    return request(`/admin/feedback?${searchParams.toString()}`)
  },
  getStats: async () => {
    // request 已经返回 result.data，不需要再取 .data
    return request('/admin/feedback/stats') as Promise<FeedbackStats>
  },
  handle: async (id: string, data: { status: string; handleNote: string }) => {
    return request(`/admin/feedback/${id}/handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
}

// 状态颜色映射
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

// 类型颜色映射
const typeColors: Record<string, string> = {
  suggestion: 'bg-purple-100 text-purple-800',
  bug: 'bg-red-100 text-red-800',
  service: 'bg-orange-100 text-orange-800',
  experience: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
}

export function FeedbackManagement() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [handleDialogOpen, setHandleDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [handleNote, setHandleNote] = useState('')
  const [handleStatus, setHandleStatus] = useState<string>('resolved')

  const queryClient = useQueryClient()

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['feedback-stats'],
    queryFn: feedbackApi.getStats,
  })

  // 获取列表数据
  const { data, isLoading } = useQuery({
    queryKey: ['feedback-list', page, pageSize, statusFilter, typeFilter],
    queryFn: () =>
      feedbackApi.getList({
        page,
        pageSize,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
  })

  // 处理反馈
  const handleMutation = useMutation({
    mutationFn: (params: { id: string; status: string; handleNote: string }) =>
      feedbackApi.handle(params.id, { status: params.status, handleNote: params.handleNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-list'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
      setHandleDialogOpen(false)
      setCurrentFeedback(null)
      setHandleNote('')
      toast.success('处理成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '处理失败')
    },
  })

  const handleView = (feedback: Feedback) => {
    setCurrentFeedback(feedback)
    setDetailDialogOpen(true)
  }

  const handleProcess = (feedback: Feedback) => {
    setCurrentFeedback(feedback)
    setHandleNote('')
    setHandleStatus('resolved')
    setHandleDialogOpen(true)
  }

  const handleConfirmProcess = () => {
    if (currentFeedback && handleNote.trim()) {
      handleMutation.mutate({
        id: currentFeedback.id,
        status: handleStatus,
        handleNote: handleNote.trim(),
      })
    }
  }

  const items = data?.items || []
  const total = data?.total || 0

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>意见反馈</h2>
          <p className='text-muted-foreground'>管理用户提交的意见反馈</p>
        </div>

        {/* 统计卡片 */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>待处理</CardTitle>
              <Clock className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>处理中</CardTitle>
              <MessageSquare className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.processing || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>已解决</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.resolved || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>已关闭</CardTitle>
              <XCircle className='h-4 w-4 text-gray-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.closed || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选器 */}
        <div className='flex gap-4'>
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='状态筛选' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='pending'>待处理</SelectItem>
              <SelectItem value='processing'>处理中</SelectItem>
              <SelectItem value='resolved'>已解决</SelectItem>
              <SelectItem value='closed'>已关闭</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='类型筛选' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部类型</SelectItem>
              <SelectItem value='suggestion'>功能建议</SelectItem>
              <SelectItem value='bug'>问题反馈</SelectItem>
              <SelectItem value='service'>服务相关</SelectItem>
              <SelectItem value='experience'>体验优化</SelectItem>
              <SelectItem value='other'>其他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 数据表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>类型</TableHead>
                <TableHead className='max-w-[300px]'>内容</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-8'>
                    加载中...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                items.map((feedback: Feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {feedback.user?.avatar ? (
                          <img
                            src={feedback.user.avatar}
                            className='h-8 w-8 rounded-full'
                            alt=''
                          />
                        ) : (
                          <div className='h-8 w-8 rounded-full bg-gray-200' />
                        )}
                        <span>{feedback.user?.nickname || '匿名用户'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColors[feedback.type] || ''}>
                        {feedback.typeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-[300px] truncate'>
                      {feedback.content}
                    </TableCell>
                    <TableCell>{feedback.contact || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[feedback.status] || ''}>
                        {feedback.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleView(feedback)}
                        >
                          查看
                        </Button>
                        {feedback.status === 'pending' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleProcess(feedback)}
                          >
                            处理
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className='p-4 border-t'>
            <SimplePagination
              currentPage={page}
              pageSize={pageSize}
              totalPages={Math.ceil(total / pageSize) || 1}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      </Main>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>反馈详情</DialogTitle>
          </DialogHeader>
          {currentFeedback && (
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <Badge className={typeColors[currentFeedback.type] || ''}>
                  {currentFeedback.typeLabel}
                </Badge>
                <Badge className={statusColors[currentFeedback.status] || ''}>
                  {currentFeedback.statusLabel}
                </Badge>
              </div>
              <div>
                <div className='text-sm text-muted-foreground mb-1'>反馈内容</div>
                <div className='p-3 bg-muted rounded-md'>{currentFeedback.content}</div>
              </div>
              {currentFeedback.images?.length > 0 && (
                <div>
                  <div className='text-sm text-muted-foreground mb-1'>截图</div>
                  <div className='flex gap-2 flex-wrap'>
                    {currentFeedback.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className='w-20 h-20 object-cover rounded'
                        alt=''
                      />
                    ))}
                  </div>
                </div>
              )}
              {currentFeedback.contact && (
                <div>
                  <div className='text-sm text-muted-foreground mb-1'>联系方式</div>
                  <div>{currentFeedback.contact}</div>
                </div>
              )}
              <div className='flex gap-4 text-sm text-muted-foreground'>
                <div>用户: {currentFeedback.user?.nickname || '匿名'}</div>
                <div>
                  提交时间: {new Date(currentFeedback.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              {currentFeedback.handleNote && (
                <div>
                  <div className='text-sm text-muted-foreground mb-1'>处理备注</div>
                  <div className='p-3 bg-muted rounded-md'>{currentFeedback.handleNote}</div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    处理人: {currentFeedback.handlerName} |{' '}
                    {currentFeedback.handledAt &&
                      new Date(currentFeedback.handledAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 处理弹窗 */}
      <Dialog open={handleDialogOpen} onOpenChange={setHandleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理反馈</DialogTitle>
            <DialogDescription>请填写处理结果和备注</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <div className='text-sm font-medium mb-2'>处理状态</div>
              <Select value={handleStatus} onValueChange={setHandleStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='processing'>处理中</SelectItem>
                  <SelectItem value='resolved'>已解决</SelectItem>
                  <SelectItem value='closed'>已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className='text-sm font-medium mb-2'>处理备注</div>
              <Textarea
                placeholder='请输入处理备注...'
                value={handleNote}
                onChange={(e) => setHandleNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setHandleDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleConfirmProcess}
              disabled={!handleNote.trim() || handleMutation.isPending}
            >
              {handleMutation.isPending ? '处理中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

