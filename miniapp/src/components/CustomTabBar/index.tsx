/**
 * 自定义 TabBar 组件
 * 支持动态主题色
 */
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '../Icon'
import { getPrimaryColor } from '@/utils/theme'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  iconName: string
}

const tabList: TabItem[] = [
  { pagePath: '/pages/index/index', text: '首页', iconName: 'home' },
  { pagePath: '/pages/services/index', text: '服务', iconName: 'grid' },
  { pagePath: '/pages/orders/index', text: '订单', iconName: 'clipboard-list' },
  { pagePath: '/pages/user/index', text: '我的', iconName: 'user' },
]

export default function CustomTabBar() {
  const [current, setCurrent] = useState(0)
  const [primaryColor, setPrimaryColor] = useState(getPrimaryColor())

  useDidShow(() => {
    // 页面显示时更新当前选中项
    const currentPath = Taro.getCurrentInstance()?.router?.path || ''
    const index = tabList.findIndex(item => currentPath.includes(item.pagePath.replace('/pages', '')))
    if (index !== -1) {
      setCurrent(index)
    }
    // 更新主题色
    setPrimaryColor(getPrimaryColor())
  })

  useEffect(() => {
    // 初始化时获取当前页面
    const currentPath = Taro.getCurrentInstance()?.router?.path || ''
    const index = tabList.findIndex(item => currentPath.includes(item.pagePath.replace('/pages', '')))
    if (index !== -1) {
      setCurrent(index)
    }
  }, [])

  const handleClick = (index: number, item: TabItem) => {
    if (index === current) return
    setCurrent(index)
    Taro.switchTab({ url: item.pagePath })
  }

  return (
    <View className='custom-tabbar'>
      {tabList.map((item, index) => (
        <View
          key={item.pagePath}
          className={`tabbar-item ${index === current ? 'active' : ''}`}
          onClick={() => handleClick(index, item)}
        >
          <View className='tabbar-icon'>
            <Icon
              name={item.iconName}
              size={22}
              color={index === current ? primaryColor : '#999'}
            />
          </View>
          <Text
            className='tabbar-text'
            style={{ color: index === current ? primaryColor : '#999' }}
          >
            {item.text}
          </Text>
        </View>
      ))}
    </View>
  )
}

