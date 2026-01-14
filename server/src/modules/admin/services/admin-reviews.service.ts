import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

export interface HideReviewDto {
    reason: string
}

export interface ReviewQueryDto {
    status?: 'all' | 'visible' | 'hidden'
    escortId?: string
    userId?: string
    rating?: number
    minRating?: number
    maxRating?: number
    hasContent?: boolean
    hasReply?: boolean
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
}

export interface RankingQueryDto {
    period?: 'week' | 'month' | 'quarter' | 'year' | 'all'
    minReviewCount?: number
    page?: number
    pageSize?: number
}

@Injectable()
export class AdminReviewsService {
    constructor(private prisma: PrismaService) { }

    /**
     * 获取评价列表
     */
    async findAll(params: ReviewQueryDto) {
        const {
            status,
            escortId,
            userId,
            rating,
            minRating,
            maxRating,
            hasContent,
            hasReply,
            startDate,
            endDate,
            page = 1,
            pageSize = 10,
        } = params
        const skip = (page - 1) * pageSize

        const where: any = {}

        // 状态筛选
        if (status && status !== 'all') {
            where.status = status
        }

        // 陪诊员筛选
        if (escortId) {
            where.escortId = escortId
        }

        // 用户筛选
        if (userId) {
            where.userId = userId
        }

        // 评分筛选
        if (rating) {
            where.rating = Number(rating)
        } else {
            if (minRating) {
                where.rating = { ...where.rating, gte: Number(minRating) }
            }
            if (maxRating) {
                where.rating = { ...where.rating, lte: Number(maxRating) }
            }
        }

        // 是否有文字内容
        if (hasContent !== undefined) {
            const hasContentBool = hasContent === true || String(hasContent) === 'true'
            if (hasContentBool) {
                where.content = { not: null }
            } else {
                where.content = null
            }
        }

        // 是否有回复
        if (hasReply !== undefined) {
            const hasReplyBool = hasReply === true || String(hasReply) === 'true'
            if (hasReplyBool) {
                where.replyContent = { not: null }
            } else {
                where.replyContent = null
            }
        }

        // 日期范围
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
        }

        const [items, total] = await Promise.all([
            this.prisma.escortReview.findMany({
                where,
                include: {
                    escort: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            avatar: true,
                            rating: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                            avatar: true,
                            phone: true,
                        },
                    },
                    order: {
                        select: {
                            id: true,
                            orderNo: true,
                            status: true,
                            totalAmount: true,
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            hospital: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.escortReview.count({ where }),
        ])

        return {
            items: items.map((item) => this.formatReview(item)),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        }
    }

    /**
     * 获取评价统计
     */
    async getStats(escortId?: string, startDate?: string, endDate?: string) {
        const where: any = { status: 'visible' }

        if (escortId) {
            where.escortId = escortId
        }

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
        }

        // 基础统计
        const [total, totalHidden, withContent, withReply, reviews] = await Promise.all([
            this.prisma.escortReview.count({ where }),
            this.prisma.escortReview.count({ where: { ...where, status: 'hidden' } }),
            this.prisma.escortReview.count({ where: { ...where, content: { not: null } } }),
            this.prisma.escortReview.count({ where: { ...where, replyContent: { not: null } } }),
            this.prisma.escortReview.findMany({
                where,
                select: { rating: true, tags: true },
            }),
        ])

        // 计算平均分
        const averageRating =
            reviews.length > 0
                ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
                : 0

        // 计算好评率 (4-5星)
        const goodCount = reviews.filter((r) => r.rating >= 4).length
        const goodRate = reviews.length > 0 ? Math.round((goodCount / reviews.length) * 1000) / 10 : 0

        // 评分分布
        const distribution = [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: reviews.filter((r) => r.rating === rating).length,
            percentage:
                reviews.length > 0
                    ? Math.round((reviews.filter((r) => r.rating === rating).length / reviews.length) * 1000) / 10
                    : 0,
        }))

        // 标签统计
        const tagCounts: Record<string, number> = {}
        reviews.forEach((r) => {
            r.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
        })
        const tagStats = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        // 计算回复率和内容率
        const replyRate = total > 0 ? Math.round((withReply / total) * 1000) / 10 : 0
        const contentRate = total > 0 ? Math.round((withContent / total) * 1000) / 10 : 0

        return {
            total,
            totalHidden,
            averageRating,
            goodRate,
            replyRate,
            contentRate,
            distribution,
            tagStats,
        }
    }

    /**
     * 获取评价详情
     */
    async findById(id: string) {
        const review = await this.prisma.escortReview.findUnique({
            where: { id },
            include: {
                escort: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                        rating: true,
                        ratingCount: true,
                        levelCode: true,
                        level: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        avatar: true,
                        phone: true,
                    },
                },
                order: {
                    select: {
                        id: true,
                        orderNo: true,
                        status: true,
                        totalAmount: true,
                        paidAmount: true,
                        appointmentDate: true,
                        appointmentTime: true,
                        createdAt: true,
                        completedAt: true,
                        service: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                        hospital: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        })

        if (!review) {
            throw new NotFoundException('评价不存在')
        }

        // 获取用户历史评价统计
        const userReviewStats = await this.prisma.escortReview.aggregate({
            where: { userId: review.userId, status: 'visible' },
            _count: true,
            _avg: { rating: true },
        })

        return {
            ...this.formatReview(review),
            userReviewStats: {
                totalCount: userReviewStats._count,
                averageRating: userReviewStats._avg.rating
                    ? Math.round(userReviewStats._avg.rating * 10) / 10
                    : 0,
            },
        }
    }

    /**
     * 隐藏评价
     */
    async hideReview(id: string, dto: HideReviewDto, adminId: string) {
        const review = await this.prisma.escortReview.findUnique({ where: { id } })
        if (!review) {
            throw new NotFoundException('评价不存在')
        }

        const updated = await this.prisma.escortReview.update({
            where: { id },
            data: {
                status: 'hidden',
                hideReason: dto.reason,
                hiddenBy: adminId,
                hiddenAt: new Date(),
            },
        })

        // 更新陪诊员评分
        await this.updateEscortRating(review.escortId)

        return updated
    }

    /**
     * 显示评价
     */
    async showReview(id: string) {
        const review = await this.prisma.escortReview.findUnique({ where: { id } })
        if (!review) {
            throw new NotFoundException('评价不存在')
        }

        const updated = await this.prisma.escortReview.update({
            where: { id },
            data: {
                status: 'visible',
                hideReason: null,
                hiddenBy: null,
                hiddenAt: null,
            },
        })

        // 更新陪诊员评分
        await this.updateEscortRating(review.escortId)

        return updated
    }

    /**
     * 获取陪诊员评分排行榜
     */
    async getRanking(params: RankingQueryDto) {
        const { period = 'all', minReviewCount = 5, page = 1, pageSize = 20 } = params
        const skip = (page - 1) * pageSize

        // 计算日期范围
        let startDate: Date | undefined
        const now = new Date()
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
                break
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
                break
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                break
        }

        // 构建查询条件
        const reviewWhere: any = { status: 'visible' }
        if (startDate) {
            reviewWhere.createdAt = { gte: startDate }
        }

        // 获取所有评价并按陪诊员分组计算
        const reviews = await this.prisma.escortReview.findMany({
            where: reviewWhere,
            select: {
                escortId: true,
                rating: true,
            },
        })

        // 按陪诊员统计
        const escortStats: Record<
            string,
            { totalRating: number; count: number; goodCount: number }
        > = {}
        reviews.forEach((r) => {
            if (!escortStats[r.escortId]) {
                escortStats[r.escortId] = { totalRating: 0, count: 0, goodCount: 0 }
            }
            escortStats[r.escortId].totalRating += r.rating
            escortStats[r.escortId].count++
            if (r.rating >= 4) {
                escortStats[r.escortId].goodCount++
            }
        })

        // 筛选符合最低评价数的陪诊员
        const qualifiedEscortIds = Object.entries(escortStats)
            .filter(([_, stats]) => stats.count >= minReviewCount)
            .sort(
                (a, b) =>
                    b[1].totalRating / b[1].count - a[1].totalRating / a[1].count,
            )

        const total = qualifiedEscortIds.length
        const paginatedIds = qualifiedEscortIds.slice(skip, skip + pageSize)

        // 获取陪诊员信息
        const escorts = await this.prisma.escort.findMany({
            where: { id: { in: paginatedIds.map(([id]) => id) } },
            select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
                levelCode: true,
                level: {
                    select: { name: true },
                },
            },
        })

        const escortMap = new Map(escorts.map((e) => [e.id, e]))

        const items = paginatedIds.map(([escortId, stats], index) => {
            const escort = escortMap.get(escortId)
            return {
                rank: skip + index + 1,
                escort: escort || { id: escortId, name: '未知陪诊员' },
                averageRating: Math.round((stats.totalRating / stats.count) * 100) / 100,
                reviewCount: stats.count,
                goodRate: Math.round((stats.goodCount / stats.count) * 1000) / 10,
            }
        })

        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            period,
        }
    }

    /**
     * 更新陪诊员评分
     */
    private async updateEscortRating(escortId: string) {
        const reviews = await this.prisma.escortReview.findMany({
            where: { escortId, status: 'visible' },
            select: { rating: true },
        })

        const count = reviews.length
        const avgRating =
            count > 0
                ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
                : 5.0

        await this.prisma.escort.update({
            where: { id: escortId },
            data: {
                rating: avgRating,
                ratingCount: count,
            },
        })
    }

    /**
     * 格式化评价数据
     */
    private formatReview(review: any) {
        return {
            ...review,
            statusLabel: this.getStatusLabel(review.status),
            ratingLabel: this.getRatingLabel(review.rating),
        }
    }

    /**
     * 获取状态标签
     */
    private getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            visible: '可见',
            hidden: '已隐藏',
        }
        return labels[status] || status
    }

    /**
     * 获取评分标签
     */
    private getRatingLabel(rating: number): string {
        const labels: Record<number, string> = {
            5: '非常满意',
            4: '满意',
            3: '一般',
            2: '不满意',
            1: '非常不满意',
        }
        return labels[rating] || `${rating}星`
    }
}
