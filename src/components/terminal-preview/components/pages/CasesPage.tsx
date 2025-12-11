/**
 * 病历页预览组件
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Plus,
  Calendar,
  Building2,
  User,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemeSettings, BannerAreaData } from '../../types'
import { previewApi } from '../../api'
import { BannerSection } from '../BannerSection'

interface CasesPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 轮播图数据覆盖 */
  bannerData?: BannerAreaData | null
}

// 病历分类 Tab
const caseTabs = [
  { key: 'all', label: '全部' },
  { key: 'outpatient', label: '门诊' },
  { key: 'inpatient', label: '住院' },
  { key: 'examination', label: '检查' },
  { key: 'surgery', label: '手术' },
]

// Mock 病历数据
const mockCases = [
  {
    id: '1',
    type: 'outpatient',
    typeText: '门诊病历',
    patientName: '张三',
    hospitalName: '北京协和医院',
    departmentName: '心内科',
    doctorName: '王医生',
    visitDate: '2024-12-10',
    diagnosis: '高血压',
    description: '血压偏高，需要定期复查',
  },
  {
    id: '2',
    type: 'examination',
    typeText: '检查报告',
    patientName: '张三',
    hospitalName: '北京301医院',
    departmentName: '影像科',
    doctorName: '李医生',
    visitDate: '2024-12-08',
    diagnosis: '胸部CT',
    description: '未见明显异常',
  },
  {
    id: '3',
    type: 'inpatient',
    typeText: '住院病历',
    patientName: '李四',
    hospitalName: '北京友谊医院',
    departmentName: '骨科',
    doctorName: '赵医生',
    visitDate: '2024-11-20',
    diagnosis: '骨折',
    description: '已完成手术，恢复良好',
  },
]

export function CasesPage({ themeSettings, isDarkMode = false, bannerData: bannerDataOverride }: CasesPageProps) {
  const [activeTab, setActiveTab] = useState('all')

  // 获取病历页轮播图
  const { data: fetchedBannerData } = useQuery({
    queryKey: ['preview', 'banners', 'cases'],
    queryFn: () => previewApi.getBanners('cases'),
    staleTime: 60 * 1000,
  })

  const bannerData = bannerDataOverride ?? fetchedBannerData ?? null

  const filteredCases = activeTab === 'all'
    ? mockCases
    : mockCases.filter(c => c.type === activeTab)

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const headerBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 病历类型颜色
  const typeColors: Record<string, string> = {
    outpatient: '#3b82f6',
    inpatient: '#8b5cf6',
    examination: '#10b981',
    surgery: '#f59e0b',
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-14'>
      {/* 搜索和筛选 */}
      <div className='px-3 pt-3 pb-2' style={{ backgroundColor: headerBg }}>
        <div className='flex items-center gap-2'>
          <div
            className='flex-1 flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer transition-all hover:shadow-md'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
          >
            <Search className='h-4 w-4' style={{ color: textMuted }} />
            <span className='text-sm' style={{ color: textMuted }}>
              搜索病历
            </span>
          </div>
          <div
            className='p-2.5 rounded-full cursor-pointer transition-colors'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
          >
            <Filter className='h-4 w-4' style={{ color: textMuted }} />
          </div>
        </div>
      </div>

      {/* 轮播图区域 */}
      {bannerData?.enabled && bannerData.items && bannerData.items.length > 0 && (
        <div style={{ backgroundColor: headerBg }}>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
            autoPlayInterval={3000}
          />
        </div>
      )}

      {/* 分类 Tab */}
      <div
        className='sticky top-0 z-10 overflow-x-auto px-3 py-2'
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}
      >
        <style>{`
          .case-tab-scroll::-webkit-scrollbar { display: none; }
          .case-tab-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        <div className='case-tab-scroll flex gap-2 overflow-x-auto'>
          {caseTabs.map(tab => (
            <div
              key={tab.key}
              className={cn(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm cursor-pointer transition-all',
                activeTab === tab.key ? 'font-medium' : ''
              )}
              style={{
                backgroundColor: activeTab === tab.key
                  ? `${themeSettings.primaryColor}15`
                  : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                color: activeTab === tab.key
                  ? themeSettings.primaryColor
                  : textSecondary,
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* 添加病历按钮 */}
      <div className='px-3 pt-3'>
        <div
          className='flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:shadow-md active:scale-[0.98]'
          style={{
            borderColor: `${themeSettings.primaryColor}40`,
            backgroundColor: `${themeSettings.primaryColor}05`,
          }}
        >
          <Plus className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
          <span className='text-sm font-medium' style={{ color: themeSettings.primaryColor }}>
            添加病历
          </span>
        </div>
      </div>

      {/* 病历列表 */}
      <div className='px-3 py-3 space-y-3'>
        {filteredCases.length === 0 ? (
          <div className='py-16 flex flex-col items-center'>
            <FileText className='h-16 w-16' style={{ color: isDarkMode ? '#4a4a4a' : '#d9d9d9' }} />
            <p className='mt-3 text-sm' style={{ color: textMuted }}>暂无病历记录</p>
            <div
              className='mt-4 px-6 py-2 rounded-full text-sm cursor-pointer transition-all hover:opacity-80'
              style={{
                backgroundColor: themeSettings.primaryColor,
                color: '#ffffff',
              }}
            >
              添加病历
            </div>
          </div>
        ) : (
          filteredCases.map(caseItem => (
            <div
              key={caseItem.id}
              className='rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
            >
              {/* 病历头部 */}
              <div
                className='flex items-center justify-between px-3 py-2 border-b'
                style={{ borderColor }}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className='px-2 py-0.5 rounded text-xs font-medium text-white'
                    style={{ backgroundColor: typeColors[caseItem.type] || textMuted }}
                  >
                    {caseItem.typeText}
                  </span>
                  <span className='text-xs' style={{ color: textMuted }}>
                    {caseItem.visitDate}
                  </span>
                </div>
                <ChevronRight className='h-4 w-4' style={{ color: textMuted }} />
              </div>

              {/* 病历内容 */}
              <div className='p-3'>
                <div className='flex items-start justify-between'>
                  <p className='text-sm font-semibold' style={{ color: textPrimary }}>
                    {caseItem.diagnosis}
                  </p>
                </div>
                <p className='mt-1 text-xs line-clamp-2' style={{ color: textSecondary }}>
                  {caseItem.description}
                </p>

                <div className='mt-3 space-y-1.5'>
                  <div className='flex items-center gap-2 text-xs' style={{ color: textMuted }}>
                    <Building2 className='h-3.5 w-3.5' />
                    <span>{caseItem.hospitalName} · {caseItem.departmentName}</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs' style={{ color: textMuted }}>
                    <User className='h-3.5 w-3.5' />
                    <span>就诊人: {caseItem.patientName}</span>
                    <span className='mx-1'>·</span>
                    <span>医生: {caseItem.doctorName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
