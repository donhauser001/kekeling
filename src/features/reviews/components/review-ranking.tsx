import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Star, Medal, Award } from 'lucide-react'
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
import { SimplePagination } from '@/components/simple-pagination'
import { request } from '@/lib/api'

interface RankingItem {
    rank: number
    escort: {
        id: string
        name: string
        avatar?: string
        phone?: string
        levelCode?: string
        level?: { name: string }
    }
    averageRating: number
    reviewCount: number
    goodRate: number
}

interface RankingResponse {
    items: RankingItem[]
    total: number
    page: number
    pageSize: number
    period: string
}

// 排名图标
function RankIcon({ rank }: { rank: number }) {
    if (rank === 1) {
        return <Trophy className="h-5 w-5 text-yellow-500" />
    }
    if (rank === 2) {
        return <Medal className="h-5 w-5 text-gray-400" />
    }
    if (rank === 3) {
        return <Award className="h-5 w-5 text-amber-600" />
    }
    return <span className="text-muted-foreground">{rank}</span>
}

// 星级组件
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                />
            ))}
        </div>
    )
}

export function ReviewRanking() {
    const [period, setPeriod] = useState('month')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const { data, isLoading } = useQuery({
        queryKey: ['review-ranking', period, page, pageSize],
        queryFn: () =>
            request<RankingResponse>('/admin/reviews/ranking', {
                params: { period, page, pageSize, minReviewCount: 3 },
            }),
    })

    const items = data?.items || []
    const total = data?.total || 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    根据评价数量和评分综合排名，最少需要 3 条评价
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="统计周期" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">本周</SelectItem>
                        <SelectItem value="month">本月</SelectItem>
                        <SelectItem value="quarter">本季度</SelectItem>
                        <SelectItem value="year">本年度</SelectItem>
                        <SelectItem value="all">全部</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Top 3 卡片 */}
            {items.length >= 3 && (
                <div className="grid gap-4 md:grid-cols-3">
                    {items.slice(0, 3).map((item) => (
                        <Card
                            key={item.escort.id}
                            className={
                                item.rank === 1
                                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20'
                                    : item.rank === 2
                                        ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20'
                                        : 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20'
                            }
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <RankIcon rank={item.rank} />
                                    <span className="text-sm text-muted-foreground">
                                        {item.reviewCount} 条评价
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    {item.escort.avatar ? (
                                        <img
                                            src={item.escort.avatar}
                                            className="h-12 w-12 rounded-full"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                            <span className="text-lg font-bold text-gray-500">
                                                {item.escort.name?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">{item.escort.name}</div>
                                        {item.escort.level?.name && (
                                            <div className="text-xs text-muted-foreground">
                                                {item.escort.level.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={item.averageRating} />
                                        <span className="font-bold">{item.averageRating.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm text-green-600">
                                        好评率 {item.goodRate}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 完整排行表格 */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">排名</TableHead>
                            <TableHead>陪诊员</TableHead>
                            <TableHead>等级</TableHead>
                            <TableHead>平均评分</TableHead>
                            <TableHead>评价数</TableHead>
                            <TableHead>好评率</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center">
                                    加载中...
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    暂无符合条件的数据
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.escort.id}>
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            <RankIcon rank={item.rank} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {item.escort.avatar ? (
                                                <img
                                                    src={item.escort.avatar}
                                                    className="h-8 w-8 rounded-full"
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                                                    <span className="text-sm font-bold text-gray-500">
                                                        {item.escort.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                            )}
                                            <span>{item.escort.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.escort.level?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={item.averageRating} />
                                            <span className="font-medium">
                                                {item.averageRating.toFixed(2)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.reviewCount}</TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                item.goodRate >= 90
                                                    ? 'text-green-600'
                                                    : item.goodRate >= 70
                                                        ? 'text-yellow-600'
                                                        : 'text-red-600'
                                            }
                                        >
                                            {item.goodRate}%
                                        </span>
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
        </div>
    )
}
