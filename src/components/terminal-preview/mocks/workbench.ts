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
} from '../types'

// ============================================================================
// 工作台统计 Mock
// ============================================================================

/**
 * Mock 工作台统计数据
 */
export function getMockWorkbenchStats(): WorkbenchStats {
  return {
    todayOrders: 5,
    todayEarnings: 680,
    monthOrders: 45,
    monthEarnings: 12800,
    rating: 4.9,
    completionRate: 98.5,
  }
}

/**
 * Mock 工作台概览
 */
export function getMockWorkbenchSummary(): WorkbenchSummary {
  return {
    pendingOrders: 3,
    todayOrders: 5,
    todayEarnings: 680,
    weekEarnings: 3200,
    rating: 4.9,
    completionRate: 98.5,
    recentOrders: [
      {
        id: 'order-1',
        serviceName: '门诊陪同',
        userName: '王**',
        appointmentTime: '2024-12-13 09:00',
        status: 'pending',
        amount: 180,
      },
      {
        id: 'order-2',
        serviceName: '检查陪同',
        userName: '李**',
        appointmentTime: '2024-12-13 14:00',
        status: 'accepted',
        amount: 220,
      },
    ],
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
        serviceName: '门诊陪同',
        hospitalName: '北京协和医院',
        appointmentTime: '2024-12-14 09:00',
        estimatedEarnings: 180,
        distance: 2.5,
        createdAt: '2024-12-13 08:00',
      },
      {
        id: 'pool-order-2',
        serviceName: '检查陪同',
        hospitalName: '北京儿童医院',
        appointmentTime: '2024-12-14 10:30',
        estimatedEarnings: 220,
        distance: 3.8,
        createdAt: '2024-12-13 07:30',
      },
      {
        id: 'pool-order-3',
        serviceName: '取药代办',
        hospitalName: '北京大学第一医院',
        appointmentTime: '2024-12-14 14:00',
        estimatedEarnings: 100,
        distance: 1.2,
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
    items: [
      {
        id: 'earning-1',
        orderId: 'order-101',
        serviceName: '门诊陪同',
        amount: 180,
        commission: 18,
        netAmount: 162,
        status: 'settled',
        settledAt: '2024-12-12',
        createdAt: '2024-12-10',
      },
      {
        id: 'earning-2',
        orderId: 'order-102',
        serviceName: '检查陪同',
        amount: 220,
        commission: 22,
        netAmount: 198,
        status: 'settled',
        settledAt: '2024-12-11',
        createdAt: '2024-12-09',
      },
      {
        id: 'earning-3',
        orderId: 'order-103',
        serviceName: '取药代办',
        amount: 100,
        commission: 10,
        netAmount: 90,
        status: 'pending',
        createdAt: '2024-12-13',
      },
    ],
    total: 3,
    hasMore: false,
  }
}

/**
 * Mock 收入统计
 */
export function getMockEarningsStats(): EarningsStats {
  return {
    totalEarnings: 12800,
    pendingEarnings: 1200,
    settledEarnings: 11600,
    thisMonthEarnings: 3500,
    lastMonthEarnings: 4200,
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
    pendingAmount: 1200,
    frozenAmount: 500,
    minWithdrawAmount: 100,
    withdrawMethods: [
      { type: 'alipay', name: '支付宝', account: '138****8888' },
      { type: 'wechat', name: '微信', account: '微信用户***' },
      { type: 'bank', name: '银行卡', account: '****6789', bankName: '中国工商银行' },
    ],
  }
}

/**
 * Mock 提现统计
 */
export function getMockWithdrawStats(): WithdrawStats {
  return {
    totalWithdrawn: 28000,
    thisMonthWithdrawn: 3500,
    lastWithdrawAt: '2024-12-10',
    withdrawRecords: [
      {
        id: 'withdraw-1',
        amount: 1000,
        status: 'completed',
        method: 'alipay',
        createdAt: '2024-12-10 15:30',
        completedAt: '2024-12-10 16:00',
      },
      {
        id: 'withdraw-2',
        amount: 2000,
        status: 'completed',
        method: 'bank',
        createdAt: '2024-12-05 10:00',
        completedAt: '2024-12-06 09:00',
      },
      {
        id: 'withdraw-3',
        amount: 500,
        status: 'pending',
        method: 'wechat',
        createdAt: '2024-12-13 08:00',
      },
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
    serviceName: '门诊陪同',
    serviceType: 'outpatient',
    status: 'accepted',
    userName: '王小明',
    userPhone: '138****8888',
    hospitalName: '北京协和医院',
    departmentName: '内科',
    appointmentTime: '2024-12-14 09:00',
    estimatedDuration: 3,
    amount: 180,
    commission: 18,
    netAmount: 162,
    requirements: '需要帮忙挂号、陪同就诊、取药',
    createdAt: '2024-12-13 08:00',
    acceptedAt: '2024-12-13 08:30',
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
    acceptNewOrders: true,
    serviceAreas: ['北京市朝阳区', '北京市海淀区', '北京市东城区'],
    serviceTypes: ['outpatient', 'checkup', 'pharmacy'],
    workingHours: {
      start: '08:00',
      end: '18:00',
    },
    maxOrdersPerDay: 5,
    notificationSettings: {
      newOrder: true,
      orderUpdate: true,
      systemNotice: true,
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
    items: [],
    total: 0,
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
    pendingAmount: 50000,
    frozenAmount: 10000,
    minWithdrawAmount: 100,
    withdrawMethods: [
      { type: 'bank', name: '银行卡', account: '****6789', bankName: '中国工商银行' },
    ],
  }
}

/**
 * Mock 零余额提现（边界值）
 */
export function getMockWithdrawZeroBalance(): WithdrawInfo {
  return {
    withdrawable: 0,
    pendingAmount: 0,
    frozenAmount: 0,
    minWithdrawAmount: 100,
    withdrawMethods: [
      { type: 'alipay', name: '支付宝', account: '138****8888' },
    ],
  }
}

