/**
 * 小程序全局配置
 *
 * 职责：仅配置路由和窗口
 * 禁止：业务逻辑
 *
 * 页面说明：
 * - pages/main/index: 主页面容器
 * - pages/services/index: 服务列表页
 * - pages/service-detail/index: 服务详情页
 * - pages/create-order/index: 下单页
 */
export default defineAppConfig({
  pages: [
    'pages/main/index',
    'pages/services/index',
    'pages/service-detail/index',
    'pages/create-order/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '科科灵陪诊',
    navigationBarTextStyle: 'black',
    // 隐藏导航栏，由 TerminalPreviewApp 控制
    navigationStyle: 'custom',
  },
  // 不使用原生 TabBar
})
