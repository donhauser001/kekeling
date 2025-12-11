import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import { escortsApi } from '@/services/api'
import { getResourceUrl } from '@/services/request'
import './detail.scss'

// 陪诊员详情数据类型
interface EscortDetail {
  id: string
  name: string
  avatar: string | null
  gender: string
  level: {
    code: string
    name: string
    badge: string | null
    description: string | null
  } | null
  experience: number | null
  introduction: string | null
  tags: string[]
  certificates: string[]
  rating: number
  orderCount: number
  ratingCount: number
  workStatus: string
  hospitals: Array<{
    id: string
    name: string
    address: string | null
    familiarDepts: string[]
    isPrimary: boolean
  }>
  recentReviews: Array<{
    id: string
    rating: number
    content: string | null
    tags: string[]
    isAnonymous: boolean
    createdAt: string
  }>
}

export default function EscortDetail() {
  const router = useRouter()
  const [escort, setEscort] = useState<EscortDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载详情数据
  const loadData = async () => {
    const { id } = router.params
    if (!id) {
      setError('缺少陪诊员 ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await escortsApi.getDetail(id)
      setEscort(data)
      setError(null)
    } catch (err) {
      console.error('加载陪诊员详情失败:', err)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [router.params.id])

  // 预约
  const handleBook = () => {
    if (!escort) return
    Taro.navigateTo({
      url: `/pages/booking/index?escortId=${escort.id}&escortName=${encodeURIComponent(escort.name)}`
    })
  }

  // 咨询（拨打平台客服）
  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: '400-123-4567' })
  }

  // 查看全部评价
  const handleViewAllReviews = () => {
    if (!escort) return
    Taro.navigateTo({ url: `/pages/escort/reviews?id=${escort.id}` })
  }

  // 格式化经验年限
  const formatExperience = (exp: number | null) => {
    if (!exp) return '新手'
    if (exp >= 12) return `${Math.floor(exp / 12)}年`
    return `${exp}个月`
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // 渲染骨架屏
  const renderSkeleton = () => (
    <View className='detail-page'>
      <View className='header-section skeleton-header'>
        <View className='skeleton-avatar-large' />
        <View className='skeleton-basic'>
          <View className='skeleton-text' style={{ width: '120px', height: '28px' }} />
          <View className='skeleton-text' style={{ width: '200px', height: '20px', marginTop: '16px' }} />
        </View>
      </View>
      <View className='section card'>
        <View className='skeleton-text' style={{ width: '80px', height: '24px' }} />
        <View className='skeleton-text' style={{ width: '100%', height: '16px', marginTop: '16px' }} />
        <View className='skeleton-text' style={{ width: '90%', height: '16px', marginTop: '8px' }} />
        <View className='skeleton-text' style={{ width: '70%', height: '16px', marginTop: '8px' }} />
      </View>
    </View>
  )

  // 渲染错误状态
  const renderError = () => (
    <View className='error-container'>
      <Icon name='alert-circle' size={48} color='#ff4d4f' />
      <Text className='error-text'>{error}</Text>
      <Button className='retry-btn' onClick={loadData}>重试</Button>
    </View>
  )

  if (loading) return renderSkeleton()
  if (error || !escort) return renderError()

  return (
    <View className='detail-page'>
      {/* 头部信息 */}
      <View className='header-section'>
        <View className='escort-avatar-large'>
          {escort.avatar ? (
            <Image src={getResourceUrl(escort.avatar)} mode='aspectFill' />
          ) : (
            <View className='avatar-placeholder'>
              <Icon name='user-check' size={48} color='#52c41a' />
            </View>
          )}
          {/* 工作状态 */}
          {escort.workStatus === 'working' && (
            <View className='work-status online'>
              <View className='status-dot' />
              <Text>接单中</Text>
            </View>
          )}
        </View>
        <View className='escort-basic'>
          <View className='name-row'>
            <Text className='escort-name'>{escort.name}</Text>
            {escort.level && (
              <Text className='escort-level tag tag-primary'>{escort.level.name}</Text>
            )}
          </View>
          <View className='stats-row'>
            <View className='stat-item'>
              <Text className='stat-value'>{escort.rating?.toFixed(1) || '5.0'}</Text>
              <Text className='stat-label'>评分</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>{escort.orderCount || 0}</Text>
              <Text className='stat-label'>完成订单</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>{formatExperience(escort.experience)}</Text>
              <Text className='stat-label'>从业经验</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 个人介绍 */}
      {escort.introduction && (
        <View className='section card'>
          <Text className='section-title'>个人介绍</Text>
          <Text className='intro-text'>{escort.introduction}</Text>
          {escort.tags && escort.tags.length > 0 && (
            <View className='tags-wrap'>
              {escort.tags.map((tag, index) => (
                <Text key={index} className='tag tag-outline'>{tag}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 资质证书 */}
      {escort.certificates && escort.certificates.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>资质证书</Text>
          <View className='cert-list'>
            {escort.certificates.map((cert, index) => (
              <View key={index} className='cert-item'>
                <Icon name='check-circle' size={18} color='#52c41a' />
                <Text>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 熟悉医院 */}
      {escort.hospitals && escort.hospitals.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>熟悉医院</Text>
          <View className='hospital-list'>
            {escort.hospitals.map(hospital => (
              <View key={hospital.id} className='hospital-item'>
                <View className='hospital-header'>
                  <Icon name='hospital' size={18} color={getPrimaryColor()} />
                  <Text className='hospital-name'>{hospital.name}</Text>
                  {hospital.isPrimary && (
                    <Text className='primary-tag'>主要</Text>
                  )}
                </View>
                {hospital.familiarDepts && hospital.familiarDepts.length > 0 && (
                  <View className='hospital-depts'>
                    {hospital.familiarDepts.map((dept, index) => (
                      <Text key={index} className='dept-tag'>{dept}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 用户评价 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>用户评价 ({escort.ratingCount})</Text>
          {escort.ratingCount > 0 && (
            <View className='more-link' onClick={handleViewAllReviews}>
              <Text>查看全部</Text>
              <Icon name='chevron-right' size={16} color='#999' />
            </View>
          )}
        </View>
        {escort.recentReviews && escort.recentReviews.length > 0 ? (
          <View className='review-list'>
            {escort.recentReviews.map(review => (
              <View key={review.id} className='review-item'>
                <View className='review-header'>
                  <Text className='review-user'>
                    {review.isAnonymous ? '匿名用户' : '用户'}
                  </Text>
                  <View className='review-rating'>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Icon
                        key={i}
                        name='star-filled'
                        size={14}
                        color={i <= review.rating ? '#faad14' : '#e8e8e8'}
                      />
                    ))}
                  </View>
                </View>
                {review.content && (
                  <Text className='review-content'>{review.content}</Text>
                )}
                {review.tags && review.tags.length > 0 && (
                  <View className='review-tags'>
                    {review.tags.map((tag, index) => (
                      <Text key={index} className='review-tag'>{tag}</Text>
                    ))}
                  </View>
                )}
                <Text className='review-date'>{formatDate(review.createdAt)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='empty-reviews'>
            <Text>暂无评价</Text>
          </View>
        )}
      </View>

      {/* 底部占位 */}
      <View style={{ height: '140px' }} />

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='action-btns'>
          <View className='action-btn' onClick={handleCall}>
            <Icon name='phone' size={24} color='#666' />
            <Text>咨询</Text>
          </View>
        </View>
        <Button className='book-btn' onClick={handleBook}>
          立即预约
        </Button>
      </View>
    </View>
  )
}
