/**
 * API 模块统一入口
 * 
 * 从各个子模块导出所有类型和 API 客户端
 */

// 基础模块
export { request, type PaginatedData, type RequestConfig } from './request'

// 认证
export * from './auth'

// 仪表盘
export * from './dashboard'

// 订单
export * from './orders'

// 陪诊员
export * from './escorts'

// 提现管理
export * from './withdrawals'

// 医院
export * from './hospitals'

// 用户 & 就诊人
export * from './users'

// 首页 & 轮播图
export * from './home'

// 医疗（医生、科室库）
export * from './medical'

// 服务（服务、分类、保障、流程、操作规范）
export * from './services'

// 系统配置
export * from './config'

// 营销中心（会员、优惠券、积分、邀请、活动、价格配置）
export * from './marketing'

// 分销中心
export * from './distribution'

// CMS 内容管理
export * from './cms'

// 陪诊员申请
export * from './escort-applications'

// 陪诊员提现记录（Admin）
export * from './admin-withdrawals'
