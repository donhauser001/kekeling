import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import CustomTabBar from '@/components/CustomTabBar'
import { getPrimaryColor } from '@/utils/theme'
import { useEscortIdentity, getEscortStatusText, getWorkStatusText, getWorkStatusColor } from '@/hooks/useEscortIdentity'
import './index.scss'

// Mock 用户数据
const mockUser = {
  id: '1',
  nickname: '微信用户',
  avatar: '',
  phone: '138****8888',
  isVip: false,
  balance: 0,
  couponCount: 2,
  orderStats: {
    pending: 1,
    confirmed: 2,
    in_progress: 0,
    completed: 5,
  }
}

// 菜单项
const menuItems = [
  {
    key: 'patients',
    title: '就诊人管理',
    icon: 'users',
    link: '/pages/user/patients'
  },
  {
    key: 'membership',
    title: '会员中心',
    icon: 'crown',
    link: '/pages/marketing/membership/index'
  },
  {
    key: 'coupons',
    title: '我的优惠券',
    icon: 'ticket',
    badge: '2',
    link: '/pages/marketing/coupons/index'
  },
  {
    key: 'points',
    title: '我的积分',
    icon: 'award',
    link: '/pages/marketing/points/index'
  },
  {
    key: 'referrals',
    title: '邀请好友',
    icon: 'user-plus',
    link: '/pages/marketing/referrals/index'
  },
  {
    key: 'campaigns',
    title: '优惠活动',
    icon: 'sparkles',
    link: '/pages/marketing/campaigns/index'
  },
  {
    key: 'feedback',
    title: '意见反馈',
    icon: 'headphones',
    link: '/pages/user/feedback'
  },
  {
    key: 'help',
    title: '帮助中心',
    icon: 'help-circle',
    link: '/pages/user/help'
  },
  {
    key: 'about',
    title: '关于我们',
    icon: 'building',
    link: '/pages/user/about'
  },
]

// 订单入口
const orderEntries = [
  { key: 'pending', title: '待支付', icon: 'credit-card', count: 0 },
  { key: 'confirmed', title: '待服务', icon: 'clock', count: 0 },
  { key: 'in_progress', title: '服务中', icon: 'rocket', count: 0 },
  { key: 'completed', title: '已完成', icon: 'check-circle', count: 0 },
]

export default function User() {
  const [user, setUser] = useState<typeof mockUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 陪诊员身份检测
  const {
    isEscort,
    escortInfo,
    isPending,
    isActive,
    isSuspended,
    isWorking,
    isBusy,
    refresh: refreshEscortIdentity,
  } = useEscortIdentity()

  useEffect(() => {
    // TODO: 检查登录状态
    const token = Taro.getStorageSync('token')
    if (token) {
      setIsLoggedIn(true)
      setUser(mockUser)
    }
  }, [])

  // 页面显示时刷新陪诊员身份
  useDidShow(() => {
    if (isLoggedIn) {
      refreshEscortIdentity()
    }
  })

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/auth/login' })
  }

  const handleOrderClick = (status: string) => {
    Taro.switchTab({ url: '/pages/orders/index' })
    // 可以通过 eventChannel 传递状态筛选
  }

  const handleMenuClick = (link: string) => {
    if (!isLoggedIn) {
      handleLogin()
      return
    }
    Taro.navigateTo({ url: link })
  }

  const handleSettings = () => {
    Taro.navigateTo({ url: '/pages/user/settings' })
  }

  return (
    <View className='user-page'>
      {/* 用户信息 */}
      <View className='user-header'>
        {isLoggedIn && user ? (
          <View className='user-info'>
            <View className='user-avatar'>
              {user.avatar ? (
                <Image src={user.avatar} mode='aspectFill' />
              ) : (
                <View className='avatar-placeholder'>
                  <Icon name='user' size={36} color='#fff' />
                </View>
              )}
            </View>
            <View className='user-detail'>
              <View className='nickname-row'>
                <Text className='nickname'>{user.nickname}</Text>
                {user.isVip && (
                  <View className='vip-badge'>
                    <Icon name='crown' size={12} color='#faad14' />
                    <Text>会员</Text>
                  </View>
                )}
              </View>
              <Text className='phone'>{user.phone}</Text>
            </View>
            <View className='settings-btn' onClick={handleSettings}>
              <Icon name='settings' size={22} color='#fff' />
            </View>
          </View>
        ) : (
          <View className='login-prompt'>
            <View className='default-avatar'>
              <Icon name='user' size={36} color='#d9d9d9' />
            </View>
            <View className='login-text' onClick={handleLogin}>
              <Text className='title'>登录/注册</Text>
              <Text className='desc'>登录后享受更多服务</Text>
            </View>
          </View>
        )}
      </View>

      {/* 订单统计 */}
      <View className='order-section card'>
        <View className='section-header'>
          <Text className='section-title'>我的订单</Text>
          <View className='all-orders' onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
            <Text>全部订单</Text>
            <Icon name='chevron-right' size={16} color='#999' />
          </View>
        </View>
        <View className='order-entries'>
          {orderEntries.map(entry => (
            <View
              key={entry.key}
              className='entry-item'
              onClick={() => handleOrderClick(entry.key)}
            >
              <View className='entry-icon-wrap'>
                <Icon name={entry.icon} size={24} />
                {user?.orderStats?.[entry.key] > 0 && (
                  <Text className='badge'>{user.orderStats[entry.key]}</Text>
                )}
              </View>
              <Text className='entry-title'>{entry.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 陪诊员工作台入口 - 仅陪诊员可见 */}
      {isLoggedIn && isEscort && (
        <View
          className='workbench-entry card'
          onClick={() => {
            if (isSuspended) {
              Taro.showToast({ title: '账号已被封禁', icon: 'none' })
              return
            }
            Taro.navigateTo({ url: '/pages/workbench/index' })
          }}
        >
          <View className='workbench-left'>
            <View className='workbench-icon'>
              <Icon name='briefcase' size={28} color='#fff' />
            </View>
            <View className='workbench-info'>
              <View className='workbench-title-row'>
                <Text className='workbench-title'>陪诊员工作台</Text>
                {isPending && (
                  <View className='status-tag pending'>审核中</View>
                )}
                {isSuspended && (
                  <View className='status-tag suspended'>已封禁</View>
                )}
                {isActive && (
                  <View
                    className='status-tag'
                    style={{ backgroundColor: getWorkStatusColor(escortInfo?.workStatus || 'resting') }}
                  >
                    {getWorkStatusText(escortInfo?.workStatus || 'resting')}
                  </View>
                )}
              </View>
              <Text className='workbench-desc'>
                {isPending ? '您的陪诊员资质正在审核中' :
                  isSuspended ? '如有疑问请联系客服' :
                    isBusy ? '您正在服务中' :
                      isWorking ? '今日接单中，点击查看详情' :
                        '点击进入工作台管理订单'}
              </Text>
            </View>
          </View>
          <Icon name='chevron-right' size={20} color='#999' />
        </View>
      )}

      {/* 功能菜单 */}
      <View className='menu-section card'>
        {menuItems.map((item, index) => (
          <View
            key={item.key}
            className={`menu-item ${index < menuItems.length - 1 ? 'border-bottom' : ''}`}
            onClick={() => handleMenuClick(item.link)}
          >
            <View className='menu-left'>
              <Icon name={item.icon} size={20} color='#666' />
              <Text className='menu-title'>{item.title}</Text>
            </View>
            <View className='menu-right'>
              {item.badge && (
                <Text className='menu-badge'>{item.badge}</Text>
              )}
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        ))}
      </View>

      {/* 客服 */}
      <View className='service-card card'>
        <Icon name='headphones' size={24} color='#52c41a' />
        <View className='service-info'>
          <Text className='service-title'>在线客服</Text>
          <Text className='service-desc'>工作时间 9:00-18:00</Text>
        </View>
        <Button className='service-btn' openType='contact'>
          立即咨询
        </Button>
      </View>

      {/* 自定义 TabBar */}
      <CustomTabBar />
    </View>
  )
}
