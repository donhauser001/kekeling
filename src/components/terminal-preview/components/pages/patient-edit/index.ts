/**
 * 就诊人编辑页面 - 模块导出
 *
 * 按《小程序页面改造规范》进行模块化拆分
 * @see docs/小程序页面改造规范.md
 */

export { PatientEditPage } from './PatientEditPage'
export type { PatientEditPageProps, PatientForm, ThemeColors } from './types'

// 子组件导出（按需使用）
export {
  FormRow,
  GenderButton,
  RelationPicker,
  PatientEditSkeleton,
} from './components'
