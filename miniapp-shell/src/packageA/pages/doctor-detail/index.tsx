import { useEffect, useState, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DoctorDetailPage as DoctorDetailPageComponent } from '@terminal-preview/components/pages/DoctorDetailPage'
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

function DoctorDetailPageContent() {
  const router = useRouter()
  const doctorId = router.params?.id || ''
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [doctorName, setDoctorName] = useState('医生详情')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      previewApi.getThemeSettings().catch(() => null),
      doctorId ? previewApi.getDoctor(doctorId).catch(() => null) : Promise.resolve(null),
    ]).then(([settings, doctor]) => {
      if (settings) {
        setThemeSettings({ ...defaultThemeSettings, ...settings })
      }
      if (doctor?.name) {
        setDoctorName(doctor.name)
      }
    }).finally(() => setIsLoading(false))
  }, [doctorId])

  useShareAppMessage(() => ({
    title: doctorName,
    path: `/packageA/pages/doctor-detail/index?id=${doctorId}`,
  }))

  useShareTimeline(() => ({
    title: doctorName,
    query: `id=${doctorId}`,
  }))

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/main/index' })
    }
  }, [])

  const handleHospitalClick = useCallback((hospitalId: string) => {
    Taro.navigateTo({
      url: `/packageA/pages/hospital-detail/index?id=${hospitalId}`,
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
      <DoctorDetailPageComponent
        doctorId={doctorId}
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onHospitalClick={handleHospitalClick}
      />
    </View>
  )
}

export default function DoctorDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DoctorDetailPageContent />
    </QueryClientProvider>
  )
}
