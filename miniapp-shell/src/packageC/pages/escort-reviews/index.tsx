/**
 * 陪诊员收到的评价页面
 *
 * 陪诊员查看收到的评价并进行回复
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useShareAppMessage, useReachBottom } from '@tarojs/taro'
import {
    getReceivedReviews,
    replyToReview,
    getMyReviewStats,
    type Review,
    type ReviewStats,
    type PaginatedReviews,
} from '@/api'
import './index.scss'

// 差评标签列表
const NEGATIVE_TAGS = ['迟到', '态度差', '不专业', '沟通困难', '效率低']

function EscortReviewsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    // 回复弹窗状态
    const [showReplyModal, setShowReplyModal] = useState(false)
    const [replyingReview, setReplyingReview] = useState<Review | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [statsData, reviewsData] = await Promise.all([
                getMyReviewStats(),
                getReceivedReviews(1, 10),
            ])

            setStats(statsData)
            setReviews(reviewsData.items)
            setHasMore(reviewsData.items.length === 10 && reviewsData.page < reviewsData.totalPages)
        } catch (error) {
            console.error('[EscortReviews] 加载数据失败:', error)
            Taro.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreReviews = async () => {
        if (isLoadingMore || !hasMore) return

        setIsLoadingMore(true)

        try {
            const nextPage = page + 1
            const result: PaginatedReviews = await getReceivedReviews(nextPage, 10)

            setReviews((prev) => [...prev, ...result.items])
            setPage(nextPage)
            setHasMore(result.items.length === 10 && nextPage < result.totalPages)
        } catch (error) {
            console.error('[EscortReviews] 加载更多失败:', error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    useReachBottom(() => {
        loadMoreReviews()
    })

    useShareAppMessage(() => ({
        title: '收到的评价',
        path: '/packageC/pages/escort-reviews/index',
    }))

    const handleBack = useCallback(() => {
        Taro.navigateBack()
    }, [])

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return '今天'
        if (days === 1) return '昨天'
        if (days < 7) return `${days}天前`
        if (days < 30) return `${Math.floor(days / 7)}周前`
        return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    // 打开回复弹窗
    const handleOpenReply = (review: Review) => {
        setReplyingReview(review)
        setReplyContent('')
        setShowReplyModal(true)
    }

    // 关闭回复弹窗
    const handleCloseReply = () => {
        setShowReplyModal(false)
        setReplyingReview(null)
        setReplyContent('')
    }

    // 提交回复
    const handleSubmitReply = async () => {
        if (!replyingReview || !replyContent.trim() || isSubmitting) return

        setIsSubmitting(true)

        try {
            const updatedReview = await replyToReview(replyingReview.id, replyContent.trim())

            // 更新列表中的评价
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === replyingReview.id
                        ? { ...r, replyContent: updatedReview.replyContent, replyAt: updatedReview.replyAt }
                        : r
                )
            )

            Taro.showToast({ title: '回复成功', icon: 'success' })
            handleCloseReply()
        } catch (error: any) {
            console.error('[EscortReviews] 回复失败:', error)
            Taro.showToast({ title: error?.message || '回复失败', icon: 'none' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <View className='page-loading'>
                <View className='loading-spinner' />
            </View>
        )
    }

    return (
        <View className='page-container'>
            {/* 导航栏 */}
            <View className='nav-bar'>
                <View className='back-btn' onClick={handleBack}>
                    <Text>←</Text>
                </View>
                <Text className='title'>收到的评价</Text>
            </View>

            {/* 统计卡片 */}
            {stats && (
                <View className='stats-card'>
                    <View className='stats-header'>
                        <View className='rating-big'>
                            <Text className='rating-value'>{stats.averageRating.toFixed(1)}</Text>
                            <Text className='rating-unit'>分</Text>
                        </View>
                        <Text className='review-count'>共 {stats.total} 条评价</Text>
                    </View>
                    <View className='stats-row'>
                        <View className='stat-item'>
                            <Text className='stat-value'>{stats.goodRatingRate.toFixed(0)}%</Text>
                            <Text className='stat-label'>好评率</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* 评价列表 */}
            {reviews.length === 0 ? (
                <View className='empty-state'>
                    <Text className='empty-icon'>⭐</Text>
                    <Text className='empty-text'>暂无收到的评价</Text>
                </View>
            ) : (
                <ScrollView scrollY className='reviews-list'>
                    {reviews.map((review) => (
                        <View key={review.id} className='review-card'>
                            {/* 头部信息 */}
                            <View className='review-header'>
                                <Image
                                    className='user-avatar'
                                    src={
                                        review.isAnonymous
                                            ? '/images/anonymous-avatar.png'
                                            : review.user?.avatar || '/images/default-avatar.png'
                                    }
                                    mode='aspectFill'
                                />
                                <View className='user-info'>
                                    <Text className='user-name'>
                                        {review.isAnonymous ? '匿名用户' : review.user?.nickname || '用户'}
                                    </Text>
                                    <Text className='service-name'>
                                        {review.order?.service?.name || '陪诊服务'}
                                    </Text>
                                </View>
                                <Text className='review-time'>{formatTime(review.createdAt)}</Text>
                            </View>

                            {/* 评分 */}
                            <View className='review-rating'>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Text
                                        key={value}
                                        className={`star ${value <= review.rating ? 'active' : ''}`}
                                    >
                                        ★
                                    </Text>
                                ))}
                                <Text className='rating-text'>{review.rating}分</Text>
                            </View>

                            {/* 标签 */}
                            {review.tags && review.tags.length > 0 && (
                                <View className='review-tags'>
                                    {review.tags.map((tag, index) => (
                                        <Text
                                            key={index}
                                            className={`tag ${NEGATIVE_TAGS.includes(tag) ? 'negative' : ''}`}
                                        >
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            {/* 内容 */}
                            {review.content && <Text className='review-content'>{review.content}</Text>}

                            {/* 图片 */}
                            {review.images && review.images.length > 0 && (
                                <View className='review-images'>
                                    {review.images.map((image, index) => (
                                        <Image
                                            key={index}
                                            className='review-image'
                                            src={image}
                                            mode='aspectFill'
                                            onClick={() => {
                                                Taro.previewImage({
                                                    current: image,
                                                    urls: review.images,
                                                })
                                            }}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* 我的回复 */}
                            {review.replyContent ? (
                                <View className='my-reply'>
                                    <View className='reply-header'>
                                        <Text className='reply-label'>我的回复</Text>
                                        {review.replyAt && (
                                            <Text className='reply-time'>{formatTime(review.replyAt)}</Text>
                                        )}
                                    </View>
                                    <Text className='reply-content'>{review.replyContent}</Text>
                                </View>
                            ) : (
                                <View className='reply-action'>
                                    <View className='reply-btn' onClick={() => handleOpenReply(review)}>
                                        <Text>💬</Text>
                                        <Text>回复评价</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* 加载更多 */}
                    <View className='load-more'>
                        {isLoadingMore ? (
                            <View className='loading-more-spinner' />
                        ) : hasMore ? (
                            <Text className='load-more-text'>上拉加载更多</Text>
                        ) : reviews.length > 0 ? (
                            <Text className='load-more-text'>已加载全部评价</Text>
                        ) : null}
                    </View>
                </ScrollView>
            )}

            {/* 回复弹窗 */}
            {showReplyModal && (
                <View className='reply-modal'>
                    <View className='modal-mask' onClick={handleCloseReply} />
                    <View className='modal-content'>
                        <View className='modal-header'>
                            <Text className='modal-title'>回复评价</Text>
                            <Text className='close-btn' onClick={handleCloseReply}>
                                ×
                            </Text>
                        </View>
                        <Textarea
                            className='reply-input'
                            value={replyContent}
                            onInput={(e) => setReplyContent(e.detail.value)}
                            placeholder='感谢您的评价，您的支持是我最大的动力...'
                            maxlength={200}
                            autoFocus
                        />
                        <Text className='char-count'>{replyContent.length}/200</Text>
                        <View
                            className={`submit-btn ${!replyContent.trim() || isSubmitting ? 'disabled' : ''}`}
                            onClick={handleSubmitReply}
                        >
                            <Text>{isSubmitting ? '提交中...' : '提交回复'}</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

export default EscortReviewsPage
