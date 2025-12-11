export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/services/index',
    'pages/services/detail',
    'pages/orders/index',
    'pages/orders/detail',
    'pages/orders/review',
    'pages/orders/complaint',
    'pages/user/index',
    'pages/user/patients',
    'pages/booking/index',
    'pages/booking/result',
    'pages/hospital/list',
    'pages/hospital/detail',
    'pages/escort/list',
    'pages/escort/detail',
    'pages/auth/login',
    // 陪诊员工作台
    'pages/workbench/index',
    'pages/workbench/orders/pool',
    'pages/workbench/orders/detail',
    // 收入与提现
    'pages/workbench/earnings/index',
    'pages/workbench/withdraw/index',
    // 服务设置
    'pages/workbench/settings/index',
    // 营销中心
    'pages/marketing/membership/index',
    'pages/marketing/membership/plans',
    'pages/marketing/coupons/index',
    'pages/marketing/coupons/available',
    'pages/marketing/points/index',
    'pages/marketing/points/records',
    'pages/marketing/referrals/index',
    'pages/marketing/campaigns/index',
    'pages/marketing/campaigns/detail',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '科科灵陪诊',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#f97316',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/services/index',
        text: '服务',
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
      },
    ],
  },
})

