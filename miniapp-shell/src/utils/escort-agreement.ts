import Taro from '@tarojs/taro'

export function navigateToEscortAgreement() {
  Taro.navigateTo({ url: '/packageB/pages/cms-page/index?slug=escort-terms' })
}
