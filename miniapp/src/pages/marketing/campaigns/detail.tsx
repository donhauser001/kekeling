import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad, useRouter } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { campaignApi, type Campaign, type SeckillItem } from '@/services/api'
import './detail.scss'

export default function CampaignDetail() {
  const router = useRouter()
  const campaignId = router.params.id
  const [campaign, setCampaign] = useState<Campaign & { seckillItems?: SeckillItem[] } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    if (campaignId) {
      loadDetail()
    }
  })

  const loadDetail = async () => {
    try {
      setLoading(true)
      const data = await campaignApi.getDetail(campaignId!)
      setCampaign(data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  const handleSeckill = async (serviceId: string) => {
    if (!campaignId) return
    try {
      Taro.showLoading({ title: '抢购中...' })
      await campaignApi.reserveSeckillStock(campaignId, serviceId)
      Taro.hideLoading()
      Taro.showToast({ title: '抢购成功', icon: 'success' })
      Taro.navigateTo({ url: `/pages/services/detail?id=${serviceId}` })
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '抢购失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='campaign-detail-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  if (!campaign) {
    return (
      <View className='campaign-detail-page'>
        <View className='empty'>活动不存在</View>
      </View>
    )
  }

  return (
    <View className='campaign-detail-page'>
      {campaign.bannerUrl && (
        <Image src={campaign.bannerUrl} mode='aspectFill' className='banner' />
      )}

      <View className='content'>
        <View className='campaign-header'>
          <Text className='campaign-name'>{campaign.name}</Text>
          <Text className='campaign-desc'>{campaign.description || '限时优惠活动'}</Text>
        </View>

        {/* 秒杀商品列表 */}
        {campaign.type === 'seckill' && campaign.seckillItems && campaign.seckillItems.length > 0 && (
          <View className='seckill-section'>
            <Text className='section-title'>秒杀商品</Text>
            {campaign.seckillItems.map((item) => (
              <View key={item.id} className='seckill-item'>
                {item.service?.image && (
                  <Image src={item.service.image} mode='aspectFill' className='item-image' />
                )}
                <View className='item-info'>
                  <Text className='item-name'>{item.service?.name}</Text>
                  <View className='item-price'>
                    <Text className='seckill-price'>¥{item.seckillPrice}</Text>
                    <Text className='original-price'>¥{item.service?.price}</Text>
                  </View>
                  <Text className='item-stock'>
                    仅剩 {item.stockRemaining} 件
                  </Text>
                </View>
                <Button
                  className={`seckill-btn ${item.stockRemaining === 0 ? 'disabled' : ''}`}
                  disabled={item.stockRemaining === 0}
                  onClick={() => handleSeckill(item.serviceId)}
                >
                  {item.stockRemaining === 0 ? '已抢光' : '立即抢购'}
                </Button>
              </View>
            ))}
          </View>
        )}

        {/* 活动规则 */}
        <View className='rules-section'>
          <Text className='section-title'>活动规则</Text>
          <View className='rules-list'>
            <View className='rule-item'>
              <Text className='rule-dot'>•</Text>
              <Text className='rule-text'>
                活动时间：{new Date(campaign.startAt).toLocaleString()} -{' '}
                {new Date(campaign.endAt).toLocaleString()}
              </Text>
            </View>
            {campaign.minAmount > 0 && (
              <View className='rule-item'>
                <Text className='rule-dot'>•</Text>
                <Text className='rule-text'>最低消费：¥{campaign.minAmount}</Text>
              </View>
            )}
            {campaign.perUserLimit > 0 && (
              <View className='rule-item'>
                <Text className='rule-dot'>•</Text>
                <Text className='rule-text'>每人限参与 {campaign.perUserLimit} 次</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

