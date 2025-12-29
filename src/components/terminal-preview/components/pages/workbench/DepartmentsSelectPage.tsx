/**
 * 科室选择页面（预览器版本）
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
 * 用于陪诊员选择擅长的科室
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

// 预设科室列表
const DEPARTMENT_LIST = [
  { id: '1', name: '内科', icon: 'stethoscope' },
  { id: '2', name: '外科', icon: 'stethoscope' },
  { id: '3', name: '妇产科', icon: 'stethoscope' },
  { id: '4', name: '儿科', icon: 'stethoscope' },
  { id: '5', name: '骨科', icon: 'stethoscope' },
  { id: '6', name: '眼科', icon: 'stethoscope' },
  { id: '7', name: '耳鼻喉科', icon: 'stethoscope' },
  { id: '8', name: '口腔科', icon: 'stethoscope' },
  { id: '9', name: '皮肤科', icon: 'stethoscope' },
  { id: '10', name: '神经内科', icon: 'stethoscope' },
  { id: '11', name: '心血管内科', icon: 'stethoscope' },
  { id: '12', name: '消化内科', icon: 'stethoscope' },
  { id: '13', name: '呼吸内科', icon: 'stethoscope' },
  { id: '14', name: '内分泌科', icon: 'stethoscope' },
  { id: '15', name: '肿瘤科', icon: 'stethoscope' },
  { id: '16', name: '中医科', icon: 'stethoscope' },
  { id: '17', name: '康复科', icon: 'stethoscope' },
  { id: '18', name: '急诊科', icon: 'stethoscope' },
]

// ============================================================================
// 类型定义
// ============================================================================

export interface DepartmentsSelectPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

interface DepartmentItem {
  id: string
  name: string
  icon?: string
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function DepartmentsSelectPageSkeleton({
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

      {/* 网格骨架 */}
      <Box
        style={{
          padding: 16 * wxScale,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12 * wxScale,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Box
            key={i}
            style={{
              width: `calc(33.33% - ${8 * wxScale}px)`,
              height: 80 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

// ============================================================================
// 组件实现
// ============================================================================

export function DepartmentsSelectPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: DepartmentsSelectPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [departments] = useState<DepartmentItem[]>(DEPARTMENT_LIST)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // 数据获取
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    // 获取已选择的科室
    previewApi
      .getWorkbenchSettings()
      .then((settings) => {
        const selected = settings.preferences?.departments || []
        // 将科室名称转换为 ID
        const selectedSet = new Set<string>()
        selected.forEach((name: string) => {
          const dept = DEPARTMENT_LIST.find(d => d.name === name)
          if (dept) {
            selectedSet.add(dept.id)
          } else {
            // 如果是 ID，直接添加
            selectedSet.add(name)
          }
        })
        setSelectedIds(selectedSet)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isEscort])

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

  const handleSave = async () => {
    setSaving(true)
    try {
      // 将选中的 ID 转换为科室名称
      const selectedNames = Array.from(selectedIds).map(id => {
        const dept = DEPARTMENT_LIST.find(d => d.id === id)
        return dept?.name || id
      })
      await previewApi.updateWorkbenchPreferences({
        departments: selectedNames,
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
              擅长科室
            </Text>
            <Box style={{ width: 36 * wxScale }} />
          </Box>
        </Box>

        <Box style={{ padding: 16 * wxScale, paddingTop: 32 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号管理擅长科室"
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
      <DepartmentsSelectPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
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
            擅长科室
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
          选择您擅长的科室领域，有助于接到更匹配的订单
        </Text>
      </Box>

      {/* 科室网格 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12 * wxScale,
        }}
      >
        {departments.map((dept) => {
          const isSelected = selectedIds.has(dept.id)
          return (
            <Box
              key={dept.id}
              onClick={() => handleToggle(dept.id)}
              style={{
                width: `calc(33.33% - ${8 * wxScale}px)`,
                padding: 12 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: isSelected ? primaryColor : cardBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8 * wxScale,
                boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Icon
                name="stethoscope"
                size={24 * wxScale}
                color={isSelected ? '#fff' : primaryColor}
              />
              <Text
                style={{
                  fontSize: 13 * wxScale,
                  fontWeight: 500,
                  color: isSelected ? '#fff' : textPrimary,
                  textAlign: 'center',
                }}
              >
                {dept.name}
              </Text>
            </Box>
          )
        })}
      </Box>

      {/* 已选择数量提示 */}
      <Box style={{ padding: 16 * wxScale, marginTop: 'auto' }}>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            textAlign: 'center',
            color: textSecondary,
          }}
        >
          已选择 {selectedIds.size} 个科室
        </Text>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}


