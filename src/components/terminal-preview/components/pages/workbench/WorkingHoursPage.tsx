/**
 * 工作时间设置页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: HTML 元素 → 跨平台原语
 * - 规则 4.1: 添加骨架屏
 * - 规则 11: 导航栏预留安全区域
 *
 * 用于陪诊员设置工作时间
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 时间选项
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0') + ':00'
)

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkingHoursPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function WorkingHoursPageSkeleton({
  primaryColor,
  isDarkMode,
}: {
  primaryColor: string
  isDarkMode: boolean
}) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 24 * wxScale,
              height: 24 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Box
            style={{
              width: 80 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Box
            style={{
              width: 40 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Box>

      {/* 卡片骨架 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Box
          style={{
            backgroundColor: cardBg,
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
          }}
        >
          {[1, 2].map((i) => (
            <Box
              key={i}
              style={{
                marginBottom: i === 1 ? 24 * wxScale : 0,
              }}
            >
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 14 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginBottom: 12 * wxScale,
                }}
              />
              <Box
                style={{
                  width: '100%',
                  height: 48 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: skeletonBg,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ============================================================================
// 时间选择器组件
// ============================================================================

function TimePicker({
  label,
  value,
  onChange,
  options,
  isDarkMode,
  primaryColor,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  isDarkMode: boolean
  primaryColor: string
}) {
  const [showPicker, setShowPicker] = useState(false)
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box style={{ marginBottom: 16 * wxScale }}>
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          fontWeight: 500,
          color: textSecondary,
          marginBottom: 8 * wxScale,
        }}
      >
        {label}
      </Text>
      <Box
        onClick={() => setShowPicker(!showPicker)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12 * wxScale,
          backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
          borderRadius: 8 * wxScale,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Text
          style={{
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: textPrimary,
          }}
        >
          {value}
        </Text>
        <Icon
          name={showPicker ? 'up' : 'down'}
          size={20 * wxScale}
          color={textSecondary}
        />
      </Box>

      {/* 下拉选择器 */}
      {showPicker && (
        <Box
          style={{
            marginTop: 8 * wxScale,
            backgroundColor: cardBg,
            borderRadius: 8 * wxScale,
            border: `1px solid ${borderColor}`,
            maxHeight: 200 * wxScale,
            overflowY: 'auto',
          }}
        >
          {options.map((option) => {
            const isSelected = option === value
            return (
              <Box
                key={option}
                onClick={() => {
                  onChange(option)
                  setShowPicker(false)
                }}
                style={{
                  padding: 12 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSelected ? `${primaryColor}10` : 'transparent',
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: isSelected ? primaryColor : textPrimary,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Icon name="check" size={18 * wxScale} color={primaryColor} />
                )}
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkingHoursPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: WorkingHoursPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [loading, setLoading] = useState(true)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')
  const [saving, setSaving] = useState(false)

  // 数据获取
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    previewApi
      .getWorkbenchSettings()
      .then((settings) => {
        if (settings.preferences?.workingHours) {
          setStartTime(settings.preferences.workingHours.start || '08:00')
          setEndTime(settings.preferences.workingHours.end || '18:00')
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isEscort])

  const handleSave = async () => {
    setSaving(true)
    try {
      await previewApi.updateWorkbenchPreferences({
        workingHours: {
          start: startTime,
          end: endTime,
        },
      })
      onNavigate?.('workbench-settings')
    } catch (err) {
      console.error('保存失败:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    onNavigate?.('workbench-settings')
  }

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={handleBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text
              style={{
                fontSize: 17 * wxScale,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              工作时间
            </Text>
            <Box style={{ width: 36 * wxScale }} />
          </Box>
        </Box>

        <Box style={{ padding: 16 * wxScale, paddingTop: 32 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号设置工作时间"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // 加载中
  if (loading) {
    return (
      <WorkingHoursPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
    )
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
      }}
    >
      {/* 导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={handleBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>
          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            工作时间
          </Text>
          {/* 保存按钮 */}
          <Box
            onClick={saving ? undefined : handleSave}
            style={{
              position: 'absolute',
              right: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              height: 36 * wxScale,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: '#fff',
              }}
            >
              {saving ? '保存中...' : '保存'}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* 提示文字 */}
      <Box style={{ padding: 12 * wxScale }}>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            color: textSecondary,
            lineHeight: 1.5,
          }}
        >
          设置您的日常工作时间，系统将在此时间段内为您推送订单
        </Text>
      </Box>

      {/* 时间设置卡片 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Box
          style={{
            backgroundColor: cardBg,
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
          }}
        >
          <TimePicker
            label="开始时间"
            value={startTime}
            onChange={setStartTime}
            options={HOUR_OPTIONS}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />
          <TimePicker
            label="结束时间"
            value={endTime}
            onChange={setEndTime}
            options={HOUR_OPTIONS}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />
        </Box>
      </Box>

      {/* 时间范围预览 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: `${primaryColor}10`,
            borderRadius: 12 * wxScale,
          }}
        >
          <Icon name="time" size={24 * wxScale} color={primaryColor} />
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: primaryColor,
            }}
          >
            {startTime} - {endTime}
          </Text>
        </Box>
      </Box>

      {/* 说明 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8 * wxScale,
            padding: 12 * wxScale,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fef3c7',
            borderRadius: 8 * wxScale,
          }}
        >
          <Icon name="info" size={16 * wxScale} color="#f59e0b" />
          <Text
            style={{
              flex: 1,
              fontSize: 12 * wxScale,
              color: isDarkMode ? '#fbbf24' : '#92400e',
              lineHeight: 1.5,
            }}
          >
            工作时间外，您仍可手动接单，但系统不会主动推送订单消息
          </Text>
        </Box>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}


