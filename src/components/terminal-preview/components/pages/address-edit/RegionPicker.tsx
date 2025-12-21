/**
 * 地区选择器弹窗组件
 */

import { useMemo } from 'react'
import { Box, Text, ScrollView } from '../../../ui/primitives'
import { Check } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { areaData } from './areaData'
import type { RegionPickerProps, AreaItem } from './types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function RegionPicker({
  visible,
  step,
  selectedProvince,
  selectedCity,
  selectedDistrict,
  selectedProvinceCode,
  selectedCityCode,
  primaryColor,
  isDarkMode,
  onSelect,
  onStepBack,
  onClose,
}: RegionPickerProps) {
  // 颜色配置
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 获取当前可选的地区列表
  const regionList = useMemo<AreaItem[]>(() => {
    if (step === 'province') {
      return areaData.provinces
    } else if (step === 'city') {
      return areaData.cityMap[selectedProvinceCode] || []
    } else {
      return areaData.districtMap[selectedCityCode] || []
    }
  }, [step, selectedProvinceCode, selectedCityCode])

  // 获取当前选中的值
  const getSelectedValue = (): string => {
    if (step === 'province') return selectedProvince
    if (step === 'city') return selectedCity
    return selectedDistrict
  }

  // 获取标题
  const getTitle = (): string => {
    if (step === 'province') return '选择省份'
    if (step === 'city') return '选择城市'
    return '选择区县'
  }

  // 获取返回按钮文字
  const getBackText = (): string => {
    return step === 'province' ? '取消' : '返回'
  }

  if (!visible) return null

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* 遮罩 */}
      <Box
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      {/* 选择面板 */}
      <Box
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        {/* 头部 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16 * wxScale,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            borderBottomStyle: 'solid',
          }}
        >
          <Box onClick={onStepBack}>
            <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
              {getBackText()}
            </Text>
          </Box>
          <Text style={{ fontWeight: 500, fontSize: 16 * wxScale, color: textPrimary }}>
            {getTitle()}
          </Text>
          <Box style={{ width: 40 * wxScale }} />
        </Box>

        {/* 列表 */}
        <ScrollView
          scrollY
          style={{
            height: isWxEnvironment() ? 400 * wxScale : '50vh',
            maxHeight: '50vh',
          }}
        >
          {regionList.map((item) => {
            const isSelected = getSelectedValue() === item.name
            return (
              <Box
                key={item.code}
                onClick={() => onSelect(item.code, item.name)}
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
                <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
                  {item.name}
                </Text>
                {isSelected && (
                  <Check size={20 * wxScale} color={primaryColor} />
                )}
              </Box>
            )
          })}
        </ScrollView>
      </Box>
    </Box>
  )
}

export default RegionPicker

