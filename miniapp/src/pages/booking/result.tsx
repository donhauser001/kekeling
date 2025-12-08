import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import Icon from '@/components/Icon'
import './result.scss'

export default function BookingResult() {
  const router = useRouter()
  const { orderId, amount } = router.params

  const handleViewOrder = () => {
    Taro.redirectTo({ url: `/pages/orders/detail?id=${orderId}` })
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  const handlePay = () => {
    // TODO: 发起微信支付
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  return (
    <View className='result-page'>
      <View className='result-card'>
        <View className='result-icon'>
          <Icon name='check-circle' size={64} color='#52c41a' />
        </View>
        <Text className='result-title'>订单提交成功</Text>
        <Text className='result-desc'>请尽快完成支付，以便为您安排陪诊员</Text>
        
        <View className='order-info'>
          <View className='info-item'>
            <Text className='info-label'>订单编号</Text>
            <Text className='info-value'>{orderId}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>应付金额</Text>
            <Text className='info-value price'>{amount}</Text>
          </View>
        </View>
      </View>

      <View className='action-section'>
        <Button className='pay-btn' onClick={handlePay}>
          立即支付 ¥{amount}
        </Button>
        <View className='secondary-actions'>
          <View className='action-item' onClick={handleViewOrder}>
            <Icon name='file-text' size={20} color='#1890ff' />
            <Text>查看订单</Text>
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
            <Icon name='phone' size={16} color='#1890ff' />
            <Text>支付成功后，陪诊员将在服务前一天与您联系</Text>
          </View>
          <View className='tip-item'>
            <Icon name='help-circle' size={16} color='#52c41a' />
            <Text>如有问题，请联系客服 400-123-4567</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
