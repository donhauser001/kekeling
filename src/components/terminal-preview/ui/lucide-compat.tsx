/**
 * lucide-react 兼容层
 *
 * 提供与 lucide-react 相同的 API，但使用 iconfont 实现
 * 用于逐步迁移 terminal-preview 中的图标使用
 *
 * 使用方式：
 * 将 import { Home } from 'lucide-react' 替换为
 * import { Home } from '../ui/lucide-compat'
 *
 * ⚠️ 这是一个过渡方案，最终应该直接使用 <Icon name="xxx" />
 */

import React from 'react'
import { Icon } from './primitives'
import type { IconName } from '@/shared/types/icon'

// Lucide 名称到 iconfont 名称的映射
const lucideToIconfontMap: Record<string, IconName> = {
  // === 导航类 ===
  'home': 'home',
  'grid': 'grid-four',
  'file': 'file-text',
  'user': 'user',
  'users': 'peoples',

  // === 操作类 ===
  'search': 'search',
  'plus': 'plus',
  'minus': 'reduce',
  'check': 'check',
  'x': 'close',

  // === 方向类 ===
  'chevron-right': 'right',
  'chevron-left': 'left',
  'chevron-down': 'down',
  'chevron-up': 'up',
  'arrow-left': 'back',
  'arrow-right': 'arrow-circle-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',

  // === 状态类 ===
  'alert': 'caution',
  'alert-circle': 'caution',
  'info': 'info',
  'star': 'stopwatch-start',
  'heart': 'heart',
  'check-circle': 'check-one',
  'check-circle-2': 'success',
  'x-circle': 'close-one',

  // === 通讯类 ===
  'phone': 'phone-telephone',
  'map-pin': 'map-draw',
  'clock': 'time',
  'calendar': 'date-comes-back',
  'message-circle': 'comment',
  'message-square': 'comment-one',
  'bell': 'remind',

  // === 设置类 ===
  'settings': 'setting',
  'logout': 'power',
  'edit': 'edit',
  'edit-2': 'editing',
  'edit-3': 'editing',
  'trash': 'delete',
  'trash-2': 'delete',

  // === 媒体类 ===
  'camera': 'camera',
  'image': 'pic',
  'upload': 'upload-one',
  'download': 'download',

  // === 其他基础 ===
  'refresh': 'refresh',
  'refresh-cw': 'refresh',
  'loader': 'loading-one',
  'loader-2': 'loading-two',
  'eye': 'preview-open',
  'eye-off': 'preview-close-one',
  'lock': 'lock',
  'unlock': 'unlock-one',
  'briefcase': 'workbench',
  'share': 'share-three',
  'share-2': 'share-three',
  'more': 'more',
  'more-horizontal': 'more',
  'more-vertical': 'more-one',

  // === 金融/支付 ===
  'wallet': 'wallet',
  'credit-card': 'bank-card-one',
  'banknote': 'paper-money',
  'dollar-sign': 'currency',
  'circle-dollar-sign': 'financing',

  // === 购物 ===
  'shopping-cart': 'shopping-cart-one',
  'shopping-bag': 'shopping-bag',
  'gift': 'gift',
  'package': 'commodity',

  // === 趋势 ===
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',

  // === 用户相关 ===
  'user-check': 'people-safe',
  'user-plus': 'people-plus',
  'user-minus': 'people-minus',
  'user-x': 'people-delete',
  'user-round': 'avatar',

  // === 文档类 ===
  'clipboard': 'clipboard',
  'clipboard-list': 'checklist',
  'file-text': 'file-text',
  'file-image': 'add-picture',
  'copy': 'copy-one',
  'save': 'save',
  'book-open': 'book-open',

  // === 列表/布局 ===
  'list': 'list',
  'layout-grid': 'grid-four',
  'filter': 'filter',

  // === 状态/装饰 ===
  'sparkles': 'lightning',
  'zap': 'lightning',
  'rocket': 'send',
  'award': 'medal-one',
  'crown': 'vip-one',
  'thumbs-up': 'like',
  'thumbs-down': 'dislike',

  // === 安全 ===
  'shield': 'shield',
  'shield-check': 'shield-add',
  'key': 'key',

  // === 帮助 ===
  'help-circle': 'help',

  // === 医疗 ===
  'stethoscope': 'stethoscope',
  'hospital': 'hospital',
  'pill': 'pill',
  'syringe': 'injection',
  'baby': 'baby',
  'heart-pulse': 'heartbeat',
  'thermometer': 'thermometer-one',
  'activity': 'ecg',
  'ambulance': 'ambulance',

  // === 其他 ===
  'percent': 'percentage',
  'git-branch': 'left-branch',
  'target': 'aiming',
  'navigation': 'send',
  'ticket': 'coupon',
  'building': 'bank',
  'building-2': 'bank',
  'hotel': 'home',
  'car': 'ambulance',
  'bus': 'ambulance',
  'truck': 'ambulance',
  'smartphone': 'phone-telephone',
  'tablet': 'grid-four',
  'laptop': 'workbench',
  'headphones': 'headset',
  'flask-conical': 'experiment',
  'bed': 'hospital-bed',
  'bed-double': 'hospital-bed',
  'bone': 'orthopedic',
  'brain': 'brain',
}

// 图标组件的通用类型
interface LucideIconProps {
  className?: string
  style?: React.CSSProperties
  size?: number | string
  color?: string
  strokeWidth?: number
}

/**
 * 创建 Lucide 风格的图标组件
 *
 * @param lucideName Lucide 图标名称（如 'home', 'chevron-right'）
 * @param iconfontName 对应的 iconfont 图标名称，如果不提供则使用映射表
 */
function createLucideIcon(lucideName: string, iconfontName?: IconName): React.FC<LucideIconProps> {
  const LucideIcon: React.FC<LucideIconProps> = ({
    className,
    style,
    size = 24,
    color,
  }) => {
    const numericSize = typeof size === 'string' ? parseInt(size, 10) : size
    // 优先使用显式指定的 iconfontName，否则从映射表查找
    const iconName = iconfontName || lucideToIconfontMap[lucideName] || (lucideName as IconName)

    return (
      <Icon
        name={iconName}
        size={numericSize}
        color={color}
        className={className}
        style={style}
      />
    )
  }

  LucideIcon.displayName = `LucideIcon(${lucideName})`
  return LucideIcon
}

// ============================================================================
// 导出图标组件（与 lucide-react 保持相同的命名）
// ============================================================================

// 导航类
export const Home = createLucideIcon('home', 'home')
export const Grid3X3 = createLucideIcon('grid', 'grid-four')
export const FileText = createLucideIcon('file', 'file-text')
export const User = createLucideIcon('user', 'user')
export const Users = createLucideIcon('users', 'peoples')

// 操作类
export const Search = createLucideIcon('search', 'search')
export const Plus = createLucideIcon('plus', 'plus')
export const Minus = createLucideIcon('minus', 'reduce')
export const Check = createLucideIcon('check', 'check')
export const X = createLucideIcon('x', 'close')

// 方向类
export const ChevronRight = createLucideIcon('chevron-right', 'right')
export const ChevronLeft = createLucideIcon('chevron-left', 'left')
export const ChevronDown = createLucideIcon('chevron-down', 'down')
export const ChevronUp = createLucideIcon('chevron-up', 'up')
export const ArrowLeft = createLucideIcon('arrow-left', 'back')
export const ArrowRight = createLucideIcon('arrow-right', 'arrow-circle-right')
export const ArrowUp = createLucideIcon('arrow-up', 'arrow-up')
export const ArrowDown = createLucideIcon('arrow-down', 'arrow-down')

// 状态类
export const AlertCircle = createLucideIcon('alert-circle', 'caution')
export const Info = createLucideIcon('info', 'info')
export const Star = createLucideIcon('star', 'stopwatch-start')
export const Heart = createLucideIcon('heart', 'heart')
export const CheckCircle = createLucideIcon('check-circle', 'check-one')
export const CheckCircle2 = createLucideIcon('check-circle-2', 'success')
export const XCircle = createLucideIcon('x-circle', 'close-one')

// 通讯类
export const Phone = createLucideIcon('phone', 'phone-telephone')
export const MapPin = createLucideIcon('map-pin', 'map-draw')
export const MapPinned = createLucideIcon('map-pinned', 'user-positioning')
export const Clock = createLucideIcon('clock', 'time')
export const Calendar = createLucideIcon('calendar', 'date-comes-back')
export const MessageCircle = createLucideIcon('message-circle', 'comment')
export const MessageSquare = createLucideIcon('message-square', 'comment-one')
export const Bell = createLucideIcon('bell', 'remind')

// 设置类
export const Settings = createLucideIcon('settings', 'setting')
export const LogOut = createLucideIcon('logout', 'power')
export const Edit = createLucideIcon('edit', 'edit')
export const Edit2 = createLucideIcon('edit-2', 'editing')
export const Edit3 = createLucideIcon('edit-3', 'editing')
export const Trash = createLucideIcon('trash', 'delete')
export const Trash2 = createLucideIcon('trash-2', 'delete')

// 媒体类
export const Camera = createLucideIcon('camera', 'camera')
export const Image = createLucideIcon('image', 'pic')
export const ImageIcon = createLucideIcon('image-icon', 'pic')
export const Upload = createLucideIcon('upload', 'upload-one')
export const Download = createLucideIcon('download', 'download')

// 其他基础
export const RefreshCw = createLucideIcon('refresh', 'refresh')
export const Loader = createLucideIcon('loader', 'loading-one')
export const Loader2 = createLucideIcon('loader-2', 'loading-two')
export const Eye = createLucideIcon('eye', 'preview-open')
export const EyeOff = createLucideIcon('eye-off', 'preview-close-one')
export const Lock = createLucideIcon('lock', 'lock')
export const Unlock = createLucideIcon('unlock', 'unlock-one')
export const Briefcase = createLucideIcon('briefcase', 'workbench')
export const Share = createLucideIcon('share', 'share-three')
export const Share2 = createLucideIcon('share-2', 'share-three')
export const MoreHorizontal = createLucideIcon('more-horizontal', 'more')
export const MoreVertical = createLucideIcon('more-vertical', 'more-one')

// 金融/支付
export const Wallet = createLucideIcon('wallet', 'wallet')
export const CreditCard = createLucideIcon('credit-card', 'bank-card-one')
export const Banknote = createLucideIcon('banknote', 'paper-money')
export const DollarSign = createLucideIcon('dollar-sign', 'currency')
export const CircleDollarSign = createLucideIcon('circle-dollar-sign', 'financing')

// 购物
export const ShoppingCart = createLucideIcon('shopping-cart', 'shopping-cart-one')
export const ShoppingBag = createLucideIcon('shopping-bag', 'shopping-bag')
export const Gift = createLucideIcon('gift', 'gift')
export const Package = createLucideIcon('package', 'commodity')

// 趋势
export const TrendingUp = createLucideIcon('trending-up', 'trending-up')
export const TrendingDown = createLucideIcon('trending-down', 'trending-down')
export const ArrowUpRight = createLucideIcon('arrow-up-right', 'trending-up')
export const ArrowDownRight = createLucideIcon('arrow-down-right', 'trending-down')

// 用户相关
export const UserCheck = createLucideIcon('user-check', 'people-safe')
export const UserPlus = createLucideIcon('user-plus', 'people-plus')
export const UserMinus = createLucideIcon('user-minus', 'people-minus')
export const UserX = createLucideIcon('user-x', 'people-delete')
export const UserRound = createLucideIcon('user-round', 'avatar')

// 文档类
export const Clipboard = createLucideIcon('clipboard', 'clipboard')
export const ClipboardList = createLucideIcon('clipboard-list', 'checklist')
export const FileStack = createLucideIcon('file-stack', 'file-collection')
export const FileImage = createLucideIcon('file-image', 'add-picture')
export const Copy = createLucideIcon('copy', 'copy-one')
export const Save = createLucideIcon('save', 'save')
export const BookOpen = createLucideIcon('book-open', 'book-open')

// 列表/布局
export const List = createLucideIcon('list', 'list')
export const LayoutGrid = createLucideIcon('layout-grid', 'grid-four')
export const Filter = createLucideIcon('filter', 'filter')
export const ArrowUpDown = createLucideIcon('arrow-up-down', 'sort-one')

// 状态/装饰
export const Sparkles = createLucideIcon('sparkles', 'lightning')
export const Zap = createLucideIcon('zap', 'lightning')
export const Rocket = createLucideIcon('rocket', 'send')
export const Award = createLucideIcon('award', 'medal-one')
export const Crown = createLucideIcon('crown', 'vip-one')
export const ThumbsUp = createLucideIcon('thumbs-up', 'like')
export const ThumbsDown = createLucideIcon('thumbs-down', 'dislike')
export const Flag = createLucideIcon('flag', 'done-all')
export const Play = createLucideIcon('play', 'play')

// 安全
export const Shield = createLucideIcon('shield', 'shield')
export const ShieldCheck = createLucideIcon('shield-check', 'shield-add')
export const Key = createLucideIcon('key', 'key')
export const Keyhole = createLucideIcon('keyhole', 'keyhole')

// 帮助
export const HelpCircle = createLucideIcon('help-circle', 'help')

// 位置
export const Ticket = createLucideIcon('ticket', 'coupon')
export const Navigation = createLucideIcon('navigation', 'send')

// 设备
export const Smartphone = createLucideIcon('smartphone', 'phone-telephone')
export const Tablet = createLucideIcon('tablet', 'grid-four')
export const Laptop = createLucideIcon('laptop', 'workbench')
export const Headphones = createLucideIcon('headphones', 'headset')

// 建筑/场所
export const Building = createLucideIcon('building', 'bank')
export const Building2 = createLucideIcon('building-2', 'bank')
export const Hotel = createLucideIcon('hotel', 'home')

// 交通
export const Car = createLucideIcon('car', 'ambulance')
export const Bus = createLucideIcon('bus', 'ambulance')
export const Truck = createLucideIcon('truck', 'ambulance')

// 医疗相关
export const Stethoscope = createLucideIcon('stethoscope', 'stethoscope')
export const Hospital = createLucideIcon('hospital', 'hospital')
export const Pill = createLucideIcon('pill', 'pill')
export const Syringe = createLucideIcon('syringe', 'injection')
export const Baby = createLucideIcon('baby', 'baby')
export const HeartPulse = createLucideIcon('heart-pulse', 'heartbeat')
export const Thermometer = createLucideIcon('thermometer', 'thermometer-one')
export const Activity = createLucideIcon('activity', 'ecg')
export const Ambulance = createLucideIcon('ambulance', 'ambulance')
export const FlaskConical = createLucideIcon('flask-conical', 'experiment')
export const Bed = createLucideIcon('bed', 'hospital-bed')
export const BedDouble = createLucideIcon('bed-double', 'hospital-bed')
export const Bone = createLucideIcon('bone', 'orthopedic')
export const Brain = createLucideIcon('brain', 'brain')

// 数学/统计
export const Percent = createLucideIcon('percent', 'percentage')
export const Target = createLucideIcon('target', 'aiming')

// 开发/版本
export const GitBranch = createLucideIcon('git-branch', 'left-branch')

// 其他
export const Utensils = createLucideIcon('utensils', 'diamond-ring')
export const Type = createLucideIcon('type', 'font-size-two')

// 类型导出
export type { LucideIconProps as LucideIcon }
