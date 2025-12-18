/**
 * 地址管理列表页面
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  User,
  Check,
  MoreVertical,
  Edit,
  Trash,
  Star,
} from 'lucide-react'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

interface AddressListPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

export function AddressListPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: AddressListPageProps) {
  const queryClient = useQueryClient()
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // 获取地址列表
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['preview', 'addresses'],
    queryFn: () => previewApi.getAddresses(),
  })

  // 删除地址
  const deleteMutation = useMutation({
    mutationFn: (id: string) => previewApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'addresses'] })
    },
  })

  // 设为默认
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => previewApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'addresses'] })
    },
  })

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个地址吗？')) {
      deleteMutation.mutate(id)
    }
    setMenuOpenId(null)
  }

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id)
    setMenuOpenId(null)
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full'>
      {/* 顶部导航 */}
      <div
        className='sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b'
        style={{
          backgroundColor: cardBg,
          borderColor,
        }}
      >
        <div className='flex items-center gap-3'>
          <button
            onClick={onBack}
            className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
          >
            <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
          </button>
          <span className='font-medium' style={{ color: textPrimary }}>
            地址管理
          </span>
        </div>
        <button
          onClick={() => onNavigate?.('address-edit', { mode: 'create' })}
          className='p-2 rounded-full'
          style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
        >
          <Plus className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
        </button>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className='p-4 space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='p-4 rounded-lg animate-pulse'
              style={{ backgroundColor: cardBg }}
            >
              <div className='h-5 w-24 rounded mb-2' style={{ backgroundColor: borderColor }} />
              <div className='h-4 w-full rounded mb-2' style={{ backgroundColor: borderColor }} />
              <div className='h-4 w-32 rounded' style={{ backgroundColor: borderColor }} />
            </div>
          ))}
        </div>
      )}

      {/* 地址列表 */}
      {!isLoading && addresses.length > 0 && (
        <div className='p-4 space-y-3'>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className='relative rounded-lg overflow-hidden'
              style={{ backgroundColor: cardBg }}
            >
              {/* 默认标签 */}
              {addr.isDefault && (
                <div
                  className='absolute top-0 right-0 px-2 py-0.5 text-xs text-white rounded-bl'
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  默认
                </div>
              )}

              <div
                className='p-4 cursor-pointer'
                onClick={() => onNavigate?.('address-edit', { id: addr.id })}
              >
                {/* 联系人信息 */}
                <div className='flex items-center gap-3 mb-2'>
                  <div className='flex items-center gap-1.5'>
                    <User className='h-4 w-4' style={{ color: textSecondary }} />
                    <span className='font-medium' style={{ color: textPrimary }}>
                      {addr.name}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Phone className='h-4 w-4' style={{ color: textSecondary }} />
                    <span className='text-sm' style={{ color: textSecondary }}>
                      {addr.phone}
                    </span>
                  </div>
                  {addr.tag && (
                    <span
                      className='px-1.5 py-0.5 text-xs rounded'
                      style={{
                        backgroundColor: `${themeSettings.primaryColor}15`,
                        color: themeSettings.primaryColor,
                      }}
                    >
                      {addr.tag}
                    </span>
                  )}
                </div>

                {/* 地址信息 */}
                <div className='flex items-start gap-1.5'>
                  <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0' style={{ color: textSecondary }} />
                  <span className='text-sm' style={{ color: textSecondary }}>
                    {addr.province}
                    {addr.city}
                    {addr.district}
                    {addr.address}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div
                className='flex items-center justify-end gap-4 px-4 py-2 border-t'
                style={{ borderColor }}
              >
                {!addr.isDefault && (
                  <button
                    className='flex items-center gap-1 text-xs'
                    style={{ color: textSecondary }}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    <Star className='h-3.5 w-3.5' />
                    设为默认
                  </button>
                )}
                <button
                  className='flex items-center gap-1 text-xs'
                  style={{ color: textSecondary }}
                  onClick={() => onNavigate?.('address-edit', { id: addr.id })}
                >
                  <Edit className='h-3.5 w-3.5' />
                  编辑
                </button>
                <button
                  className='flex items-center gap-1 text-xs text-red-500'
                  onClick={() => handleDelete(addr.id)}
                >
                  <Trash className='h-3.5 w-3.5' />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && addresses.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <div
            className='w-16 h-16 rounded-full flex items-center justify-center mb-4'
            style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
          >
            <MapPin className='h-8 w-8' style={{ color: themeSettings.primaryColor }} />
          </div>
          <p className='text-center font-medium mb-2' style={{ color: textPrimary }}>
            暂无收货地址
          </p>
          <p className='text-center text-sm mb-4' style={{ color: textSecondary }}>
            添加地址后可快速选择
          </p>
          <button
            className='flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm'
            style={{ backgroundColor: themeSettings.primaryColor }}
            onClick={() => onNavigate?.('address-edit', { mode: 'create' })}
          >
            <Plus className='h-4 w-4' />
            添加地址
          </button>
        </div>
      )}
    </div>
  )
}

export default AddressListPage
