/**
 * 工作台 Mock 数据
 * 
 * 包含：工作台统计、订单池、收入、提现、订单详情、设置
 * 迁移自: api.ts
 */

import type {
  WorkbenchStats,
  WorkbenchSummary,
  OrdersPoolResponse,
  EarningsResponse,
  EarningsStats,
  WithdrawInfo,
  WithdrawStats,
  WorkbenchOrderDetail,
  WorkbenchSettings,
} from '../api/types'

// ============================================================================
// 工作台统计 Mock
// ============================================================================

/**
 * Mock 工作台统计数据
 */
export function getMockWorkbenchStats(): WorkbenchStats {
  return {
    pendingOrders: 3,
    ongoingOrders: 2,
    completedOrders: 28,
    todayIncome: 680,
    monthIncome: 12800,
    withdrawable: 8500,
    onlineStatus: 'online',
    // 近7天收入趋势
    incomeTrend: [
      { label: '12/7', amount: 320 },
      { label: '12/8', amount: 580 },
      { label: '12/9', amount: 420 },
      { label: '12/10', amount: 750 },
      { label: '12/11', amount: 620 },
      { label: '12/12', amount: 890 },
      { label: '今日', amount: 680 },
    ],
    // 陪诊员个人信息
    escortName: '李护士',
    escortAvatar: '',
    escortPhone: '139****8888',
    escortLevel: '金牌陪诊员',
    rating: 4.9,
    orderCount: 328,
  }
}

/**
 * Mock 工作台概览
 */
export function getMockWorkbenchSummary(): WorkbenchSummary {
  return {
    todayOrders: 5,
    weekOrders: 28,
    monthOrders: 120,
    totalOrders: 580,
    todayIncome: 680,
    weekIncome: 3200,
    monthIncome: 12800,
    totalIncome: 68000,
    rating: 4.9,
    satisfactionRate: 98.5,
  }
}

// ============================================================================
// 订单池 Mock
// ============================================================================

/**
 * Mock 订单池数据
 */
export function getMockOrdersPool(): OrdersPoolResponse {
  return {
    items: [
      {
        id: 'pool-order-1',
        orderNo: 'ORD-2024-001',
        serviceType: '陪诊服务',
        serviceName: '门诊陪同',
        hospitalName: '北京协和医院',
        department: '内科',
        appointmentTime: '2024-12-14 09:00',
        amount: 180,
        commission: 162,
        createdAt: '2024-12-13 08:00',
      },
      {
        id: 'pool-order-2',
        orderNo: 'ORD-2024-002',
        serviceType: '陪诊服务',
        serviceName: '检查陪同',
        hospitalName: '北京儿童医院',
        department: '儿科',
        appointmentTime: '2024-12-14 10:30',
        amount: 220,
        commission: 198,
        createdAt: '2024-12-13 07:30',
      },
      {
        id: 'pool-order-3',
        orderNo: 'ORD-2024-003',
        serviceType: '代办服务',
        serviceName: '取药代办',
        hospitalName: '北京大学第一医院',
        appointmentTime: '2024-12-14 14:00',
        amount: 100,
        commission: 90,
        createdAt: '2024-12-13 09:00',
      },
    ],
    total: 3,
    hasMore: false,
  }
}

// ============================================================================
// 收入相关 Mock
// ============================================================================

/**
 * Mock 收入数据
 */
export function getMockEarnings(): EarningsResponse {
  return {
    balance: 5800,
    totalEarned: 12800,
    totalWithdrawn: 7000,
    pendingSettlement: 1200,
    items: [
      {
        id: 'earning-1',
        type: 'order',
        title: '门诊陪同订单收入',
        amount: 162,
        createdAt: '2024-12-10',
        orderNo: 'ORD-2024-101',
      },
      {
        id: 'earning-2',
        type: 'order',
        title: '检查陪同订单收入',
        amount: 198,
        createdAt: '2024-12-09',
        orderNo: 'ORD-2024-102',
      },
      {
        id: 'earning-3',
        type: 'order',
        title: '取药代办订单收入',
        amount: 90,
        createdAt: '2024-12-13',
        orderNo: 'ORD-2024-103',
      },
    ],
    hasMore: false,
  }
}

/**
 * Mock 收入统计
 */
export function getMockEarningsStats(): EarningsStats {
  return {
    totalEarnings: 12800,
    monthlyEarnings: 3500,
    withdrawable: 5800,
    pendingWithdraw: 1200,
    totalOrders: 120,
    monthlyOrders: 28,
    monthlyOrdersGrowth: 15.5,
    recentRecords: [
      { id: 'record-1', type: 'order', title: '门诊陪同订单', amount: 162, createdAt: '2024-12-13', status: 'completed' },
      { id: 'record-2', type: 'order', title: '检查陪同订单', amount: 198, createdAt: '2024-12-12', status: 'completed' },
    ],
  }
}

// ============================================================================
// 提现相关 Mock
// ============================================================================

/**
 * Mock 提现信息
 */
export function getMockWithdrawInfo(): WithdrawInfo {
  return {
    withdrawable: 5800,
    minWithdrawAmount: 100,
    feeRate: 0.006,
    estimatedHours: 24,
    bankCards: [
      { id: 'card-1', bankName: '中国工商银行', cardNo: '6789', isDefault: true },
      { id: 'card-2', bankName: '中国建设银行', cardNo: '4321', isDefault: false },
    ],
  }
}

/**
 * Mock 提现统计
 */
export function getMockWithdrawStats(): WithdrawStats {
  return {
    withdrawable: 5800,
    pendingAmount: 1200,
    minAmount: 100,
    maxAmount: 50000,
    feeRate: 0.006,
    estimatedHours: 24,
    remainingTimes: 3,
    accounts: [
      { id: 'acc-1', type: 'bank', name: '储蓄卡', accountNo: '****6789', bankName: '中国工商银行', isDefault: true },
      { id: 'acc-2', type: 'alipay', name: '支付宝', accountNo: '138****8888', isDefault: false },
    ],
    recentRecords: [
      { id: 'withdraw-1', amount: 1000, fee: 6, actualAmount: 994, accountName: '中国工商银行 ****6789', createdAt: '2024-12-10 15:30', completedAt: '2024-12-10 16:00', status: 'completed' },
      { id: 'withdraw-2', amount: 2000, fee: 12, actualAmount: 1988, accountName: '中国工商银行 ****6789', createdAt: '2024-12-05 10:00', completedAt: '2024-12-06 09:00', status: 'completed' },
      { id: 'withdraw-3', amount: 500, fee: 3, actualAmount: 497, accountName: '支付宝 138****8888', createdAt: '2024-12-13 08:00', status: 'pending' },
    ],
  }
}

// ============================================================================
// 订单详情 Mock
// ============================================================================

/**
 * Mock 工作台订单详情
 */
export function getMockWorkbenchOrderDetail(orderId: string): WorkbenchOrderDetail {
  return {
    id: orderId,
    orderNo: `ORD${orderId.toUpperCase()}`,
    status: 'accepted',
    statusText: '已接单',
    service: {
      id: 'svc-1',
      name: '门诊陪同',
      type: 'outpatient',
      duration: 180,
    },
    appointment: {
      date: '2024-12-14',
      time: '09:00',
      hospitalName: '北京协和医院',
      department: '内科',
      address: '北京市东城区帅府园一号',
    },
    user: {
      id: 'user-1',
      name: '王小明',
      phone: '13888888888',
      maskedPhone: '138****8888',
    },
    payment: {
      amount: 180,
      commission: 162,
    },
    remark: '需要帮忙挂号、陪同就诊、取药',
    createdAt: '2024-12-13 08:00',
    updatedAt: '2024-12-13 08:30',
  }
}

// ============================================================================
// 工作台设置 Mock
// ============================================================================

/**
 * Mock 工作台设置
 */
export function getMockWorkbenchSettings(): WorkbenchSettings {
  return {
    isOnline: true,
    autoAcceptOrders: true,
    preferences: {
      serviceTypes: ['门诊陪同', '检查陪同', '取药代办'],
      serviceAreas: ['北京协和医院', '北京大学第一医院', '中日友好医院'],
      departments: ['内科', '外科', '妇产科', '儿科'],
      maxDistance: 10,
      workingHours: {
        start: '08:00',
        end: '18:00',
      },
    },
    notifications: {
      newOrder: true,
      orderStatus: true,
      system: true,
      marketing: false,
    },
    profile: {
      name: '李护士',
      avatar: '',
      phone: '139****8888',
      level: '金牌陪诊员',
      rating: 4.9,
    },
  }
}

// ============================================================================
// 边界值变体
// ============================================================================

/**
 * Mock 空收入记录（边界值）
 */
export function getMockEarningsEmpty(): EarningsResponse {
  return {
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingSettlement: 0,
    items: [],
    hasMore: false,
  }
}

/**
 * Mock 空订单池（边界值）
 */
export function getMockOrdersPoolEmpty(): OrdersPoolResponse {
  return {
    items: [],
    total: 0,
    hasMore: false,
  }
}

/**
 * Mock 大额提现（边界值）
 */
export function getMockWithdrawLargeAmount(): WithdrawInfo {
  return {
    withdrawable: 100000,
    minWithdrawAmount: 100,
    feeRate: 0.006,
    estimatedHours: 24,
    bankCards: [
      { id: 'card-1', bankName: '中国工商银行', cardNo: '6789', isDefault: true },
    ],
  }
}

/**
 * Mock 零余额提现（边界值）
 */
export function getMockWithdrawZeroBalance(): WithdrawInfo {
  return {
    withdrawable: 0,
    minWithdrawAmount: 100,
    feeRate: 0.006,
    estimatedHours: 24,
    bankCards: [
      { id: 'card-1', bankName: '支付宝', cardNo: '8888', isDefault: true },
    ],
  }
}

// ============================================================================
// 我的订单 Mock（Step 14.13 FIX-P3-01）
// ============================================================================

/**
 * 我的订单项类型
 */
export interface MyOrderItem {
  id: string
  orderNo: string
  serviceType: string
  serviceName: string
  appointmentTime: string
  hospitalName: string
  department?: string
  amount: number
  commission: number
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
  userName?: string
  userPhone?: string
}

/**
 * 我的订单响应类型
 */
export interface MyOrdersResponse {
  items: MyOrderItem[]
  total: number
  hasMore: boolean
}

/**
 * Mock 我的订单数据
 */
export function getMockMyOrders(status?: string): MyOrdersResponse {
  const allOrders: MyOrderItem[] = [
    {
      id: 'my-order-1',
      orderNo: 'ORD202412130001',
      serviceType: 'accompany',
      serviceName: '全程陪诊',
      appointmentTime: '2024-12-15 09:00',
      hospitalName: '北京协和医院',
      department: '内科',
      amount: 299,
      commission: 180,
      status: 'pending',
      createdAt: '2024-12-13 10:30',
      userName: '王**',
      userPhone: '138****8888',
    },
    {
      id: 'my-order-2',
      orderNo: 'ORD202412130002',
      serviceType: 'accompany',
      serviceName: '检查陪同',
      appointmentTime: '2024-12-14 14:00',
      hospitalName: '北京儿童医院',
      department: '儿科',
      amount: 259,
      commission: 150,
      status: 'ongoing',
      createdAt: '2024-12-12 16:20',
      userName: '李**',
      userPhone: '139****9999',
    },
    {
      id: 'my-order-3',
      orderNo: 'ORD202412120003',
      serviceType: 'medicine',
      serviceName: '取药代办',
      appointmentTime: '2024-12-12 10:00',
      hospitalName: '北京朝阳医院',
      amount: 99,
      commission: 50,
      status: 'completed',
      createdAt: '2024-12-11 08:45',
      userName: '张**',
      userPhone: '137****7777',
    },
    {
      id: 'my-order-4',
      orderNo: 'ORD202412100004',
      serviceType: 'accompany',
      serviceName: '门诊陪同',
      appointmentTime: '2024-12-10 09:30',
      hospitalName: '北京大学第一医院',
      department: '外科',
      amount: 199,
      commission: 120,
      status: 'completed',
      createdAt: '2024-12-09 14:10',
      userName: '赵**',
      userPhone: '136****6666',
    },
    {
      id: 'my-order-5',
      orderNo: 'ORD202412080005',
      serviceType: 'accompany',
      serviceName: '住院陪护',
      appointmentTime: '2024-12-08 08:00',
      hospitalName: '中日友好医院',
      department: '骨科',
      amount: 599,
      commission: 350,
      status: 'cancelled',
      createdAt: '2024-12-07 09:00',
      userName: '刘**',
      userPhone: '135****5555',
    },
  ]

  // 根据状态筛选
  let filteredOrders = allOrders
  if (status && status !== 'all') {
    filteredOrders = allOrders.filter((order) => {
      if (status === 'pending') return order.status === 'pending' || order.status === 'accepted'
      return order.status === status
    })
  }

  return {
    items: filteredOrders,
    total: filteredOrders.length,
    hasMore: false,
  }
}

