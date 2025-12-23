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
      ],
    },
    {
      root: 'packageB',
      name: 'user',
      pages: [
        'pages/profile/index',        // 我的页面
        'pages/user-settings/index',  // 用户设置
      ],
    },
  ],
  // 分包预下载规则
  preloadRule: {
    'pages/main/index': {
      network: 'all',
      packages: ['packageA', 'packageB'],
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
