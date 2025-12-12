/**
 * 分销中心 Mock 数据
 * 
 * 包含：分销统计、团队成员、分润记录、邀请、晋升
 * 迁移自: api.ts
 */

import type {
  DistributionStats,
  DistributionMembersParams,
  DistributionMembersResponse,
  DistributionRecordsParams,
  DistributionRecordsResponse,
  DistributionInvite,
  DistributionPromotion,
} from '../types'

// ============================================================================
// 分销统计 Mock
// ============================================================================

/**
 * Mock 分销统计数据
 */
export function getMockDistributionStats(): DistributionStats {
  return {
    totalDistribution: 12580.5,
    pendingDistribution: 1200,
    settledDistribution: 11380.5,
    directMembers: 28,
    indirectMembers: 156,
    currentLevel: 'gold',
    nextLevel: 'platinum',
    promotionProgress: 68,
  }
}

/**
 * Mock 零进度分销统计（边界值）
 * promotionProgress: 0 表示适用晋升但没有进度
 */
export function getMockDistributionStatsZeroProgress(): DistributionStats {
  return {
    totalDistribution: 500,
    pendingDistribution: 100,
    settledDistribution: 400,
    directMembers: 2,
    indirectMembers: 0,
    currentLevel: 'basic',
    nextLevel: 'silver',
    promotionProgress: 0,
  }
}

/**
 * Mock 已达最高等级（边界值）
 * promotionProgress: undefined 表示不适用晋升
 */
export function getMockDistributionStatsMaxLevel(): DistributionStats {
  return {
    totalDistribution: 150000,
    pendingDistribution: 5000,
    settledDistribution: 145000,
    directMembers: 200,
    indirectMembers: 1500,
    currentLevel: 'diamond',
    nextLevel: undefined,
    promotionProgress: undefined,
  }
}

// ============================================================================
// 团队成员 Mock
// ============================================================================

/**
 * Mock 分销团队成员列表
 */
export function getMockDistributionMembers(params?: DistributionMembersParams): DistributionMembersResponse {
  const relation = params?.relation || 'direct'
  
  if (relation === 'direct') {
    return {
      items: [
        {
          id: 'member-1',
          name: '张三',
          avatar: 'https://picsum.photos/100/100?random=10',
          level: 'silver',
          joinedAt: '2024-11-15',
          totalContribution: 580,
          lastOrderAt: '2024-12-12',
        },
        {
          id: 'member-2',
          name: '李四',
          avatar: 'https://picsum.photos/100/100?random=11',
          level: 'gold',
          joinedAt: '2024-10-20',
          totalContribution: 1280,
          lastOrderAt: '2024-12-10',
        },
        {
          id: 'member-3',
          name: '王五',
          avatar: 'https://picsum.photos/100/100?random=12',
          level: 'basic',
          joinedAt: '2024-12-01',
          totalContribution: 120,
          lastOrderAt: '2024-12-08',
        },
      ],
      total: 28,
      hasMore: true,
    }
  }
  
  // 间接成员
  return {
    items: [
      {
        id: 'member-i1',
        name: '赵六',
        avatar: 'https://picsum.photos/100/100?random=20',
        level: 'basic',
        joinedAt: '2024-11-20',
        totalContribution: 80,
        inviterName: '张三',
      },
      {
        id: 'member-i2',
        name: '钱七',
        avatar: 'https://picsum.photos/100/100?random=21',
        level: 'silver',
        joinedAt: '2024-11-25',
        totalContribution: 320,
        inviterName: '李四',
      },
    ],
    total: 156,
    hasMore: true,
  }
}

/**
 * Mock 空团队成员列表（边界值）
 */
export function getMockDistributionMembersEmpty(): DistributionMembersResponse {
  return {
    items: [],
    total: 0,
    hasMore: false,
  }
}

// ============================================================================
// 分润记录 Mock
// ============================================================================

/**
 * Mock 分润记录列表
 */
export function getMockDistributionRecords(params?: DistributionRecordsParams): DistributionRecordsResponse {
  const status = params?.status
  
  const allRecords = [
    {
      id: 'record-d1',
      orderId: 'order-201',
      memberName: '张三',
      serviceName: '门诊陪同',
      orderAmount: 200,
      distributionAmount: 20,
      rate: 10,
      status: 'settled' as const,
      settledAt: '2024-12-12',
      createdAt: '2024-12-10',
    },
    {
      id: 'record-d2',
      orderId: 'order-202',
      memberName: '李四',
      serviceName: '检查陪同',
      orderAmount: 300,
      distributionAmount: 30,
      rate: 10,
      status: 'settled' as const,
      settledAt: '2024-12-11',
      createdAt: '2024-12-09',
    },
    {
      id: 'record-d3',
      orderId: 'order-203',
      memberName: '王五',
      serviceName: '取药代办',
      orderAmount: 100,
      distributionAmount: 10,
      rate: 10,
      status: 'pending' as const,
      createdAt: '2024-12-13',
    },
  ]
  
  const filteredRecords = status 
    ? allRecords.filter(r => r.status === status)
    : allRecords
  
  return {
    items: filteredRecords,
    total: filteredRecords.length,
    hasMore: false,
  }
}

/**
 * Mock 空分润记录（边界值）
 */
export function getMockDistributionRecordsEmpty(): DistributionRecordsResponse {
  return {
    items: [],
    total: 0,
    hasMore: false,
  }
}

// ============================================================================
// 邀请信息 Mock
// ============================================================================

/**
 * Mock 分销邀请信息
 */
export function getMockDistributionInvite(): DistributionInvite {
  return {
    inviteCode: 'DIST2024ABC',
    inviteUrl: 'https://example.com/invite/DIST2024ABC',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DIST2024ABC',
    inviteReward: 50,
    inviteRules: [
      '邀请好友成为分销员，获得50元现金奖励',
      '好友完成首单后奖励自动发放',
      '无邀请上限，多邀多得',
    ],
  }
}

// ============================================================================
// 晋升信息 Mock
// ============================================================================

/**
 * Mock 分销晋升信息
 */
export function getMockDistributionPromotion(): DistributionPromotion {
  return {
    currentLevel: 'gold',
    currentLevelName: '黄金分销员',
    nextLevel: 'platinum',
    nextLevelName: '铂金分销员',
    promotionProgress: 68,
    promotionConditions: [
      { name: '累计分润金额', current: 12580, target: 20000, unit: '元' },
      { name: '直属成员数', current: 28, target: 50, unit: '人' },
      { name: '本月活跃成员', current: 15, target: 20, unit: '人' },
    ],
    nextLevelBenefits: [
      '分润比例提升至15%',
      '优先获得新订单推送',
      '专属客服支持',
    ],
  }
}

/**
 * Mock 最高等级晋升信息（边界值）
 */
export function getMockDistributionPromotionMaxLevel(): DistributionPromotion {
  return {
    currentLevel: 'diamond',
    currentLevelName: '钻石分销员',
    nextLevel: undefined,
    nextLevelName: undefined,
    promotionProgress: undefined,
    promotionConditions: [],
    nextLevelBenefits: [],
    isMaxLevel: true,
  }
}

/**
 * Mock 零进度晋升信息（边界值）
 */
export function getMockDistributionPromotionZeroProgress(): DistributionPromotion {
  return {
    currentLevel: 'basic',
    currentLevelName: '普通分销员',
    nextLevel: 'silver',
    nextLevelName: '白银分销员',
    promotionProgress: 0,
    promotionConditions: [
      { name: '累计分润金额', current: 0, target: 1000, unit: '元' },
      { name: '直属成员数', current: 0, target: 5, unit: '人' },
    ],
    nextLevelBenefits: [
      '分润比例提升至8%',
      '获得团队管理权限',
    ],
  }
}

