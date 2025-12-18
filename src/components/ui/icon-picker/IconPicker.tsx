/**
 * 图标选择器组件
 *
 * 用于后台管理系统选择图标
 * 支持搜索、分类浏览
 */

import { useState, useMemo, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { AppIcon, recommendedIcons, getFlatRecommendedIcons, type IconName } from './AppIcon'

/**
 * 旧图标名到新图标名的映射
 * 用于兼容数据库中已存储的旧图标名（如来自 lucide-react 的名称）
 */
const legacyIconMap: Record<string, IconName> = {
  // Lucide 图标名 -> iconfont 图标名
  'shield-check': 'shield',
  'shield-alert': 'shield-add',
  'check-circle': 'check-one',
  'check-circle-2': 'success',
  'x-circle': 'close-one',
  'alert-circle': 'caution',
  'info': 'info',
  'help-circle': 'help',
  'thumbs-up': 'like',
  'thumbs-down': 'dislike',
  'star': 'stopwatch-start',
  'clock': 'time',
  'banknote': 'paper-money',
  'credit-card': 'bank-card-one',
  'user': 'user',
  'users': 'peoples',
  'user-plus': 'people-plus',
  'phone': 'phone-telephone',
  'message-circle': 'comment',
  'message-square': 'comment-one',
  'bell': 'remind',
  'shopping-cart': 'shopping-cart-one',
  'shopping-bag': 'shopping-bag',
  'package': 'commodity',
  'clipboard-list': 'checklist',
  'home': 'home',
  'settings': 'setting',
  'search': 'search',
  'edit': 'edit',
  'trash': 'delete',
  'trash-2': 'delete',
  'share': 'share-three',
  'refresh-cw': 'refresh',
  'download': 'download',
  'upload': 'upload-one',
  'more-horizontal': 'more',
  'more-vertical': 'more',
  'zap': 'lightning',
  'send': 'send',
  'lock': 'lock',
  'unlock': 'unlock-one',
  'key': 'key',
  'gift': 'gift',
  'heart': 'heart',
  'bookmark': 'bookmark',
  'wallet': 'wallet',
  'alarm-clock': 'alarm-clock',
  'history': 'history',
  'medal': 'medal-one',
  'crown': 'vip-one',
  'activity': 'heartbeat',
  'stethoscope': 'stethoscope',
  'syringe': 'injection',
  'pill': 'pill',
  'ambulance': 'ambulance',
  'hospital': 'hospital',
}

/**
 * 获取映射后的图标名（如果存在旧名称映射）
 */
function getMappedIconName(name: string | undefined): IconName | undefined {
  if (!name) return undefined
  // 如果是旧名称，返回映射后的新名称
  if (legacyIconMap[name]) {
    return legacyIconMap[name]
  }
  // 否则直接返回（假设它是有效的 IconName）
  return name as IconName
}

interface IconPickerProps {
  /** 当前选中的图标 */
  value?: IconName
  /** 选择图标时的回调 */
  onChange?: (iconName: IconName) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 按钮的额外类名 */
  className?: string
  /** 占位文本 */
  placeholder?: string
}

export function IconPicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = '选择图标',
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // 处理滚轮事件（Radix UI Popover 会阻止默认滚动）
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current
    if (!container) return

    // 手动滚动
    container.scrollTop += e.deltaY
    e.stopPropagation()
  }, [])

  // 获取映射后的图标名
  const mappedValue = getMappedIconName(value)

  // 获取图标标签
  const iconLabel = useMemo(() => {
    if (!mappedValue) return ''
    const flatIcons = getFlatRecommendedIcons()
    const found = flatIcons.find((i) => i.name === mappedValue)
    return found?.label || mappedValue
  }, [mappedValue])

  // 过滤图标
  const filteredGroups = useMemo(() => {
    if (!search) return recommendedIcons

    const searchLower = search.toLowerCase()
    return recommendedIcons
      .map((group) => ({
        ...group,
        icons: group.icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(searchLower) ||
            icon.label.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((group) => group.icons.length > 0)
  }, [search])

  const handleSelect = (iconName: IconName) => {
    onChange?.(iconName)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-start gap-2', className)}
        >
          {mappedValue ? (
            <>
              <AppIcon name={mappedValue} size={18} className="text-emerald-500" />
              <span className="flex-1 text-left">{iconLabel}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="搜索图标..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="h-[300px] overflow-y-auto p-2"
        >
          {filteredGroups.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              未找到匹配的图标
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  {group.category}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {group.icons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={cn(
                        'p-2 rounded-md flex items-center justify-center hover:bg-accent transition-colors',
                        mappedValue === icon.name && 'bg-accent ring-2 ring-primary'
                      )}
                      title={icon.label}
                    >
                      <AppIcon name={icon.name} size={20} />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
