/**
 * 评价 API
 *
 * 提供评价相关的接口：
 * - 提交评价
 * - 修改评价
 * - 获取订单评价状态
 * - 获取我的评价列表
 * - 获取陪诊员评价列表
 * - 陪诊员回复评价
 */

import { get, post, put } from './request'

// ============================================================================
// 类型定义
// ============================================================================

/** 评价信息 */
export interface Review {
    id: string
    orderId: string
    escortId: string
    userId: string
    rating: number
    content?: string
    tags: string[]
    images: string[]
    replyContent?: string
    replyAt?: string
    status: 'visible' | 'hidden'
    isAnonymous: boolean
    createdAt: string
    updatedAt: string
    // 关联信息
    user?: {
        nickname: string
        avatar?: string
    }
    escort?: {
        id: string
        name: string
        avatar?: string
        level?: { name: string }
    }
    order?: {
        id: string
        orderNo: string
        service?: { name: string }
    }
}

/** 评价统计 */
export interface ReviewStats {
    averageRating: number
    total: number
    distribution: { rating: number; count: number }[]
    goodRatingRate: number
}

/** 分页响应 */
export interface PaginatedReviews {
    items: Review[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

/** 订单评价状态 */
export interface OrderReviewStatus {
    canReview: boolean
    canEdit: boolean
    hasReviewed: boolean
    reviewDeadline?: string
    editDeadline?: string
    review?: Review
}

/** 创建评价请求 */
export interface CreateReviewRequest {
    orderId: string
    escortId: string
    rating: number
    content?: string
    tags?: string[]
    images?: string[]
    isAnonymous?: boolean
}

/** 更新评价请求 */
export interface UpdateReviewRequest {
    rating?: number
    content?: string
    tags?: string[]
    images?: string[]
    isAnonymous?: boolean
}

// ============================================================================
// 评价标签配置
// ============================================================================

/** 好评标签 */
export const POSITIVE_TAGS = [
    '服务专业',
    '准时到达',
    '态度友好',
    '沟通顺畅',
    '细心周到',
    '经验丰富',
    '物超所值',
]

/** 差评标签 */
export const NEGATIVE_TAGS = [
    '迟到',
    '态度差',
    '不专业',
    '沟通困难',
    '效率低',
]

/**
 * 根据评分获取推荐标签
 */
export function getRecommendedTags(rating: number): string[] {
    return rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS
}

// ============================================================================
// 用户端 API
// ============================================================================

/**
 * 提交评价
 */
export function createReview(data: CreateReviewRequest): Promise<Review> {
    return post<Review>('/reviews', data as unknown as Record<string, unknown>)
}

/**
 * 修改评价（7天内可修改）
 */
export function updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
    return put<Review>(`/reviews/${reviewId}`, data as unknown as Record<string, unknown>)
}

/**
 * 获取订单评价状态
 */
export function getOrderReviewStatus(orderId: string): Promise<OrderReviewStatus> {
    return get<OrderReviewStatus>(`/reviews/order/${orderId}`)
}

/**
 * 获取我的评价列表
 */
export function getMyReviews(page = 1, pageSize = 10): Promise<PaginatedReviews> {
    return get<PaginatedReviews>(`/reviews/my?page=${page}&pageSize=${pageSize}`)
}

/**
 * 获取陪诊员评价列表（公开展示）
 */
export function getEscortReviews(
    escortId: string,
    page = 1,
    pageSize = 10,
    rating?: number
): Promise<{ items: Review[]; total: number; stats: ReviewStats }> {
    let url = `/escorts/${escortId}/reviews?page=${page}&pageSize=${pageSize}`
    if (rating) {
        url += `&rating=${rating}`
    }
    return get(url)
}

// ============================================================================
// 陪诊员端 API
// ============================================================================

/**
 * 获取我收到的评价列表（陪诊员）
 */
export function getReceivedReviews(page = 1, pageSize = 10): Promise<PaginatedReviews> {
    return get<PaginatedReviews>(`/escort/reviews?page=${page}&pageSize=${pageSize}`)
}

/**
 * 回复评价（陪诊员）
 */
export function replyToReview(reviewId: string, replyContent: string): Promise<Review> {
    return post<Review>(`/escort/reviews/${reviewId}/reply`, { replyContent })
}

/**
 * 获取我的评价统计（陪诊员）
 */
export function getMyReviewStats(): Promise<ReviewStats> {
    return get<ReviewStats>('/escort/reviews/stats')
}
