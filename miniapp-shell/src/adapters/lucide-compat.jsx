/**
 * lucide-react 兼容层 - 小程序版本
 *
 * 提供与 lucide-react 相同的 API，但使用 iconfont 实现
 * 此文件使用 JSX 格式，确保被 Taro 正确处理（避免 TypeScript 语法导致的 prebundle 问题）
 *
 * @see src/components/terminal-preview/ui/lucide-compat.tsx (原始文件)
 */

import React from 'react'
// 从主仓的 miniapp primitives 导入 Icon 组件
// 通过 NormalModuleReplacementPlugin 会解析到正确的文件
import { Icon } from '@terminal-preview/ui/primitives'

/**
 * 创建 Lucide 风格的图标组件
 * @param {string} iconName - 图标名称
 * @returns {React.FC<{className?: string, style?: object, size?: number|string, color?: string}>}
 */
function createLucideIcon(iconName) {
  const LucideIcon = ({
    className,
    style,
    size = 24,
    color,
  }) => {
    const numericSize = typeof size === 'string' ? parseInt(size, 10) : size

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

  LucideIcon.displayName = `LucideIcon(${iconName})`
  return LucideIcon
}

/**
 * 创建一个占位图标
 * @param {string} fallbackName - 后备图标名称
 */
function createPlaceholderIcon(fallbackName = 'grid') {
  return createLucideIcon(fallbackName)
}

// ============================================================================
// 导出图标组件（与 lucide-react 保持相同的命名）
// ============================================================================

// 导航类
export const Home = createLucideIcon('home')
export const Grid3X3 = createLucideIcon('grid')
export const FileText = createLucideIcon('file')
export const User = createLucideIcon('user')
export const Users = createLucideIcon('user')

// 操作类
export const Search = createLucideIcon('search')
export const Plus = createLucideIcon('plus')
export const Minus = createLucideIcon('minus')
export const Check = createLucideIcon('check')
export const X = createLucideIcon('x')

// 方向类
export const ChevronRight = createLucideIcon('chevron-right')
export const ChevronLeft = createLucideIcon('chevron-left')
export const ChevronDown = createLucideIcon('chevron-down')
export const ChevronUp = createLucideIcon('chevron-up')
export const ArrowLeft = createLucideIcon('arrow-left')
export const ArrowRight = createLucideIcon('arrow-right')

// 状态类
export const AlertCircle = createLucideIcon('alert')
export const Info = createLucideIcon('info')
export const Star = createLucideIcon('star')
export const Heart = createLucideIcon('heart')
export const CheckCircle = createLucideIcon('check')

// 通讯类
export const Phone = createLucideIcon('phone')
export const MapPin = createLucideIcon('map-pin')
export const Clock = createLucideIcon('clock')
export const Calendar = createLucideIcon('calendar')

// 设置类
export const Settings = createLucideIcon('settings')
export const LogOut = createLucideIcon('logout')
export const Edit = createLucideIcon('edit')
export const Edit2 = createLucideIcon('edit')
export const Edit3 = createLucideIcon('edit')
export const Trash = createLucideIcon('trash')
export const Trash2 = createLucideIcon('trash')

// 媒体类
export const Camera = createLucideIcon('camera')
export const Image = createLucideIcon('image')
export const ImageIcon = createLucideIcon('image')
export const Upload = createLucideIcon('upload')
export const Download = createLucideIcon('download')

// 其他
export const RefreshCw = createLucideIcon('refresh')
export const Sun = createPlaceholderIcon('star')
export const Moon = createPlaceholderIcon('star')
export const Loader = createLucideIcon('loader')
export const Loader2 = createLucideIcon('loader')
export const Eye = createLucideIcon('eye')
export const EyeOff = createLucideIcon('eye-off')
export const Lock = createLucideIcon('lock')
export const Briefcase = createLucideIcon('briefcase')
export const Share = createLucideIcon('share')
export const Share2 = createLucideIcon('share')
export const MoreHorizontal = createLucideIcon('more')
export const MoreVertical = createLucideIcon('more')

// ============================================================================
// 占位图标（iconfont 中未定义，使用相近的替代）
// ============================================================================

// 医疗相关（使用 heart 作为占位）
export const Stethoscope = createPlaceholderIcon('heart')
export const Hospital = createPlaceholderIcon('heart')
export const Pill = createPlaceholderIcon('heart')
export const Syringe = createPlaceholderIcon('heart')
export const Baby = createPlaceholderIcon('user')
export const Bone = createPlaceholderIcon('heart')
export const Brain = createPlaceholderIcon('heart')
export const FlaskConical = createPlaceholderIcon('eye')
export const BedDouble = createPlaceholderIcon('heart')
export const Bed = createPlaceholderIcon('heart')
export const HeartPulse = createPlaceholderIcon('heart')
export const Thermometer = createPlaceholderIcon('heart')
export const Activity = createPlaceholderIcon('heart')
export const Ambulance = createPlaceholderIcon('briefcase')

// 交通/物流（使用 briefcase 作为占位）
export const Truck = createPlaceholderIcon('briefcase')
export const Bus = createPlaceholderIcon('briefcase')
export const Car = createPlaceholderIcon('briefcase')

// 商业/建筑（使用 grid 作为占位）
export const Building = createPlaceholderIcon('grid')
export const Building2 = createPlaceholderIcon('grid')
export const Hotel = createPlaceholderIcon('star')
export const ShoppingBag = createPlaceholderIcon('briefcase')
export const ShoppingCart = createPlaceholderIcon('briefcase')

// 文档类（使用 file 作为占位）
export const ClipboardList = createPlaceholderIcon('file')
export const FileStack = createPlaceholderIcon('file')
export const Clipboard = createPlaceholderIcon('file')
export const Copy = createPlaceholderIcon('file')

// 通讯类（使用 info 作为占位）
export const MessageSquare = createPlaceholderIcon('info')
export const MessageCircle = createPlaceholderIcon('info')
export const Bell = createPlaceholderIcon('alert')
export const Headphones = createPlaceholderIcon('phone')

// 装饰类（使用 star 作为占位）
export const Sparkles = createPlaceholderIcon('star')
export const Rocket = createPlaceholderIcon('star')
export const Zap = createPlaceholderIcon('star')
export const Gift = createPlaceholderIcon('star')
export const Award = createPlaceholderIcon('star')
export const Crown = createPlaceholderIcon('star')
export const Utensils = createPlaceholderIcon('star')

// 用户类（使用 user 作为占位）
export const UserCheck = createPlaceholderIcon('user')
export const UserPlus = createPlaceholderIcon('user')
export const UserMinus = createPlaceholderIcon('user')
export const UserX = createPlaceholderIcon('user')

// 信用卡/支付（使用 briefcase 作为占位）
export const CreditCard = createPlaceholderIcon('briefcase')
export const Wallet = createPlaceholderIcon('briefcase')
export const Banknote = createPlaceholderIcon('briefcase')
export const CircleDollarSign = createPlaceholderIcon('briefcase')
export const DollarSign = createPlaceholderIcon('briefcase')

// 帮助类
export const HelpCircle = createPlaceholderIcon('info')

// 位置类
export const Ticket = createPlaceholderIcon('file')
export const Navigation = createPlaceholderIcon('map-pin')

// 趋势/箭头类
export const TrendingUp = createPlaceholderIcon('arrow-right')
export const TrendingDown = createPlaceholderIcon('arrow-left')
export const ArrowDownRight = createPlaceholderIcon('chevron-right')
export const ArrowUpRight = createPlaceholderIcon('chevron-right')

// 设备类
export const Smartphone = createPlaceholderIcon('phone')
export const Tablet = createPlaceholderIcon('grid')
export const Laptop = createPlaceholderIcon('grid')

// 用户相关（补充）
export const UserRound = createPlaceholderIcon('user')

// 文件相关（补充）
export const FileImage = createPlaceholderIcon('image')

// 开发/版本控制
export const GitBranch = createPlaceholderIcon('share')

// 数学/统计
export const Percent = createPlaceholderIcon('info')

// 阅读/文档
export const BookOpen = createPlaceholderIcon('file')

// 安全
export const Shield = createPlaceholderIcon('lock')

// 排序/方向
export const ArrowUpDown = createPlaceholderIcon('chevron-up')

// 社交
export const ThumbsUp = createPlaceholderIcon('star')

// 布局
export const LayoutGrid = createPlaceholderIcon('grid')
export const List = createPlaceholderIcon('file')

// 包裹/物品
export const Package = createPlaceholderIcon('briefcase')

// 目标
export const Target = createPlaceholderIcon('eye')

// 状态类（补充）
export const CheckCircle2 = createLucideIcon('check')
export const XCircle = createPlaceholderIcon('x')

// 筛选/过滤
export const Filter = createPlaceholderIcon('search')

// 文字/类型
export const Type = createPlaceholderIcon('file')
