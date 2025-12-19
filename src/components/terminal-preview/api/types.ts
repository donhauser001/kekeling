/**
 * 终端全局预览器 API 类型定义
 *
 * 本文件包含 API 相关的类型定义：
 * - 服务相关类型
 * - 营销中心类型
 * - 用户资料类型
 * - 陪诊员类型
 * - 工作台类型
 *
 * @see ../types.ts 预览器核心类型定义
 */

// ============================================================================
// 服务相关类型
// ============================================================================

/** 服务列表查询参数 */
export interface ServiceQueryParams {
  categoryId?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: 'default' | 'sales' | 'rating' | 'price-asc' | 'price-desc'
}

/** 服务亮点项 */
export interface ServiceIncludeItem {
  text: string
  icon?: string
}

/** 服务须知项 */
export interface ServiceNoteItem {
  title: string
  content: string
}

/** 服务保障（关联模型） */
export interface ServiceGuarantee {
  id: string
  name: string
  icon: string
  description: string | null
}

/** 自定义字段类型 */
export interface CustomField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'datetime' | 'image'
  required: boolean
  options?: string[]  // select/checkbox/radio 的选项
  placeholder?: string
  maxImages?: number  // 图片类型时，最大上传数量
}

/** 操作规范类型 */
export interface OperationGuide {
  id: string
  title: string
  summary?: string          // 摘要
  content: string           // 富文本内容
  coverImage?: string
  tags?: string[]
  category?: {
    id: string
    name: string
    icon?: string
  }
}

/** 服务详情类型（与后端一致） */
export interface ServiceDetail {
  id: string
  name: string
  description?: string
  content?: string  // 富文本内容
  price: number
  originalPrice?: number | null
  unit?: string
  duration?: string | null
  coverImage?: string | null
  detailImages?: string[]  // 详情图片数组
  orderCount: number
  rating: number
  tags?: string[]
  status: string
  serviceIncludes?: ServiceIncludeItem[]  // 服务亮点
  serviceNotes?: ServiceNoteItem[]  // 服务须知
  guarantees?: ServiceGuarantee[]  // 服务保障（关联）
  workflowId?: string  // 关联流程ID
  workflow?: {  // 关联流程
    id: string
    name: string
    baseDuration: number           // 基础服务时长（分钟）
    overtimeEnabled: boolean       // 是否允许超时加时
    overtimePrice: number | null   // 超时单价
    overtimeUnit: string           // 超时计价单位
    overtimeMax: number | null     // 最大加时时长（分钟）
    overtimeGrace: number          // 宽限时间（分钟）
    steps: Array<{
      id: string
      name: string
      type: string
      sort: number
    }>
  }
  category?: {
    id: string
    name: string
    icon?: string
  }
  // 业务配置字段
  needPatient?: boolean           // 需要填写就诊人
  needHospital?: boolean          // 需要选择医院
  needDepartment?: boolean        // 需要选择科室
  needDoctor?: boolean            // 需要选择医生
  needAppointment?: boolean       // 需要预约时间
  needIdCard?: boolean            // 需要身份证
  needGender?: boolean            // 需要性别
  needEmergencyContact?: boolean  // 需要紧急联系人
  needMedicalRecord?: boolean     // 需要上传病历
  allowPostOrder?: boolean        // 允许先下单后填写信息
  customFields?: CustomField[]    // 自定义字段
  fieldOrder?: string[]           // 字段排序
  builtinFieldsRequired?: Record<string, boolean>  // 内置字段必填配置
  // 陪诊员视角专属字段（仅陪诊员可见）
  commissionRate?: number         // 分成比例 0-100（如 70 表示陪诊员得 70%）
  commissionNote?: string         // 分成说明
  operationGuides?: OperationGuide[]  // 操作规范列表
}

// ============================================================================
// 营销中心类型定义
// ============================================================================

/**
 * 优惠券项
 * 对应接口: GET /marketing/coupons/my
 */
export interface CouponItem {
  id: string
  name: string
  description?: string
  /** 优惠金额 */
  amount: number
  /** 最低消费金额 */
  minAmount: number
  /** 过期时间（格式: YYYY-MM-DD） */
  expireAt: string
  /** 状态 */
  status: 'available' | 'used' | 'expired'
}

/** 优惠券列表响应 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}

/**
 * 会员信息
 * 对应接口: GET /marketing/membership/my
 */
export interface MembershipInfo {
  id: string
  /** 会员等级 */
  level: string
  /** 等级名称 */
  levelName: string
  /** 过期时间 (YYYY-MM-DD) */
  expireAt: string
  /** 积分余额 */
  points: number
}

/**
 * 会员套餐
 * 对应接口: GET /marketing/membership/plans
 */
export interface MembershipPlan {
  id: string
  name: string
  description: string
  /** 价格 */
  price: number
  /** 原价 */
  originalPrice?: number
  /** 有效天数 */
  durationDays: number
  /** 是否推荐 */
  isRecommended?: boolean
}

/**
 * 积分信息
 * 对应接口: GET /marketing/points/my
 */
export interface PointsInfo {
  /** 当前积分余额 */
  balance: number
  /** 累计获得 */
  totalEarned: number
  /** 累计使用 */
  totalUsed: number
  /** 即将过期（30天内） */
  expiringSoon: number
}

/**
 * 积分记录
 * 对应接口: GET /marketing/points/records
 */
export interface PointsRecord {
  id: string
  /** 标题 */
  title: string
  /** 积分变动数量 */
  points: number
  /** 类型: earn=获得, use=使用 */
  type: 'earn' | 'use'
  /** 创建时间 */
  createdAt: string
}

/** 积分记录列表响应 */
export interface PointsRecordsResponse {
  items: PointsRecord[]
  total: number
}

/**
 * 邀请信息
 * 对应接口: GET /marketing/referrals/info
 */
export interface ReferralInfo {
  /** 邀请码 */
  inviteCode: string
  /** 已邀请人数 */
  invitedCount: number
  /** 已获得积分 */
  earnedPoints: number
  /** 待领取积分 */
  pendingPoints: number
  /** 每次邀请奖励积分 */
  rewardPoints: number
}

/**
 * 活动信息
 * 对应接口: GET /marketing/campaigns
 */
export interface Campaign {
  id: string
  /** 活动标题 */
  title: string
  /** 活动描述 */
  description: string
  /** 封面图 */
  coverImage?: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 状态 */
  status: 'upcoming' | 'ongoing' | 'ended'
}

/**
 * 活动详情
 * 对应接口: GET /marketing/campaigns/:id
 */
export interface CampaignDetail extends Campaign {
  /** 活动规则 */
  rules?: string
  /** 活动奖励列表 */
  rewards?: string[]
}

/**
 * 可领取优惠券
 * 对应接口: GET /marketing/coupons/available
 */
export interface AvailableCoupon {
  id: string
  name: string
  description?: string
  /** 优惠金额 */
  amount: number
  /** 最低消费金额 */
  minAmount: number
  /** 剩余可领数量 */
  remaining: number
}

// ============================================================================
// 用户资料类型
// ============================================================================

/** 用户资料 */
export interface UserProfile {
  id: string
  nickname?: string | null
  avatar?: string | null
  phone?: string | null
  gender?: string | null
  birthday?: string | null
}

/** 陪诊员资料 */
export interface EscortProfile {
  id: string
  name: string
  avatar?: string | null
  phone: string
  gender: string
  introduction?: string | null
  levelCode?: string | null
  rating: number
  orderCount: number
}

// ============================================================================
// 陪诊员公开信息类型（用户端可查看）
// ⚠️ /escorts 是公开接口，允许 userToken 或匿名访问
// ============================================================================

/** 陪诊员列表项 */
export interface EscortListItem {
  id: string
  name: string
  avatar?: string
  level?: string
  serviceCount: number
  rating: number
  tags?: string[]
  status: 'available' | 'offline'
}

/** 陪诊员详情 */
export interface EscortDetail extends EscortListItem {
  bio?: string
  experience: number
  serviceAreas?: string[]
}

// ============================================================================
// 工作台类型（陪诊员端，需 escortToken）
// ============================================================================

/** 陪诊员接单状态 */
export type EscortOnlineStatus = 'online' | 'busy' | 'rest' | 'offline'

/** 收入趋势数据点 */
export interface IncomeTrendItem {
  /** 日期标签（如：周一、12/10） */
  label: string
  /** 收入金额 */
  amount: number
}

/** 工作台统计数据 */
export interface WorkbenchStats {
  /** 待接单数 */
  pendingOrders: number
  /** 进行中订单数 */
  ongoingOrders: number
  /** 已完成订单数 */
  completedOrders: number
  /** 今日收入 */
  todayIncome: number
  /** 本月收入 */
  monthIncome: number
  /** 可提现金额 */
  withdrawable: number
  /** 接单状态 */
  onlineStatus: EscortOnlineStatus
  /** 近7天收入趋势 */
  incomeTrend?: IncomeTrendItem[]
  /** 陪诊员姓名 */
  escortName?: string
  /** 陪诊员头像 */
  escortAvatar?: string
  /** 陪诊员手机号（脱敏） */
  escortPhone?: string
  /** 认证等级（如：金牌陪诊员） */
  escortLevel?: string
  /** 评分 */
  rating?: number
  /** 服务订单数 */
  orderCount?: number
}

/**
 * 工作台汇总数据
 * 对应接口: GET /escort-app/workbench/summary
 */
export interface WorkbenchSummary {
  /** 今日订单数 */
  todayOrders: number
  /** 本周订单数 */
  weekOrders: number
  /** 本月订单数 */
  monthOrders: number
  /** 累计订单数 */
  totalOrders: number
  /** 今日收入 */
  todayIncome: number
  /** 本周收入 */
  weekIncome: number
  /** 本月收入 */
  monthIncome: number
  /** 累计收入 */
  totalIncome: number
  /** 服务评分（0-5） */
  rating: number
  /** 好评率（0-100） */
  satisfactionRate: number
}

/** 订单池订单项 */
export interface PoolOrderItem {
  id: string
  /** 订单号 */
  orderNo: string
  /** 服务类型 */
  serviceType: string
  /** 服务名称 */
  serviceName: string
  /** 预约时间 */
  appointmentTime: string
  /** 医院名称 */
  hospitalName: string
  /** 科室 */
  department?: string
  /** 订单金额 */
  amount: number
  /** 预计佣金 */
  commission: number
  /** 距离（km） */
  distance?: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 订单池响应
 * 对应接口: GET /escort-app/orders/pool
 */
export interface OrdersPoolResponse {
  items: PoolOrderItem[]
  total: number
  hasMore: boolean
}

/**
 * 我的订单项
 * 对应接口: GET /escort-app/my-orders
 */
export interface MyOrderItem {
  id: string
  /** 订单号 */
  orderNo: string
  /** 服务类型 */
  serviceType: string
  /** 服务名称 */
  serviceName: string
  /** 预约时间 */
  appointmentTime: string
  /** 医院名称 */
  hospitalName: string
  /** 科室 */
  department?: string
  /** 订单金额 */
  amount: number
  /** 预计佣金 */
  commission: number
  /** 订单状态 */
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  /** 创建时间 */
  createdAt: string
  /** 用户名称（脱敏） */
  userName?: string
  /** 用户电话（脱敏） */
  userPhone?: string
}

/**
 * 我的订单响应
 * 对应接口: GET /escort-app/my-orders
 */
export interface MyOrdersResponse {
  items: MyOrderItem[]
  total: number
  hasMore: boolean
}

/** 我的订单查询参数 */
export interface MyOrdersParams {
  /** 订单状态筛选 */
  status?: 'pending' | 'ongoing' | 'completed' | 'cancelled'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 工作台订单详情
 * 对应接口: GET /escort-app/orders/:id
 */
export interface WorkbenchOrderDetail {
  id: string
  orderNo: string
  /** 订单状态 */
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  statusText: string
  /** 服务信息 */
  service: {
    id: string
    name: string
    type: string
    /** 服务时长（分钟） */
    duration?: number
  }
  /** 预约信息 */
  appointment: {
    date: string
    time: string
    hospitalName: string
    department?: string
    address?: string
  }
  /** 用户信息 */
  user: {
    id: string
    name: string
    phone: string
    /** 脱敏手机号 */
    maskedPhone: string
    avatar?: string
  }
  /** 金额信息 */
  payment: {
    amount: number
    commission: number
    tip?: number
  }
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 工作台设置
 * 对应接口: GET /escort-app/workbench/settings
 * 通道: escortRequest（⚠️ 必须 escortToken）
 */
export interface WorkbenchSettings {
  /** 是否在线（接单开关） */
  isOnline: boolean
  /** 自动接单 */
  autoAcceptOrders: boolean
  /** 接单偏好 */
  preferences: {
    /** 服务类型偏好 */
    serviceTypes: string[]
    /** 服务医院 */
    serviceAreas: string[]
    /** 擅长科室 */
    departments?: string[]
    /** 最大接单距离（km） */
    maxDistance?: number
    /** 工作时间段 */
    workingHours?: {
      start: string // HH:mm
      end: string   // HH:mm
    }
  }
  /** 通知设置 */
  notifications: {
    /** 新订单通知 */
    newOrder: boolean
    /** 订单状态变更通知 */
    orderStatus: boolean
    /** 系统通知 */
    system: boolean
    /** 营销通知 */
    marketing: boolean
  }
  /** 个人资料 */
  profile: {
    name: string
    avatar?: string
    phone: string
    level: string
    rating: number
  }
}

/** 收入明细项 */
export interface EarningsItem {
  id: string
  /** 类型 */
  type: 'order' | 'bonus' | 'withdraw' | 'refund'
  /** 标题 */
  title: string
  /** 金额（正为收入，负为支出） */
  amount: number
  /** 时间 */
  createdAt: string
  /** 关联订单号 */
  orderNo?: string
}

/**
 * 收入统计响应
 * 对应接口: GET /escort-app/earnings
 */
export interface EarningsResponse {
  /** 可提现余额 */
  balance: number
  /** 累计收入 */
  totalEarned: number
  /** 累计提现 */
  totalWithdrawn: number
  /** 待结算 */
  pendingSettlement: number
  /** 收入明细 */
  items: EarningsItem[]
  hasMore: boolean
}

/** 收入统计记录项 */
export interface EarningsStatsRecord {
  id: string
  /** 收入类型 */
  type: 'order' | 'bonus' | 'withdraw' | 'refund'
  /** 标题 */
  title: string
  /** 金额（正数为收入，负数为支出） */
  amount: number
  /** 订单号 */
  orderNo?: string
  /** 时间 */
  createdAt: string
  /** 状态 */
  status: 'completed' | 'pending' | 'failed'
}

/**
 * 收入统计汇总（用于 WorkbenchEarningsPage 指标卡片）
 * 对应接口: GET /escort-app/earnings/stats
 * 通道: escortRequest
 */
export interface EarningsStats {
  /** 总收入 */
  totalEarnings: number
  /** 本月收入 */
  monthlyEarnings: number
  /** 可提现金额 */
  withdrawable: number
  /** 提现中金额 */
  pendingWithdraw: number
  /** 累计订单数 */
  totalOrders: number
  /** 本月订单数 */
  monthlyOrders: number
  /** 环比增长率（本月订单数相比上月，百分比） */
  monthlyOrdersGrowth?: number
  /** 最近收入记录 */
  recentRecords: EarningsStatsRecord[]
}

/**
 * 提现信息
 * 对应接口: GET /escort-app/withdraw/info
 */
export interface WithdrawInfo {
  /** 可提现金额 */
  withdrawable: number
  /** 最低提现金额 */
  minWithdrawAmount: number
  /** 提现手续费率（0-1） */
  feeRate: number
  /** 预计到账时间（小时） */
  estimatedHours: number
  /** 已绑定银行卡 */
  bankCards: {
    id: string
    bankName: string
    cardNo: string // 仅显示后4位
    isDefault: boolean
  }[]
}

/** 提现账户类型 */
export interface WithdrawAccount {
  id: string
  /** 账户类型 */
  type: 'bank' | 'alipay' | 'wechat'
  /** 账户名称 */
  name: string
  /** 账号信息（脱敏） */
  accountNo: string
  /** 银行名称（仅银行卡） */
  bankName?: string
  /** 是否默认 */
  isDefault: boolean
}

/** 提现记录 */
export interface WithdrawRecord {
  id: string
  /** 提现金额 */
  amount: number
  /** 手续费 */
  fee: number
  /** 实际到账 */
  actualAmount: number
  /** 提现账户名称 */
  accountName: string
  /** 提现时间 */
  createdAt: string
  /** 到账时间 */
  completedAt?: string
  /** 状态 */
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

/**
 * 提现统计汇总（用于 WorkbenchWithdrawPage）
 * 对应接口: GET /escort-app/withdraw/stats
 * 通道: escortRequest
 */
export interface WithdrawStats {
  /** 可提现金额 */
  withdrawable: number
  /** 提现中金额 */
  pendingAmount: number
  /** 最低提现金额 */
  minAmount: number
  /** 单笔最高金额 */
  maxAmount: number
  /** 手续费率（0-1） */
  feeRate: number
  /** 预计到账时间（小时） */
  estimatedHours: number
  /** 今日剩余提现次数 */
  remainingTimes: number
  /** 提现账户列表 */
  accounts: WithdrawAccount[]
  /** 最近提现记录 */
  recentRecords: WithdrawRecord[]
}
