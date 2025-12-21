/**
 * 地址编辑/创建页面
 *
 * 改造记录 (2025-12-21):
 * - useQuery/useMutation → useState + useEffect
 * - HTML 元素 → 跨平台原语 (Box/Text/Input)
 * - 添加 wxScale 和 style 双写
 * - 图标使用 size 和 color props
 * - 拆分为多个子组件
 */

import { useState, useEffect } from 'react'
import { Box, Text, ScrollView, Input, Icon } from '../../../ui/primitives'
import {
  MapPin,
  User,
  Phone,
  Home,
  Building,
  Briefcase,
  ChevronRight,
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi, type Address } from '../../../api'
import { RegionPicker } from './RegionPicker'
import { areaData, findProvinceCode, findCityCode } from './areaData'
import {
  type AddressEditPageProps,
  type FormData,
  type PickerStep,
  defaultFormData,
  tagOptions,
  isCustomTag,
} from './types'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 图标映射
const tagIconMap: Record<string, typeof Home> = {
  home: Home,
  building: Building,
  briefcase: Briefcase,
}

export function AddressEditPage({
  themeSettings,
  isDarkMode = false,
  addressId,
  mode = 'create',
  onBack,
}: AddressEditPageProps) {
  const isEdit = mode === 'edit' || !!addressId

  // 表单状态
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [saving, setSaving] = useState(false)

  // 地区选择器状态
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [pickerStep, setPickerStep] = useState<PickerStep>('province')
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedCityCode, setSelectedCityCode] = useState('')

  // 自定义标签状态
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [customTagValue, setCustomTagValue] = useState('')

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const inputBg = isDarkMode ? '#1a1a1a' : '#f9fafb'

  // 获取地址详情（编辑模式）
  useEffect(() => {
    if (isEdit && addressId) {
      previewApi.getAddresses()
        .then((addresses) => {
          const existingAddress = addresses.find((a) => a.id === addressId)
          if (existingAddress) {
            setFormData({
              name: existingAddress.name,
              phone: existingAddress.phone,
              province: existingAddress.province,
              city: existingAddress.city,
              district: existingAddress.district,
              address: existingAddress.address,
              tag: existingAddress.tag || '',
              isDefault: existingAddress.isDefault,
            })

            // 查找省份代码
            const provinceCode = findProvinceCode(existingAddress.province)
            if (provinceCode) {
              setSelectedProvinceCode(provinceCode)
              // 查找城市代码
              const cityCode = findCityCode(provinceCode, existingAddress.city)
              if (cityCode) {
                setSelectedCityCode(cityCode)
              }
            }
          }
        })
        .catch(console.error)
    }
  }, [isEdit, addressId])

  // 验证表单
  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号码'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号码格式不正确'
    }
    if (!formData.province || !formData.city || !formData.district) {
      newErrors.province = '请选择所在地区'
    }
    if (!formData.address.trim()) {
      newErrors.address = '请输入详细地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        province: formData.province,
        city: formData.city,
        district: formData.district,
        address: formData.address.trim(),
        tag: formData.tag || '',
        isDefault: formData.isDefault,
      }

      if (isEdit && addressId) {
        await previewApi.updateAddress(addressId, submitData)
      } else {
        await previewApi.createAddress(submitData)
      }
      onBack?.()
    } catch (err) {
      console.error('保存失败:', err)
    } finally {
      setSaving(false)
    }
  }

  // 选择地区
  const handleSelectRegion = (code: string, name: string) => {
    if (pickerStep === 'province') {
      setFormData({ ...formData, province: name, city: '', district: '' })
      setSelectedProvinceCode(code)
      setSelectedCityCode('')
      setPickerStep('city')
    } else if (pickerStep === 'city') {
      setFormData({ ...formData, city: name, district: '' })
      setSelectedCityCode(code)
      setPickerStep('district')
    } else {
      setFormData({ ...formData, district: name })
      setShowRegionPicker(false)
      setPickerStep('province')
    }
  }

  // 地区选择器返回
  const handleRegionStepBack = () => {
    if (pickerStep === 'city') {
      setPickerStep('province')
    } else if (pickerStep === 'district') {
      setPickerStep('city')
    } else {
      setShowRegionPicker(false)
    }
  }

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
            {isEdit ? '编辑地址' : '新增地址'}
          </Text>
        </Box>
      </Box>

      {/* 表单 */}
      <ScrollView style={{ flex: 1, padding: 16 * wxScale }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 * wxScale }}>
          {/* 联系人信息 */}
          <Box
            style={{
              borderRadius: 8 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {/* 姓名 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                borderBottomStyle: 'solid',
              }}
            >
              <User size={20 * wxScale} color={textSecondary} />
              <Input
                type="text"
                placeholder="姓名"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  fontSize: 14 * wxScale,
                  color: textPrimary,
                  border: 'none',
                  outline: 'none',
                }}
              />
            </Box>
            {errors.name && (
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: '#ef4444',
                  paddingLeft: 48 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                }}
              >
                {errors.name}
              </Text>
            )}

            {/* 手机号 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
              }}
            >
              <Phone size={20 * wxScale} color={textSecondary} />
              <Input
                type="tel"
                placeholder="手机号码"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  fontSize: 14 * wxScale,
                  color: textPrimary,
                  border: 'none',
                  outline: 'none',
                }}
              />
            </Box>
            {errors.phone && (
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: '#ef4444',
                  paddingLeft: 48 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                }}
              >
                {errors.phone}
              </Text>
            )}
          </Box>

          {/* 地址信息 */}
          <Box
            style={{
              borderRadius: 8 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {/* 省市区选择 */}
            <Box
              onClick={() => {
                setShowRegionPicker(true)
                setPickerStep('province')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                borderBottomStyle: 'solid',
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                <MapPin size={20 * wxScale} color={textSecondary} />
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: formData.province ? textPrimary : textSecondary,
                  }}
                >
                  {formData.province
                    ? `${formData.province} ${formData.city} ${formData.district}`
                    : '选择省/市/区'}
                </Text>
              </Box>
              <ChevronRight size={20 * wxScale} color={textSecondary} />
            </Box>
            {errors.province && (
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: '#ef4444',
                  paddingLeft: 48 * wxScale,
                  paddingTop: 4 * wxScale,
                }}
              >
                {errors.province}
              </Text>
            )}

            {/* 详细地址 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
              }}
            >
              <Box style={{ marginTop: 2 * wxScale }}>
                <Home size={20 * wxScale} color={textSecondary} />
              </Box>
              <Input
                type="text"
                placeholder="详细地址（街道、楼栋、门牌号）"
                value={formData.address}
                onChange={(value) => setFormData({ ...formData, address: value })}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  fontSize: 14 * wxScale,
                  color: textPrimary,
                  border: 'none',
                  outline: 'none',
                  minHeight: 40 * wxScale,
                }}
              />
            </Box>
            {errors.address && (
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: '#ef4444',
                  paddingLeft: 48 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 8 * wxScale,
                }}
              >
                {errors.address}
              </Text>
            )}
          </Box>

          {/* 标签选择 */}
          <Box
            style={{
              borderRadius: 8 * wxScale,
              padding: 16 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: textSecondary,
                marginBottom: 12 * wxScale,
              }}
            >
              标签
            </Text>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
              {/* 预设标签 */}
              {tagOptions.map((tag) => {
                const IconComp = tagIconMap[tag.icon]
                const isSelected = formData.tag === tag.value
                return (
                  <Box
                    key={tag.value}
                    onClick={() => {
                      setFormData({ ...formData, tag: isSelected ? '' : tag.value })
                      setShowCustomTagInput(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6 * wxScale,
                      paddingLeft: 12 * wxScale,
                      paddingRight: 12 * wxScale,
                      paddingTop: 6 * wxScale,
                      paddingBottom: 6 * wxScale,
                      borderRadius: 9999,
                      backgroundColor: isSelected ? primaryColor : inputBg,
                    }}
                  >
                    <IconComp size={16 * wxScale} color={isSelected ? '#fff' : textSecondary} />
                    <Text
                      style={{
                        fontSize: 14 * wxScale,
                        color: isSelected ? '#fff' : textSecondary,
                      }}
                    >
                      {tag.value}
                    </Text>
                  </Box>
                )
              })}

              {/* 自定义标签显示 */}
              {isCustomTag(formData.tag) && !showCustomTagInput && (
                <Box
                  onClick={() => {
                    setCustomTagValue(formData.tag)
                    setShowCustomTagInput(true)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6 * wxScale,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 6 * wxScale,
                    paddingBottom: 6 * wxScale,
                    borderRadius: 9999,
                    backgroundColor: primaryColor,
                  }}
                >
                  <MapPin size={16 * wxScale} color="#fff" />
                  <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>
                    {formData.tag}
                  </Text>
                </Box>
              )}

              {/* 自定义按钮 */}
              {!showCustomTagInput && !isCustomTag(formData.tag) && (
                <Box
                  onClick={() => {
                    setShowCustomTagInput(true)
                    setCustomTagValue('')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6 * wxScale,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 6 * wxScale,
                    paddingBottom: 6 * wxScale,
                    borderRadius: 9999,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: borderColor,
                  }}
                >
                  <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                    + 自定义
                  </Text>
                </Box>
              )}
            </Box>

            {/* 自定义标签输入 */}
            {showCustomTagInput && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8 * wxScale,
                  marginTop: 12 * wxScale,
                }}
              >
                <Input
                  type="text"
                  value={customTagValue}
                  onChange={(value) => setCustomTagValue(value.slice(0, 6))}
                  placeholder="最多6字"
                  maxLength={6}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 8 * wxScale,
                    paddingBottom: 8 * wxScale,
                    fontSize: 14 * wxScale,
                    borderRadius: 8 * wxScale,
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderStyle: 'solid',
                    backgroundColor: inputBg,
                    color: textPrimary,
                    outline: 'none',
                  }}
                />
                <Box
                  onClick={() => {
                    if (customTagValue.trim()) {
                      setFormData({ ...formData, tag: customTagValue.trim() })
                    }
                    setShowCustomTagInput(false)
                  }}
                  style={{
                    flexShrink: 0,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 8 * wxScale,
                    paddingBottom: 8 * wxScale,
                    fontSize: 14 * wxScale,
                    borderRadius: 8 * wxScale,
                    backgroundColor: primaryColor,
                  }}
                >
                  <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>确定</Text>
                </Box>
                <Box
                  onClick={() => {
                    setShowCustomTagInput(false)
                    setCustomTagValue('')
                  }}
                  style={{
                    flexShrink: 0,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 8 * wxScale,
                    paddingBottom: 8 * wxScale,
                    fontSize: 14 * wxScale,
                    borderRadius: 8 * wxScale,
                    backgroundColor: inputBg,
                  }}
                >
                  <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>取消</Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* 设为默认 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 8 * wxScale,
              padding: 16 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
              设为默认地址
            </Text>
            <Box
              onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              style={{
                position: 'relative',
                width: 44 * wxScale,
                height: 24 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: formData.isDefault ? primaryColor : borderColor,
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 4 * wxScale,
                  left: formData.isDefault ? 24 * wxScale : 4 * wxScale,
                  width: 16 * wxScale,
                  height: 16 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </Box>
          </Box>
        </Box>
      </ScrollView>

      {/* 底部保存按钮 */}
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
          onClick={handleSubmit}
          style={{
            width: '100%',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
            borderRadius: 8 * wxScale,
            backgroundColor: saving ? `${primaryColor}80` : primaryColor,
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>
            {saving ? '保存中...' : '保存'}
          </Text>
        </Box>
      </Box>

      {/* 地区选择器 */}
      <RegionPicker
        visible={showRegionPicker}
        step={pickerStep}
        selectedProvince={formData.province}
        selectedCity={formData.city}
        selectedDistrict={formData.district}
        selectedProvinceCode={selectedProvinceCode}
        selectedCityCode={selectedCityCode}
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
        onSelect={handleSelectRegion}
        onStepBack={handleRegionStepBack}
        onClose={() => {
          setShowRegionPicker(false)
          setPickerStep('province')
        }}
      />
    </Box>
  )
}

export default AddressEditPage

