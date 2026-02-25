import { ContentSection } from '../components/content-section'
import { MiniappForm } from './miniapp-form'

export function SettingsMiniapp() {
  return (
    <ContentSection
      title='小程序设置'
      desc='配置小程序功能开关和开发调试选项。'
    >
      <MiniappForm />
    </ContentSection>
  )
}
