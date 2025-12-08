import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './result.scss'

export default function BookingResult() {
  const router = useRouter()
  const { status } = router.params

  const isSuccess = status === 'success'

  const handleViewOrder = () => {
    Taro.redirectTo({ url: '/pages/orders/detail?id=mock_order_001' })
  }

  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  return (
    <View className='result-page'>
      <View className='result-content'>
        <View className={`result-icon ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? '✓' : '✕'}
        </View>
        <Text className='result-title'>
          {isSuccess ? '预约成功' : '预约失败'}
        </Text>
        <Text className='result-desc'>
          {isSuccess 
            ? '您的订单已提交成功，请前往订单详情查看'
            : '订单提交失败，请稍后重试'}
        </Text>
      </View>

      <View className='result-actions'>
        {isSuccess && (
          <Button className='btn btn-primary' onClick={handleViewOrder}>
            查看订单
          </Button>
        )}
        <Button className='btn btn-outline' onClick={handleBackHome}>
          返回首页
        </Button>
      </View>
    </View>
  )
}

