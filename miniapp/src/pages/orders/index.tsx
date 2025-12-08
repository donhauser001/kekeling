import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import './index.scss'

// 订单状态 Tab
const orderTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'confirmed', label: '待服务' },
  { key: 'in_progress', label: '服务中' },
  { key: 'completed', label: '已完成' },
]

// Mock 数据
const mockOrders = [
  { 
    id: '1', 
    orderNo: 'KKL202412180001', 
    serviceName: '门诊陪诊', 
    hospitalName: '上海市第一人民医院',
    escortName: '张护士',
    appointmentDate: '2024-12-20',
    appointmentTime: '09:00',
    status: 'confirmed',
    paidAmount: 249,
    createdAt: '2024-12-18 10:30'
  },
  { 
    id: '2', 
    orderNo: 'KKL202412170002', 
    serviceName: '检查陪同', 
    hospitalName: '复旦大学附属华山医院',
    escortName: '李护士',
    appointmentDate: '2024-12-19',
    appointmentTime: '14:00',
    status: 'completed',
    paidAmount: 199,
    createdAt: '2024-12-17 15:20'
  },
  { 
    id: '3', 
    orderNo: 'KKL202412180003', 
    serviceName: '住院陪护', 
    hospitalName: '上海交通大学医学院附属瑞金医院',
    escortName: null,
    appointmentDate: '2024-12-22',
    appointmentTime: '08:00',
    status: 'pending',
    paidAmount: 399,
    createdAt: '2024-12-18 16:45'
  },
]

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待支付', color: '#faad14' },
  paid: { text: '待确认', color: '#1890ff' },
  confirmed: { text: '待服务', color: '#1890ff' },
  assigned: { text: '已分配', color: '#52c41a' },
  in_progress: { text: '服务中', color: '#52c41a' },
  completed: { text: '已完成', color: '#999' },
  cancelled: { text: '已取消', color: '#999' },
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredOrders = activeTab === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab)

  const handleOrderClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/orders/detail?id=${id}` })
  }

  const handlePay = (e: any, orderId: string) => {
    e.stopPropagation()
    // TODO: 发起支付
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  return (
    <View className='orders-page'>
      {/* Tab 栏 */}
      <View className='order-tabs'>
        {orderTabs.map(tab => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <View className='order-list'>
        {filteredOrders.length === 0 ? (
          <View className='empty-container'>
            <Icon name='package-search' size={64} color='#d9d9d9' />
            <Text className='empty-text'>暂无订单</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View
              key={order.id}
              className='order-card card'
              onClick={() => handleOrderClick(order.id)}
            >
              <View className='order-header'>
                <Text className='order-no'>订单号: {order.orderNo}</Text>
                <Text 
                  className='order-status'
                  style={{ color: statusMap[order.status]?.color }}
                >
                  {statusMap[order.status]?.text}
                </Text>
              </View>

              <View className='order-content'>
                <View className='service-info'>
                  <Text className='service-name'>{order.serviceName}</Text>
                  <Text className='hospital-name'>{order.hospitalName}</Text>
                </View>
                <View className='appointment-info'>
                  <View className='info-item'>
                    <Icon name='clock' size={14} color='#999' />
                    <Text>{order.appointmentDate} {order.appointmentTime}</Text>
                  </View>
                  {order.escortName && (
                    <View className='info-item'>
                      <Icon name='user-check' size={14} color='#999' />
                      <Text>{order.escortName}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View className='order-footer'>
                <View className='price-info'>
                  <Text className='label'>实付</Text>
                  <Text className='price'>{order.paidAmount}</Text>
                </View>
                <View className='action-btns'>
                  {order.status === 'pending' && (
                    <View className='btn btn-primary' onClick={(e) => handlePay(e, order.id)}>
                      去支付
                    </View>
                  )}
                  {order.status === 'completed' && (
                    <View className='btn btn-outline'>再次预约</View>
                  )}
                  <View className='btn btn-text'>查看详情</View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
