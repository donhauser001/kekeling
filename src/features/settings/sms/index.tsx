import { ContentSection } from '../components/content-section'
import { AliyunSmsForm } from './aliyun-sms-form'

export function SettingsSms() {
  return (
    <ContentSection
      title='短信配置'
      desc='配置短信服务，用于发送验证码等通知。'
    >
      <AliyunSmsForm />
    </ContentSection>
  )
}
