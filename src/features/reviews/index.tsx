import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Star,
    MessageSquare,
    ThumbsUp,
    EyeOff,
    Trophy,
    Filter,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SimplePagination } from '@/components/simple-pagination'
import { request } from '@/lib/api'
import { ReviewDetailDialog } from './components/review-detail-dialog'
import { ReviewRanking } from './components/review-ranking'

// 类型定义
interface Review {
    id: string
    orderId: string
    escortId: string
    userId: string
    rating: number
    ratingLabel: string
    content?: string
    tags: string[]
    images: string[]
    replyContent?: string
    replyAt?: string
    status: string
    statusLabel: string
    isAnonymous: boolean
    hideReason?: string
    hiddenBy?: string
    hiddenAt?: string
    createdAt: string
    updatedAt: string
    escort?: {
        id: string
        name: string
        phone: string
        avatar?: string
        rating: number
    }
    user?: {
        id: string
        nickname?: string
        avatar?: string
        phone?: string
    }
    order?: {
        id: string
        orderNo: string
        status: string
        totalAmount: number
        service?: { id: string; name: string }
        hospital?: { id: string; name: string }
    }
}

interface ReviewStats {
    total: number
    totalHidden: number
    averageRating: number
    goodRate: number
    replyRate: number
    contentRate: number
    distribution: { rating: number; count: number; percentage: number }[]
    tagStats: { tag: string; count: number }[]
}

// API 函数
const reviewsApi = {
    getList: async (params: {
        page?: number
        pageSize?: number
        status?: string
        rating?: number
        escortId?: string
    }) => {
        return request<{
            items: Review[]
            total: number
            page: number
            pageSize: number
        }>('/admin/reviews', { params })
    },
    getStats: async () => {
        return request<ReviewStats>('/admin/reviews/stats')
    },
    getDetail: async (id: string) => {
        return request<Review & { userReviewStats: { totalCount: number; averageRating: number } }>(
            `/admin/reviews/${id}`
        )
    },
    hideReview: async (id: string, reason: string) => {
        return request(`/admin/reviews/${id}/hide`, {
            method: 'POST',
            data: { reason },
        })
    },
    showReview: async (id: string) => {
        return request(`/admin/reviews/${id}/show`, { method: 'POST' })
    },
}

// 星级组件
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                />
            ))}
        </div>
    )
}

// 状态颜色映射
const statusColors: Record<string, string> = {
    visible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    hidden: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function ReviewsManagement() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [ratingFilter, setRatingFilter] = useState<string>('')
    const [activeTab, setActiveTab] = useState('list')

    // 弹窗状态
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [hideDialogOpen, setHideDialogOpen] = useState(false)
    const [currentReview, setCurrentReview] = useState<Review | null>(null)
    const [hideReason, setHideReason] = useState('')

    const queryClient = useQueryClient()

    // 获取统计数据
    const { data: stats } = useQuery({
        queryKey: ['review-stats'],
        queryFn: reviewsApi.getStats,
    })

    // 获取列表数据
    const { data, isLoading } = useQuery({
        queryKey: ['review-list', page, pageSize, statusFilter, ratingFilter],
        queryFn: () =>
            reviewsApi.getList({
                page,
                pageSize,
                status: statusFilter || undefined,
                rating: ratingFilter ? Number(ratingFilter) : undefined,
            }),
    })

    // 隐藏评价
    const hideMutation = useMutation({
        mutationFn: (params: { id: string; reason: string }) =>
            reviewsApi.hideReview(params.id, params.reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-list'] })
            queryClient.invalidateQueries({ queryKey: ['review-stats'] })
            setHideDialogOpen(false)
            setCurrentReview(null)
            setHideReason('')
            toast.success('评价已隐藏')
        },
        onError: (error: Error) => {
            toast.error(error.message || '操作失败')
        },
    })

    // 显示评价
    const showMutation = useMutation({
        mutationFn: (id: string) => reviewsApi.showReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-list'] })
            queryClient.invalidateQueries({ queryKey: ['review-stats'] })
            toast.success('评价已恢复显示')
        },
        onError: (error: Error) => {
            toast.error(error.message || '操作失败')
        },
    })

    const handleViewDetail = (review: Review) => {
        setCurrentReview(review)
        setDetailDialogOpen(true)
    }

    const handleHide = (review: Review) => {
        setCurrentReview(review)
        setHideReason('')
        setHideDialogOpen(true)
    }

    const handleConfirmHide = () => {
        if (currentReview && hideReason.trim()) {
            hideMutation.mutate({
                id: currentReview.id,
                reason: hideReason.trim(),
            })
        }
    }

    const handleShow = (review: Review) => {
        showMutation.mutate(review.id)
    }

    const items = data?.items || []
    const total = data?.total || 0

    return (
        <>
            <Header fixed>
                <div className="ms-auto flex items-center space-x-4">
                    <Search />
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">评价管理</h2>
                    <p className="text-muted-foreground">管理用户对陪诊服务的评价</p>
                </div>

                {/* 统计卡片 */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">总评价数</CardTitle>
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                隐藏: {stats?.totalHidden || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.averageRating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="flex items-center gap-1">
                                <StarRating rating={Math.round(stats?.averageRating || 0)} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">好评率</CardTitle>
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.goodRate || 0}%</div>
                            <p className="text-xs text-muted-foreground">4-5星比例</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">回复率</CardTitle>
                            <MessageSquare className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.replyRate || 0}%</div>
                            <p className="text-xs text-muted-foreground">
                                有内容: {stats?.contentRate || 0}%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="list" className="gap-2">
                            <Filter className="h-4 w-4" />
                            评价列表
                        </TabsTrigger>
                        <TabsTrigger value="ranking" className="gap-2">
                            <Trophy className="h-4 w-4" />
                            评分排行
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        {/* 筛选器 */}
                        <div className="flex gap-4">
                            <Select
                                value={statusFilter || 'all'}
                                onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="状态筛选" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部状态</SelectItem>
                                    <SelectItem value="visible">可见</SelectItem>
                                    <SelectItem value="hidden">已隐藏</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={ratingFilter || 'all'}
                                onValueChange={(v) => setRatingFilter(v === 'all' ? '' : v)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="评分筛选" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部评分</SelectItem>
                                    <SelectItem value="5">5星</SelectItem>
                                    <SelectItem value="4">4星</SelectItem>
                                    <SelectItem value="3">3星</SelectItem>
                                    <SelectItem value="2">2星</SelectItem>
                                    <SelectItem value="1">1星</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 数据表格 */}
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>用户</TableHead>
                                        <TableHead>陪诊员</TableHead>
                                        <TableHead>评分</TableHead>
                                        <TableHead className="max-w-[200px]">内容</TableHead>
                                        <TableHead>标签</TableHead>
                                        <TableHead>状态</TableHead>
                                        <TableHead>时间</TableHead>
                                        <TableHead>操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-8 text-center">
                                                加载中...
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                暂无数据
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((review) => (
                                            <TableRow key={review.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {review.user?.avatar ? (
                                                            <img
                                                                src={review.user.avatar}
                                                                className="h-8 w-8 rounded-full"
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                                                        )}
                                                        <span>
                                                            {review.isAnonymous
                                                                ? '匿名用户'
                                                                : review.user?.nickname || '未知'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {review.escort?.avatar ? (
                                                            <img
                                                                src={review.escort.avatar}
                                                                className="h-8 w-8 rounded-full"
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                                                        )}
                                                        <span>{review.escort?.name || '未知'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StarRating rating={review.rating} />
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {review.content || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {review.tags.slice(0, 2).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {review.tags.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{review.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[review.status] || ''}>
                                                        {review.statusLabel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(review)}
                                                        >
                                                            查看
                                                        </Button>
                                                        {review.status === 'visible' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleHide(review)}
                                                            >
                                                                <EyeOff className="mr-1 h-4 w-4" />
                                                                隐藏
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleShow(review)}
                                                            >
                                                                显示
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div className="border-t p-4">
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
                    </TabsContent>

                    <TabsContent value="ranking">
                        <ReviewRanking />
                    </TabsContent>
                </Tabs>
            </Main>

            {/* 详情弹窗 */}
            <ReviewDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                reviewId={currentReview?.id}
            />

            {/* 隐藏确认弹窗 */}
            <Dialog open={hideDialogOpen} onOpenChange={setHideDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>隐藏评价</DialogTitle>
                        <DialogDescription>隐藏后，该评价将不在用户端展示。请填写隐藏原因。</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 text-sm font-medium">隐藏原因</div>
                            <Textarea
                                placeholder="请输入隐藏原因..."
                                value={hideReason}
                                onChange={(e) => setHideReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setHideDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleConfirmHide}
                            disabled={!hideReason.trim() || hideMutation.isPending}
                        >
                            {hideMutation.isPending ? '处理中...' : '确认隐藏'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
