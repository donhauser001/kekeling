import { useEffect, useState, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HospitalDetailPage as HospitalDetailPageComponent } from '@terminal-preview/components/pages/HospitalDetailPage'
import { previewApi } from '@terminal-preview/api'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import './index.scss'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function HospitalDetailPageContent() {
  const router = useRouter()
  const hospitalId = router.params?.id || ''
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [hospitalName, setHospitalName] = useState('医院详情')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      previewApi.getThemeSettings().catch(() => null),
      hospitalId ? previewApi.getHospital(hospitalId).catch(() => null) : Promise.resolve(null),
    ]).then(([settings, hospital]) => {
      if (settings) {
        setThemeSettings({ ...defaultThemeSettings, ...settings })
      }
      if (hospital?.name) {
        setHospitalName(hospital.name)
      }
    }).finally(() => setIsLoading(false))
  }, [hospitalId])

  useShareAppMessage(() => ({
    title: hospitalName,
    path: `/packageA/pages/hospital-detail/index?id=${hospitalId}`,
  }))

  useShareTimeline(() => ({
    title: hospitalName,
    query: `id=${hospitalId}`,
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }, [])

  const handleDoctorClick = useCallback((doctorId: string) => {
    Taro.navigateTo({
      url: `/packageA/pages/doctor-detail/index?id=${doctorId}`,
    })
  }, [])

  if (isLoading) {
    return (
      <View className="page-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <View className="page-container">
      <HospitalDetailPageComponent
        hospitalId={hospitalId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onDoctorClick={handleDoctorClick}
      />
    </View>
  )
}

export default function HospitalDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <HospitalDetailPageContent />
    </QueryClientProvider>
  )
}
