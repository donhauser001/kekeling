import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { pointApi, type UserPoint } from '@/services/api'
import './index.scss'

export default function Points() {
  const [points, setPoints] = useState<UserPoint | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadData()
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await pointApi.getMyPoints()
      setPoints(data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    try {
      Taro.showLoading({ title: '签到中...' })
      const result = await pointApi.dailyCheckin()
      Taro.hideLoading()
      Taro.showToast({
        title: `签到成功，获得${result.pointsEarned}积分`,
        icon: 'success',
      })
      setCheckedIn(true)
      loadData()
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '签到失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='points-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  return (
    <View className='points-page'>
      <View className='header'>
        <Text className='title'>我的积分</Text>
      </View>

      {/* 积分概览 */}
      <View className='points-overview card'>
        <View className='points-value'>
          <Text className='value'>{points?.currentPoints || 0}</Text>
          <Text className='label'>当前可用积分</Text>
        </View>
        <View className='points-stats'>
          <View className='stat-item'>
            <Text className='stat-value'>{points?.totalPoints || 0}</Text>
            <Text className='stat-label'>累计获得</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{points?.usedPoints || 0}</Text>
            <Text className='stat-label'>已使用</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{points?.expiredPoints || 0}</Text>
            <Text className='stat-label'>已过期</Text>
          </View>
        </View>
      </View>

      {/* 每日签到 */}
      <View className='checkin-section card'>
        <View className='checkin-header'>
          <Icon name='calendar' size={24} color='#52c41a' />
          <Text className='checkin-title'>每日签到</Text>
        </View>
        <View className='checkin-content'>
          <Text className='checkin-desc'>每日签到可获得积分奖励</Text>
          <Button
            className={`checkin-btn ${checkedIn ? 'disabled' : ''}`}
            disabled={checkedIn}
            onClick={handleCheckin}
          >
            {checkedIn ? '今日已签到' : '立即签到'}
          </Button>
        </View>
      </View>

      {/* 积分明细入口 */}
      <View
        className='records-entry card'
        onClick={() => Taro.navigateTo({ url: '/pages/marketing/points/records' })}
      >
        <View className='entry-left'>
          <Icon name='list' size={24} color='#1890ff' />
          <Text className='entry-title'>积分明细</Text>
        </View>
        <Icon name='chevron-right' size={20} color='#999' />
      </View>

      {/* 积分说明 */}
      <View className='points-rules card'>
        <Text className='rules-title'>积分规则</Text>
        <View className='rules-list'>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>消费1元可获得1积分</Text>
          </View>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>积分可用于订单抵扣，100积分=1元</Text>
          </View>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>积分有效期为1年，过期将自动清零</Text>
          </View>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>每日签到可获得额外积分奖励</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

