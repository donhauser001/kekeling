/**
 * 开发环境配置
 */
import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {
    // 开启 source map 用于调试
    enableSourceMap: true,
    sourceMapType: 'source-map', // 完整 source map
  },
  h5: {}
} satisfies UserConfigExport<'webpack5'>
