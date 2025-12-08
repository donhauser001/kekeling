import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { initTheme } from './utils/theme'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
    
    // 初始化主题色
    initTheme().then(color => {
      console.log('主题色已加载:', color)
    })
    
    // 初始化云开发
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: 'your-env-id', // TODO: 替换为你的云环境 ID
        traceUser: true,
      })
    }
  })

  return children
}

export default App

