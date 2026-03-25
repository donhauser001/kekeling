import { View } from '@tarojs/components'
import { TerminalPreviewApp } from '@/runtime'
import './index.scss'

export default function HomePage() {
  return (
    <View className="main-container">
      <TerminalPreviewApp />
    </View>
  )
}
