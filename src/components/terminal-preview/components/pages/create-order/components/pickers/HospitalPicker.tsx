/**
 * 医院选择器
 * 按《小程序页面改造规范》改造
 */

import { useMemo, useState } from 'react'
import { Box, Text, Icon, Input } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Hospital, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface HospitalPickerProps {
  hospitals: Hospital[]
  selectedHospital?: Hospital
  selectedProvince?: string
  selectedCity?: string
  customHospitalName?: string
  customProvince?: string
  customCity?: string
  onSelect: (hospital: Hospital) => void
  onSelectCustom: (params: { hospitalName: string; province?: string; city?: string }) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

interface HospitalRegion {
  province: string
  city: string
}

const DIRECT_CITY_PREFIXES = ['北京市', '上海市', '天津市', '重庆市']

function parseHospitalRegion(hospital: Hospital): HospitalRegion {
  const address = (hospital.address || '').replace(/\s+/g, '')

  for (const city of DIRECT_CITY_PREFIXES) {
    if (address.startsWith(city)) {
      return { province: city, city }
    }
  }

  const provinceMatch = address.match(/^(.+?(?:省|自治区|特别行政区))(.+?(?:市|州|地区|盟))/)
  if (provinceMatch) {
    return {
      province: provinceMatch[1],
      city: provinceMatch[2],
    }
  }

  const cityMatch = address.match(/^(.+?(?:市|州|地区|盟))/)
  if (cityMatch) {
    return {
      province: cityMatch[1],
      city: cityMatch[1],
    }
  }

  return {
    province: '未分组',
    city: '未分组',
  }
}

function RegionChip({
  label,
  selected,
  onClick,
  primaryColor,
  colors,
}: {
  label: string
  selected: boolean
  onClick: () => void
  primaryColor: string
  colors: ThemeColors
}) {
  return (
    <Box
      onClick={onClick}
      style={{
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        paddingTop: 8 * wxScale,
        paddingBottom: 8 * wxScale,
        borderRadius: 9999,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: selected ? primaryColor : colors.borderColor,
        backgroundColor: selected ? `${primaryColor}12` : colors.inputBg,
      }}
    >
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: selected ? primaryColor : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

export function HospitalPicker({
  hospitals,
  selectedHospital,
  selectedProvince,
  selectedCity,
  customHospitalName,
  customProvince,
  customCity,
  onSelect,
  onSelectCustom,
  onClose,
  colors,
  primaryColor,
}: HospitalPickerProps) {
  const { textPrimary, textSecondary, textMuted, borderColor, inputBg } = colors
  const [keyword, setKeyword] = useState('')
  const [provinceFilter, setProvinceFilter] = useState(selectedProvince || '')
  const [cityFilter, setCityFilter] = useState(selectedCity || '')
  const [customMode, setCustomMode] = useState(Boolean(customHospitalName))
  const [customHospitalInput, setCustomHospitalInput] = useState(customHospitalName || '')
  const [customProvinceFilter, setCustomProvinceFilter] = useState(customProvince || '')
  const [customCityFilter, setCustomCityFilter] = useState(customCity || '')

  const hospitalsWithRegion = useMemo(
    () => hospitals.map((hospital) => ({ hospital, region: parseHospitalRegion(hospital) })),
    [hospitals]
  )

  const provinceOptions = useMemo(
    () => Array.from(new Set(hospitalsWithRegion.map((item) => item.region.province))),
    [hospitalsWithRegion]
  )

  const cityOptions = useMemo(() => {
    if (!provinceFilter) return []
    return Array.from(
      new Set(
        hospitalsWithRegion
          .filter((item) => item.region.province === provinceFilter)
          .map((item) => item.region.city)
      )
    )
  }, [hospitalsWithRegion, provinceFilter])

  const filteredHospitals = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return hospitalsWithRegion.filter(({ hospital, region }) => {
      if (provinceFilter && region.province !== provinceFilter) return false
      if (cityFilter && region.city !== cityFilter) return false
      if (!q) return true
      const name = hospital.name?.toLowerCase() || ''
      const shortName = hospital.shortName?.toLowerCase() || ''
      const address = hospital.address?.toLowerCase() || ''
      return name.includes(q) || shortName.includes(q) || address.includes(q)
    })
  }, [cityFilter, hospitalsWithRegion, keyword, provinceFilter])

  return (
    <PickerModal
      title="选择就诊医院"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
        <Box
          onClick={() => setCustomMode((prev) => !prev)}
          style={{
            padding: 12 * wxScale,
            borderRadius: 10 * wxScale,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: customMode ? primaryColor : borderColor,
            backgroundColor: customMode ? `${primaryColor}12` : inputBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: customMode ? primaryColor : textPrimary }}>
            其他医院，手动填写
          </Text>
          {customMode ? <Icon name="check-one" size={16 * wxScale} color={primaryColor} /> : null}
        </Box>

        {customMode ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            <Box>
              <Text style={{ display: 'block', marginBottom: 8 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                省份（可选）
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
                {provinceOptions.map((province) => (
                  <RegionChip
                    key={province}
                    label={province}
                    selected={customProvinceFilter === province}
                    onClick={() => {
                      setCustomProvinceFilter((prev) => (prev === province ? '' : province))
                      setCustomCityFilter('')
                    }}
                    primaryColor={primaryColor}
                    colors={colors}
                  />
                ))}
              </Box>
            </Box>

            {customProvinceFilter ? (
              <Box>
                <Text style={{ display: 'block', marginBottom: 8 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                  城市（可选）
                </Text>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
                  {Array.from(
                    new Set(
                      hospitalsWithRegion
                        .filter((item) => item.region.province === customProvinceFilter)
                        .map((item) => item.region.city)
                    )
                  ).map((city) => (
                    <RegionChip
                      key={city}
                      label={city}
                      selected={customCityFilter === city}
                      onClick={() => setCustomCityFilter((prev) => (prev === city ? '' : city))}
                      primaryColor={primaryColor}
                      colors={colors}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}

            <Input
              value={customHospitalInput}
              onChange={setCustomHospitalInput}
              placeholder="请输入医院名称"
              style={{
                width: '100%',
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                borderRadius: 8 * wxScale,
                fontSize: 14 * wxScale,
                backgroundColor: inputBg,
                color: textPrimary,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor,
              }}
            />

            <Box
              onClick={() => {
                const nextHospitalName = customHospitalInput.trim()
                if (!nextHospitalName) return
                onSelectCustom({
                  hospitalName: nextHospitalName,
                  province: customProvinceFilter || undefined,
                  city: customCityFilter || undefined,
                })
                onClose()
              }}
              style={{
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderRadius: 10 * wxScale,
                backgroundColor: customHospitalInput.trim() ? primaryColor : borderColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#ffffff' }}>
                使用自填医院
              </Text>
            </Box>
          </Box>
        ) : (
          <>
            <Input
              value={keyword}
              onChange={setKeyword}
              placeholder="搜索医院名称或简称"
              style={{
                width: '100%',
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                borderRadius: 8 * wxScale,
                fontSize: 14 * wxScale,
                backgroundColor: inputBg,
                color: textPrimary,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor,
              }}
            />

            <Box>
              <Text style={{ display: 'block', marginBottom: 8 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                省份
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
                {provinceOptions.map((province) => (
                  <RegionChip
                    key={province}
                    label={province}
                    selected={provinceFilter === province}
                    onClick={() => {
                      const nextProvince = provinceFilter === province ? '' : province
                      setProvinceFilter(nextProvince)
                      setCityFilter('')
                    }}
                    primaryColor={primaryColor}
                    colors={colors}
                  />
                ))}
              </Box>
            </Box>

            {provinceFilter ? (
              <Box>
                <Text style={{ display: 'block', marginBottom: 8 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                  城市
                </Text>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
                  {cityOptions.map((city) => (
                    <RegionChip
                      key={city}
                      label={city}
                      selected={cityFilter === city}
                      onClick={() => setCityFilter((prev) => (prev === city ? '' : city))}
                      primaryColor={primaryColor}
                      colors={colors}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
              {filteredHospitals.map(({ hospital, region }) => (
                <Box
                  key={hospital.id}
                  onClick={() => {
                    onSelect(hospital)
                    onClose()
                  }}
                  style={{
                    padding: 12 * wxScale,
                    borderRadius: 8 * wxScale,
                    borderWidth: selectedHospital?.id === hospital.id ? 2 : 1,
                    borderStyle: 'solid',
                    borderColor: selectedHospital?.id === hospital.id ? primaryColor : borderColor,
                    backgroundColor: selectedHospital?.id === hospital.id ? `${primaryColor}10` : inputBg,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                      {hospital.name}
                    </Text>
                    {selectedHospital?.id === hospital.id ? (
                      <Icon name="check" size={18 * wxScale} color={primaryColor} />
                    ) : null}
                  </Box>
                  <Text
                    style={{
                      display: 'block',
                      marginTop: 4 * wxScale,
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                    }}
                  >
                    {[region.province, region.city].filter(Boolean).join(' · ')}
                  </Text>
                  <Text
                    style={{
                      display: 'block',
                      marginTop: 2 * wxScale,
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                    }}
                  >
                    {hospital.address}
                  </Text>
                </Box>
              ))}

              {filteredHospitals.length === 0 ? (
                <Box
                  style={{
                    paddingTop: 20 * wxScale,
                    paddingBottom: 20 * wxScale,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13 * wxScale, color: textMuted }}>未找到相关医院</Text>
                </Box>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </PickerModal>
  )
}
