/**
 * 评价提交页面
 *
 * 用户完成订单后提交评价
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Textarea, Switch } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import {
    createReview,
    updateReview,
    getOrderReviewStatus,
    getRecommendedTags,
    type CreateReviewRequest,
} from '@/api'
import './index.scss'

// 评分文案
const RATING_TEXTS = ['', '非常差', '较差', '一般', '满意', '非常满意']

function ReviewSubmitPage() {
    const router = useRouter()
    const orderId = router.params?.orderId || ''
    const escortId = router.params?.escortId || ''
    const escortName = decodeURIComponent(router.params?.escortName || '')
    const serviceName = decodeURIComponent(router.params?.serviceName || '')
    const escortAvatar = decodeURIComponent(router.params?.escortAvatar || '')

    const [isLoading, setIsLoading] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)
    const [rating, setRating] = useState(5)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [content, setContent] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 获取推荐标签
    const recommendedTags = getRecommendedTags(rating)

    useEffect(() => {
        loadReviewStatus()
    }, [orderId])

    const loadReviewStatus = async () => {
        if (!orderId) {
            Taro.showToast({ title: '订单ID无效', icon: 'none' })
            setTimeout(() => Taro.navigateBack(), 1500)
            return
        }

        try {
            const status = await getOrderReviewStatus(orderId)

            if (!status.canReview && !status.canEdit) {
                Taro.showToast({ title: '该订单无法评价', icon: 'none' })
                setTimeout(() => Taro.navigateBack(), 1500)
                return
            }

            // 如果已有评价，填充数据（编辑模式）
            if (status.review) {
                setIsEditMode(true)
                setRating(status.review.rating)
                setSelectedTags(status.review.tags || [])
                setContent(status.review.content || '')
                setImages(status.review.images || [])
                setIsAnonymous(status.review.isAnonymous || false)
            }
        } catch (error) {
            console.error('[ReviewSubmit] 获取评价状态失败:', error)
            Taro.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            setIsLoading(false)
        }
    }

    useShareAppMessage(() => ({
        title: '评价服务',
        path: `/packageB/pages/review-submit/index?orderId=${orderId}`,
    }))

    const handleBack = useCallback(() => {
        Taro.navigateBack()
    }, [])

    // 选择评分
    const handleRatingSelect = (value: number) => {
        setRating(value)
        // 切换评分时清空标签选择
        setSelectedTags([])
    }

    // 切换标签
    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )
    }

    // 上传图片
    const handleChooseImage = async () => {
        if (images.length >= 6) {
            Taro.showToast({ title: '最多上传6张图片', icon: 'none' })
            return
        }

        try {
            const res = await Taro.chooseImage({
                count: 6 - images.length,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
            })

            // TODO: 上传到服务器，这里先使用本地路径
            const newImages = [...images, ...res.tempFilePaths]
            setImages(newImages.slice(0, 6))
        } catch (error) {
            console.log('[ReviewSubmit] 选择图片取消或失败')
        }
    }

    // 删除图片
    const handleDeleteImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    // 提交评价
    const handleSubmit = async () => {
        if (rating === 0) {
            Taro.showToast({ title: '请选择评分', icon: 'none' })
            return
        }

        setIsSubmitting(true)

        try {
            if (isEditMode) {
                // 编辑模式：修改评价
                await updateReview(orderId, {
                    rating,
                    content: content.trim() || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                    images: images.length > 0 ? images : undefined,
                    isAnonymous,
                })
                Taro.showToast({ title: '修改成功', icon: 'success' })
            } else {
                // 新建模式：提交评价
                const data: CreateReviewRequest = {
                    orderId,
                    escortId,
                    rating,
                    content: content.trim() || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                    images: images.length > 0 ? images : undefined,
                    isAnonymous,
                }
                await createReview(data)
                Taro.showToast({ title: '评价成功', icon: 'success' })
            }

            setTimeout(() => {
                Taro.navigateBack()
            }, 1500)
        } catch (error: any) {
            console.error('[ReviewSubmit] 提交评价失败:', error)
            Taro.showToast({ title: error?.message || '提交失败', icon: 'none' })
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
                <Text className='title'>评价服务</Text>
            </View>

            {/* 订单信息 */}
            <View className='order-card'>
                <View className='order-info'>
                    <Image
                        className='escort-avatar'
                        src={escortAvatar || '/images/default-avatar.png'}
                        mode='aspectFill'
                    />
                    <View className='order-detail'>
                        <Text className='service-name'>{serviceName || '陪诊服务'}</Text>
                        <Text className='escort-name'>陪诊员：{escortName || '未知'}</Text>
                    </View>
                </View>
            </View>

            {/* 评分 */}
            <View className='rating-section'>
                <Text className='section-title'>服务评分</Text>
                <View className='rating-stars'>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <Text
                            key={value}
                            className={`star ${value <= rating ? 'active' : ''}`}
                            onClick={() => handleRatingSelect(value)}
                        >
                            ★
                        </Text>
                    ))}
                </View>
                <Text className='rating-text'>{RATING_TEXTS[rating]}</Text>
            </View>

            {/* 标签选择 */}
            <View className='tags-section'>
                <Text className='section-title'>选择标签</Text>
                <View className='tags-list'>
                    {recommendedTags.map((tag) => (
                        <Text
                            key={tag}
                            className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </Text>
                    ))}
                </View>
            </View>

            {/* 评价内容 */}
            <View className='content-section'>
                <Text className='section-title'>写点什么吧</Text>
                <Textarea
                    className='content-input'
                    value={content}
                    onInput={(e) => setContent(e.detail.value)}
                    placeholder='分享您的服务体验，帮助其他用户了解陪诊员...'
                    maxlength={500}
                />
                <Text className='char-count'>{content.length}/500</Text>
            </View>

            {/* 图片上传 */}
            <View className='images-section'>
                <Text className='section-title'>添加图片（最多6张）</Text>
                <View className='images-list'>
                    {images.map((image, index) => (
                        <View key={index} className='image-item'>
                            <Image className='preview-image' src={image} mode='aspectFill' />
                            <View className='delete-btn' onClick={() => handleDeleteImage(index)}>
                                ×
                            </View>
                        </View>
                    ))}
                    {images.length < 6 && (
                        <View className='add-image' onClick={handleChooseImage}>
                            <Text className='add-icon'>+</Text>
                            <Text className='add-text'>添加</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 匿名选项 */}
            <View className='anonymous-section'>
                <Text className='label'>匿名评价</Text>
                <Switch
                    className='switch'
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.detail.value)}
                    color='#10b981'
                />
            </View>

            {/* 提交按钮 */}
            <View className='submit-section'>
                <View
                    className={`submit-btn ${isSubmitting ? 'disabled' : ''}`}
                    onClick={!isSubmitting ? handleSubmit : undefined}
                >
                    <Text>{isSubmitting ? '提交中...' : isEditMode ? '修改评价' : '提交评价'}</Text>
                </View>
            </View>
        </View>
    )
}

export default ReviewSubmitPage
