import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { campaignApi, type Campaign } from '@/services/api'
import './index.scss'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadCampaigns()
  })

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const result = await campaignApi.getActiveCampaigns({ page: 1, pageSize: 20 })
      setCampaigns(result.data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getCampaignTypeText = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return '限时特惠'
      case 'seckill':
        return '秒杀'
      case 'threshold':
        return '满减'
      case 'newcomer':
        return '新人专享'
      default:
        return '活动'
    }
  }

  const getDiscountText = (campaign: Campaign) => {
    if (campaign.discountType === 'amount') {
      return `减¥${campaign.discountValue}`
    } else {
      return `${campaign.discountValue}折`
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getTimeRemaining = (endAt: string) => {
    const now = new Date().getTime()
    const end = new Date(endAt).getTime()
    const diff = end - now
    if (diff <= 0) return '已结束'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (days > 0) return `剩余${days}天${hours}小时`
    if (hours > 0) return `剩余${hours}小时${minutes}分钟`
    return `剩余${minutes}分钟`
  }

  return (
    <View className='campaigns-page'>
      <View className='header'>
        <Text className='title'>优惠活动</Text>
      </View>

      {loading ? (
        <View className='loading'>加载中...</View>
      ) : campaigns.length === 0 ? (
        <View className='empty'>
          <Icon name='sparkles' size={64} color='#d9d9d9' />
          <Text className='empty-text'>暂无进行中的活动</Text>
        </View>
      ) : (
        <View className='campaigns-list'>
          {campaigns.map((campaign) => (
            <View
              key={campaign.id}
              className='campaign-card'
              onClick={() =>
                Taro.navigateTo({ url: `/pages/marketing/campaigns/detail?id=${campaign.id}` })
              }
            >
              {campaign.bannerUrl && (
                <Image src={campaign.bannerUrl} mode='aspectFill' className='campaign-banner' />
              )}
              <View className='campaign-content'>
                <View className='campaign-header'>
                  <View className='campaign-type'>
                    <Icon name='sparkles' size={20} color='#ff4d4f' />
                    <Text className='type-text'>{getCampaignTypeText(campaign.type)}</Text>
                  </View>
                  <Text className='campaign-name'>{campaign.name}</Text>
                </View>
                <View className='campaign-discount'>
                  <Text className='discount-text'>{getDiscountText(campaign)}</Text>
                  {campaign.minAmount > 0 && (
                    <Text className='min-amount'>满{campaign.minAmount}元可用</Text>
                  )}
                </View>
                <View className='campaign-footer'>
                  <Text className='campaign-time'>
                    {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
                  </Text>
                  <Text className='time-remaining'>{getTimeRemaining(campaign.endAt)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

