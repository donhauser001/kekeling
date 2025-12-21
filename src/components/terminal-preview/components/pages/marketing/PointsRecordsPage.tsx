/**
 * 积分明细页面
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings } from '../../../types'
import { previewApi } from '../../../api'
import type { PointsRecord } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface PointsRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string) => void
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function PointsRecordsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
}: PointsRecordsPageProps) {
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 获取积分记录
  const fetchRecords = () => {
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getPointsRecords()
      .then((data) => setRecords(data?.data ?? []))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const isEmpty = !isLoading && records.length === 0

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 导航栏 ========== */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
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
          {onBack && (
            <Box
              onClick={onBack}
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
          )}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            积分明细
          </Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                style={{
                  padding: 12 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: cardBg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Box
                    style={{
                      height: 14 * wxScale,
                      width: 120 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                      marginBottom: 8 * wxScale,
                    }}
                  />
                  <Box
                    style={{
                      height: 12 * wxScale,
                      width: 80 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                    }}
                  />
                </Box>
                <Box
                  style={{
                    height: 16 * wxScale,
                    width: 40 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* 请求失败 */}
        {isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="close" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              加载失败
            </Text>
            <Box
              onClick={fetchRecords}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>点击重试</Text>
            </Box>
          </Box>
        )}

        {/* 空状态 */}
        {isEmpty && !isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="checklist" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              暂无积分记录
            </Text>
            {onNavigate && (
              <Box
                onClick={() => onNavigate('points')}
                style={{
                  marginTop: 16 * wxScale,
                  paddingLeft: 16 * wxScale,
                  paddingRight: 16 * wxScale,
                  paddingTop: 8 * wxScale,
                  paddingBottom: 8 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: primaryColor,
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#fff' }}>
                  去赚积分
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* 记录列表 */}
        {!isLoading && !isError && records.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
            {records.map((record) => (
              <RecordItem key={record.id} record={record} isDarkMode={isDarkMode} />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

// ============================================================================
// 记录项子组件
// ============================================================================

interface RecordItemProps {
  record: PointsRecord
  isDarkMode: boolean
}

function RecordItem({ record, isDarkMode }: RecordItemProps) {
  const isEarn = record.type === 'earn' || record.type === 'refund'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12 * wxScale,
        borderRadius: 8 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box>
        <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>{record.description}</Text>
        <Text
          style={{
            display: 'block',
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {formatDate(record.createdAt)}
        </Text>
      </Box>
      <Text
        style={{
          fontSize: 16 * wxScale,
          fontWeight: 500,
          color: isEarn ? '#22c55e' : '#ef4444',
        }}
      >
        {record.points > 0 ? '+' : ''}{record.points}
      </Text>
    </Box>
  )
}
