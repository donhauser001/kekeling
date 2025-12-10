import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    // H5 开发服务器配置
    devServer: {
      port: 10086,
      host: '0.0.0.0', // 允许局域网访问
      // API 代理配置 (可选，也可以直接配置 CORS)
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  },
} satisfies UserConfigExport<'webpack5'>

