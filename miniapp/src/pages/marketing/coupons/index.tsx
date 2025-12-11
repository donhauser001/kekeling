import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { couponApi, type UserCoupon } from '@/services/api'
import './index.scss'

export default function Coupons() {
  const [activeTab, setActiveTab] = useState<'unused' | 'used' | 'expired'>('unused')
  const [coupons, setCoupons] = useState<UserCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useLoad(() => {
    loadCoupons()
  })

  const loadCoupons = async (reset = false) => {
    try {
      if (reset) {
        setPage(1)
        setCoupons([])
      }
      setLoading(true)
      const result = await couponApi.getMyCoupons({
        status: activeTab === 'unused' ? 'unused' : activeTab === 'used' ? 'used' : 'expired',
        page: reset ? 1 : page,
        pageSize: 10,
      })
      if (reset) {
        setCoupons(result.data)
      } else {
        setCoupons([...coupons, ...result.data])
      }
      setHasMore(result.data.length === 10)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons(true)
  }, [activeTab])

  const getCouponTypeText = (type: string) => {
    switch (type) {
      case 'amount':
        return '满减券'
      case 'percent':
        return '折扣券'
      case 'free':
        return '免费券'
      default:
        return '优惠券'
    }
  }

  const getCouponValueText = (coupon: UserCoupon) => {
    switch (coupon.type) {
      case 'amount':
        return `¥${coupon.value}`
      case 'percent':
        return `${coupon.value}折`
      case 'free':
        return '免费'
      default:
        return ''
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <View className='coupons-page'>
      <View className='header'>
        <Text className='title'>我的优惠券</Text>
        <View className='header-actions'>
          <View
            className='exchange-btn'
            onClick={() => {
              Taro.showModal({
                title: '兑换优惠券',
                editable: true,
                placeholderText: '请输入兑换码',
                success: async (res) => {
                  if (res.confirm && res.content) {
                    try {
                      Taro.showLoading({ title: '兑换中...' })
                      await couponApi.exchange(res.content)
                      Taro.hideLoading()
                      Taro.showToast({ title: '兑换成功', icon: 'success' })
                      loadCoupons(true)
                    } catch (error: any) {
                      Taro.hideLoading()
                      Taro.showToast({ title: error.message || '兑换失败', icon: 'none' })
                    }
                  }
                },
              })
            }}
          >
            <Icon name='key' size={18} color='#1890ff' />
            <Text>兑换码</Text>
          </View>
          <View
            className='available-btn'
            onClick={() => Taro.navigateTo({ url: '/pages/marketing/coupons/available' })}
          >
            <Icon name='plus' size={20} color='#fff' />
            <Text>领取优惠券</Text>
          </View>
        </View>
      </View>

      {/* 标签页 */}
      <View className='tabs'>
        <View
          className={`tab-item ${activeTab === 'unused' ? 'active' : ''}`}
          onClick={() => setActiveTab('unused')}
        >
          <Text>未使用</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'used' ? 'active' : ''}`}
          onClick={() => setActiveTab('used')}
        >
          <Text>已使用</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          <Text>已过期</Text>
        </View>
      </View>

      {/* 优惠券列表 */}
      <View className='coupons-list'>
        {loading && coupons.length === 0 ? (
          <View className='empty'>加载中...</View>
        ) : coupons.length === 0 ? (
          <View className='empty'>
            <Icon name='ticket' size={64} color='#d9d9d9' />
            <Text className='empty-text'>暂无优惠券</Text>
            <Button
              className='claim-btn'
              onClick={() => Taro.navigateTo({ url: '/pages/marketing/coupons/available' })}
            >
              去领取
            </Button>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View
              key={coupon.id}
              className={`coupon-card ${coupon.status === 'expired' ? 'expired' : ''}`}
            >
              <View className='coupon-left'>
                <View className='coupon-value'>
                  <Text className='value-text'>{getCouponValueText(coupon)}</Text>
                  <Text className='value-label'>{getCouponTypeText(coupon.type)}</Text>
                </View>
                {coupon.minAmount > 0 && (
                  <Text className='min-amount'>满{coupon.minAmount}元可用</Text>
                )}
              </View>
              <View className='coupon-right'>
                <Text className='coupon-name'>{coupon.name}</Text>
                <Text className='coupon-date'>
                  {formatDate(coupon.startAt)} - {formatDate(coupon.expireAt)}
                </Text>
                {coupon.status === 'unused' && (
                  <View className='status-badge unused'>未使用</View>
                )}
                {coupon.status === 'used' && (
                  <View className='status-badge used'>已使用</View>
                )}
                {coupon.status === 'expired' && (
                  <View className='status-badge expired'>已过期</View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

