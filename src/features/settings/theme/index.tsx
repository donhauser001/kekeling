import { ContentSection } from '../components/content-section'
import { ThemeForm } from './theme-form'

export function SettingsTheme() {
  return (
    <ContentSection
      title='小程序主题'
      desc='配置小程序的主题色、品牌名称和标语，所有终端将保持统一风格。'
    >
      <ThemeForm />
    </ContentSection>
  )
}

