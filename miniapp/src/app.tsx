import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
    
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

