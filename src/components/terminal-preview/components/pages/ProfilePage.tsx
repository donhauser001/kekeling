/**
 * 个人中心页预览组件
 *
 * Step 4/7: 增加陪诊员入口
 * - 普通用户视角：显示入口但需要二次登录
 * - 陪诊员视角：显示"进入工作台"
 */

import {
  User,
  Settings,
  CreditCard,
  Clock,
  Rocket,
  CheckCircle,
  Users,
  MapPin,
  Ticket,
  Headphones,
  HelpCircle,
  Building,
  ChevronRight,
  Briefcase,
  LogOut,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../types'

interface ProfilePageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 当前视角角色 */
  effectiveViewerRole?: PreviewViewerRole
  /** 点击陪诊员入口回调 */
  onEscortEntryClick?: () => void
  /** 点击进入工作台回调 */
  onWorkbenchClick?: () => void
  /** 退出陪诊员视角回调 */
  onExitEscortMode?: () => void
}

// 订单入口
const orderEntries = [
  { key: 'pending', title: '待支付', icon: CreditCard, count: 1 },
  { key: 'confirmed', title: '待服务', icon: Clock, count: 2 },
  { key: 'in_progress', title: '服务中', icon: Rocket, count: 0 },
  { key: 'completed', title: '已完成', icon: CheckCircle, count: 5 },
]

// 菜单项
const menuItems = [
  { key: 'patients', title: '就诊人管理', icon: Users },
  { key: 'address', title: '地址管理', icon: MapPin },
  { key: 'coupons', title: '我的优惠券', icon: Ticket, badge: '2' },
  { key: 'feedback', title: '意见反馈', icon: Headphones },
  { key: 'help', title: '帮助中心', icon: HelpCircle },
  { key: 'about', title: '关于我们', icon: Building },
]

export function ProfilePage({
  themeSettings,
  isDarkMode = false,
  effectiveViewerRole = 'user',
  onEscortEntryClick,
  onWorkbenchClick,
  onExitEscortMode,
}: ProfilePageProps) {
  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  const isEscort = effectiveViewerRole === 'escort'

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-4'>
      {/* 用户头部 */}
      <div
        className='px-4 pt-8 pb-6'
        style={{
          background: `linear-gradient(180deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor}dd 100%)`,
        }}
      >
        {/* 陪诊员身份提示条 */}
        {isEscort && (
          <div className='flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-white/10'>
            <div className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4 text-white' />
              <span className='text-sm text-white'>陪诊员模式</span>
            </div>
            <button
              onClick={onExitEscortMode}
              className='flex items-center gap-1 px-2 py-1 rounded text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors'
            >
              <LogOut className='h-3 w-3' />
              <span>退出</span>
            </button>
          </div>
        )}

        <div className='flex items-center gap-3'>
          {/* 头像 */}
          <div className='h-16 w-16 rounded-full bg-white/20 flex items-center justify-center'>
            <User className='h-8 w-8 text-white' />
          </div>
          {/* 用户信息 */}
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <span className='text-lg font-semibold text-white'>微信用户</span>
              {isEscort && (
                <span className='px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white'>
                  陪诊员
                </span>
              )}
            </div>
            <span className='text-sm text-white/80'>138****8888</span>
          </div>
          {/* 设置按钮 */}
          <div className='p-2 cursor-pointer'>
            <Settings className='h-5 w-5 text-white' />
          </div>
        </div>
      </div>

      {/* 订单统计 */}
      <div className='px-3 -mt-4'>
        <div className='rounded-xl overflow-hidden' style={{ backgroundColor: cardBg }}>
          <div className='flex items-center justify-between px-4 py-3 border-b' style={{ borderColor }}>
            <span className='text-sm font-medium' style={{ color: textPrimary }}>我的订单</span>
            <div className='flex items-center gap-0.5 cursor-pointer' style={{ color: textMuted }}>
              <span className='text-xs'>全部订单</span>
              <ChevronRight className='h-4 w-4' />
            </div>
          </div>
          <div className='flex py-4'>
            {orderEntries.map(entry => {
              const IconComp = entry.icon
              return (
                <div
                  key={entry.key}
                  className='flex-1 flex flex-col items-center gap-1.5 cursor-pointer'
                >
                  <div className='relative'>
                    <IconComp className='h-6 w-6' style={{ color: textSecondary }} />
                    {entry.count > 0 && (
                      <span
                        className='absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] text-white flex items-center justify-center'
                        style={{ backgroundColor: '#ff4d4f' }}
                      >
                        {entry.count}
                      </span>
                    )}
                  </div>
                  <span className='text-xs' style={{ color: textSecondary }}>{entry.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className='px-3 mt-3'>
        <div className='rounded-xl overflow-hidden' style={{ backgroundColor: cardBg }}>
          {menuItems.map((item, index) => {
            const IconComp = item.icon
            return (
              <div
                key={item.key}
                className='flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:opacity-80 active:opacity-60'
                style={{
                  borderBottom: index < menuItems.length - 1 ? `1px solid ${borderColor}` : 'none',
                }}
              >
                <div className='flex items-center gap-3'>
                  <IconComp className='h-5 w-5' style={{ color: textSecondary }} />
                  <span className='text-sm' style={{ color: textPrimary }}>{item.title}</span>
                </div>
                <div className='flex items-center gap-2'>
                  {item.badge && (
                    <span
                      className='px-2 py-0.5 rounded-full text-[10px] text-white'
                      style={{ backgroundColor: '#ff4d4f' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className='h-4 w-4' style={{ color: textMuted }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 陪诊员入口卡片 */}
      <div className='px-3 mt-3'>
        <div
          className='rounded-xl flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:shadow-md'
          style={{
            backgroundColor: cardBg,
            border: isEscort ? `1px solid ${themeSettings.primaryColor}40` : 'none',
          }}
          onClick={isEscort ? onWorkbenchClick : onEscortEntryClick}
        >
          <div
            className='w-10 h-10 rounded-full flex items-center justify-center'
            style={{
              backgroundColor: isEscort ? themeSettings.primaryColor : `${themeSettings.primaryColor}20`,
            }}
          >
            <Briefcase
              className='h-5 w-5'
              style={{ color: isEscort ? '#ffffff' : themeSettings.primaryColor }}
            />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium' style={{ color: textPrimary }}>
              {isEscort ? '陪诊员工作台' : '成为陪诊员'}
            </p>
            <p className='text-xs' style={{ color: textMuted }}>
              {isEscort ? '管理订单、查看收入' : '加入我们，开启陪诊服务'}
            </p>
          </div>
          <div
            className='px-4 py-1.5 rounded-full text-xs text-white'
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            {isEscort ? '进入工作台' : '立即加入'}
          </div>
        </div>
      </div>

      {/* 客服卡片 */}
      <div className='px-3 mt-3'>
        <div
          className='rounded-xl flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:shadow-md'
          style={{ backgroundColor: cardBg }}
        >
          <Headphones className='h-6 w-6 text-green-500' />
          <div className='flex-1'>
            <p className='text-sm font-medium' style={{ color: textPrimary }}>在线客服</p>
            <p className='text-xs' style={{ color: textMuted }}>工作时间 9:00-18:00</p>
          </div>
          <div
            className='px-4 py-1.5 rounded-full text-xs text-white'
            style={{ backgroundColor: '#52c41a' }}
          >
            立即咨询
          </div>
        </div>
      </div>
    </div>
  )
}
