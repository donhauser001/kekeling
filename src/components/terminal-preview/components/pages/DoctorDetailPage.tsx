import { useEffect, useMemo, useState } from 'react'
import { Box, Text, Icon, ScrollView, Image } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import { previewApi } from '../../api'
import type { ThemeSettings } from '../../types'
import type { DoctorDetail } from '../../api/user-api'
import { getResourceUrl } from '../../utils'

export interface DoctorDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  doctorId?: string
  onBack?: () => void
  onHospitalClick?: (hospitalId: string) => void
}

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

function formatTitle(title?: string) {
  if (!title) return '医生'
  if (title === 'chief') return '主任医师'
  if (title === 'deputy') return '副主任医师'
  if (title === 'attending') return '主治医师'
  return title
}

export function DoctorDetailPage({
  themeSettings,
  isDarkMode = false,
  doctorId,
  onBack,
  onHospitalClick,
}: DoctorDetailPageProps) {
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#111827' : '#f5f7fa'
  const cardBg = isDarkMode ? '#1f2937' : '#ffffff'
  const textPrimary = isDarkMode ? '#f9fafb' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#374151' : '#e5e7eb'

  useEffect(() => {
    if (!doctorId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    previewApi.getDoctor(doctorId)
      .then((res) => {
        setDoctor(res)
        if (!res) {
          setIsError(true)
        }
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [doctorId])

  const specialtyText = useMemo(() => {
    if (doctor?.specialties?.length) {
      return doctor.specialties.join('、')
    }
    return doctor?.specialty || ''
  }, [doctor])

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
            医生详情
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

          {!isLoading && (isError || !doctor) && (
            <Box style={{ paddingTop: 48 * wxScale, alignItems: 'center' }}>
              <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>医生信息加载失败</Text>
            </Box>
          )}

          {!isLoading && doctor && (
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
                      width: 68 * wxScale,
                      height: 68 * wxScale,
                      borderRadius: 34 * wxScale,
                      overflow: 'hidden',
                      backgroundColor: `${primaryColor}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {doctor.avatar ? (
                      <Image
                        src={getResourceUrl(doctor.avatar)}
                        mode="aspectFill"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Icon name="user" size={28 * wxScale} color={primaryColor} />
                    )}
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text style={{ display: 'block', fontSize: 18 * wxScale, fontWeight: 700, color: textPrimary }}>
                      {doctor.name}
                    </Text>
                    <Text style={{ display: 'block', marginTop: 6 * wxScale, fontSize: 13 * wxScale, color: primaryColor }}>
                      {formatTitle(doctor.title)}
                    </Text>
                    {doctor.department?.name && (
                      <Text style={{ display: 'block', marginTop: 6 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                        {doctor.department.parent?.name ? `${doctor.department.parent.name} / ` : ''}{doctor.department.name}
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg, display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>执业信息</Text>
                {doctor.hospital && (
                  <Box
                    onClick={() => doctor.hospital?.id && onHospitalClick?.(doctor.hospital.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8 * wxScale,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, flex: 1 }}>
                      <Icon name="hospital" size={16 * wxScale} color={textSecondary} />
                      <Text style={{ flex: 1, fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.6 }}>
                        {doctor.hospital.name}
                      </Text>
                    </Box>
                    <Icon name="right" size={14 * wxScale} color={textSecondary} />
                  </Box>
                )}
                {doctor.hospital?.address && (
                  <Box style={{ display: 'flex', gap: 8 * wxScale }}>
                    <Icon name="local" size={16 * wxScale} color={textSecondary} />
                    <Text style={{ flex: 1, fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.6 }}>
                      {doctor.hospital.address}
                    </Text>
                  </Box>
                )}
                {doctor.phone && (
                  <Box style={{ display: 'flex', gap: 8 * wxScale }}>
                    <Icon name="phone" size={16 * wxScale} color={textSecondary} />
                    <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>{doctor.phone}</Text>
                  </Box>
                )}
                {(doctor.rating !== undefined || doctor.consultCount !== undefined) && (
                  <Box style={{ display: 'flex', gap: 16 * wxScale }}>
                    {doctor.rating !== undefined && (
                      <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>评分 {doctor.rating}</Text>
                    )}
                    {doctor.consultCount !== undefined && (
                      <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>接诊 {doctor.consultCount}</Text>
                    )}
                  </Box>
                )}
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>擅长领域</Text>
                <Text style={{ marginTop: 12 * wxScale, fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.8 }}>
                  {specialtyText || '暂无擅长领域介绍'}
                </Text>
              </Box>

              <Box style={{ padding: 16 * wxScale, borderRadius: 16 * wxScale, backgroundColor: cardBg }}>
                <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>医生简介</Text>
                <Text style={{ marginTop: 12 * wxScale, fontSize: 13 * wxScale, color: textSecondary, lineHeight: 1.8 }}>
                  {doctor.introduction || '暂无简介'}
                </Text>
              </Box>
            </>
          )}
        </Box>
      </ScrollView>
    </Box>
  )
}
