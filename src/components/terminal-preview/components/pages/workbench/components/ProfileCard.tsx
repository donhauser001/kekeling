/**
 * 陪诊员个人信息卡片组件
 *
 * 按小程序页面改造规范实现：
 * - 使用跨平台原语 Box, Text, Image
 * - 布局属性在 style 中定义
 * - 使用 lucide-compat 图标
 * - wxScale 用于视觉尺寸
 */

import { useState } from 'react'
import { Box, Text, Image } from '../../../../ui/primitives'
import { User, Settings, Award, ChevronDown, Check } from '../../../../ui/lucide-compat'
import { getFullResourceUrl } from '../../../../platform/config'
import type { ProfileCardProps, EscortWorkStatus } from '../types'
import { STATUS_CONFIG, STATUS_ORDER } from '../types'

export function ProfileCard({
  profile,
  stats,
  workStatus,
  onStatusChange,
  onSettingsClick,
  themeSettings,
  isDarkMode,
  wxScale,
}: ProfileCardProps) {
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const currentConfig = STATUS_CONFIG[workStatus]

  // 服务中时禁止切换状态
  const isBusy = workStatus === 'busy'
  // 可选择的状态列表（排除 busy，因为 busy 是系统自动设置的）
  const selectableStatuses = STATUS_ORDER.filter(s => s !== 'busy')

  const handleStatusSelect = (status: EscortWorkStatus) => {
    if (isBusy) return // 服务中禁止切换
    onStatusChange(status)
    setShowStatusPicker(false)
  }
  
  const handleTogglePicker = () => {
    if (isBusy) return // 服务中禁止打开选择器
    setShowStatusPicker(!showStatusPicker)
  }

  // 脱敏手机号
  const maskedPhone = profile.phone
    ? `${profile.phone.slice(0, 3)}****${profile.phone.slice(-4)}`
    : ''

  // 等级名称
  const levelName = profile.level?.name || (profile.levelCode ? '认证陪诊员' : '')

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        // 不设置 overflow: hidden，否则会裁切下拉菜单
      }}
    >
      {/* 上半部分：头像和基本信息 */}
      <Box
        style={{
          padding: 20 * wxScale,
          paddingBottom: 16 * wxScale,
          position: 'relative',
          background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor}dd 100%)`,
          borderTopLeftRadius: 12 * wxScale,
          borderTopRightRadius: 12 * wxScale,
        }}
      >
        {/* 右上角设置按钮 */}
        <Box
          onClick={onSettingsClick}
          style={{
            position: 'absolute',
            top: 12 * wxScale,
            right: 12 * wxScale,
            width: 32 * wxScale,
            height: 32 * wxScale,
            borderRadius: 16 * wxScale,
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={16 * wxScale} color="#fff" />
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16 * wxScale,
          }}
        >
          {/* 头像 */}
          <Box
            style={{
              width: 64 * wxScale,
              height: 64 * wxScale,
              borderRadius: 32 * wxScale,
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {profile.avatar ? (
              <Image
                src={getFullResourceUrl(profile.avatar)}
                mode="aspectFill"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : (
              <User size={32 * wxScale} color="#fff" />
            )}
          </Box>

          {/* 信息 */}
          <Box style={{ flex: 1 }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8 * wxScale,
              }}
            >
              <Text
                style={{
                  display: 'block',
                  fontSize: 18 * wxScale,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {profile.name || '陪诊员'}
              </Text>
              {levelName && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2 * wxScale,
                    paddingLeft: 8 * wxScale,
                    paddingRight: 8 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 9999,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Award size={12 * wxScale} color="#fff" />
                  <Text
                    style={{
                      fontSize: 10 * wxScale,
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    {levelName}
                  </Text>
                </Box>
              )}
            </Box>
            <Text
              style={{
                display: 'block',
                marginTop: 4 * wxScale,
                fontSize: 14 * wxScale,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {maskedPhone}
            </Text>
          </Box>
        </Box>

        {/* 在线状态 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12 * wxScale,
            marginTop: 16 * wxScale,
          }}
        >
          {/* 状态选择按钮 */}
          <Box style={{ position: 'relative' }}>
            <Box
              onClick={handleTogglePicker}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8 * wxScale,
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 6 * wxScale,
                paddingBottom: 6 * wxScale,
                borderRadius: 9999,
                backgroundColor: 'rgba(255,255,255,0.15)',
                opacity: isBusy ? 0.7 : 1,
              }}
            >
              <Box
                style={{
                  width: 8 * wxScale,
                  height: 8 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: currentConfig.color === '#10b981' ? '#4ade80' : currentConfig.color,
                }}
              />
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: '#fff',
                }}
              >
                {currentConfig.shortLabel}
              </Text>
              {/* 服务中不显示下拉箭头 */}
              {!isBusy && (
              <ChevronDown
                size={16 * wxScale}
                color="rgba(255,255,255,0.7)"
                style={{
                  transform: showStatusPicker ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
              )}
            </Box>

            {/* 状态选择面板（服务中时不显示） */}
            {showStatusPicker && !isBusy && (
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  marginTop: 8 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 20,
                }}
              >
                {selectableStatuses.map((status) => {
                  const config = STATUS_CONFIG[status]
                  const isActive = workStatus === status
                  return (
                    <Box
                      key={status}
                      onClick={() => handleStatusSelect(status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10 * wxScale,
                        paddingLeft: 16 * wxScale,
                        paddingRight: 16 * wxScale,
                        paddingTop: 10 * wxScale,
                        paddingBottom: 10 * wxScale,
                        backgroundColor: isActive
                          ? (isDarkMode ? 'rgba(255,255,255,0.1)' : '#f9fafb')
                          : 'transparent',
                      }}
                    >
                      <Box
                        style={{
                          width: 8 * wxScale,
                          height: 8 * wxScale,
                          borderRadius: 4 * wxScale,
                          backgroundColor: config.color,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14 * wxScale,
                          fontWeight: 500,
                          color: isActive ? config.color : (isDarkMode ? '#e5e7eb' : '#374151'),
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {config.shortLabel}
                      </Text>
                      {isActive && (
                        <Check size={16 * wxScale} color={config.color} />
                      )}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>

          {/* 状态说明 */}
          <Text
            style={{
              flex: 1,
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {isBusy ? '服务完成后可切换状态' : currentConfig.description}
          </Text>
        </Box>
      </Box>

      {/* 下半部分：数据统计 */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          borderBottomLeftRadius: 12 * wxScale,
          borderBottomRightRadius: 12 * wxScale,
        }}
      >
        <StatItem
          label="评分"
          value={stats.rating?.toFixed(1) || '-'}
          icon="star"
          wxScale={wxScale}
          isDarkMode={isDarkMode}
        />
        <Box
          style={{
            width: 1,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
          }}
        />
        <StatItem
          label="服务单"
          value={String(stats.totalOrders || 0)}
          wxScale={wxScale}
          isDarkMode={isDarkMode}
        />
        <Box
          style={{
            width: 1,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
          }}
        />
        <StatItem
          label="今日完成"
          value={String(stats.completedOrders || 0)}
          wxScale={wxScale}
          isDarkMode={isDarkMode}
        />
      </Box>
    </Box>
  )
}

// 统计项子组件
interface StatItemProps {
  label: string
  value: string
  icon?: 'star'
  wxScale: number
  isDarkMode: boolean
}

function StatItem({ label, value, icon, wxScale, isDarkMode }: StatItemProps) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2 * wxScale,
        }}
      >
        {icon === 'star' && (
          <Text
            style={{
              fontSize: 16 * wxScale,
              color: '#fbbf24',
            }}
          >
            ★
          </Text>
        )}
        <Text
          style={{
            fontSize: 18 * wxScale,
            fontWeight: 700,
            color: isDarkMode ? '#fff' : '#111827',
          }}
        >
          {value}
        </Text>
      </Box>
      <Text
        style={{
          marginTop: 2 * wxScale,
          fontSize: 12 * wxScale,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
