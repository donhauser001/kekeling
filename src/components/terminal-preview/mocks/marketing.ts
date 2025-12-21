/**
 * 营销中心 Mock 数据
 * 
 * 包含：会员、积分、优惠券、邀请奖励、活动、陪诊员列表
 * 迁移自: api.ts
 */

import type {
  PointsInfo,
  PointsRecordsResponse,
  ReferralInfo,
  Campaign,
  CampaignDetail,
  AvailableCoupon,
  CouponsResponse,
  EscortListItem,
  EscortDetail,
} from '../api/types'

// ============================================================================
// 会员相关 Mock
// ============================================================================

export interface MembershipInfo {
  id: string
  level: 'basic' | 'silver' | 'gold' | 'platinum'
  levelName: string
  expireAt: string
  points: number
}

export interface MembershipPlan {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  durationDays: number
  isRecommended?: boolean
}

/**
 * Mock 会员信息
 */
export function getMockMembershipData(): MembershipInfo | null {
  // 模拟 50% 概率已开通会员
  if (Math.random() > 0.5) {
    return {
      id: 'mock-membership-1',
      level: 'gold',
      levelName: '黄金会员',
      expireAt: '2025-06-30',
      points: 1280,
    }
  }
  return null
}

/**
 * Mock 会员套餐列表
 */
export function getMockMembershipPlans(): MembershipPlan[] {
  return [
    {
      id: 'plan-1',
      name: '月度会员',
      description: '适合短期体验',
      price: 29,
      originalPrice: 39,
      duration: 30,
      features: ['基础权益', '专属客服'],
    },
    {
      id: 'plan-2',
      name: '季度会员',
      description: '超值推荐',
      price: 79,
      originalPrice: 117,
      duration: 90,
      recommended: true,
      features: ['全部权益', '专属折扣', '积分加倍'],
    },
    {
      id: 'plan-3',
      name: '年度会员',
      description: '最划算的选择',
      price: 268,
      originalPrice: 468,
      duration: 365,
      features: ['全部权益', '专属折扣', '积分双倍', '优先预约'],
    },
  ]
}

// ============================================================================
// 积分相关 Mock
// ============================================================================

/**
 * Mock 积分信息
 */
export function getMockPointsData(): PointsInfo {
  return {
    balance: 1280,
    totalEarned: 2500,
    totalUsed: 1220,
    expiringSoon: 100,
  }
}

/**
 * Mock 积分记录
 */
export function getMockPointsRecords(): PointsRecordsResponse {
  return {
    data: [
      {
        id: 'record-1',
        points: 10,
        balance: 1280,
        type: 'earn',
        source: 'daily_checkin',
        description: '每日签到',
        createdAt: '2024-12-12T09:00:00Z',
      },
      {
        id: 'record-2',
        points: 50,
        balance: 1270,
        type: 'earn',
        source: 'order_complete',
        description: '完成订单奖励',
        createdAt: '2024-12-11T15:30:00Z',
      },
      {
        id: 'record-3',
        points: -100,
        balance: 1220,
        type: 'use',
        source: 'coupon_exchange',
        description: '兑换优惠券',
        createdAt: '2024-12-10T12:00:00Z',
      },
      {
        id: 'record-4',
        points: 200,
        balance: 1320,
        type: 'earn',
        source: 'referral_reward',
        description: '邀请好友奖励',
        createdAt: '2024-12-09T18:00:00Z',
      },
      {
        id: 'record-5',
        points: -50,
        balance: 1120,
        type: 'use',
        source: 'order_consume',
        description: '抵扣订单',
        createdAt: '2024-12-08T10:30:00Z',
      },
    ],
    total: 5,
    page: 1,
    pageSize: 20,
  }
}

// ============================================================================
// 邀请奖励相关 Mock
// ============================================================================

/**
 * Mock 邀请奖励信息
 */
export function getMockReferralInfo(): ReferralInfo {
  return {
    inviteCode: 'ABC123XY',
    invitedCount: 15,
    earnedPoints: 380,
    pendingPoints: 50,
    rewardPoints: 10,
  }
}

// ============================================================================
// 活动相关 Mock
// ============================================================================

/**
 * Mock 活动列表
 */
export function getMockCampaigns(): Campaign[] {
  return [
    {
      id: 'campaign-1',
      title: '新用户专享 - 首单立减20元',
      description: '新用户首次下单即可享受20元优惠',
      coverImage: 'https://picsum.photos/400/200?random=1',
      startTime: '2024-12-01',
      endTime: '2024-12-31',
      status: 'ongoing',
    },
    {
      id: 'campaign-2',
      title: '会员专属 - 会员积分翻倍',
      description: '活动期间会员下单积分翻倍',
      coverImage: 'https://picsum.photos/400/200?random=2',
      startTime: '2024-12-01',
      endTime: '2024-12-31',
      status: 'ongoing',
    },
    {
      id: 'campaign-3',
      title: '邀请有礼 - 邀请好友得现金',
      description: '邀请好友注册可获得现金奖励',
      coverImage: 'https://picsum.photos/400/200?random=3',
      startTime: '2024-11-01',
      endTime: '2024-11-30',
      status: 'ended',
    },
  ]
}

/**
 * Mock 活动详情
 */
export function getMockCampaignDetail(id: string): CampaignDetail {
  return {
    id,
    title: '新用户专享活动 - 首单立减20元',
    description: '新用户首次下单即可享受20元优惠，活动期间不限次数',
    coverImage: 'https://picsum.photos/400/200?random=1',
    startTime: '2024-12-01',
    endTime: '2024-12-31',
    status: 'ongoing',
    rules: `## 活动规则

1. 活动仅限新注册用户参与
2. 每位用户限享受一次优惠
3. 优惠不可与其他活动叠加使用
4. 最终解释权归平台所有

## 参与方式

1. 下载并注册APP
2. 选择服务并下单
3. 结算时自动减免20元`,
    rewards: [
      '首单立减20元',
      '额外赠送100积分',
    ],
  }
}

// ============================================================================
// 优惠券相关 Mock
// ============================================================================

/**
 * Mock 可领取优惠券列表
 */
export function getMockAvailableCoupons(): AvailableCoupon[] {
  return [
    {
      id: 'coupon-available-1',
      name: '新人专享券',
      description: '满100减20',
      amount: 20,
      minAmount: 100,
      remaining: 50,
    },
    {
      id: 'coupon-available-2',
      name: '会员折扣券',
      description: '全场8.5折',
      amount: 15,
      minAmount: 0,
      remaining: 999,
    },
    {
      id: 'coupon-available-3',
      name: '限时特惠券',
      description: '满200减50',
      amount: 50,
      minAmount: 200,
      remaining: 10,
    },
  ]
}

/**
 * Mock 用户优惠券列表
 */
export function getMockCouponsData(): CouponsResponse {
  return {
    items: [
      {
        id: 'coupon-1',
        name: '新人专享券',
        amount: 20,
        minAmount: 100,
        description: '满100减20，仅限新用户使用',
        expireAt: '2024-12-31',
        status: 'available',
      },
      {
        id: 'coupon-2',
        name: '会员折扣券',
        amount: 15,
        minAmount: 0,
        description: '全场8.5折',
        expireAt: '2024-12-31',
        status: 'available',
      },
      {
        id: 'coupon-3',
        name: '满减优惠券',
        amount: 50,
        minAmount: 200,
        description: '满200减50',
        expireAt: '2024-11-30',
        status: 'expired',
      },
      {
        id: 'coupon-4',
        name: '限时特惠券',
        amount: 30,
        minAmount: 150,
        description: '满150减30',
        expireAt: '2024-12-15',
        status: 'used',
      },
    ],
    total: 4,
  }
}

// ============================================================================
// 陪诊员列表相关 Mock
// ============================================================================

/**
 * Mock 陪诊员列表
 */
export function getMockEscorts(): EscortListItem[] {
  return [
    { id: 'escort-1', name: '张护士', avatar: 'https://picsum.photos/100/100?random=1', rating: 4.9, serviceCount: 128, tags: ['儿童陪诊'], status: 'available' },
    { id: 'escort-2', name: '李医生', avatar: 'https://picsum.photos/100/100?random=2', rating: 4.8, serviceCount: 256, tags: ['老年陪诊'], status: 'available' },
    { id: 'escort-3', name: '王护师', avatar: 'https://picsum.photos/100/100?random=3', rating: 4.7, serviceCount: 89, tags: ['产检陪诊'], status: 'available' },
  ]
}

/**
 * Mock 陪诊员详情
 */
export function getMockEscortDetail(id: string): EscortDetail {
  return {
    id,
    name: '张护士',
    avatar: 'https://picsum.photos/200/200?random=1',
    rating: 4.9,
    serviceCount: 128,
    tags: ['儿童陪诊'],
    status: 'available',
    bio: '从业8年，专注儿童陪诊服务，熟悉各大儿童医院就诊流程',
    experience: 8,
    serviceAreas: ['北京儿童医院', '首都儿科研究所'],
  }
}

// ============================================================================
// 边界值变体
// ============================================================================

/**
 * Mock 空积分记录（边界值）
 */
export function getMockPointsRecordsEmpty(): PointsRecordsResponse {
  return {
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  }
}

/**
 * Mock 空优惠券列表（边界值）
 */
export function getMockCouponsEmpty(): CouponsResponse {
  return {
    items: [],
    total: 0,
  }
}

