/**
 * 地址管理列表页面
 * 
 * 改造记录 (2025-12-21):
 * - useQuery/useMutation → useState + useEffect
 * - HTML 元素 → 跨平台原语 (Box/Text)
 * - 添加 wxScale 和 style 双写
 * - 图标使用 size 和 color props
 */

import { useState, useEffect } from 'react'
import { Box, Text, ScrollView, Image, Icon } from '../../ui/primitives'
import {
  Plus,
  MapPin,
  Phone,
  User,
  Edit,
  Trash,
  Star,
} from '../../ui/lucide-compat'
import { isWxEnvironment } from '../../platform/env'
import { getWxBridge } from '../../bridge'
import type { ThemeSettings } from '../../types'
import { previewApi, type Address } from '../../api'

interface AddressListPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export function AddressListPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: AddressListPageProps) {
  // 状态管理
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 获取地址列表
  useEffect(() => {
    setLoading(true)
    previewApi.getAddresses()
      .then(data => setAddresses(data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // 刷新列表
  const refreshList = () => {
    previewApi.getAddresses()
      .then(data => setAddresses(data || []))
      .catch(console.error)
  }

  // 删除地址
  const handleDelete = async (id: string) => {
    const wxBridge = getWxBridge()
    const { confirm } = await wxBridge.showModal({
      title: '提示',
      content: '确定要删除这个地址吗？',
    })
    if (!confirm) return

    setActionLoading(id)
    try {
      await previewApi.deleteAddress(id)
      refreshList()
    } catch (err) {
      console.error('删除失败:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // 设为默认
  const handleSetDefault = async (id: string) => {
    setActionLoading(id)
    try {
      await previewApi.setDefaultAddress(id)
      refreshList()
    } catch (err) {
      console.error('设置默认失败:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // 骨架屏
  const renderSkeleton = () => (
    <Box style={{ padding: 16 * wxScale, display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          style={{
            padding: 16 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Box
            style={{
              height: 20 * wxScale,
              width: 96 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: borderColor,
              marginBottom: 8 * wxScale,
            }}
          />
          <Box
            style={{
              height: 16 * wxScale,
              width: '100%',
              borderRadius: 4 * wxScale,
              backgroundColor: borderColor,
              marginBottom: 8 * wxScale,
            }}
          />
          <Box
            style={{
              height: 16 * wxScale,
              width: 128 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: borderColor,
            }}
          />
        </Box>
      ))}
    </Box>
  )

  // 空状态
  const renderEmpty = () => (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64 * wxScale,
        paddingBottom: 64 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
      }}
    >
      <Box
        style={{
          width: 64 * wxScale,
          height: 64 * wxScale,
          borderRadius: 32 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${primaryColor}15`,
          marginBottom: 16 * wxScale,
        }}
      >
        <MapPin size={32 * wxScale} color={primaryColor} />
      </Box>
      <Text
        style={{
          display: 'block',
          textAlign: 'center',
          fontWeight: 500,
          fontSize: 16 * wxScale,
          color: textPrimary,
          marginBottom: 8 * wxScale,
        }}
      >
        暂无收货地址
      </Text>
      <Text
        style={{
          display: 'block',
          textAlign: 'center',
          fontSize: 14 * wxScale,
          color: textSecondary,
          marginBottom: 16 * wxScale,
        }}
      >
        添加地址后可快速选择
      </Text>
      <Box
        onClick={() => onNavigate?.('address-edit', { mode: 'create' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          borderRadius: 9999,
          backgroundColor: primaryColor,
        }}
      >
        <Plus size={16 * wxScale} color="#fff" />
        <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>
          添加地址
        </Text>
      </Box>
    </Box>
  )

  // 地址列表
  const renderAddressList = () => (
    <Box style={{ padding: 16 * wxScale, display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
      {addresses.map((addr) => (
        <Box
          key={addr.id}
          style={{
            position: 'relative',
            borderRadius: 8 * wxScale,
            overflow: 'hidden',
            backgroundColor: cardBg,
          }}
        >
          {/* 默认标签 */}
          {addr.isDefault && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                paddingLeft: 8 * wxScale,
                paddingRight: 8 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                fontSize: 12 * wxScale,
                color: '#fff',
                backgroundColor: primaryColor,
                borderBottomLeftRadius: 8 * wxScale,
              }}
            >
              <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>默认</Text>
            </Box>
          )}

          {/* 地址信息 - 点击进入编辑 */}
          <Box
            onClick={() => onNavigate?.('address-edit', { id: addr.id })}
            style={{ padding: 16 * wxScale }}
          >
            {/* 联系人信息 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * wxScale,
                marginBottom: 8 * wxScale,
                flexWrap: 'wrap',
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                <User size={16 * wxScale} color={textSecondary} />
                <Text style={{ fontWeight: 500, fontSize: 14 * wxScale, color: textPrimary }}>
                  {addr.name}
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                <Phone size={16 * wxScale} color={textSecondary} />
                <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                  {addr.phone}
                </Text>
              </Box>
              {addr.tag && (
                <Box
                  style={{
                    paddingLeft: 6 * wxScale,
                    paddingRight: 6 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>
                    {addr.tag}
                  </Text>
                </Box>
              )}
            </Box>

            {/* 地址信息 */}
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 6 * wxScale }}>
              <Box style={{ marginTop: 2 * wxScale, flexShrink: 0 }}>
                <MapPin size={16 * wxScale} color={textSecondary} />
              </Box>
              <Text style={{ fontSize: 14 * wxScale, color: textSecondary, lineHeight: 1.5 }}>
                {addr.province}
                {addr.city}
                {addr.district}
                {addr.address}
              </Text>
            </Box>
          </Box>

          {/* 操作按钮 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 16 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderTopWidth: 1,
              borderTopColor: borderColor,
              borderTopStyle: 'solid',
            }}
          >
            {!addr.isDefault && (
              <Box
                onClick={() => handleSetDefault(addr.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4 * wxScale,
                  opacity: actionLoading === addr.id ? 0.5 : 1,
                }}
              >
                <Star size={14 * wxScale} color={textSecondary} />
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                  设为默认
                </Text>
              </Box>
            )}
            <Box
              onClick={() => onNavigate?.('address-edit', { id: addr.id })}
              style={{ display: 'flex', alignItems: 'center', gap: 4 * wxScale }}
            >
              <Edit size={14 * wxScale} color={textSecondary} />
              <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                编辑
              </Text>
            </Box>
            <Box
              onClick={() => handleDelete(addr.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4 * wxScale,
                opacity: actionLoading === addr.id ? 0.5 : 1,
              }}
            >
              <Trash size={14 * wxScale} color="#ef4444" />
              <Text style={{ fontSize: 12 * wxScale, color: '#ef4444' }}>
                删除
              </Text>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 80 * wxScale,
      }}
    >
      {/* 顶部导航栏 - 按规范 3.3.2 自定义导航栏 Type A */}
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
            地址管理
          </Text>
        </Box>
      </Box>

      {/* 内容区 */}
      <ScrollView style={{ flex: 1 }}>
        {loading && renderSkeleton()}
        {!loading && addresses.length === 0 && renderEmpty()}
        {!loading && addresses.length > 0 && renderAddressList()}
      </ScrollView>

      {/* 底部新增按钮 - 按规范放在底部，避免右上角被胶囊遮挡 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16 * wxScale,
          backgroundColor: cardBg,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          borderTopStyle: 'solid',
        }}
      >
        <Box
          onClick={() => onNavigate?.('address-edit', { mode: 'create' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * wxScale,
            width: '100%',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
            borderRadius: 8 * wxScale,
            backgroundColor: primaryColor,
          }}
        >
          <Plus size={18 * wxScale} color="#fff" />
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>
            新增地址
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default AddressListPage
