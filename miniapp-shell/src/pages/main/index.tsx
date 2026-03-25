import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'

export default function MainPage() {
  useDidShow(() => {
    Taro.reLaunch({
      url: '/packageD/pages/home/index',
    })
  })

  return (
    <View className="main-container">
      <View className="redirect-loading">
        <Text className="redirect-text">加载中...</Text>
      </View>
    </View>
  )
}
