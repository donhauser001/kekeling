import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import { mockRequestPayment, isH5 } from '@/utils/env-adapter'
import { post } from '@/services/request'
import { ordersApi } from '@/services/api'
import './result.scss'

export default function BookingResult() {
  const router = useRouter()
  const { orderId, orderNo, amount } = router.params
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)

  // 处理支付
  const handlePay = async () => {
    if (!orderId) {
      Taro.showToast({ title: '订单信息异常', icon: 'none' })
      return
    }

    try {
      setPaying(true)
      
      // 调用 Mock 支付
      await mockRequestPayment({
        orderId,
        orderNo: orderNo || orderId,
        totalAmount: Number(amount) || 0,
      })
      
      // H5 环境下，调用测试接口更新订单状态
      if (isH5) {
        try {
          await post(`/test/pay-order/${orderId}`)
        } catch (err) {
          console.error('更新订单状态失败:', err)
        }
      }
      
      // 支付成功
      setPaySuccess(true)
      Taro.showToast({ title: '支付成功', icon: 'success' })
      
      // 2秒后跳转到订单详情
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/orders/detail?id=${orderId}` })
      }, 2000)
      
    } catch (err: any) {
      console.error('支付失败:', err)
      if (err.errMsg?.includes('cancel')) {
        Taro.showToast({ title: '支付已取消', icon: 'none' })
      } else {
        Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
      }
    } finally {
      setPaying(false)
    }
  }

  // 查看订单
  const handleViewOrder = () => {
    Taro.redirectTo({ url: `/pages/orders/detail?id=${orderId}` })
  }

  // 返回首页
  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  // 取消订单
  const handleCancel = async () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      confirmText: '确定取消',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await ordersApi.cancel(orderId!, '用户主动取消')
            Taro.showToast({ title: '订单已取消', icon: 'success' })
            setTimeout(() => {
              Taro.redirectTo({ url: `/pages/orders/detail?id=${orderId}` })
            }, 1500)
          } catch (err) {
            Taro.showToast({ title: '取消失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 支付成功状态
  if (paySuccess) {
    return (
      <View className='result-page'>
        <View className='result-card success'>
          <View className='result-icon'>
            <Icon name='check-circle' size={64} color='#52c41a' />
          </View>
          <Text className='result-title'>支付成功</Text>
          <Text className='result-desc'>订单已提交，我们将尽快为您安排陪诊员</Text>
          
          <View className='order-info'>
            <View className='info-item'>
              <Text className='info-label'>订单编号</Text>
              <Text className='info-value'>{orderNo || orderId}</Text>
            </View>
            <View className='info-item'>
              <Text className='info-label'>支付金额</Text>
              <Text className='info-value price'>¥{amount}</Text>
            </View>
          </View>
        </View>

        <View className='action-section'>
          <Button className='primary-btn' onClick={handleViewOrder}>
            查看订单详情
          </Button>
          <Button className='secondary-btn' onClick={handleBackHome}>
            返回首页
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className='result-page'>
      <View className='result-card'>
        <View className='result-icon pending'>
          <Icon name='clock' size={64} color='#faad14' />
        </View>
        <Text className='result-title'>订单提交成功</Text>
        <Text className='result-desc'>请尽快完成支付，以便为您安排陪诊员</Text>
        
        <View className='order-info'>
          <View className='info-item'>
            <Text className='info-label'>订单编号</Text>
            <Text className='info-value'>{orderNo || orderId}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>应付金额</Text>
            <Text className='info-value price'>¥{amount}</Text>
          </View>
        </View>
      </View>

      <View className='action-section'>
        <Button 
          className='pay-btn' 
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? '支付中...' : `立即支付 ¥${amount}`}
        </Button>
        <View className='secondary-actions'>
          <View className='action-item' onClick={handleViewOrder}>
            <Icon name='file-text' size={20} color={getPrimaryColor()} />
            <Text>查看订单</Text>
          </View>
          <View className='action-item' onClick={handleCancel}>
            <Icon name='x-circle' size={20} color='#ff4d4f' />
            <Text>取消订单</Text>
          </View>
          <View className='action-item' onClick={handleBackHome}>
            <Icon name='home' size={20} color='#666' />
            <Text>返回首页</Text>
          </View>
        </View>
      </View>

      {/* 温馨提示 */}
      <View className='tips-section card'>
        <Text className='tips-title'>温馨提示</Text>
        <View className='tips-list'>
          <View className='tip-item'>
            <Icon name='clock' size={16} color='#faad14' />
            <Text>请在30分钟内完成支付，超时订单将自动取消</Text>
          </View>
          <View className='tip-item'>
            <Icon name='phone' size={16} color={getPrimaryColor()} />
            <Text>支付成功后，陪诊员将在服务前一天与您联系</Text>
          </View>
          <View className='tip-item'>
            <Icon name='help-circle' size={16} color='#52c41a' />
            <Text>如有问题，请联系客服 400-123-4567</Text>
          </View>
        </View>
      </View>

      {/* H5 开发提示 */}
      {isH5 && (
        <View className='dev-tip'>
          <Text>🚧 H5 开发模式：点击"立即支付"将弹出模拟支付窗口</Text>
        </View>
      )}
    </View>
  )
}
