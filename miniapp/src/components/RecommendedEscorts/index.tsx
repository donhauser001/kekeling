import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { escortsApi, getResourceUrl } from '@/services/api'
import './index.scss'

interface Escort {
  id: string
  name: string
  avatar: string | null
  rating: number
  orderCount: number
  tags: string[]
  experience: string | null
  level: string
  introduction: string | null
  workStatus: string
}

interface RecommendedEscortsProps {
  primaryColor?: string
  limit?: number
}

export default function RecommendedEscorts({ primaryColor = '#f97316', limit = 6 }: RecommendedEscortsProps) {
  const [escorts, setEscorts] = useState<Escort[]>([])
  const [loading, setLoading] = useState(true)

  // 加载推荐陪诊员
  useEffect(() => {
    loadEscorts()
  }, [])

  const loadEscorts = async () => {
    try {
      setLoading(true)
      const result = await escortsApi.getList({
        status: 'active',
        sortBy: 'rating',
        pageSize: limit,
      })
      setEscorts(result.data || [])
    } catch (error) {
      console.error('加载推荐陪诊员失败:', error)
      setEscorts([])
    } finally {
      setLoading(false)
    }
  }

  const handleEscortClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/escort/detail?id=${id}` })
  }

  const handleViewAll = () => {
    Taro.navigateTo({ url: '/pages/escort/list' })
  }

  // 获取等级显示
  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      senior: '资深',
      intermediate: '中级',
      junior: '初级',
      trainee: '实习',
    }
    return levels[level] || level
  }

  // 如果加载中或无数据，不显示
  if (loading) {
    return (
      <View className="recommended-escorts">
        <View className="section-header">
          <Text className="section-title">推荐陪诊员</Text>
        </View>
        <View className="loading-container">
          <View className="skeleton-item" />
          <View className="skeleton-item" />
          <View className="skeleton-item" />
        </View>
      </View>
    )
  }

  if (escorts.length === 0) {
    return null
  }

  return (
    <View className="recommended-escorts">
      {/* 标题栏 */}
      <View className="section-header">
        <Text className="section-title">推荐陪诊员</Text>
        <View className="view-all" onClick={handleViewAll}>
          <Text className="view-all-text">查看全部</Text>
          <Text className="view-all-arrow">›</Text>
        </View>
      </View>

      {/* 陪诊员列表 - 横向滚动 */}
      <ScrollView
        className="escorts-scroll"
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className="escorts-list">
          {escorts.map((escort) => (
            <View
              key={escort.id}
              className="escort-card"
              onClick={() => handleEscortClick(escort.id)}
            >
              {/* 头像 */}
              <View className="escort-avatar-wrapper">
                <Image
                  className="escort-avatar"
                  src={escort.avatar ? getResourceUrl(escort.avatar) : '/assets/default-avatar.png'}
                  mode="aspectFill"
                />
                {escort.workStatus === 'working' && (
                  <View className="work-status" style={{ backgroundColor: '#22c55e' }} />
                )}
              </View>

              {/* 信息 */}
              <View className="escort-info">
                <View className="escort-name-row">
                  <Text className="escort-name">{escort.name}</Text>
                  <Text
                    className="escort-level"
                    style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}
                  >
                    {getLevelLabel(escort.level)}
                  </Text>
                </View>

                <View className="escort-stats">
                  <Text className="stat-rating">⭐ {escort.rating.toFixed(1)}</Text>
                  <Text className="stat-orders">{escort.orderCount}单</Text>
                </View>

                {/* 标签 */}
                {escort.tags && escort.tags.length > 0 && (
                  <View className="escort-tags">
                    {escort.tags.slice(0, 2).map((tag, index) => (
                      <Text key={index} className="escort-tag">
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
