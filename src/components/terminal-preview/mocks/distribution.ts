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
    totalTeamSize: 184,
    directCount: 28,
    indirectCount: 156,
    totalDistribution: 12580.5,
    monthlyDistribution: 1200,
    pendingDistribution: 1200,
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
    totalTeamSize: 2,
    directCount: 2,
    indirectCount: 0,
    totalDistribution: 500,
    monthlyDistribution: 100,
    pendingDistribution: 100,
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
    totalTeamSize: 1700,
    directCount: 200,
    indirectCount: 1500,
    totalDistribution: 150000,
    monthlyDistribution: 5000,
    pendingDistribution: 5000,
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
          phone: '138****8888',
          level: 'silver',
          relation: 'direct' as const,
          joinedAt: '2024-11-15',
          totalOrders: 5,
          totalDistribution: 580,
        },
        {
          id: 'member-2',
          name: '李四',
          avatar: 'https://picsum.photos/100/100?random=11',
          phone: '139****6666',
          level: 'gold',
          relation: 'direct' as const,
          joinedAt: '2024-10-20',
          totalOrders: 12,
          totalDistribution: 1280,
        },
        {
          id: 'member-3',
          name: '王五',
          avatar: 'https://picsum.photos/100/100?random=12',
          phone: '137****5555',
          level: 'basic',
          relation: 'direct' as const,
          joinedAt: '2024-12-01',
          totalOrders: 2,
          totalDistribution: 120,
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
        phone: '136****4444',
        level: 'basic',
        relation: 'indirect' as const,
        joinedAt: '2024-11-20',
        totalOrders: 1,
        totalDistribution: 80,
      },
      {
        id: 'member-i2',
        name: '钱七',
        avatar: 'https://picsum.photos/100/100?random=21',
        phone: '135****3333',
        level: 'silver',
        relation: 'indirect' as const,
        joinedAt: '2024-11-25',
        totalOrders: 4,
        totalDistribution: 320,
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

  const allRecords: DistributionRecordsResponse['items'] = [
    {
      id: 'record-d1',
      type: 'order',
      title: '门诊陪同订单分润',
      amount: 20,
      status: 'settled',
      sourceEscortName: '张三',
      orderNo: 'ORD-2024-201',
      createdAt: '2024-12-10',
      settledAt: '2024-12-12',
    },
    {
      id: 'record-d2',
      type: 'order',
      title: '检查陪同订单分润',
      amount: 30,
      status: 'settled',
      sourceEscortName: '李四',
      orderNo: 'ORD-2024-202',
      createdAt: '2024-12-09',
      settledAt: '2024-12-11',
    },
    {
      id: 'record-d3',
      type: 'order',
      title: '取药代办订单分润',
      amount: 10,
      status: 'pending',
      sourceEscortName: '王五',
      orderNo: 'ORD-2024-203',
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
    inviteLink: 'https://example.com/invite/DIST2024ABC',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DIST2024ABC',
    totalInvited: 28,
    rewardPerInvite: 50,
    showInviteStats: true,
  }
}

// 保留邀请规则供 UI 使用
const _inviteRules = [
  '邀请好友成为分销员，获得50元现金奖励',
  '好友完成首单后奖励自动发放',
  '无邀请上限，多邀多得',
]
void _inviteRules

// ============================================================================
// 晋升信息 Mock
// ============================================================================

/**
 * Mock 分销晋升信息
 */
export function getMockDistributionPromotion(): DistributionPromotion {
  return {
    currentLevel: {
      code: 'gold',
      name: '黄金分销员',
      commissionRate: 0.12,
      benefits: ['分润比例12%', '团队管理权限'],
    },
    nextLevel: {
      code: 'platinum',
      name: '铂金分销员',
      commissionRate: 0.15,
      benefits: ['分润比例提升至15%', '优先获得新订单推送', '专属客服支持'],
      requirements: [
        { type: 'team_size', current: 28, required: 50 },
        { type: 'total_orders', current: 156, required: 200 },
        { type: 'monthly_orders', current: 15, required: 20 },
      ],
    },
  }
}

/**
 * Mock 最高等级晋升信息（边界值）
 */
export function getMockDistributionPromotionMaxLevel(): DistributionPromotion {
  return {
    currentLevel: {
      code: 'diamond',
      name: '钻石分销员',
      commissionRate: 0.20,
      benefits: ['最高分润比例20%', '专属VIP客服', '优先推送高价值订单', '团队数据报表'],
    },
    nextLevel: undefined,
  }
}

/**
 * Mock 零进度晋升信息（边界值）
 */
export function getMockDistributionPromotionZeroProgress(): DistributionPromotion {
  return {
    currentLevel: {
      code: 'basic',
      name: '普通分销员',
      commissionRate: 0.05,
      benefits: ['基础分润比例5%'],
    },
    nextLevel: {
      code: 'silver',
      name: '白银分销员',
      commissionRate: 0.08,
      benefits: ['分润比例提升至8%', '获得团队管理权限'],
      requirements: [
        { type: 'team_size', current: 0, required: 5 },
        { type: 'total_orders', current: 0, required: 10 },
      ],
    },
  }
}
