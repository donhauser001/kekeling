/**
 * 图标组件 - 基于 iconfont 字体
 * 与管理后台图标体系完全一致
 * 图标库：775 个图标
 */
import { Text } from '@tarojs/components'
import '@/assets/fonts/iconfont.scss'
import './index.scss'

// 常用图标名称类型
export type IconName =
  // 导航
  | 'home'
  | 'home1'
  | 'search'
  | 'back'
  | 'return'
  // 用户
  | 'user'
  | 'peoples'
  | 'people'
  | 'avatar'
  | 'me'
  | 'vip-one'
  // 状态
  | 'check'
  | 'check-one'
  | 'check-small'
  | 'check-correct'
  | 'success'
  | 'close'
  | 'close-one'
  | 'close-small'
  | 'caution'
  | 'alarm'
  | 'info'
  | 'help'
  | 'tips'
  // 安全保障
  | 'shield'
  | 'shield-add'
  | 'lock'
  | 'lock-one'
  | 'unlock-one'
  | 'protection'
  | 'protect'
  | 'key'
  // 点赞收藏
  | 'like'
  | 'dislike'
  | 'heart'
  | 'Heart'
  | 'Hearts'
  | 'attention'
  | 'bookmark'
  // 箭头方向
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-circle-up'
  | 'arrow-circle-down'
  | 'arrow-circle-left'
  | 'arrow-circle-right'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'go-ahead'
  // 操作类
  | 'add'
  | 'add-one'
  | 'plus'
  | 'reduce'
  | 'reduce-one'
  | 'edit'
  | 'delete'
  | 'save'
  | 'send'
  | 'share-three'
  | 'download'
  | 'upload-one'
  | 'refresh'
  | 'more'
  | 'more-one'
  | 'setting'
  | 'filter'
  | 'copy-one'
  // 时间日期
  | 'time'
  | 'alarm-clock'
  | 'history'
  | 'appointment'
  // 通讯联系
  | 'phone-telephone'
  | 'phone-incoming'
  | 'comment'
  | 'comment-one'
  | 'comments'
  | 'remind'
  | 'mail'
  | 'headset'
  // 医疗健康
  | 'hospital'
  | 'hospital-bed'
  | 'hospital-three'
  | 'hospital-four'
  | 'stethoscope'
  | 'pill'
  | 'pills'
  | 'injection'
  | 'infusion'
  | 'first-aid-kit'
  | 'medical-box'
  | 'medicine-chest'
  | 'medicine-bottle'
  | 'heartbeat'
  | 'heart-rate'
  | 'thermometer'
  | 'ambulance'
  | 'ecg'
  | 'brain'
  | 'lung'
  | 'teeth'
  | 'eyes'
  | 'nurse-cap'
  | 'prescription'
  | 'medical-files'
  | 'mask'
  | 'test-tube'
  | 'microscope'
  // 金融支付
  | 'wallet'
  | 'wallet-one'
  | 'bank'
  | 'bank-card-one'
  | 'coupon'
  | 'gift'
  | 'gift-bag'
  | 'red-envelope'
  | 'income'
  | 'expenses'
  | 'transaction'
  | 'transaction-order'
  | 'bill'
  | 'diamond'
  // 购物订单
  | 'shopping-cart-one'
  | 'shopping-cart-two'
  | 'shopping-bag'
  | 'shopping'
  | 'commodity'
  | 'checklist'
  | 'buy'
  | 'receive'
  | 'ticket-one'
  | 'label'
  | 'box'
  // 文件文档
  | 'folder'
  | 'folder-close'
  | 'folder-plus'
  | 'file-text'
  | 'clipboard'
  | 'report'
  | 'agreement'
  // 多媒体
  | 'camera'
  | 'pic'
  | 'picture'
  | 'video'
  | 'play'
  | 'pause'
  | 'music'
  | 'voice'
  | 'volume-up'
  | 'volume-mute'
  // 界面操作
  | 'zoom-in'
  | 'zoom-out'
  | 'full-screen'
  | 'preview-open'
  | 'preview-close-one'
  | 'list'
  | 'grid-four'
  | 'grid-nine'
  // 位置地图
  | 'map-draw'
  | 'discovery-index'
  // 数据图表
  | 'analysis'
  | 'trend'
  | 'pie'
  | 'performance'
  // 工具设备
  | 'workbench'
  | 'terminal'
  | 'power'
  | 'bluetooth'
  | 'connect'
  // 旧图标兼容
  | 'yiliao'
  | 'yiliaozixun'
  | 'bingli'
  | 'yiliaoxian'
  | 'empathize-line'
  | 'first-aid-kit-line'
  // 允许任意字符串（兼容完整的 775 个图标）
  | (string & {})

interface IconProps {
  /** 图标名称 */
  name: IconName
  /** 图标大小（单位：px），默认 24 */
  size?: number
  /** 图标颜色，默认 currentColor */
  color?: string
  /** 额外的 CSS 类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
  /** 点击事件 */
  onClick?: () => void
}

/**
 * 图标组件
 *
 * 使用 iconfont 字体渲染，确保全平台一致性
 *
 * @example
 * ```tsx
 * <Icon name="hospital" size={24} color="#3b82f6" />
 * <Icon name="shield" className="text-green-500" />
 * ```
 */
export default function Icon({
  name,
  size = 24,
  color,
  className = '',
  style,
  onClick,
}: IconProps) {
  return (
    <Text
      className={`iconfont icon-${name} icon ${className}`}
      style={{
        fontSize: `${size}px`,
        color: color,
        lineHeight: 1,
        ...style,
      }}
      onClick={onClick}
    />
  )
}

/**
 * 快捷导出常用图标名称
 */
export const IconNames = {
  // 导航
  HOME: 'home' as IconName,
  SEARCH: 'search' as IconName,
  BACK: 'back' as IconName,

  // 用户
  USER: 'user' as IconName,
  PEOPLES: 'peoples' as IconName,

  // 状态
  CHECK: 'check' as IconName,
  CHECK_ONE: 'check-one' as IconName,
  SUCCESS: 'success' as IconName,
  CLOSE: 'close' as IconName,
  INFO: 'info' as IconName,

  // 安全
  SHIELD: 'shield' as IconName,
  LOCK: 'lock' as IconName,
  PROTECTION: 'protection' as IconName,

  // 医疗
  HOSPITAL: 'hospital' as IconName,
  STETHOSCOPE: 'stethoscope' as IconName,
  PILL: 'pill' as IconName,
  HEARTBEAT: 'heartbeat' as IconName,

  // 订单
  SHOPPING_CART: 'shopping-cart-one' as IconName,
  TRANSACTION_ORDER: 'transaction-order' as IconName,
  CHECKLIST: 'checklist' as IconName,

  // 金融
  WALLET: 'wallet' as IconName,
  COUPON: 'coupon' as IconName,
  GIFT: 'gift' as IconName,

  // 操作
  ADD: 'add' as IconName,
  PLUS: 'plus' as IconName,
  EDIT: 'edit' as IconName,
  DELETE: 'delete' as IconName,
  SETTING: 'setting' as IconName,
  MORE: 'more' as IconName,
  SHARE: 'share-three' as IconName,

  // 箭头
  ARROW_UP: 'arrow-up' as IconName,
  ARROW_DOWN: 'arrow-down' as IconName,
  ARROW_LEFT: 'left' as IconName,
  ARROW_RIGHT: 'right' as IconName,

  // 时间
  TIME: 'time' as IconName,
  ALARM_CLOCK: 'alarm-clock' as IconName,
  HISTORY: 'history' as IconName,

  // 通讯
  PHONE: 'phone-telephone' as IconName,
  COMMENT: 'comment' as IconName,
  REMIND: 'remind' as IconName,

  // 点赞
  LIKE: 'like' as IconName,
  HEART: 'heart' as IconName,
  BOOKMARK: 'bookmark' as IconName,
}
