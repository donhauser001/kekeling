/**
 * 我的评价页面
 *
 * 显示用户发表的所有评价
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useShareAppMessage, useReachBottom } from '@tarojs/taro'
import { getMyReviews, type Review, type PaginatedReviews } from '@/api'
import './index.scss'

function MyReviewsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async (pageNum = 1) => {
        if (pageNum > 1) {
            setIsLoadingMore(true)
        }

        try {
            const result: PaginatedReviews = await getMyReviews(pageNum, 10)

            if (pageNum === 1) {
                setReviews(result.items)
            } else {
                setReviews((prev) => [...prev, ...result.items])
            }

            setPage(pageNum)
            setHasMore(result.items.length === 10 && pageNum < result.totalPages)
        } catch (error) {
            console.error('[MyReviews] 加载评价失败:', error)
            Taro.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }

    useReachBottom(() => {
        if (hasMore && !isLoadingMore) {
            loadReviews(page + 1)
        }
    })

    useShareAppMessage(() => ({
        title: '我的评价',
        path: '/packageB/pages/my-reviews/index',
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
                <Text className='title'>我的评价</Text>
            </View>

            {reviews.length === 0 ? (
                <View className='empty-state'>
                    <Text className='empty-icon'>📝</Text>
                    <Text className='empty-text'>暂无评价记录</Text>
                </View>
            ) : (
                <ScrollView scrollY className='reviews-list'>
                    {reviews.map((review) => (
                        <View key={review.id} className='review-card'>
                            {/* 头部信息 */}
                            <View className='review-header'>
                                <Image
                                    className='escort-avatar'
                                    src={review.escort?.avatar || '/images/default-avatar.png'}
                                    mode='aspectFill'
                                />
                                <View className='escort-info'>
                                    <Text className='escort-name'>{review.escort?.name || '陪诊员'}</Text>
                                    <Text className='service-name'>{review.order?.service?.name || '陪诊服务'}</Text>
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
                                        <Text key={index} className='tag'>{tag}</Text>
                                    ))}
                                </View>
                            )}

                            {/* 内容 */}
                            {review.content && (
                                <Text className='review-content'>{review.content}</Text>
                            )}

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

                            {/* 陪诊员回复 */}
                            {review.replyContent && (
                                <View className='escort-reply'>
                                    <View className='reply-header'>
                                        <Text className='reply-label'>陪诊员回复</Text>
                                        {review.replyAt && (
                                            <Text className='reply-time'>{formatTime(review.replyAt)}</Text>
                                        )}
                                    </View>
                                    <Text className='reply-content'>{review.replyContent}</Text>
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
        </View>
    )
}

export default MyReviewsPage
