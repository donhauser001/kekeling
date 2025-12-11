import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad, useRouter } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { membershipApi } from '@/services/api'
import { paymentApi } from '@/services/api'
import './plans.scss'

export default function MembershipPlans() {
  const router = useRouter()
  const levelId = router.params.levelId
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    if (levelId) {
      loadPlans()
    }
  })

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await membershipApi.getPlans(levelId)
      setPlans(data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (planId: string) => {
    try {
      Taro.showLoading({ title: '处理中...' })
      const order = await membershipApi.purchase(planId)
      Taro.hideLoading()

      // 跳转到支付页面
      Taro.navigateTo({
        url: `/pages/payment/index?orderId=${order.id}&type=membership`,
      })
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '购买失败', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='plans-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  return (
    <View className='plans-page'>
      <View className='header'>
        <Text className='title'>选择套餐</Text>
      </View>

      <View className='plans-list'>
        {plans.map((plan) => (
          <View
            key={plan.id}
            className={`plan-card card ${plan.recommended ? 'recommended' : ''}`}
          >
            {plan.recommended && (
              <View className='recommended-badge'>推荐</View>
            )}
            <View className='plan-header'>
              <Text className='plan-name'>{plan.name}</Text>
              {plan.originalPrice && plan.originalPrice > plan.price && (
                <View className='price-info'>
                  <Text className='original-price'>¥{plan.originalPrice}</Text>
                  <Text className='current-price'>¥{plan.price}</Text>
                </View>
              )}
              {(!plan.originalPrice || plan.originalPrice <= plan.price) && (
                <Text className='current-price'>¥{plan.price}</Text>
              )}
            </View>
            <View className='plan-duration'>
              <Text>有效期：{plan.duration}天</Text>
              {plan.renewalBonus > 0 && (
                <Text className='bonus'>续费赠送{plan.renewalBonus}天</Text>
              )}
            </View>
            {plan.description && (
              <Text className='plan-desc'>{plan.description}</Text>
            )}
            {plan.features && plan.features.length > 0 && (
              <View className='plan-features'>
                {plan.features.map((feature: string, index: number) => (
                  <View key={index} className='feature-item'>
                    <Icon name='check' size={16} color='#52c41a' />
                    <Text>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
            <Button
              className='purchase-btn'
              onClick={() => handlePurchase(plan.id)}
            >
              立即购买
            </Button>
          </View>
        ))}
      </View>
    </View>
  )
}
