import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

// Mock 用户数据
const mockUser = {
  id: '1',
  nickname: '微信用户',
  avatar: '',
  phone: '138****8888',
  isLogin: true,
}

const menuItems = [
  { icon: '👥', title: '就诊人管理', path: '/pages/user/patients' },
  { icon: '📍', title: '常用医院', path: '/pages/hospital/list' },
  { icon: '❤️', title: '我的收藏', path: '' },
  { icon: '🎫', title: '优惠券', path: '' },
  { icon: '📞', title: '联系客服', action: 'contact' },
  { icon: '⚙️', title: '设置', path: '' },
  { icon: '❓', title: '帮助中心', path: '' },
]

export default function User() {
  const [user, setUser] = useState(mockUser)

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/auth/login' })
  }

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.action === 'contact') {
      Taro.makePhoneCall({ phoneNumber: '400-123-4567' })
      return
    }
    if (item.path) {
      Taro.navigateTo({ url: item.path })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  return (
    <View className='user-page'>
      {/* 用户信息 */}
      <View className='user-header'>
        {user.isLogin ? (
          <View className='user-info'>
            <View className='user-avatar'>
              {user.avatar ? (
                <Image src={user.avatar} mode='aspectFill' />
              ) : (
                <View className='avatar-placeholder'>👤</View>
              )}
            </View>
            <View className='user-detail'>
              <Text className='user-name'>{user.nickname}</Text>
              <Text className='user-phone'>{user.phone}</Text>
            </View>
          </View>
        ) : (
          <View className='login-prompt' onClick={handleLogin}>
            <View className='user-avatar'>
              <View className='avatar-placeholder'>👤</View>
            </View>
            <View className='login-text'>
              <Text className='login-title'>登录/注册</Text>
              <Text className='login-desc'>登录后享受更多服务</Text>
            </View>
          </View>
        )}
      </View>

      {/* 订单卡片 */}
      <View className='order-card card'>
        <View className='card-header'>
          <Text className='card-title'>我的订单</Text>
          <Text className='card-more' onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
            全部订单 →
          </Text>
        </View>
        <View className='order-status-grid'>
          <View className='status-item' onClick={() => Taro.navigateTo({ url: '/pages/orders/index?tab=pending' })}>
            <View className='status-icon'>💳</View>
            <Text className='status-text'>待支付</Text>
          </View>
          <View className='status-item' onClick={() => Taro.navigateTo({ url: '/pages/orders/index?tab=confirmed' })}>
            <View className='status-icon'>📋</View>
            <Text className='status-text'>待服务</Text>
          </View>
          <View className='status-item' onClick={() => Taro.navigateTo({ url: '/pages/orders/index?tab=in_progress' })}>
            <View className='status-icon'>🚀</View>
            <Text className='status-text'>服务中</Text>
          </View>
          <View className='status-item' onClick={() => Taro.navigateTo({ url: '/pages/orders/index?tab=completed' })}>
            <View className='status-icon'>✅</View>
            <Text className='status-text'>已完成</Text>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='menu-card card'>
        {menuItems.map((item, index) => (
          <View
            key={index}
            className='menu-item'
            onClick={() => handleMenuClick(item)}
          >
            <View className='menu-icon'>{item.icon}</View>
            <Text className='menu-title'>{item.title}</Text>
            <View className='menu-arrow'>→</View>
          </View>
        ))}
      </View>

      {/* 底部信息 */}
      <View className='footer'>
        <Text className='version'>版本 1.0.0</Text>
      </View>
    </View>
  )
}

