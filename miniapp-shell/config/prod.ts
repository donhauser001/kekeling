/**
 * 生产环境配置
 */
import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {
    // 生产环境禁用 source map，减少分包体积
    enableSourceMap: false,
    webpackChain(chain) {
      // 禁用 devtool（source map）
      chain.devtool(false)
    },
  },
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
  }
} satisfies UserConfigExport<'webpack5'>
