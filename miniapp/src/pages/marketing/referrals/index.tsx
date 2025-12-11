import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { referralApi, type ReferralStats, type ReferralRecord } from '@/services/api'
import './index.scss'

export default function Referrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [records, setRecords] = useState<ReferralRecord[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadData()
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, recordsData] = await Promise.all([
        referralApi.getStats(),
        referralApi.getRecords({ page: 1, pageSize: 10 }),
      ])
      setStats(statsData)
      setRecords(recordsData.data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (stats?.inviteCode) {
      Taro.setClipboardData({
        data: stats.inviteCode,
        success: () => {
          Taro.showToast({ title: '邀请码已复制', icon: 'success' })
        },
      })
    }
  }

  const handleShare = () => {
    if (!stats?.inviteCode) {
      Taro.showToast({ title: '邀请码获取失败', icon: 'none' })
      return
    }

    // 使用微信分享功能
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })

    // 或者使用自定义分享
    Taro.showActionSheet({
      itemList: ['分享给微信好友', '生成分享海报', '复制邀请链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给微信好友
          Taro.showToast({ title: '请点击右上角分享', icon: 'none' })
        } else if (res.tapIndex === 1) {
          // 生成分享海报（TODO: 实现海报生成功能）
          Taro.showToast({ title: '海报功能开发中', icon: 'none' })
        } else if (res.tapIndex === 2) {
          // 复制邀请链接
          const inviteLink = `https://your-domain.com/invite?code=${stats.inviteCode}`
          Taro.setClipboardData({
            data: inviteLink,
            success: () => {
              Taro.showToast({ title: '邀请链接已复制', icon: 'success' })
            },
          })
        }
      },
    })
  }

  if (loading) {
    return (
      <View className='referrals-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  return (
    <View className='referrals-page'>
      <View className='header'>
        <Text className='title'>邀请好友</Text>
      </View>

      {/* 邀请码卡片 */}
      <View className='invite-code-card card'>
        <View className='code-section'>
          <Text className='code-label'>我的邀请码</Text>
          <View className='code-value' onClick={handleCopyCode}>
            <Text className='code-text'>{stats?.inviteCode || '--'}</Text>
            <Icon name='copy' size={20} color='#1890ff' />
          </View>
        </View>
        <Button className='share-btn' onClick={handleShare}>
          分享邀请
        </Button>
      </View>

      {/* 邀请统计 */}
      <View className='stats-section card'>
        <View className='stats-grid'>
          <View className='stat-item'>
            <Text className='stat-value'>{stats?.totalInvites || 0}</Text>
            <Text className='stat-label'>总邀请数</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats?.registeredCount || 0}</Text>
            <Text className='stat-label'>已注册</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats?.rewardedCount || 0}</Text>
            <Text className='stat-label'>已奖励</Text>
          </View>
        </View>
      </View>

      {/* 邀请记录 */}
      <View className='records-section'>
        <Text className='section-title'>邀请记录</Text>
        {records.length === 0 ? (
          <View className='empty'>暂无邀请记录</View>
        ) : (
          <View className='records-list'>
            {records.map((record) => (
              <View key={record.id} className='record-item'>
                <View className='record-left'>
                  <View className='record-avatar'>
                    {record.invitee?.nickname ? (
                      <Text className='avatar-text'>
                        {record.invitee.nickname.charAt(0)}
                      </Text>
                    ) : (
                      <Icon name='user' size={24} color='#999' />
                    )}
                  </View>
                  <View className='record-info'>
                    <Text className='record-name'>
                      {record.invitee?.nickname || '待注册'}
                    </Text>
                    <Text className='record-time'>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View className='record-right'>
                  <View
                    className={`status-badge ${record.status === 'rewarded'
                        ? 'rewarded'
                        : record.status === 'registered'
                          ? 'registered'
                          : 'pending'
                      }`}
                  >
                    {record.status === 'rewarded'
                      ? '已奖励'
                      : record.status === 'registered'
                        ? '已注册'
                        : '待注册'}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 邀请规则说明 */}
      <View className='rules-section card'>
        <Text className='rules-title'>邀请规则</Text>
        <View className='rules-list'>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>好友通过您的邀请码注册并完成首单，您可获得奖励</Text>
          </View>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>被邀请人也可获得新人专享优惠</Text>
          </View>
          <View className='rule-item'>
            <Text className='rule-dot'>•</Text>
            <Text className='rule-text'>邀请奖励包括优惠券和积分</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

