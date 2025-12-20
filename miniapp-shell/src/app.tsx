/**
 * 小程序入口
 *
 * 职责：
 * 1. 环境检测
 * 2. 注入 WxBridge runtime
 * 3. 加载图标字体（Iconfont）
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
 * Iconfont 字体 URL（从服务器加载）
 * 字体文件位于 server/uploads/fonts/iconfont.ttf
 */
const ICONFONT_URL = `${SERVER_BASE_URL}/uploads/fonts/iconfont.ttf`

/**
 * 加载图标字体
 *
 * 使用 iconfont 统一图标系统（775 个图标）
 * 确保后台、终端预览器、小程序使用相同的图标
 */
function loadIconFonts() {
  // 加载 Iconfont（统一图标系统）
  Taro.loadFontFace({
    global: true,
    family: 'iconfont',
    source: `url("${ICONFONT_URL}")`,
    success: () => {
      console.log('[Iconfont] 字体加载成功 (775 icons)')
    },
    fail: (err) => {
      console.warn('[Iconfont] 字体加载失败:', err)
      console.warn('[Iconfont] URL:', ICONFONT_URL)
    },
  })
}

// 使用 Class 组件以确保 Taro 的生命周期正确触发
class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('[miniapp-shell] App launched')
    // 注入小程序环境的 WxBridge 实现
    injectWxBridgeRuntime()
    // 加载图标字体（统一 Iconfont 系统）
    loadIconFonts()
  }

  render() {
    return this.props.children
  }
}

export default App
