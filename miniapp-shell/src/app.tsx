/**
 * 小程序入口
 *
 * 职责：
 * 1. 环境检测
 * 2. 注入 WxBridge runtime
 * 3. 预加载主题设置（避免页面闪烁）
 *
 * 说明：
 * - Taro 的页面渲染与 App 的 children 是分离的
 * - QueryClientProvider 在页面级组件（TerminalPreviewApp）中提供
 *
 * 禁止：
 * - 业务逻辑
 * - 直接调用 wx.xxx（必须通过 runtime 层）
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */
import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { injectWxBridgeRuntime } from './runtime'
import './app.scss'

/**
 * 服务器地址配置
 * 使用线上服务器地址，确保真机可以访问
 */
const SERVER_BASE_URL = 'https://kkl.top'

/**
 * 主题缓存 key
 */
const THEME_CACHE_KEY = 'kekeling_theme_settings'

/**
 * 预加载主题设置
 * 在 App 启动时立即加载主题，缓存到本地存储
 * 解决页面切换时主题色闪烁问题（#2）
 */
function preloadThemeSettings() {
  Taro.request({
    url: `${SERVER_BASE_URL}/api/config/theme/settings`,
    method: 'GET',
    success: (res) => {
      const payload = (res.data as { data?: unknown })?.data ?? res.data
      if (res.statusCode === 200 && payload) {
        // 缓存主题设置
        Taro.setStorageSync(THEME_CACHE_KEY, JSON.stringify(payload))
        console.log('[Theme] 主题预加载成功')
      }
    },
    fail: (err) => {
      console.warn('[Theme] 主题预加载失败:', err)
    },
  })
}

// 使用 Class 组件以确保 Taro 的生命周期正确触发
class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('[miniapp-shell] App launched')
    // 注入小程序环境的 WxBridge 实现
    injectWxBridgeRuntime()
    // 预加载主题设置（避免页面切换时闪烁）
    preloadThemeSettings()
  }

  render() {
    return this.props.children
  }
}

export default App
