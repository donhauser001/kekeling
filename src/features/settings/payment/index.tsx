import { ContentSection } from '../components/content-section'
import { PaymentForm } from './payment-form'

export function SettingsPayment() {
  return (
    <ContentSection
      title='支付配置'
      desc='配置微信支付商户信息，用于小程序支付功能。'
    >
      <PaymentForm />
    </ContentSection>
  )
}

