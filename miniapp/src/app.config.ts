export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/services/index',
    'pages/services/detail',
    'pages/orders/index',
    'pages/orders/detail',
    'pages/user/index',
    'pages/user/patients',
    'pages/booking/index',
    'pages/booking/result',
    'pages/hospital/list',
    'pages/hospital/detail',
    'pages/escort/list',
    'pages/escort/detail',
    'pages/auth/login',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '科科灵陪诊',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
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

