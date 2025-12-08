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
    navigationBarTitleText: '可客灵陪诊',
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
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/services/index',
        text: '服务',
        iconPath: 'assets/icons/service.png',
        selectedIconPath: 'assets/icons/service-active.png',
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: 'assets/icons/order.png',
        selectedIconPath: 'assets/icons/order-active.png',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/icons/user.png',
        selectedIconPath: 'assets/icons/user-active.png',
      },
    ],
  },
})

