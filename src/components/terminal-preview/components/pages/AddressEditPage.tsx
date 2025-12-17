/**
 * 地址编辑/创建页面
 *
 * 使用 @vant/area-data 提供完整的中国省市区数据
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Home,
  Building,
  Briefcase,
  Check,
  ChevronRight,
} from 'lucide-react'
import { areaList } from '@vant/area-data'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

interface AddressEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 地址 ID（编辑模式） */
  addressId?: string
  /** 模式：create 或 edit */
  mode?: 'create' | 'edit'
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// 预设标签
const tagOptions = [
  { value: '家', icon: Home },
  { value: '公司', icon: Building },
  { value: '学校', icon: Briefcase },
]

// 判断是否是自定义标签
const isCustomTag = (tag: string) => tag && !tagOptions.some((t) => t.value === tag)

/**
 * 解析 @vant/area-data 数据结构
 * areaList = { province_list: { code: name }, city_list: { code: name }, county_list: { code: name } }
 */
function parseAreaData() {
  const provinces: Array<{ code: string; name: string }> = []
  const cityMap: Record<string, Array<{ code: string; name: string }>> = {}
  const districtMap: Record<string, Array<{ code: string; name: string }>> = {}

  // 解析省份
  Object.entries(areaList.province_list).forEach(([code, name]) => {
    provinces.push({ code, name })
  })

  // 解析城市（根据省份代码前2位匹配）
  Object.entries(areaList.city_list).forEach(([code, name]) => {
    const provinceCode = code.slice(0, 2) + '0000'
    if (!cityMap[provinceCode]) {
      cityMap[provinceCode] = []
    }
    cityMap[provinceCode].push({ code, name })
  })

  // 解析区县（根据城市代码前4位匹配）
  Object.entries(areaList.county_list).forEach(([code, name]) => {
    const cityCode = code.slice(0, 4) + '00'
    if (!districtMap[cityCode]) {
      districtMap[cityCode] = []
    }
    districtMap[cityCode].push({ code, name })
  })

  return { provinces, cityMap, districtMap }
}

// 解析后的地区数据（单例）
const areaData = parseAreaData()

interface FormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  tag: string
  isDefault: boolean
}

const defaultFormData: FormData = {
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  tag: '',
  isDefault: false,
}

export function AddressEditPage({
  themeSettings,
  isDarkMode = false,
  addressId,
  mode = 'create',
  onBack,
  onNavigate,
}: AddressEditPageProps) {
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit' || !!addressId
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [pickerStep, setPickerStep] = useState<'province' | 'city' | 'district'>('province')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  // 存储选中的省市代码，用于级联查询
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('')
  const [selectedCityCode, setSelectedCityCode] = useState<string>('')
  // 自定义标签输入状态
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [customTagValue, setCustomTagValue] = useState('')

  // 获取地址详情（编辑模式）
  const { data: existingAddress } = useQuery({
    queryKey: ['preview', 'address', addressId],
    queryFn: async () => {
      const addresses = await previewApi.getAddresses()
      return addresses.find((a) => a.id === addressId)
    },
    enabled: isEdit && !!addressId,
  })

  // 填充表单数据
  useEffect(() => {
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
      const province = areaData.provinces.find((p) => p.name === existingAddress.province)
      if (province) {
        setSelectedProvinceCode(province.code)
        // 查找城市代码
        const cities = areaData.cityMap[province.code] || []
        const city = cities.find((c) => c.name === existingAddress.city)
        if (city) {
          setSelectedCityCode(city.code)
        }
      }
    }
  }, [existingAddress])

  // 创建地址
  const createMutation = useMutation({
    mutationFn: (data: Omit<FormData, 'isDefault'> & { isDefault?: boolean }) =>
      previewApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'addresses'] })
      onBack?.()
    },
  })

  // 更新地址
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: Partial<FormData> }) =>
      previewApi.updateAddress(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'addresses'] })
      onBack?.()
    },
  })

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const inputBg = isDarkMode ? '#1a1a1a' : '#f9fafb'

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
  const handleSubmit = () => {
    if (!validate()) return

    const submitData: Omit<FormData, 'isDefault'> & { isDefault?: boolean } = {
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
      updateMutation.mutate({ id: addressId, data: submitData })
    } else {
      createMutation.mutate(submitData)
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

  // 获取当前可选的地区列表
  const getRegionList = useMemo(() => {
    if (pickerStep === 'province') {
      return areaData.provinces
    } else if (pickerStep === 'city') {
      return areaData.cityMap[selectedProvinceCode] || []
    } else {
      return areaData.districtMap[selectedCityCode] || []
    }
  }, [pickerStep, selectedProvinceCode, selectedCityCode])

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-24'>
      {/* 顶部导航 */}
      <div
        className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b'
        style={{
          backgroundColor: cardBg,
          borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
      >
        <button
          onClick={onBack}
          className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
        >
          <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
        </button>
        <span className='font-medium' style={{ color: textPrimary }}>
          {isEdit ? '编辑地址' : '新增地址'}
        </span>
      </div>

      {/* 表单 */}
      <div className='p-4 space-y-4'>
        {/* 联系人 */}
        <div className='rounded-lg overflow-hidden' style={{ backgroundColor: cardBg }}>
          <div className='px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3'>
              <User className='h-5 w-5' style={{ color: textSecondary }} />
              <input
                type='text'
                placeholder='姓名'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='flex-1 bg-transparent outline-none text-sm'
                style={{ color: textPrimary }}
              />
            </div>
            {errors.name && (
              <p className='text-xs text-red-500 mt-1 pl-8'>{errors.name}</p>
            )}
          </div>
          <div className='px-4 py-3'>
            <div className='flex items-center gap-3'>
              <Phone className='h-5 w-5' style={{ color: textSecondary }} />
              <input
                type='tel'
                placeholder='手机号码'
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className='flex-1 bg-transparent outline-none text-sm'
                style={{ color: textPrimary }}
              />
            </div>
            {errors.phone && (
              <p className='text-xs text-red-500 mt-1 pl-8'>{errors.phone}</p>
            )}
          </div>
        </div>

        {/* 地址 */}
        <div className='rounded-lg overflow-hidden' style={{ backgroundColor: cardBg }}>
          <div
            className='px-4 py-3 border-b flex items-center justify-between cursor-pointer'
            style={{ borderColor }}
            onClick={() => {
              setShowRegionPicker(true)
              setPickerStep('province')
            }}
          >
            <div className='flex items-center gap-3'>
              <MapPin className='h-5 w-5' style={{ color: textSecondary }} />
              <span className='text-sm' style={{ color: formData.province ? textPrimary : textSecondary }}>
                {formData.province
                  ? `${formData.province} ${formData.city} ${formData.district}`
                  : '选择省/市/区'}
              </span>
            </div>
            <ChevronRight className='h-5 w-5' style={{ color: textSecondary }} />
          </div>
          {errors.province && (
            <p className='text-xs text-red-500 px-4 pt-1 pl-12'>{errors.province}</p>
          )}
          <div className='px-4 py-3'>
            <div className='flex items-start gap-3'>
              <Home className='h-5 w-5 mt-0.5' style={{ color: textSecondary }} />
              <textarea
                placeholder='详细地址（街道、楼栋、门牌号）'
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className='flex-1 bg-transparent outline-none text-sm resize-none'
                style={{ color: textPrimary }}
                rows={2}
              />
            </div>
            {errors.address && (
              <p className='text-xs text-red-500 mt-1 pl-8'>{errors.address}</p>
            )}
          </div>
        </div>

        {/* 标签 */}
        <div className='rounded-lg p-4' style={{ backgroundColor: cardBg }}>
          <p className='text-sm mb-3' style={{ color: textSecondary }}>
            标签
          </p>
          <div className='flex flex-wrap gap-2'>
            {/* 预设标签 */}
            {tagOptions.map((tag) => {
              const IconComp = tag.icon
              const isSelected = formData.tag === tag.value
              return (
                <button
                  key={tag.value}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors'
                  style={{
                    backgroundColor: isSelected ? themeSettings.primaryColor : inputBg,
                    color: isSelected ? '#fff' : textSecondary,
                  }}
                  onClick={() => {
                    setFormData({ ...formData, tag: isSelected ? '' : tag.value })
                    setShowCustomTagInput(false)
                  }}
                >
                  <IconComp className='h-4 w-4' />
                  {tag.value}
                </button>
              )
            })}
            {/* 自定义标签（如果已存在且不是预设） */}
            {isCustomTag(formData.tag) && !showCustomTagInput && (
              <button
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors'
                style={{
                  backgroundColor: themeSettings.primaryColor,
                  color: '#fff',
                }}
                onClick={() => {
                  setCustomTagValue(formData.tag)
                  setShowCustomTagInput(true)
                }}
              >
                <MapPin className='h-4 w-4' />
                {formData.tag}
              </button>
            )}
            {/* 自定义按钮 */}
            {!showCustomTagInput && !isCustomTag(formData.tag) && (
              <button
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border border-dashed'
                style={{
                  backgroundColor: 'transparent',
                  color: textSecondary,
                  borderColor: borderColor,
                }}
                onClick={() => {
                  setShowCustomTagInput(true)
                  setCustomTagValue('')
                }}
              >
                + 自定义
              </button>
            )}
          </div>
          {/* 自定义标签输入框 */}
          {showCustomTagInput && (
            <div className='mt-3 flex items-center gap-2'>
              <input
                type='text'
                value={customTagValue}
                onChange={(e) => setCustomTagValue(e.target.value.slice(0, 6))}
                placeholder='最多6字'
                maxLength={6}
                className='flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border outline-none'
                style={{
                  backgroundColor: inputBg,
                  borderColor: borderColor,
                  color: textPrimary,
                }}
                autoFocus
              />
              <button
                className='shrink-0 px-3 py-2 text-sm rounded-lg whitespace-nowrap'
                style={{
                  backgroundColor: themeSettings.primaryColor,
                  color: '#fff',
                }}
                onClick={() => {
                  if (customTagValue.trim()) {
                    setFormData({ ...formData, tag: customTagValue.trim() })
                  }
                  setShowCustomTagInput(false)
                }}
              >
                确定
              </button>
              <button
                className='shrink-0 px-3 py-2 text-sm rounded-lg whitespace-nowrap'
                style={{
                  backgroundColor: inputBg,
                  color: textSecondary,
                }}
                onClick={() => {
                  setShowCustomTagInput(false)
                  setCustomTagValue('')
                }}
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* 设为默认 */}
        <div
          className='rounded-lg p-4 flex items-center justify-between'
          style={{ backgroundColor: cardBg }}
        >
          <span className='text-sm' style={{ color: textPrimary }}>
            设为默认地址
          </span>
          <button
            className='relative w-11 h-6 rounded-full transition-colors'
            style={{
              backgroundColor: formData.isDefault ? themeSettings.primaryColor : borderColor,
            }}
            onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
          >
            <span
              className='absolute top-1 w-4 h-4 rounded-full bg-white transition-all'
              style={{ left: formData.isDefault ? '24px' : '4px' }}
            />
          </button>
        </div>
      </div>

      {/* 底部保存按钮 */}
      <div
        className='fixed bottom-0 left-0 right-0 p-4 border-t'
        style={{ backgroundColor: cardBg, borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
      >
        <button
          className='w-full py-3 rounded-lg text-white font-medium disabled:opacity-50'
          style={{ backgroundColor: themeSettings.primaryColor }}
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 地区选择器 */}
      {showRegionPicker && (
        <div className='fixed inset-0 z-50'>
          {/* 遮罩 */}
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => {
              setShowRegionPicker(false)
              setPickerStep('province')
            }}
          />
          {/* 选择面板 */}
          <div
            className='absolute bottom-0 left-0 right-0 rounded-t-2xl'
            style={{ backgroundColor: cardBg }}
          >
            <div className='flex items-center justify-between p-4 border-b' style={{ borderColor }}>
              <button
                className='text-sm'
                style={{ color: textSecondary }}
                onClick={() => {
                  if (pickerStep === 'city') {
                    setPickerStep('province')
                  } else if (pickerStep === 'district') {
                    setPickerStep('city')
                  } else {
                    setShowRegionPicker(false)
                  }
                }}
              >
                {pickerStep === 'province' ? '取消' : '返回'}
              </button>
              <span className='font-medium' style={{ color: textPrimary }}>
                {pickerStep === 'province' ? '选择省份' : pickerStep === 'city' ? '选择城市' : '选择区县'}
              </span>
              <div className='w-10' />
            </div>
            <div className='max-h-[50vh] overflow-y-auto'>
              {getRegionList.map((item) => (
                <div
                  key={item.code}
                  className='flex items-center justify-between px-4 py-3 border-b cursor-pointer active:bg-black/5'
                  style={{ borderColor }}
                  onClick={() => handleSelectRegion(item.code, item.name)}
                >
                  <span className='text-sm' style={{ color: textPrimary }}>
                    {item.name}
                  </span>
                  {((pickerStep === 'province' && formData.province === item.name) ||
                    (pickerStep === 'city' && formData.city === item.name) ||
                    (pickerStep === 'district' && formData.district === item.name)) && (
                      <Check className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressEditPage
