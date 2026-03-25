/**
 * 就诊人列表页面（预览器版本）
 *
 * 用户管理就诊人信息
 * - page key: 'patients'
 * - 支持添加、编辑、删除、设为默认
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect, useCallback } from 'react'
import { Box, Text, ScrollView, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { PatientsPageSkeleton } from '../PatientsPageSkeleton'
import { previewApi } from '../../api'
import { getWxBridge } from '../../bridge'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface PatientsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  selectMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onSelectPatient?: (patientId: string) => void
  /** 刷新触发器，值变化时重新加载数据 */
  refreshTrigger?: number
}

/** 就诊人信息（页面展示用） */
interface Patient {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number | null
  phone: string
  idCard?: string
  relation: string
  isDefault: boolean
}

// ============================================================================
// 工具函数
// ============================================================================

/** 从生日计算年龄 */
function calculateAge(birthday: string | null | undefined): number | null {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/** 脱敏手机号 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/** 脱敏身份证号 */
function maskIdCard(idCard: string | null | undefined): string | undefined {
  if (!idCard || idCard.length < 10) return idCard || undefined
  return idCard.slice(0, 3) + '***********' + idCard.slice(-4)
}

// ============================================================================
// 子组件
// ============================================================================

/** 患者卡片 */
function PatientCard({
  patient,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onSetDefault,
  onDelete,
  themeSettings,
  isDarkMode,
}: {
  patient: Patient
  isMenuOpen: boolean
  onToggleMenu: () => void
  onEdit: () => void
  onSetDefault: () => void
  onDelete: () => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const primaryColor = themeSettings.primaryColor

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        overflow: 'visible',
        position: 'relative',
        zIndex: isMenuOpen ? 20 : 1,
        backgroundColor: cardBg,
        marginBottom: 12 * wxScale,
      }}
    >
      {/* 主内容 */}
      <Box
        onClick={onEdit}
        style={{
          padding: 16 * wxScale,
        }}
      >
        {/* 头部：姓名 + 标签 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12 * wxScale,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            <Box
              style={{
                width: 40 * wxScale,
                height: 40 * wxScale,
                borderRadius: 20 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${primaryColor}20`,
              }}
            >
              <Icon name="user" size={20 * wxScale} color={primaryColor} />
            </Box>
            <Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                  {patient.name}
                </Text>
                <Box
                  style={{
                    paddingLeft: 6 * wxScale,
                    paddingRight: 6 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: patient.gender === 'male' ? '#e0f2fe' : '#fce7f3',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10 * wxScale,
                      color: patient.gender === 'male' ? '#0284c7' : '#db2777',
                    }}
                  >
                    {patient.gender === 'male' ? '男' : '女'}
                  </Text>
                </Box>
                {patient.age !== null && (
                  <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                    {patient.age}岁
                  </Text>
                )}
              </Box>
              <Text style={{ fontSize: 12 * wxScale, color: textMuted, marginTop: 2 * wxScale }}>
                {patient.relation}
              </Text>
            </Box>
          </Box>

          {/* 默认标签 + 操作按钮 */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            {patient.isDefault && (
              <Box
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 2 * wxScale,
                  paddingBottom: 2 * wxScale,
                  borderRadius: 9999,
                  backgroundColor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2 * wxScale,
                }}
              >
                <Icon name="like" size={12 * wxScale} color="#fff" />
                <Text style={{ fontSize: 10 * wxScale, color: '#fff' }}>默认</Text>
              </Box>
            )}
            <Box
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onToggleMenu()
              }}
              style={{
                width: 32 * wxScale,
                height: 32 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16 * wxScale,
              }}
            >
              <Icon name="more-one" size={16 * wxScale} color={textSecondary} />
            </Box>
          </Box>
        </Box>

        {/* 详细信息 */}
        <Box style={{ marginLeft: 48 * wxScale }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginBottom: 8 * wxScale }}>
            <Icon name="phone-telephone" size={14 * wxScale} color={textMuted} />
            <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{patient.phone}</Text>
          </Box>
          {patient.idCard && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
              <Icon name="id-card-h" size={14 * wxScale} color={textMuted} />
              <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{patient.idCard}</Text>
            </Box>
          )}
        </Box>

        {/* 编辑入口 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: 12 * wxScale,
            paddingTop: 12 * wxScale,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            borderTopStyle: 'solid',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>编辑信息</Text>
            <Icon name="right" size={16 * wxScale} color={textMuted} />
          </Box>
        </Box>
      </Box>

      {/* 操作菜单下拉 */}
      {isMenuOpen && (
        <Box
          style={{
            position: 'absolute',
            right: 12 * wxScale,
            top: 56 * wxScale,
            zIndex: 10,
            borderRadius: 8 * wxScale,
            paddingTop: 4 * wxScale,
            paddingBottom: 4 * wxScale,
            minWidth: 120 * wxScale,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: borderColor,
            borderStyle: 'solid',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Box
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onEdit()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
            }}
          >
            <Icon name="edit" size={16 * wxScale} color={textSecondary} />
            <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>编辑</Text>
          </Box>
          {!patient.isDefault && (
            <Box
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onSetDefault()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8 * wxScale,
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
              }}
            >
              <Icon name="check-one" size={16 * wxScale} color={primaryColor} />
              <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>设为默认</Text>
            </Box>
          )}
          <Box
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
            }}
          >
            <Icon name="delete" size={16 * wxScale} color="#ef4444" />
            <Text style={{ fontSize: 14 * wxScale, color: '#ef4444' }}>删除</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function PatientsPage({
  themeSettings,
  isDarkMode,
  selectMode = false,
  onBack,
  onNavigate,
  onSelectPatient,
  refreshTrigger,
}: PatientsPageProps) {
  // 操作菜单状态
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  // 就诊人列表状态
  const [patients, setPatients] = useState<Patient[]>([])
  // 加载状态（用于骨架屏）
  const [isLoading, setIsLoading] = useState(true)
  // 操作中状态
  const [isOperating, setIsOperating] = useState(false)

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const primaryColor = themeSettings.primaryColor
  const wxBridge = getWxBridge()

  // 加载就诊人列表
  const loadPatients = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await previewApi.getPatients()
      // 转换 API 数据为页面展示格式
      const formattedPatients: Patient[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        gender: (p.gender === 'male' || p.gender === 'female' ? p.gender : 'male') as 'male' | 'female',
        age: calculateAge((p as { birthday?: string }).birthday),
        phone: maskPhone(p.phone),
        idCard: maskIdCard(p.idCard),
        relation: p.relation,
        isDefault: p.isDefault ?? false,
      }))
      setPatients(formattedPatients)
    } catch (error) {
      console.error('[PatientsPage] 加载就诊人失败:', error)
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始加载 & refreshTrigger 变化时刷新
  useEffect(() => {
    loadPatients()
  }, [loadPatients, refreshTrigger])

  // 加载中显示骨架屏
  if (isLoading) {
    return (
      <PatientsPageSkeleton
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
    )
  }

  // 设为默认
  const handleSetDefault = async (id: string) => {
    if (isOperating) return
    setIsOperating(true)
    try {
      await previewApi.setDefaultPatient(id)
      // 更新本地状态
      setPatients(prev => prev.map(p => ({
        ...p,
        isDefault: p.id === id,
      })))
      wxBridge.showToast({ title: '已设为默认就诊人', icon: 'success' })
    } catch (error) {
      console.error('[PatientsPage] 设为默认失败:', error)
      const message = error instanceof Error ? error.message : '设为默认失败'
      wxBridge.showToast({ title: message, icon: 'none' })
    } finally {
      setIsOperating(false)
      setActiveMenuId(null)
    }
  }

  // 删除就诊人
  const handleDelete = async (id: string) => {
    if (isOperating) return
    const patient = patients.find((item) => item.id === id)
    const result = await wxBridge.showModal({
      title: '删除就诊人',
      content: patient
        ? `确认删除就诊人“${patient.name}”吗？`
        : '确认删除这个就诊人吗？',
      confirmText: '删除',
    })
    if (!result.confirm) {
      setActiveMenuId(null)
      return
    }
    setIsOperating(true)
    try {
      await previewApi.deletePatient(id)
      // 更新本地状态
      setPatients(prev => prev.filter(p => p.id !== id))
      wxBridge.showToast({ title: '删除成功', icon: 'success' })
    } catch (error) {
      console.error('[PatientsPage] 删除就诊人失败:', error)
      const message = error instanceof Error ? error.message : '删除失败'
      wxBridge.showToast({ title: message, icon: 'none' })
    } finally {
      setIsOperating(false)
      setActiveMenuId(null)
    }
  }

  // 编辑就诊人
  const handleEdit = (id: string) => {
    onNavigate?.('patient-edit', { id })
    setActiveMenuId(null)
  }

  const handleCardClick = (id: string) => {
    if (selectMode) {
      onSelectPatient?.(id)
      setActiveMenuId(null)
      return
    }
    handleEdit(id)
  }

  // 添加就诊人
  const handleAdd = () => {
    onNavigate?.('patient-edit')
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 16 * wxScale,
      }}
    >
      {/* 顶部导航栏 - 符合规范 3.3.2 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
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
          {/* 返回按钮（绝对定位左侧） */}
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
          {/* 标题（居中） */}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            就诊人管理
          </Text>
          {/* 右侧区域留空，不放操作按钮（避免胶囊遮挡） */}
        </Box>
      </Box>

      {/* 就诊人列表 */}
      <ScrollView style={{ flex: 1 }}>
        {/* 内容容器 - 小程序中 ScrollView 的 padding 可能不生效，用 Box 包裹 */}
        <Box
          style={{
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          {patients.length === 0 ? (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 64 * wxScale,
                paddingBottom: 64 * wxScale,
              }}
            >
              <Icon name="user" size={64 * wxScale} color={textMuted} />
              <Text style={{ marginTop: 16 * wxScale, fontSize: 14 * wxScale, color: textMuted }}>
                暂无就诊人信息
              </Text>
              <Box
                onClick={handleAdd}
                style={{
                  marginTop: 16 * wxScale,
                  paddingLeft: 24 * wxScale,
                  paddingRight: 24 * wxScale,
                  paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                  paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                  borderRadius: 9999,
                  backgroundColor: primaryColor,
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>添加就诊人</Text>
              </Box>
            </Box>
          ) : (
            <>
              {patients.map(patient => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  isMenuOpen={activeMenuId === patient.id}
                  onToggleMenu={() => setActiveMenuId(activeMenuId === patient.id ? null : patient.id)}
                  onEdit={() => handleCardClick(patient.id)}
                  onSetDefault={() => handleSetDefault(patient.id)}
                  onDelete={() => handleDelete(patient.id)}
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                />
              ))}

              {/* 底部添加按钮 */}
              <Box
                onClick={handleAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8 * wxScale,
                  paddingTop: 12 * wxScale,
                  paddingBottom: 12 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: `${primaryColor}10`,
                  borderWidth: 1,
                  borderColor: primaryColor,
                  borderStyle: 'dashed',
                }}
              >
                <Icon name="plus" size={16 * wxScale} color={primaryColor} />
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: primaryColor }}>
                  添加就诊人
                </Text>
              </Box>
            </>
          )}
        </Box>
      </ScrollView>

      {/* 点击遮罩层关闭菜单 */}
      {activeMenuId && (
        <Box
          onClick={() => setActiveMenuId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        />
      )}
    </Box>
  )
}
