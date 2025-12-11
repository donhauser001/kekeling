import { View, Text, Image, Textarea, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { ordersApi } from '@/services/api'
import { getResourceUrl } from '@/services/request'
import './review.scss'

// 预设评价标签
const REVIEW_TAGS = ['服务专业', '准时守约', '耐心细致', '沟通顺畅', '热情友好', '经验丰富']

interface OrderInfo {
  id: string
  orderNo: string
  escort: {
    id: string
    name: string
    avatar: string | null
    level: { name: string } | null
  } | null
  service: {
    id: string
    name: string
  } | null
}

export default function OrderReview() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载订单信息
  const loadOrder = async () => {
    const { id } = router.params
    if (!id) {
      setError('缺少订单 ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // 检查是否已评价
      const reviewStatus = await ordersApi.checkReviewed(id)
      if (reviewStatus.reviewed) {
        Taro.showToast({ title: '该订单已评价', icon: 'none' })
        setTimeout(() => Taro.navigateBack(), 1500)
        return
      }
      // 获取订单详情
      const data = await ordersApi.getDetail(id)
      setOrder(data)
      setError(null)
    } catch (err) {
      console.error('加载订单失败:', err)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [router.params.id])

  // 选择星级
  const handleRating = (star: number) => {
    setRating(star)
  }

  // 切换标签
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // 提交评价
  const handleSubmit = async () => {
    if (!order) return

    if (rating < 1 || rating > 5) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      await ordersApi.review(order.id, {
        rating,
        content: content.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isAnonymous,
      })

      Taro.showToast({ title: '评价成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('提交评价失败:', err)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // 渲染骨架屏
  const renderSkeleton = () => (
    <View className='review-page'>
      <View className='escort-card card'>
        <View className='skeleton-avatar' />
        <View className='skeleton-info'>
          <View className='skeleton-text' style={{ width: '80px', height: '24px' }} />
          <View className='skeleton-text' style={{ width: '120px', height: '20px', marginTop: '8px' }} />
        </View>
      </View>
    </View>
  )

  // 渲染错误状态
  const renderError = () => (
    <View className='error-container'>
      <Icon name='alert-circle' size={48} color='#ff4d4f' />
      <Text className='error-text'>{error}</Text>
      <Button className='retry-btn' onClick={loadOrder}>重试</Button>
    </View>
  )

  if (loading) return renderSkeleton()
  if (error || !order) return renderError()

  return (
    <View className='review-page'>
      {/* 陪诊员信息 */}
      {order.escort && (
        <View className='escort-card card'>
          <View className='escort-avatar'>
            {order.escort.avatar ? (
              <Image src={getResourceUrl(order.escort.avatar)} mode='aspectFill' />
            ) : (
              <View className='avatar-placeholder'>
                <Icon name='user-check' size={28} color='#52c41a' />
              </View>
            )}
          </View>
          <View className='escort-info'>
            <Text className='escort-name'>{order.escort.name}</Text>
            <Text className='service-name'>{order.service?.name || '陪诊服务'}</Text>
          </View>
        </View>
      )}

      {/* 评分 */}
      <View className='rating-section card'>
        <Text className='section-title'>服务评分</Text>
        <View className='rating-stars'>
          {[1, 2, 3, 4, 5].map(star => (
            <View key={star} className='star-item' onClick={() => handleRating(star)}>
              <Icon
                name='star-filled'
                size={36}
                color={star <= rating ? '#faad14' : '#e8e8e8'}
              />
            </View>
          ))}
        </View>
        <Text className='rating-text'>
          {rating === 5 && '非常满意'}
          {rating === 4 && '比较满意'}
          {rating === 3 && '一般'}
          {rating === 2 && '不太满意'}
          {rating === 1 && '非常不满意'}
        </Text>
      </View>

      {/* 标签选择 */}
      <View className='tags-section card'>
        <Text className='section-title'>标签评价（可多选）</Text>
        <View className='tags-list'>
          {REVIEW_TAGS.map(tag => (
            <View
              key={tag}
              className={`tag-item ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 文字评价 */}
      <View className='content-section card'>
        <Text className='section-title'>详细评价（选填）</Text>
        <Textarea
          className='content-input'
          placeholder='请分享您的服务体验，帮助其他用户更好地选择...'
          value={content}
          onInput={e => setContent(e.detail.value)}
          maxlength={500}
        />
        <Text className='char-count'>{content.length}/500</Text>
      </View>

      {/* 匿名评价 */}
      <View className='anonymous-section'>
        <View
          className={`anonymous-checkbox ${isAnonymous ? 'checked' : ''}`}
          onClick={() => setIsAnonymous(!isAnonymous)}
        >
          {isAnonymous && <Icon name='check' size={14} color='#fff' />}
        </View>
        <Text className='anonymous-text'>匿名评价</Text>
      </View>

      {/* 提交按钮 */}
      <View className='submit-section'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          disabled={submitting}
          loading={submitting}
        >
          {submitting ? '提交中...' : '提交评价'}
        </Button>
      </View>
    </View>
  )
}
