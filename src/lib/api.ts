/**
 * 科科灵管理后台 API 客户端
 *
 * ⚠️ 本文件是兼容层，实际代码已拆分到 api/ 目录下
 *
 * 模块结构：
 * - api/request.ts      - 基础请求函数
 * - api/auth.ts         - 认证 API
 * - api/dashboard.ts    - 仪表盘 API
 * - api/orders.ts       - 订单 API
 * - api/escorts.ts      - 陪诊员相关 API（人员、等级、标签）
 * - api/withdrawals.ts  - 提现管理 API
 * - api/hospitals.ts    - 医院 API
 * - api/users.ts        - 用户 & 就诊人 API
 * - api/home.ts         - 首页 & 轮播图 API
 * - api/medical.ts      - 医疗 API（医生、科室库）
 * - api/services.ts     - 服务 API（服务、分类、保障、流程、操作规范）
 * - api/config.ts       - 系统配置 API
 * - api/marketing.ts    - 营销中心 API（会员、优惠券、积分、邀请、活动、价格配置）
 * - api/distribution.ts - 分销中心 API
 * - api/cms.ts          - CMS 内容管理 API
 * - api/escort-applications.ts - 陪诊员申请 API
 * - api/admin-withdrawals.ts   - 陪诊员提现记录 API（Admin）
 *
 * 原始文件备份: api.ts.backup
 */

export * from './api/index'
