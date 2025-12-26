/**
 * 小程序全局配置
 *
 * 职责：仅配置路由和窗口
 * 禁止：业务逻辑
 *
 * 页面说明：
 * - pages/main/index: 主页面容器（主包入口，仅首页）
 *
 * 分包说明：
 * - packageA: 服务相关页面（服务列表、服务详情、下单）
 * - packageB: 用户相关页面（我的、设置、就诊人、订单等）
 *
 * @see docs/功能模块改造指南/miniapp-分包优化计划-2024-12-23.md
 */
export default defineAppConfig({
  // 主包页面（仅首页入口）
  pages: [
    'pages/main/index',
  ],
  // 分包配置
  subPackages: [
    {
      root: 'packageA',
      name: 'services',
      pages: [
        'pages/services/index',
        'pages/service-detail/index',
        'pages/create-order/index',
        'pages/search/index',           // 搜索页面
      ],
    },
    {
      root: 'packageB',
      name: 'user',
      pages: [
        'pages/profile/index',          // 我的页面
        'pages/user-orders/index',      // 我的订单
        'pages/user-order-detail/index', // 订单详情
        'pages/patients/index',         // 就诊人管理
        'pages/patient-edit/index',     // 就诊人编辑
        'pages/user-settings/index',    // 用户设置
        'pages/membership/index',       // 会员中心
        'pages/membership-plans/index', // 会员套餐
        'pages/coupons/index',          // 优惠券
        'pages/points/index',           // 积分中心
        'pages/points-records/index',   // 积分明细
        'pages/address-list/index',     // 地址管理
        'pages/address-edit/index',     // 地址编辑
        'pages/feedback/index',         // 意见反馈
        'pages/help-center/index',      // 帮助中心
        'pages/article-detail/index',   // 文章详情
        'pages/cms-page/index',         // CMS页面（使用 WebView）
        'pages/referrals/index',        // 邀请有礼
        'pages/escort-detail/index',    // 陪诊员详情
        'pages/order-complaint/index',  // 订单投诉
        'pages/coupons-available/index', // 领券中心
        'pages/escort-apply/index',     // 陪诊员申请
        'pages/campaigns/index',        // 活动中心
        'pages/campaigns-detail/index', // 活动详情
      ],
    },
    {
      root: 'packageC',
      name: 'escort',
      pages: [
        'pages/workbench/index',           // 陪诊员工作台
        'pages/orders-pool/index',         // 订单池
        'pages/my-orders/index',           // 我的订单
        'pages/order-detail/index',        // 订单详情
        'pages/pool-order-detail/index',   // 订单池订单详情
        'pages/my-order-detail/index',     // 我的订单详情
        'pages/earnings/index',            // 收入统计
        'pages/withdraw/index',            // 提现
        'pages/workbench-settings/index',  // 工作台设置
        'pages/service-types/index',       // 服务类型
        'pages/escort-profile-edit/index', // 编辑陪诊员资料
      ],
    },
    {
      root: 'packageE',
      name: 'distribution',
      pages: [
        'pages/distribution/index',          // 分销中心
        'pages/distribution-invite/index',   // 邀请好友
        'pages/distribution-members/index',  // 团队成员
        'pages/distribution-records/index',  // 分润记录
        'pages/distribution-promotion/index', // 晋升进度
      ],
    },
  ],
  // 分包预下载规则
  preloadRule: {
    'pages/main/index': {
      network: 'all',
      packages: ['packageA', 'packageB'],
    },
    'packageB/pages/profile/index': {
      network: 'all',
      packages: ['packageC'],
    },
    'packageC/pages/workbench/index': {
      network: 'all',
      packages: ['packageE'],
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '科科灵陪诊',
    navigationBarTextStyle: 'black',
    // 隐藏导航栏，由 TerminalPreviewApp 控制
    navigationStyle: 'custom',
  },
  // 启用组件按需注入（解决代码质量检查"组件"项）
  lazyCodeLoading: 'requiredComponents',
  // 不使用原生 TabBar
})
