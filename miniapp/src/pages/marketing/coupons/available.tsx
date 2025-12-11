import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { couponApi } from '@/services/api'
import './available.scss'

export default function AvailableCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadCoupons()
  })

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const data = await couponApi.getAvailable()
      setCoupons(data)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (templateId: string) => {
    try {
      Taro.showLoading({ title: '领取中...' })
      await couponApi.claim(templateId)
      Taro.hideLoading()
      Taro.showToast({ title: '领取成功', icon: 'success' })
      loadCoupons()
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '领取失败', icon: 'none' })
    }
  }

  return (
    <View className='available-coupons-page'>
      <View className='header'>
        <Text className='title'>可领取优惠券</Text>
      </View>

      {loading ? (
        <View className='loading'>加载中...</View>
      ) : coupons.length === 0 ? (
        <View className='empty'>
          <Icon name='ticket' size={64} color='#d9d9d9' />
          <Text className='empty-text'>暂无可领取的优惠券</Text>
        </View>
      ) : (
        <View className='coupons-list'>
          {coupons.map((coupon) => (
            <View key={coupon.id} className='coupon-card'>
              <View className='coupon-info'>
                <Text className='coupon-name'>{coupon.name}</Text>
                <Text className='coupon-desc'>{coupon.description || '限时优惠'}</Text>
                <View className='coupon-rules'>
                  {coupon.minAmount > 0 && (
                    <Text className='rule-item'>满{coupon.minAmount}元可用</Text>
                  )}
                  {coupon.perUserLimit > 0 && (
                    <Text className='rule-item'>每人限领{coupon.perUserLimit}张</Text>
                  )}
                </View>
              </View>
              <Button
                className='claim-btn'
                onClick={() => handleClaim(coupon.id)}
              >
                立即领取
              </Button>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

