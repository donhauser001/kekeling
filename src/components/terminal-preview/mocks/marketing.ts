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
} from '../types'

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
      durationDays: 30,
    },
    {
      id: 'plan-2',
      name: '季度会员',
      description: '超值推荐',
      price: 79,
      originalPrice: 117,
      durationDays: 90,
      isRecommended: true,
    },
    {
      id: 'plan-3',
      name: '年度会员',
      description: '最划算的选择',
      price: 268,
      originalPrice: 468,
      durationDays: 365,
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
    items: [
      {
        id: 'record-1',
        title: '每日签到',
        points: 10,
        type: 'earn',
        createdAt: '2024-12-12 09:00',
      },
      {
        id: 'record-2',
        title: '完成订单奖励',
        points: 50,
        type: 'earn',
        createdAt: '2024-12-11 15:30',
      },
      {
        id: 'record-3',
        title: '兑换优惠券',
        points: 100,
        type: 'use',
        createdAt: '2024-12-10 12:00',
      },
      {
        id: 'record-4',
        title: '邀请好友奖励',
        points: 200,
        type: 'earn',
        createdAt: '2024-12-09 18:00',
      },
      {
        id: 'record-5',
        title: '抵扣订单',
        points: 50,
        type: 'use',
        createdAt: '2024-12-08 10:30',
      },
    ],
    total: 5,
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
    totalInvited: 15,
    totalReward: 380,
    pendingReward: 50,
    rules: [
      '邀请好友注册即可获得10积分',
      '好友首次下单，您将获得订单金额5%的现金奖励',
      '奖励将在好友完成订单后7天内发放',
    ],
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
      title: '新用户专享',
      subtitle: '首单立减20元',
      description: '新用户首次下单即可享受20元优惠',
      imageUrl: 'https://picsum.photos/400/200?random=1',
      startAt: '2024-12-01',
      endAt: '2024-12-31',
      status: 'active',
    },
    {
      id: 'campaign-2',
      title: '会员专属',
      subtitle: '会员积分翻倍',
      description: '活动期间会员下单积分翻倍',
      imageUrl: 'https://picsum.photos/400/200?random=2',
      startAt: '2024-12-01',
      endAt: '2024-12-31',
      status: 'active',
    },
    {
      id: 'campaign-3',
      title: '邀请有礼',
      subtitle: '邀请好友得现金',
      description: '邀请好友注册可获得现金奖励',
      imageUrl: 'https://picsum.photos/400/200?random=3',
      startAt: '2024-11-01',
      endAt: '2024-11-30',
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
    title: '新用户专享活动',
    subtitle: '首单立减20元',
    description: '新用户首次下单即可享受20元优惠，活动期间不限次数',
    imageUrl: 'https://picsum.photos/400/200?random=1',
    startAt: '2024-12-01',
    endAt: '2024-12-31',
    status: 'active',
    content: `
## 活动规则

1. 活动仅限新注册用户参与
2. 每位用户限享受一次优惠
3. 优惠不可与其他活动叠加使用
4. 最终解释权归平台所有

## 参与方式

1. 下载并注册APP
2. 选择服务并下单
3. 结算时自动减免20元
    `,
    rules: [
      '活动仅限新注册用户参与',
      '每位用户限享受一次优惠',
      '优惠不可与其他活动叠加使用',
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
      type: 'discount',
      value: 20,
      minAmount: 100,
      description: '满100减20',
      validFrom: '2024-12-01',
      validTo: '2024-12-31',
      isLimited: true,
      remaining: 50,
    },
    {
      id: 'coupon-available-2',
      name: '会员折扣券',
      type: 'percent',
      value: 15,
      minAmount: 0,
      description: '全场8.5折',
      validFrom: '2024-12-01',
      validTo: '2024-12-31',
      isLimited: false,
    },
    {
      id: 'coupon-available-3',
      name: '限时特惠券',
      type: 'discount',
      value: 50,
      minAmount: 200,
      description: '满200减50',
      validFrom: '2024-12-10',
      validTo: '2024-12-15',
      isLimited: true,
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
        type: 'discount',
        value: 20,
        minAmount: 100,
        description: '满100减20，仅限新用户使用',
        validFrom: '2024-12-01',
        validTo: '2024-12-31',
        status: 'available',
      },
      {
        id: 'coupon-2',
        name: '会员折扣券',
        type: 'percent',
        value: 15,
        minAmount: 0,
        description: '全场8.5折',
        validFrom: '2024-12-01',
        validTo: '2024-12-31',
        status: 'available',
      },
      {
        id: 'coupon-3',
        name: '满减优惠券',
        type: 'discount',
        value: 50,
        minAmount: 200,
        description: '满200减50',
        validFrom: '2024-11-01',
        validTo: '2024-11-30',
        status: 'expired',
      },
      {
        id: 'coupon-4',
        name: '限时特惠券',
        type: 'discount',
        value: 30,
        minAmount: 150,
        description: '满150减30',
        validFrom: '2024-12-01',
        validTo: '2024-12-15',
        status: 'used',
        usedAt: '2024-12-10',
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
    { id: 'escort-1', name: '张护士', avatar: 'https://picsum.photos/100/100?random=1', rating: 4.9, orderCount: 128, specialty: '儿童陪诊' },
    { id: 'escort-2', name: '李医生', avatar: 'https://picsum.photos/100/100?random=2', rating: 4.8, orderCount: 256, specialty: '老年陪诊' },
    { id: 'escort-3', name: '王护师', avatar: 'https://picsum.photos/100/100?random=3', rating: 4.7, orderCount: 89, specialty: '产检陪诊' },
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
    orderCount: 128,
    specialty: '儿童陪诊',
    bio: '从业8年，专注儿童陪诊服务，熟悉各大儿童医院就诊流程',
    hospital: '北京儿童医院',
    services: ['门诊陪同', '检查陪同', '取药代办'],
    reviews: [
      { id: 'review-1', userName: '王**', rating: 5, content: '非常专业，孩子很喜欢', createdAt: '2024-12-10' },
      { id: 'review-2', userName: '李**', rating: 5, content: '服务周到，省心省力', createdAt: '2024-12-08' },
    ],
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
    items: [],
    total: 0,
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

