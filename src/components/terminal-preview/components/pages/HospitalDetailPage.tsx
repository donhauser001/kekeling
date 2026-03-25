import { useEffect, useMemo, useState } from 'react'
import { Box, Text, Icon, Button, ScrollView } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import { previewApi } from '../../api'
import type { ThemeSettings } from '../../types'
import type { Hospital, Department, Doctor } from '../../api/user-api'

export interface HospitalDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  hospitalId?: string
  onBack?: () => void
  onDoctorClick?: (doctorId: string) => void
}

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

function flattenDepartments(items: Department[]): string[] {
  const result: string[] = []

  const walk = (nodes: Department[]) => {
    nodes.forEach((node) => {
      if (node.name) {
        result.push(node.name)
      }
      if (node.children?.length) {
        walk(node.children)
      }
    })
  }

  walk(items)
  return Array.from(new Set(result))
}

export function HospitalDetailPage({
  themeSettings,
  isDarkMode = false,
  hospitalId,
  onBack,
  onDoctorClick,
}: HospitalDetailPageProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#111827' : '#f5f7fa'
  const cardBg = isDarkMode ? '#1f2937' : '#ffffff'
  const textPrimary = isDarkMode ? '#f9fafb' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#374151' : '#e5e7eb'

  useEffect(() => {
    if (!hospitalId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    Promise.all([
      previewApi.getHospital(hospitalId),
      previewApi.getHospitalDepartments(hospitalId),
      previewApi.getHospitalDoctors(hospitalId, { pageSize: 20 }),
    ])
      .then(([hospitalRes, departmentsRes, doctorsRes]) => {
        setHospital(hospitalRes)
        setDepartments(departmentsRes || [])
        setDoctors(doctorsRes?.data || [])
        if (!hospitalRes) {
          setIsError(true)
        }
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [hospitalId])

  const departmentNames = useMemo(() => flattenDepartments(departments), [departments])

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: cardBg,
          paddingTop: wxSafeAreaTop,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44 * wxScale,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
          }}
        >
          {onBack && (
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                width: 36 * wxScale,
                height: 36 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="left" size={20 * wxScale} color={textPrimary} />
            </Box>
          )}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: textPrimary }}>
            医院详情
          </Text>
        </Box>
      </Box>

      <ScrollView style={{ flex: 1 }}>
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 16 * wxScale,
            paddingBottom: 24 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          {isLoading && (
            <Box style={{ paddingTop: 48 * wxScale, alignItems: 'center' }}>
              <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>加载中...</Text>
            </Box>
          )}

          {!isLoading && (isError || !hospital) && (
            <Box style={{ paddingTop: 48 * wxScale, alignItems: 'center' }}>
              <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>医院信息加载失败</Text>
            </Box>
          )}

          {!isLoading && hospital && (
            <>
              <Box
                style={{
                  padding: 16 * wxScale,
                  borderRadius: 16 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box style={{ display: 'flex', gap: 12 * wxScale }}>
                  <Box
                    style={{
                      width: 56 * wxScale,
                      height: 56 * wxScale,
                      borderRadius: 14 * wxScale,
                      backgroundColor: `${primaryColor}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="hospital" size={28 * wxScale} color={primaryColor} />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text style={{ display: 'block', fontSize: 18 * wxScale, fontWeight: 700, color: textPrimary, lineHeight: 1.5 }}>
                      {hospital.name}
                    </Text>
                    <Box style={{ display: 'flex', gap: 8 * wxScale, marginTop: 8 * wxScale, flexWrap: 'wrap' }}>
                      <Box style={{ paddingTop: 4 * wxScale, paddingBottom: 4 * wxScale, paddingLeft: 8 * wxScale, paddingRight: 8 * wxScale, borderRadius: 999, backgroundColor: `${primaryColor}12` }}>
                        <Text style={{ fontSize: 11 * wxScale, color: primaryColor }}>{hospital.level}</Text>
                      </Box>
                      <Box style={{ paddingTop: 4 * wxScale, paddingBottom: 4 * wxScale, paddingLeft: 8 * wxScale, paddingRight: 8 * wxScale, borderRadius: 999, backgroundColor: isDarkMode ? '#374151' : '#eef2f7' }}>
                        <Text style={{ fontSize: 11 * wxScale, color: textSecondary }}>{hospital.type}</Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg, display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>基础信息</Text>
                <Box style={{ display: 'flex', gap: 8 * wxScale }}>
                  <Icon name="local" size={16 * wxScale} color={textSecondary} />
                  <Text style={{ flex: 1, fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.6 }}>
                    {hospital.address || '暂无地址'}
                  </Text>
                </Box>
                {hospital.phone && (
                  <Box style={{ display: 'flex', gap: 8 * wxScale }}>
                    <Icon name="phone" size={16 * wxScale} color={textSecondary} />
                    <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>{hospital.phone}</Text>
                  </Box>
                )}
                {hospital.introduction && (
                  <Text style={{ fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.8 }}>
                    {hospital.introduction}
                  </Text>
                )}
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>开设科室</Text>
                {departmentNames.length > 0 ? (
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale, marginTop: 12 * wxScale }}>
                    {departmentNames.map((name) => (
                      <Box key={name} style={{ paddingTop: 6 * wxScale, paddingBottom: 6 * wxScale, paddingLeft: 10 * wxScale, paddingRight: 10 * wxScale, borderRadius: 999, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}>
                        <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{name}</Text>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text style={{ marginTop: 12 * wxScale, fontSize: 13 * wxScale, color: textSecondary }}>暂无科室信息</Text>
                )}
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>在院医生</Text>
                {doctors.length > 0 ? (
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 * wxScale, marginTop: 12 * wxScale }}>
                    {doctors.map((doctor) => (
                      <Button
                        key={doctor.id}
                        onClick={() => onDoctorClick?.(doctor.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: 12 * wxScale,
                          borderRadius: 12 * wxScale,
                          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                        }}
                      >
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 * wxScale }}>
                          <Box style={{ flex: 1 }}>
                            <Text style={{ display: 'block', fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
                              {doctor.name}
                            </Text>
                            <Text style={{ display: 'block', marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                              {doctor.title || '医生'}
                            </Text>
                          </Box>
                          <Icon name="right" size={16 * wxScale} color={textSecondary} />
                        </Box>
                      </Button>
                    ))}
                  </Box>
                ) : (
                  <Text style={{ marginTop: 12 * wxScale, fontSize: 13 * wxScale, color: textSecondary }}>暂无医生信息</Text>
                )}
              </Box>
            </>
          )}
        </Box>
      </ScrollView>
    </Box>
  )
}
