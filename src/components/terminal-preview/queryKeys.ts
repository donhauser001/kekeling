/**
 * 预览器 Query Key 工厂
 * 
 * Step 14.1-B.4: 统一 queryKey 命名规范
 * 格式: ['preview', 模块, 功能, ...params]
 */

// ============================================================================
// 缓存时间配置
// ============================================================================

/**
 * React Query 缓存策略配置
 * 
 * | 数据类型 | staleTime | gcTime | 适用场景 |
 * |---------|-----------|--------|---------|
 * | 配置类 | 5min | 30min | themeSettings, homeSettings |
 * | 列表类 | 1min | 10min | escorts, campaigns, coupons |
 * | 详情类 | 30s | 5min | escort-detail, campaign-detail |
 * | 统计类 | 30s | 2min | workbench stats, distribution stats |
 * | 记录类 | 1min | 5min | earnings, records, withdraw |
 */
export const QUERY_CACHE_CONFIG = {
  config: {
    staleTime: 5 * 60 * 1000,  // 5 分钟
    gcTime: 30 * 60 * 1000,   // 30 分钟
  },
  list: {
    staleTime: 1 * 60 * 1000,  // 1 分钟
    gcTime: 10 * 60 * 1000,   // 10 分钟
  },
  detail: {
    staleTime: 30 * 1000,      // 30 秒
    gcTime: 5 * 60 * 1000,    // 5 分钟
  },
  stats: {
    staleTime: 30 * 1000,      // 30 秒
    gcTime: 2 * 60 * 1000,    // 2 分钟
  },
  records: {
    staleTime: 1 * 60 * 1000,  // 1 分钟
    gcTime: 5 * 60 * 1000,    // 5 分钟
  },
} as const

// ============================================================================
// Query Key 工厂
// ============================================================================

export const previewQueryKeys = {
  // 根 key
  all: ['preview'] as const,
  
  // ==========================================================================
  // 配置
  // ==========================================================================
  config: {
    all: ['preview', 'config'] as const,
    theme: ['preview', 'config', 'theme'] as const,
    home: ['preview', 'config', 'home'] as const,
  },
  
  // ==========================================================================
  // 营销中心
  // ==========================================================================
  marketing: {
    all: ['preview', 'marketing'] as const,
    membership: ['preview', 'marketing', 'membership'] as const,
    membershipPlans: ['preview', 'marketing', 'membership-plans'] as const,
    points: ['preview', 'marketing', 'points'] as const,
    pointsRecords: ['preview', 'marketing', 'points-records'] as const,
    referrals: ['preview', 'marketing', 'referrals'] as const,
    coupons: ['preview', 'marketing', 'coupons'] as const,
    couponsAvailable: ['preview', 'marketing', 'coupons-available'] as const,
    campaigns: ['preview', 'marketing', 'campaigns'] as const,
    campaignDetail: (id: string) => ['preview', 'marketing', 'campaign', id] as const,
  },
  
  // ==========================================================================
  // 陪诊员
  // ==========================================================================
  escort: {
    all: ['preview', 'escort'] as const,
    list: ['preview', 'escort', 'list'] as const,
    detail: (id: string) => ['preview', 'escort', 'detail', id] as const,
  },
  
  // ==========================================================================
  // 工作台（需要 escortToken）
  // ==========================================================================
  workbench: {
    all: ['preview', 'workbench'] as const,
    stats: ['preview', 'workbench', 'stats'] as const,
    summary: ['preview', 'workbench', 'summary'] as const,
    settings: ['preview', 'workbench', 'settings'] as const,
    ordersPool: ['preview', 'workbench', 'orders-pool'] as const,
    orderDetail: (id: string) => ['preview', 'workbench', 'order', id] as const,
    earnings: ['preview', 'workbench', 'earnings'] as const,
    earningsStats: ['preview', 'workbench', 'earnings-stats'] as const,
    withdraw: ['preview', 'workbench', 'withdraw'] as const,
    withdrawStats: ['preview', 'workbench', 'withdraw-stats'] as const,
  },
  
  // ==========================================================================
  // 分销中心（需要 escortToken）
  // ==========================================================================
  distribution: {
    all: ['preview', 'distribution'] as const,
    stats: ['preview', 'distribution', 'stats'] as const,
    members: (params?: { relation?: 'direct' | 'indirect' }) =>
      ['preview', 'distribution', 'members', params] as const,
    records: (params?: { range?: '7d' | '30d' | 'all'; status?: 'pending' | 'settled' }) =>
      ['preview', 'distribution', 'records', params] as const,
    invite: ['preview', 'distribution', 'invite'] as const,
    promotion: ['preview', 'distribution', 'promotion'] as const,
  },
  
  // ==========================================================================
  // 首页
  // ==========================================================================
  home: {
    all: ['preview', 'home'] as const,
    banners: (area?: string) => ['preview', 'home', 'banners', area] as const,
    stats: ['preview', 'home', 'stats'] as const,
    services: ['preview', 'home', 'services'] as const,
    recommendations: ['preview', 'home', 'recommendations'] as const,
  },
  
  // ==========================================================================
  // 服务
  // ==========================================================================
  services: {
    all: ['preview', 'services'] as const,
    list: (params?: { type?: string; category?: string }) =>
      ['preview', 'services', 'list', params] as const,
    detail: (id: string) => ['preview', 'services', 'detail', id] as const,
    categories: ['preview', 'services', 'categories'] as const,
  },
} as const

// ============================================================================
// 类型导出
// ============================================================================

export type PreviewQueryKeys = typeof previewQueryKeys

