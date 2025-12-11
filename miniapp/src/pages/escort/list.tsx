import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import { escortsApi } from '@/services/api'
import { getResourceUrl } from '@/services/request'
import './list.scss'

// 陪诊员数据类型
interface Escort {
  id: string
  name: string
  avatar: string | null
  gender: string
  level: {
    code: string
    name: string
    badge: string | null
  } | null
  experience: number | null
  introduction: string | null
  tags: string[]
  rating: number
  orderCount: number
  ratingCount: number
  workStatus: string
  primaryHospital: {
    id: string
    name: string
  } | null
}

// 排序类型
type SortBy = 'rating' | 'orderCount' | 'experience'

export default function EscortList() {
  const [escorts, setEscorts] = useState<Escort[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('rating')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10

  // 加载数据
  const loadData = async (isRefresh = false) => {
    const currentPage = isRefresh ? 1 : page

    try {
      if (isRefresh) {
        setLoading(true)
      } else if (currentPage > 1) {
        setLoadingMore(true)
      }

      const result = await escortsApi.getList({
        sortBy,
        page: currentPage,
        pageSize,
      })

      const newData = result.data || []

      if (isRefresh) {
        setEscorts(newData)
        setPage(1)
      } else {
        setEscorts(prev => [...prev, ...newData])
      }

      setHasMore(newData.length === pageSize && currentPage * pageSize < result.total)
    } catch (error) {
      console.error('加载陪诊员列表失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
      setLoadingMore(false)
      Taro.stopPullDownRefresh()
    }
  }

  // 初始加载
  useEffect(() => {
    loadData(true)
  }, [sortBy])

  // 下拉刷新
  usePullDownRefresh(() => {
    loadData(true)
  })

  // 上拉加载更多
  useReachBottom(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1)
    }
  })

  // 页码变化时加载数据
  useEffect(() => {
    if (page > 1) {
      loadData()
    }
  }, [page])

  // 切换排序
  const handleSort = (sort: SortBy) => {
    if (sort !== sortBy) {
      setSortBy(sort)
      setPage(1)
    }
  }

  // 跳转详情
  const handleEscortClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/escort/detail?id=${id}` })
  }

  // 格式化经验年限
  const formatExperience = (exp: number | null) => {
    if (!exp) return '新手'
    if (exp >= 12) return `${Math.floor(exp / 12)}年`
    return `${exp}个月`
  }

  // 渲染骨架屏
  const renderSkeleton = () => (
    <View className='escort-list'>
      {[1, 2, 3].map(i => (
        <View key={i} className='escort-card card skeleton'>
          <View className='escort-header'>
            <View className='escort-avatar skeleton-avatar' />
            <View className='escort-info'>
              <View className='skeleton-text' style={{ width: '80px', height: '20px' }} />
              <View className='skeleton-text' style={{ width: '150px', height: '16px', marginTop: '8px' }} />
            </View>
          </View>
          <View className='skeleton-text' style={{ width: '100%', height: '16px', marginTop: '12px' }} />
          <View className='skeleton-text' style={{ width: '70%', height: '16px', marginTop: '8px' }} />
        </View>
      ))}
    </View>
  )

  // 渲染空状态
  const renderEmpty = () => (
    <View className='empty-container'>
      <Icon name='user-x' size={48} color='#ccc' />
      <Text className='empty-text'>暂无陪诊员</Text>
      <Text className='empty-desc'>请稍后再试</Text>
    </View>
  )

  return (
    <View className='escort-list-page'>
      {/* 筛选栏 */}
      <View className='filter-bar'>
        <View
          className={`filter-item ${sortBy === 'rating' ? 'active' : ''}`}
          onClick={() => handleSort('rating')}
        >
          <Icon name='star-filled' size={16} color={sortBy === 'rating' ? getPrimaryColor() : '#666'} />
          <Text>好评优先</Text>
        </View>
        <View
          className={`filter-item ${sortBy === 'orderCount' ? 'active' : ''}`}
          onClick={() => handleSort('orderCount')}
        >
          <Icon name='file-text' size={16} color={sortBy === 'orderCount' ? getPrimaryColor() : '#666'} />
          <Text>接单量</Text>
        </View>
        <View
          className={`filter-item ${sortBy === 'experience' ? 'active' : ''}`}
          onClick={() => handleSort('experience')}
        >
          <Icon name='clock' size={16} color={sortBy === 'experience' ? getPrimaryColor() : '#666'} />
          <Text>经验</Text>
        </View>
      </View>

      {/* 列表内容 */}
      {loading ? (
        renderSkeleton()
      ) : escorts.length === 0 ? (
        renderEmpty()
      ) : (
        <View className='escort-list'>
          {escorts.map(escort => (
            <View
              key={escort.id}
              className='escort-card card'
              onClick={() => handleEscortClick(escort.id)}
            >
              <View className='escort-header'>
                <View className='escort-avatar'>
                  {escort.avatar ? (
                    <Image src={getResourceUrl(escort.avatar)} mode='aspectFill' />
                  ) : (
                    <View className='avatar-placeholder'>
                      <Icon name='user-check' size={28} color='#52c41a' />
                    </View>
                  )}
                  {/* 工作状态指示 */}
                  {escort.workStatus === 'working' && (
                    <View className='status-dot online' />
                  )}
                </View>
                <View className='escort-info'>
                  <View className='name-row'>
                    <Text className='escort-name'>{escort.name}</Text>
                    {escort.level && (
                      <Text className='escort-level tag tag-primary'>{escort.level.name}</Text>
                    )}
                  </View>
                  <View className='stats-row'>
                    <View className='stat-item'>
                      <Icon name='star-filled' size={14} color='#faad14' />
                      <Text>{escort.rating?.toFixed(1) || '5.0'}</Text>
                    </View>
                    <View className='stat-item'>
                      <Icon name='file-text' size={14} color={getPrimaryColor()} />
                      <Text>{escort.orderCount || 0}单</Text>
                    </View>
                    <View className='stat-item'>
                      <Icon name='clock' size={14} color='#52c41a' />
                      <Text>{formatExperience(escort.experience)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {escort.introduction && (
                <Text className='escort-intro' numberOfLines={2}>{escort.introduction}</Text>
              )}

              {escort.tags && escort.tags.length > 0 && (
                <View className='escort-tags'>
                  {escort.tags.slice(0, 4).map((tag, index) => (
                    <Text key={index} className='tag tag-outline'>{tag}</Text>
                  ))}
                </View>
              )}

              {escort.primaryHospital && (
                <View className='escort-hospitals'>
                  <Icon name='hospital' size={14} color='#999' />
                  <Text>{escort.primaryHospital.name}</Text>
                </View>
              )}
            </View>
          ))}

          {/* 加载更多 */}
          {loadingMore && (
            <View className='loading-more'>
              <Text>加载中...</Text>
            </View>
          )}
          {!hasMore && escorts.length > 0 && (
            <View className='no-more'>
              <Text>已加载全部</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
