/**
 * 服务项目选择页面（预览器版本）
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
 * 用于陪诊员选择可接单的服务项目
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

// ============================================================================
// 类型定义
// ============================================================================

export interface ServiceTypesPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
  unit?: string
  orderCount: number
  category?: { name: string }
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function ServiceTypesPageSkeleton({
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

      {/* 提示文字骨架 */}
      <Box style={{ padding: 12 * wxScale }}>
        <Box
          style={{
            width: '80%',
            height: 16 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
          }}
        />
      </Box>

      {/* 列表骨架 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Box
          style={{
            backgroundColor: cardBg,
            borderRadius: 12 * wxScale,
            overflow: 'hidden',
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderBottom: i < 5 ? `1px solid ${isDarkMode ? '#3a3a3a' : '#f0f0f0'}` : 'none',
              }}
            >
              <Box style={{ flex: 1 }}>
                <Box
                  style={{
                    width: 120 * wxScale,
                    height: 16 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    marginBottom: 8 * wxScale,
                  }}
                />
                <Box
                  style={{
                    width: 80 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                  }}
                />
              </Box>
              <Box
                style={{
                  width: 24 * wxScale,
                  height: 24 * wxScale,
                  borderRadius: 12 * wxScale,
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
// 组件实现
// ============================================================================

export function ServiceTypesPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: ServiceTypesPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'

  // 数据状态
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  // 数据获取
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    previewApi
      .getServices({ pageSize: 50 })
      .then((result) => {
        const items = result.data || []
        setServices(items)
        // 默认选中前3个
        if (items.length > 0 && !initialized) {
          const defaultSelected = items.slice(0, 3).map((s: ServiceItem) => s.id)
          setSelectedIds(new Set(defaultSelected))
          setInitialized(true)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isEscort, initialized])

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSave = () => {
    onNavigate?.('workbench-settings')
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
              服务项目
            </Text>
            <Box style={{ width: 36 * wxScale }} />
          </Box>
        </Box>

        <Box style={{ padding: 16 * wxScale, paddingTop: 32 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号管理服务项目"
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
      <ServiceTypesPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
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
            服务项目
          </Text>
          {/* 保存按钮 */}
          <Box
            onClick={handleSave}
            style={{
              position: 'absolute',
              right: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: '#fff',
              }}
            >
              保存
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
          选择您可以提供的服务项目，系统将根据您的选择推送相关订单
        </Text>
      </Box>

      {/* 服务项目列表 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        {services.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
              暂无服务项目
            </Text>
          </Box>
        ) : (
          <Box
            style={{
              backgroundColor: cardBg,
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
            }}
          >
            {services.map((service, index) => {
              const isSelected = selectedIds.has(service.id)
              const isLast = index === services.length - 1
              return (
                <Box
                  key={service.id}
                  onClick={() => handleToggle(service.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 12 * wxScale,
                    borderBottom: isLast ? 'none' : `1px solid ${borderColor}`,
                  }}
                >
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8 * wxScale,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14 * wxScale,
                          fontWeight: 500,
                          color: textPrimary,
                        }}
                      >
                        {service.name}
                      </Text>
                      {service.category && (
                        <Text
                          style={{
                            fontSize: 12 * wxScale,
                            paddingLeft: 6 * wxScale,
                            paddingRight: 6 * wxScale,
                            paddingTop: 2 * wxScale,
                            paddingBottom: 2 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor,
                          }}
                        >
                          {service.category.name}
                        </Text>
                      )}
                    </Box>
                    {service.description && (
                      <Text
                        style={{
                          display: 'block',
                          fontSize: 12 * wxScale,
                          marginTop: 2 * wxScale,
                          color: textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {service.description}
                      </Text>
                    )}
                    <Text
                      style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        marginTop: 4 * wxScale,
                        color: textSecondary,
                      }}
                    >
                      ¥{service.price}
                      {service.unit ? `/${service.unit}` : ''} · 已售{service.orderCount}单
                    </Text>
                  </Box>
                  <Box
                    style={{
                      width: 24 * wxScale,
                      height: 24 * wxScale,
                      borderRadius: 12 * wxScale,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 12 * wxScale,
                      flexShrink: 0,
                      backgroundColor: isSelected
                        ? primaryColor
                        : isDarkMode
                          ? '#3a3a3a'
                          : '#e5e7eb',
                    }}
                  >
                    {isSelected && <Icon name="check" size={16 * wxScale} color="#fff" />}
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* 已选择数量提示 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            textAlign: 'center',
            color: textSecondary,
          }}
        >
          已选择 {selectedIds.size} 项服务
        </Text>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
