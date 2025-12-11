import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { membershipApi } from '@/services/api'
import './index.scss'

export default function Membership() {
  const [levels, setLevels] = useState<any[]>([])
  const [myMembership, setMyMembership] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadData()
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [levelsData, membershipData] = await Promise.all([
        membershipApi.getLevels(),
        membershipApi.getMyMembership().catch(() => null),
      ])
      setLevels(levelsData)
      setMyMembership(membershipData)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (planId: string) => {
    try {
      Taro.showLoading({ title: '处理中...' })
      await membershipApi.purchase(planId)
      Taro.hideLoading()
      Taro.showToast({ title: '购买成功', icon: 'success' })
      loadData()
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '购买失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='membership-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  return (
    <View className='membership-page'>
      <View className='header'>
        <Text className='title'>会员中心</Text>
      </View>

      {/* 我的会员状态 */}
      {myMembership && (
        <View className='my-membership card'>
          <View className='membership-info'>
            <Icon name='crown' size={32} color='#faad14' />
            <View className='info-text'>
              <Text className='level-name'>{myMembership.level?.name || '会员'}</Text>
              <Text className='expire-date'>
                到期时间：{new Date(myMembership.expiresAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {myMembership.status === 'active' && (
            <View className='status-badge active'>生效中</View>
          )}
        </View>
      )}

      {/* 会员权益说明 */}
      {myMembership && myMembership.level && (
        <View className='benefits-section card'>
          <Text className='section-title'>会员权益</Text>
          <View className='benefits-list'>
            <View className='benefit-item'>
              <Icon name='check-circle' size={20} color='#52c41a' />
              <Text className='benefit-text'>
                享受 {myMembership.level.discount}% 折扣优惠
              </Text>
            </View>
            {myMembership.level.overtimeFeeWaiver > 0 && (
              <View className='benefit-item'>
                <Icon name='check-circle' size={20} color='#52c41a' />
                <Text className='benefit-text'>
                  超时费用减免 {myMembership.level.overtimeFeeWaiver} 分钟
                </Text>
              </View>
            )}
            {myMembership.level.benefits?.map((benefit: string, index: number) => (
              <View key={index} className='benefit-item'>
                <Icon name='check-circle' size={20} color='#52c41a' />
                <Text className='benefit-text'>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 会员等级列表 */}
      <View className='levels-section'>
        <Text className='section-title'>选择会员等级</Text>
        {levels.map((level) => (
          <View key={level.id} className='level-card card'>
            <View className='level-header'>
              <View className='level-info'>
                <Icon name='crown' size={24} color='#faad14' />
                <Text className='level-name'>{level.name}</Text>
                <Text className='level-badge'>Lv.{level.level}</Text>
              </View>
              <Text className='discount'>{level.discount}% 折扣</Text>
            </View>
            <View className='level-benefits'>
              {level.benefits?.map((benefit: string, index: number) => (
                <View key={index} className='benefit-item'>
                  <Icon name='check' size={16} color='#52c41a' />
                  <Text>{benefit}</Text>
                </View>
              ))}
            </View>
            <View className='level-footer'>
              <View className='price-info'>
                <Text className='price'>¥{level.price}</Text>
                <Text className='duration'>/{level.duration}天</Text>
              </View>
              <Button
                className='purchase-btn'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/marketing/membership/plans?levelId=${level.id}`,
                  })
                }}
              >
                立即开通
              </Button>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

