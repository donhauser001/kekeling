/**
 * 跨宿主原语组件 - 导出入口
 *
 * 默认导出 Web 实现（主仓使用）
 * 小程序构建时，通过 miniapp-shell 的 webpack alias 替换
 *
 * 使用方式：
 * import { Box, Text, Button, Image, Input, Icon } from '../ui/primitives'
 *
 * Icon 使用方式：
 * <Icon name="home" size={24} color="#333" />
 *
 * @see docs/终端预览器审计/小程序组件适配改造计划.md
 * @see docs/终端预览器审计/跨平台图标系统技术方案.md
 */

// 导出 Web 实现的组件
export { Box, Text, Button, Image, Input, Textarea, ScrollView, Icon } from './web'

// 导出类型定义
export type {
  BoxProps,
  TextProps,
  ButtonProps,
  ImageProps,
  InputProps,
  TextareaProps,
  ScrollViewProps,
} from './types'

// Icon 类型从共享类型导出
export type { IconName } from '@/shared/types/icon'
export type { IconProps } from './Icon'
