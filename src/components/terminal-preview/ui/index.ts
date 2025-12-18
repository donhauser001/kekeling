/**
 * 终端预览器 UI 模块入口
 *
 * 统一导出跨宿主原语组件和相关类型
 *
 * @see docs/终端预览器审计/小程序组件适配改造计划.md
 */

// 跨宿主原语组件
export {
  Box,
  Text,
  Button,
  Image,
  Input,
  Textarea,
  ScrollView,
} from './primitives'

// 类型定义
export type {
  BoxProps,
  TextProps,
  ButtonProps,
  ImageProps,
  InputProps,
  TextareaProps,
  ScrollViewProps,
} from './primitives'
