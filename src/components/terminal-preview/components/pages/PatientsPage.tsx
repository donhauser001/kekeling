/**
 * 就诊人列表页面（预览器版本）
 *
 * 用户管理就诊人信息
 * - page key: 'patients'
 * - 支持添加、编辑、删除、设为默认
 */

import { useState } from 'react'
import { ArrowLeft, Plus, User, Phone, CreditCard, Star, ChevronRight, MoreHorizontal, Trash2, Edit, UserCheck } from 'lucide-react'
import type { ThemeSettings } from '../../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface PatientsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

/** 就诊人信息 */
interface Patient {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  phone: string
  idCard?: string
  relation: string
  isDefault: boolean
}

// Mock 就诊人数据
const mockPatients: Patient[] = [
  {
    id: '1',
    name: '张三',
    gender: 'male',
    age: 35,
    phone: '138****8888',
    idCard: '110***********1234',
    relation: '本人',
    isDefault: true,
  },
  {
    id: '2',
    name: '李小明',
    gender: 'male',
    age: 8,
    phone: '138****8888',
    idCard: '110***********5678',
    relation: '子女',
    isDefault: false,
  },
  {
    id: '3',
    name: '王阿姨',
    gender: 'female',
    age: 62,
    phone: '139****9999',
    idCard: '110***********9012',
    relation: '父母',
    isDefault: false,
  },
]

// ============================================================================
// 组件实现
// ============================================================================

export function PatientsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
}: PatientsPageProps) {
  // 操作菜单状态
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  // 就诊人列表状态（用于模拟删除、设为默认等操作）
  const [patients, setPatients] = useState<Patient[]>(mockPatients)

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 设为默认
  const handleSetDefault = (id: string) => {
    setPatients(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id,
    })))
    setActiveMenuId(null)
  }

  // 删除就诊人
  const handleDelete = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id))
    setActiveMenuId(null)
  }

  // 编辑就诊人
  const handleEdit = (id: string) => {
    onNavigate?.('patient-edit', { id })
    setActiveMenuId(null)
  }

  // 添加就诊人
  const handleAdd = () => {
    onNavigate?.('patient-edit')
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-4'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={onBack}
          className='w-8 h-8 flex items-center justify-center text-white'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-base font-semibold text-white'>就诊人管理</h1>
        <button
          onClick={handleAdd}
          className='w-8 h-8 flex items-center justify-center text-white'
        >
          <Plus className='h-5 w-5' />
        </button>
      </div>

      {/* 就诊人列表 */}
      <div className='px-3 pt-3 space-y-3'>
        {patients.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <User className='h-16 w-16' style={{ color: textMuted }} />
            <p className='mt-4 text-sm' style={{ color: textMuted }}>
              暂无就诊人信息
            </p>
            <button
              onClick={handleAdd}
              className='mt-4 px-6 py-2 rounded-full text-sm text-white'
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              添加就诊人
            </button>
          </div>
        ) : (
          patients.map(patient => (
            <div
              key={patient.id}
              className='rounded-xl overflow-hidden relative'
              style={{ backgroundColor: cardBg }}
            >
              {/* 主内容 */}
              <div
                className='p-4 cursor-pointer hover:opacity-90 transition-opacity'
                onClick={() => handleEdit(patient.id)}
              >
                {/* 头部：姓名 + 标签 */}
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center'
                      style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
                    >
                      <User className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium' style={{ color: textPrimary }}>
                          {patient.name}
                        </span>
                        <span
                          className='px-1.5 py-0.5 rounded text-[10px]'
                          style={{
                            backgroundColor: patient.gender === 'male' ? '#e0f2fe' : '#fce7f3',
                            color: patient.gender === 'male' ? '#0284c7' : '#db2777',
                          }}
                        >
                          {patient.gender === 'male' ? '男' : '女'}
                        </span>
                        <span className='text-xs' style={{ color: textSecondary }}>
                          {patient.age}岁
                        </span>
                      </div>
                      <span className='text-xs' style={{ color: textMuted }}>
                        {patient.relation}
                      </span>
                    </div>
                  </div>
                  {/* 默认标签 + 操作按钮 */}
                  <div className='flex items-center gap-2'>
                    {patient.isDefault && (
                      <span
                        className='px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-0.5'
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                        <Star className='h-3 w-3' />
                        默认
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === patient.id ? null : patient.id)
                      }}
                      className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors'
                    >
                      <MoreHorizontal className='h-4 w-4' style={{ color: textSecondary }} />
                    </button>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className='space-y-2 ml-12'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-3.5 w-3.5' style={{ color: textMuted }} />
                    <span className='text-xs' style={{ color: textSecondary }}>
                      {patient.phone}
                    </span>
                  </div>
                  {patient.idCard && (
                    <div className='flex items-center gap-2'>
                      <CreditCard className='h-3.5 w-3.5' style={{ color: textMuted }} />
                      <span className='text-xs' style={{ color: textSecondary }}>
                        {patient.idCard}
                      </span>
                    </div>
                  )}
                </div>

                {/* 编辑入口 */}
                <div
                  className='flex items-center justify-end mt-3 pt-3 border-t'
                  style={{ borderColor }}
                >
                  <div className='flex items-center gap-0.5' style={{ color: textMuted }}>
                    <span className='text-xs'>编辑信息</span>
                    <ChevronRight className='h-4 w-4' />
                  </div>
                </div>
              </div>

              {/* 操作菜单下拉 */}
              {activeMenuId === patient.id && (
                <div
                  className='absolute right-3 top-14 z-10 rounded-lg shadow-lg py-1 min-w-[120px]'
                  style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(patient.id)
                    }}
                    className='w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors'
                  >
                    <Edit className='h-4 w-4' style={{ color: textSecondary }} />
                    <span className='text-sm' style={{ color: textPrimary }}>编辑</span>
                  </button>
                  {!patient.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetDefault(patient.id)
                      }}
                      className='w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors'
                    >
                      <UserCheck className='h-4 w-4' style={{ color: themeSettings.primaryColor }} />
                      <span className='text-sm' style={{ color: themeSettings.primaryColor }}>设为默认</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(patient.id)
                    }}
                    className='w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors'
                  >
                    <Trash2 className='h-4 w-4 text-red-500' />
                    <span className='text-sm text-red-500'>删除</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 底部添加按钮 */}
      {patients.length > 0 && (
        <div className='px-3 mt-4'>
          <button
            onClick={handleAdd}
            className='w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2'
            style={{
              backgroundColor: `${themeSettings.primaryColor}10`,
              color: themeSettings.primaryColor,
              border: `1px dashed ${themeSettings.primaryColor}`,
            }}
          >
            <Plus className='h-4 w-4' />
            添加就诊人
          </button>
        </div>
      )}

      {/* 点击遮罩层关闭菜单 */}
      {activeMenuId && (
        <div
          className='fixed inset-0 z-0'
          onClick={() => setActiveMenuId(null)}
        />
      )}
    </div>
  )
}
