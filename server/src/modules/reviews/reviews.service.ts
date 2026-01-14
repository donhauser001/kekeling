import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    // 评价时限：订单完成后 30 天内
    private readonly REVIEW_DEADLINE_DAYS = 30
    // 修改时限：提交后 7 天内可修改一次
    private readonly EDIT_DEADLINE_DAYS = 7

    /**
     * 提交评价
     */
    async createReview(userId: string, dto: CreateReviewDto) {
        // 1. 验证订单存在且属于该用户
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { escortReview: true },
        })

        if (!order) {
            throw new NotFoundException('订单不存在')
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('无权评价此订单')
        }

        // 2. 验证订单状态必须是已完成
        if (order.status !== 'completed') {
            throw new BadRequestException('订单未完成，无法评价')
        }

        // 3. 验证是否已评价
        if (order.escortReview) {
            throw new BadRequestException('该订单已评价')
        }

        // 4. 验证是否在评价时限内
        if (order.completedAt) {
            const deadlineDate = new Date(order.completedAt)
            deadlineDate.setDate(deadlineDate.getDate() + this.REVIEW_DEADLINE_DAYS)
            if (new Date() > deadlineDate) {
                throw new BadRequestException(
                    `评价时限已过，订单完成后 ${this.REVIEW_DEADLINE_DAYS} 天内可评价`
                )
            }
        }

        // 5. 验证陪诊员存在
        if (!order.escortId) {
            throw new BadRequestException('订单无陪诊员信息')
        }

        // 6. 创建评价
        const review = await this.prisma.escortReview.create({
            data: {
                orderId: dto.orderId,
                escortId: order.escortId,
                userId,
                rating: dto.rating,
                content: dto.content,
                tags: dto.tags || [],
                images: dto.images || [],
                isAnonymous: dto.isAnonymous || false,
                status: 'visible',
            },
        })

        // 7. 更新陪诊员评分
        await this.updateEscortRating(order.escortId)

        return review
    }

    /**
     * 获取订单评价状态
     */
    async getOrderReviewStatus(userId: string, orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                escortReview: {
                    select: {
                        id: true,
                        rating: true,
                        content: true,
                        tags: true,
                        images: true,
                        replyContent: true,
                        replyAt: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        })

        if (!order) {
            throw new NotFoundException('订单不存在')
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('无权查看此订单')
        }

        // 计算评价截止时间
        let reviewDeadline: Date | null = null
        let canReview = false
        let canEdit = false

        if (order.status === 'completed' && order.completedAt) {
            reviewDeadline = new Date(order.completedAt)
            reviewDeadline.setDate(reviewDeadline.getDate() + this.REVIEW_DEADLINE_DAYS)
            canReview = !order.escortReview && new Date() <= reviewDeadline

            // 是否可以修改（7天内）
            if (order.escortReview) {
                const editDeadline = new Date(order.escortReview.createdAt)
                editDeadline.setDate(editDeadline.getDate() + this.EDIT_DEADLINE_DAYS)
                canEdit = new Date() <= editDeadline
            }
        }

        return {
            hasReviewed: !!order.escortReview,
            review: order.escortReview,
            canReview,
            canEdit,
            reviewDeadline: reviewDeadline?.toISOString(),
            orderStatus: order.status,
        }
    }

    /**
     * 修改评价
     */
    async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
        const review = await this.prisma.escortReview.findUnique({
            where: { id: reviewId },
        })

        if (!review) {
            throw new NotFoundException('评价不存在')
        }

        if (review.userId !== userId) {
            throw new ForbiddenException('无权修改此评价')
        }

        // 验证是否在修改时限内
        const editDeadline = new Date(review.createdAt)
        editDeadline.setDate(editDeadline.getDate() + this.EDIT_DEADLINE_DAYS)
        if (new Date() > editDeadline) {
            throw new BadRequestException(
                `修改时限已过，评价提交后 ${this.EDIT_DEADLINE_DAYS} 天内可修改`
            )
        }

        // 更新评价
        const updated = await this.prisma.escortReview.update({
            where: { id: reviewId },
            data: {
                rating: dto.rating,
                content: dto.content,
                tags: dto.tags,
                images: dto.images,
            },
        })

        // 更新陪诊员评分
        await this.updateEscortRating(review.escortId)

        return updated
    }

    /**
     * 我的评价列表
     */
    async getMyReviews(userId: string, params: { page?: number; pageSize?: number }) {
        const { page = 1, pageSize = 10 } = params
        const skip = (page - 1) * pageSize

        const [items, total] = await Promise.all([
            this.prisma.escortReview.findMany({
                where: { userId },
                include: {
                    escort: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    order: {
                        select: {
                            id: true,
                            orderNo: true,
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
                            appointmentDate: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.escortReview.count({ where: { userId } }),
        ])

        // 计算每条评价是否可修改
        const itemsWithCanEdit = items.map((item) => {
            const editDeadline = new Date(item.createdAt)
            editDeadline.setDate(editDeadline.getDate() + this.EDIT_DEADLINE_DAYS)
            return {
                ...item,
                canEdit: new Date() <= editDeadline,
            }
        })

        return {
            items: itemsWithCanEdit,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
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
}
