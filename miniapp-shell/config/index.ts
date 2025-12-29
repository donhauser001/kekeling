/**
 * Taro 构建配置
 *
 * 职责：仅配置构建相关参数
 * 禁止：业务逻辑、wx.xxx 调用
 */
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'path'
import devConfig from './dev'
import prodConfig from './prod'

// miniapp-shell 的 node_modules 路径（用于强制 React 单实例）
const miniappNodeModules = path.resolve(__dirname, '..', 'node_modules')

export default defineConfig<'webpack5'>(async (merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'kekeling-miniapp-shell',
    date: '2024-12-18',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false
    },
    alias: {
      // ============================================================
      // lucide-react 兼容层重定向（必须放在最前面，优先级最高）
      // 将 lucide-react 重定向到 iconfont 兼容层
      // @see docs/终端预览器审计/跨平台图标系统技术方案.md
      // ============================================================
      'lucide-react': path.resolve(__dirname, '..', 'src', 'adapters', 'lucide-compat'),
      // ============================================================
      // React 单实例强制解析
      // 防止主仓 terminal-preview 的依赖解析到主仓 node_modules/react@19
      // ============================================================
      'react': path.resolve(miniappNodeModules, 'react'),
      // 注意：不要 alias react-dom！
      // Taro 小程序使用 @tarojs/react 作为渲染器，不需要真正的 react-dom
      // 如果 alias react-dom 会导致它被打包进小程序，引发 window/document 错误
      'react/jsx-runtime': path.resolve(miniappNodeModules, 'react', 'jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(miniappNodeModules, 'react', 'jsx-dev-runtime'),
      // ============================================================
      // React Query 单实例强制解析
      // 解决 Provider 与业务代码 useQuery/useQueryClient 来自不同包实例导致 Context 丢失
      // ============================================================
      '@tanstack/react-query': path.resolve(miniappNodeModules, '@tanstack', 'react-query'),
      // miniapp-shell 未直接依赖 @tanstack/query-core（但作为 react-query 传递依赖存在于 .pnpm）
      '@tanstack/query-core': path.resolve(
        miniappNodeModules,
        '.pnpm',
        '@tanstack+query-core@5.90.12',
        'node_modules',
        '@tanstack',
        'query-core',
      ),
      // scheduler 由 react-dom 内部引用，通过 resolve.modules 解析

      // ============================================================
      // 主仓模块映射
      // ============================================================
      // 指向主仓的 lib 模块（cn 函数、cookies 等）
      '@/lib/utils': path.resolve(__dirname, '..', '..', 'src', 'lib', 'utils.ts'),
      '@/lib/cookies': path.resolve(__dirname, '..', '..', 'src', 'lib', 'cookies.ts'),
      // 指向主仓的 shared 模块（类型定义、资源等）
      '@/shared': path.resolve(__dirname, '..', '..', 'src', 'shared'),
      // 指向主仓的 UI 组件（shadcn/ui）
      '@/components/ui': path.resolve(__dirname, '..', '..', 'src', 'components', 'ui'),
      // 跨宿主原语组件 - 小程序构建时使用 miniapp 实现
      '@terminal-preview/ui/primitives': path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview', 'ui', 'primitives', 'miniapp.tsx'),
      // 指向主仓的终端预览器组件
      '@terminal-preview': path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview'),
      // 通配符 alias 放最后（miniapp-shell 自身代码使用）
      '@': path.resolve(__dirname, '..', 'src'),
    },
    mini: {
      // 增加模板层级限制（默认 16），防止深层嵌套导致模板缺失
      baseLevel: 32,
      // 禁用 source map，减少包体积
      enableSourceMap: false,
      // 启用运行时配置
      runtime: {
        // 启用内部 HTML 支持，允许使用原生 HTML 标签
        // 这将把 div/span/img 等标签映射到小程序组件
        enableInnerHTML: true,
      },
      // 将主仓目录和特定 node_modules 纳入 babel 编译链
      // 解决通过 alias 引入的外部 .ts/.tsx 文件未被转译的问题
      compile: {
        include: [
          // 主仓终端预览器组件目录
          path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview'),
          // 主仓 lib 目录（cn 函数等工具）
          path.resolve(__dirname, '..', '..', 'src', 'lib'),
          // 主仓 UI 组件目录（shadcn/ui）
          path.resolve(__dirname, '..', '..', 'src', 'components', 'ui'),
          // 主仓 shared 目录（iconfont 资源、类型定义）
          path.resolve(__dirname, '..', '..', 'src', 'shared'),
          // @tanstack/react-query 和 @tanstack/query-core 使用了 ES2020+ 语法
          // 需要 babel 转译为 ES5 以兼容小程序环境
          (modulePath: string) => /@tanstack/.test(modulePath),
        ],
      },
      // webpack 配置链：确保 React 单实例
      webpackChain(chain) {
        // 禁用 source map，减少包体积
        chain.devtool(false)

        // 优先从 miniapp-shell 的 node_modules 解析依赖
        // 防止主仓的 node_modules 中的 React 19 被引入
        chain.resolve.modules
          .prepend(miniappNodeModules)
          .prepend('node_modules')

        // 强制所有 React 相关模块使用同一个实例
        // 解决 react-reconciler 和 @tanstack/react-query 使用不同 React 实例导致 Context 隔离
        chain.resolve.alias
          .set('react', path.resolve(miniappNodeModules, 'react'))
          .set('react/jsx-runtime', path.resolve(miniappNodeModules, 'react', 'jsx-runtime'))
          .set('react/jsx-dev-runtime', path.resolve(miniappNodeModules, 'react', 'jsx-dev-runtime'))
          .set('@tanstack/react-query', path.resolve(miniappNodeModules, '@tanstack', 'react-query'))
          .set('@tanstack/query-core', path.resolve(
            miniappNodeModules,
            '.pnpm',
            '@tanstack+query-core@5.90.12',
            'node_modules',
            '@tanstack',
            'query-core',
          ))
          .set('scheduler', path.resolve(miniappNodeModules, '.pnpm', 'scheduler@0.23.2', 'node_modules', 'scheduler'))

        // 跨宿主原语组件：将相对路径导入替换为 miniapp 实现
        // 因为终端预览器使用相对路径导入（如 ../ui/primitives），alias 无法捕获
        // 必须使用 NormalModuleReplacementPlugin 拦截
        const miniappPrimitivesPath = path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview', 'ui', 'primitives', 'miniapp.tsx')
        const webpack = require('webpack')
        chain.plugin('replace-primitives').use(webpack.NormalModuleReplacementPlugin, [
          // 匹配 primitives 相关的导入
          /primitives/,
          (resource: { request: string }) => {
            // 替换 ui/primitives 的导入为 miniapp 实现
            if (resource.request && (
              resource.request.includes('/ui/primitives') ||
              resource.request.endsWith('/primitives') ||
              resource.request.includes('primitives/index')
            )) {
              resource.request = miniappPrimitivesPath
            }
          },
        ])

        // 替换 Web-only 组件（PhoneFrame, DebugPanel）为 stub 实现
        // 这些组件在小程序中不会被渲染，但代码仍会被打包
        const webOnlyStubsPath = path.resolve(__dirname, '..', 'src', 'adapters', 'web-only-stubs.tsx')
        chain.plugin('replace-phone-frame').use(webpack.NormalModuleReplacementPlugin, [
          /PhoneFrame/,
          (resource: { request: string }) => {
            if (resource.request && resource.request.includes('PhoneFrame')) {
              resource.request = webOnlyStubsPath
            }
          },
        ])
        chain.plugin('replace-debug-panel').use(webpack.NormalModuleReplacementPlugin, [
          /DebugPanel/,
          (resource: { request: string }) => {
            if (resource.request && resource.request.includes('DebugPanel')) {
              resource.request = webOnlyStubsPath
            }
          },
        ])

        // 恢复 splitChunks 配置，确保 vendors 和 common chunks 被生成
        // 通过 Taro 的 commonChunks + addChunkPages 控制主包不引用这些 chunks
        chain.optimization.splitChunks({
          chunks: 'all',
          cacheGroups: {
            // 将 React 相关模块强制打包到 vendors chunk
            react: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/](react|react-reconciler|scheduler|@tanstack[\\/]react-query)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // 默认 vendors
            defaultVendors: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            // common chunk
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        })
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      // 将主仓目录纳入 babel 编译链（与 mini 配置保持一致）
      // 解决通过 alias 引入的外部 .ts/.tsx 文件未被转译的问题
      compile: {
        include: [
          // 主仓终端预览器组件目录
          path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview'),
          // 主仓 lib 目录（cn 函数等工具）
          path.resolve(__dirname, '..', '..', 'src', 'lib'),
          // 主仓 UI 组件目录（shadcn/ui）
          path.resolve(__dirname, '..', '..', 'src', 'components', 'ui'),
          // 主仓 shared 目录（iconfont 资源、类型定义）
          path.resolve(__dirname, '..', '..', 'src', 'shared'),
        ],
      },
      // webpack 配置链
      webpackChain(chain) {
        // 优先从 miniapp-shell 的 node_modules 解析依赖
        chain.resolve.modules
          .prepend(miniappNodeModules)
          .prepend('node_modules')

        // 强制所有 React 相关模块使用同一个实例
        chain.resolve.alias
          .set('react', path.resolve(miniappNodeModules, 'react'))
          .set('react/jsx-runtime', path.resolve(miniappNodeModules, 'react', 'jsx-runtime'))
          .set('react/jsx-dev-runtime', path.resolve(miniappNodeModules, 'react', 'jsx-dev-runtime'))
          .set('@tanstack/react-query', path.resolve(miniappNodeModules, '@tanstack', 'react-query'))
          .set('@tanstack/query-core', path.resolve(
            miniappNodeModules,
            '.pnpm',
            '@tanstack+query-core@5.90.12',
            'node_modules',
            '@tanstack',
            'query-core',
          ))
          .set('scheduler', path.resolve(miniappNodeModules, '.pnpm', 'scheduler@0.23.2', 'node_modules', 'scheduler'))

        // iconfont 字体文件路径映射（iconfont.css 使用绝对路径 /fonts/...）
        const iconfontDir = path.resolve(__dirname, '..', '..', 'src', 'shared', 'assets', 'iconfont')
        chain.resolve.alias
          .set('/fonts/iconfont.woff2', path.resolve(iconfontDir, 'iconfont.woff2'))
          .set('/fonts/iconfont.woff', path.resolve(iconfontDir, 'iconfont.woff'))
          .set('/fonts/iconfont.ttf', path.resolve(iconfontDir, 'iconfont.ttf'))

        // 跨宿主原语组件：H5 使用 web 实现
        const webPrimitivesPath = path.resolve(__dirname, '..', '..', 'src', 'components', 'terminal-preview', 'ui', 'primitives', 'web.tsx')
        const webpack = require('webpack')
        chain.plugin('replace-primitives').use(webpack.NormalModuleReplacementPlugin, [
          /primitives/,
          (resource: { request: string }) => {
            if (resource.request && (
              resource.request.includes('/ui/primitives') ||
              resource.request.endsWith('/primitives') ||
              resource.request.includes('primitives/index')
            )) {
              resource.request = webPrimitivesPath
            }
          },
        ])
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
