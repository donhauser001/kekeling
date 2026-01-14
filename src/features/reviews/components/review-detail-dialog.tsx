import { useQuery } from '@tanstack/react-query'
import { Star, Clock, MessageSquare, User, Package, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { request } from '@/lib/api'

interface ReviewDetail {
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
        ratingCount: number
        levelCode?: string
        level?: { name: string }
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
        paidAmount: number
        appointmentDate: string
        appointmentTime: string
        createdAt: string
        completedAt?: string
        service?: { id: string; name: string; price: number }
        hospital?: { id: string; name: string }
    }
    userReviewStats?: {
        totalCount: number
        averageRating: number
    }
}

interface ReviewDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    reviewId?: string
}

// 星级组件
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                />
            ))}
        </div>
    )
}

export function ReviewDetailDialog({
    open,
    onOpenChange,
    reviewId,
}: ReviewDetailDialogProps) {
    const { data: review, isLoading } = useQuery({
        queryKey: ['review-detail', reviewId],
        queryFn: () => request<ReviewDetail>(`/admin/reviews/${reviewId}`),
        enabled: !!reviewId && open,
    })

    if (!reviewId) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>评价详情</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center">加载中...</div>
                ) : review ? (
                    <div className="space-y-6">
                        {/* 评价信息 */}
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <Star className="h-4 w-4" />
                                评价信息
                            </h4>
                            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} size="lg" />
                                        <span className="font-medium">{review.rating}分</span>
                                        <span className="text-muted-foreground">
                                            ({review.ratingLabel})
                                        </span>
                                    </div>
                                    <Badge
                                        className={
                                            review.status === 'visible'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }
                                    >
                                        {review.statusLabel}
                                    </Badge>
                                </div>

                                {review.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {review.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {review.content && (
                                    <div className="rounded-md bg-background p-3">
                                        {review.content}
                                    </div>
                                )}

                                {review.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {review.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                className="h-20 w-20 rounded-md object-cover"
                                                alt=""
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    评价时间：{new Date(review.createdAt).toLocaleString('zh-CN')}
                                </div>
                            </div>
                        </div>

                        {/* 陪诊员回复 */}
                        {review.replyContent && (
                            <div>
                                <h4 className="mb-3 flex items-center gap-2 font-medium">
                                    <MessageSquare className="h-4 w-4" />
                                    陪诊员回复
                                </h4>
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                                    <p>{review.replyContent}</p>
                                    {review.replyAt && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            回复时间：{new Date(review.replyAt).toLocaleString('zh-CN')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 隐藏信息 */}
                        {review.status === 'hidden' && review.hideReason && (
                            <div>
                                <h4 className="mb-3 font-medium text-red-600">隐藏信息</h4>
                                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                                    <p>隐藏原因：{review.hideReason}</p>
                                    {review.hiddenAt && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            隐藏时间：{new Date(review.hiddenAt).toLocaleString('zh-CN')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* 订单信息 */}
                        {review.order && (
                            <div>
                                <h4 className="mb-3 flex items-center gap-2 font-medium">
                                    <Package className="h-4 w-4" />
                                    订单信息
                                </h4>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">订单号</span>
                                        <span>{review.order.orderNo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">服务</span>
                                        <span>{review.order.service?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">医院</span>
                                        <span>{review.order.hospital?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">金额</span>
                                        <span>¥{Number(review.order.paidAmount || review.order.totalAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">服务时间</span>
                                        <span>
                                            {new Date(review.order.appointmentDate).toLocaleDateString('zh-CN')}{' '}
                                            {review.order.appointmentTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* 用户信息 */}
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <User className="h-4 w-4" />
                                用户信息
                            </h4>
                            <div className="flex items-center gap-4">
                                {review.user?.avatar ? (
                                    <img
                                        src={review.user.avatar}
                                        className="h-12 w-12 rounded-full"
                                        alt=""
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                        <User className="h-6 w-6 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium">
                                        {review.isAnonymous ? '匿名用户' : review.user?.nickname || '未知用户'}
                                    </div>
                                    {!review.isAnonymous && review.user?.phone && (
                                        <div className="text-sm text-muted-foreground">
                                            {review.user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                                        </div>
                                    )}
                                    {review.userReviewStats && (
                                        <div className="text-sm text-muted-foreground">
                                            历史评价: {review.userReviewStats.totalCount}次 / 平均
                                            {review.userReviewStats.averageRating.toFixed(1)}分
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* 陪诊员信息 */}
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <Building className="h-4 w-4" />
                                陪诊员信息
                            </h4>
                            <div className="flex items-center gap-4">
                                {review.escort?.avatar ? (
                                    <img
                                        src={review.escort.avatar}
                                        className="h-12 w-12 rounded-full"
                                        alt=""
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                        <User className="h-6 w-6 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium">{review.escort?.name || '未知'}</div>
                                    {review.escort?.level?.name && (
                                        <Badge variant="outline" className="mt-1">
                                            {review.escort.level.name}
                                        </Badge>
                                    )}
                                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        {review.escort?.rating?.toFixed(1) || '5.0'}分
                                        <span>（共{review.escort?.ratingCount || 0}条评价）</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">评价不存在</div>
                )}
            </DialogContent>
        </Dialog>
    )
}
