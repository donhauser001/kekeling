/**
 * 病历页面
 *
 * 显示用户的病历记录列表
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, ScrollView
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon, ScrollView } from '../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../platform/env'
import type { ThemeSettings, BannerAreaData } from '../../types'
import { previewApi } from '../../api'
import { BannerSection } from '../BannerSection'

// ============================================================================
// 类型定义
// ============================================================================

interface CasesPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  bannerData?: BannerAreaData | null
  onBack?: () => void
}

interface CaseItem {
  id: string
  type: string
  typeText: string
  patientName: string
  hospitalName: string
  departmentName: string
  doctorName: string
  visitDate: string
  diagnosis: string
  description: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

const caseTabs = [
  { key: 'all', label: '全部' },
  { key: 'outpatient', label: '门诊' },
  { key: 'inpatient', label: '住院' },
  { key: 'examination', label: '检查' },
  { key: 'surgery', label: '手术' },
]

const typeColors: Record<string, string> = {
  outpatient: '#3b82f6',
  inpatient: '#8b5cf6',
  examination: '#10b981',
  surgery: '#f59e0b',
}

// Mock 病历数据
const mockCases: CaseItem[] = [
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

// ============================================================================
// 主组件
// ============================================================================

export function CasesPage({
  themeSettings,
  isDarkMode = false,
  bannerData: bannerDataOverride,
  onBack,
}: CasesPageProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [bannerData, setBannerData] = useState<BannerAreaData | null>(bannerDataOverride ?? null)
  const [isLoading, setIsLoading] = useState(!bannerDataOverride)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const headerBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 获取轮播图
  useEffect(() => {
    if (bannerDataOverride) return
    setIsLoading(true)
    previewApi
      .getBanners('cases')
      .then(setBannerData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [bannerDataOverride])

  // 筛选病历
  const filteredCases = activeTab === 'all' ? mockCases : mockCases.filter((c) => c.type === activeTab)

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 顶部导航栏 ========== */}
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
          {/* 返回按钮 */}
          {onBack && (
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
          )}

          {/* 标题 */}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>病历管理</Text>
        </Box>
      </Box>

      {/* ========== 搜索栏 ========== */}
      <Box
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 8 * wxScale,
          backgroundColor: headerBg,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <Box
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              borderRadius: 9999,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 10 * wxScale,
              paddingBottom: 10 * wxScale,
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
            }}
          >
            <Icon name="search" size={16 * wxScale} color={textMuted} />
            <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>搜索病历</Text>
          </Box>
          <Box
            style={{
              width: 40 * wxScale,
              height: 40 * wxScale,
              borderRadius: 20 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
            }}
          >
            <Icon name="filter" size={16 * wxScale} color={textMuted} />
          </Box>
        </Box>
      </Box>

      {/* ========== 轮播图 ========== */}
      {!isLoading && bannerData?.enabled && bannerData.items && bannerData.items.length > 0 && (
        <Box style={{ backgroundColor: headerBg }}>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
            autoPlayInterval={3000}
          />
        </Box>
      )}

      {/* ========== 分类 Tab ========== */}
      <Box
        style={{
          position: 'sticky',
          top: wxSafeAreaTop + 44 * wxScale,
          zIndex: 50,
          backgroundColor: headerBg,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {isBrowserEnvironment() && (
          <style>{`
            .case-tab-scroll::-webkit-scrollbar { display: none; }
            .case-tab-scroll { scrollbar-width: none; -ms-overflow-style: none; }
          `}</style>
        )}
        <ScrollView
          scrollX
          className="case-tab-scroll"
          style={{
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 8 * wxScale,
            paddingBottom: 8 * wxScale,
          }}
        >
          <Box style={{ display: 'flex', gap: 8 * wxScale }}>
            {caseTabs.map((tab) => (
              <Box
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flexShrink: 0,
                  paddingLeft: 14 * wxScale,
                  paddingRight: 14 * wxScale,
                  paddingTop: 6 * wxScale,
                  paddingBottom: 6 * wxScale,
                  borderRadius: 9999,
                  fontSize: 14 * wxScale,
                  fontWeight: activeTab === tab.key ? 500 : 400,
                  backgroundColor:
                    activeTab === tab.key ? `${primaryColor}15` : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                  color: activeTab === tab.key ? primaryColor : textSecondary,
                  cursor: 'pointer',
                }}
              >
                <Text style={{ fontSize: 14 * wxScale }}>{tab.label}</Text>
              </Box>
            ))}
          </Box>
        </ScrollView>
      </Box>

      {/* ========== 添加病历按钮 ========== */}
      <Box style={{ paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale, paddingTop: 12 * wxScale }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 12 * wxScale,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: `${primaryColor}40`,
            backgroundColor: `${primaryColor}05`,
            cursor: 'pointer',
          }}
        >
          <Icon name="add" size={20 * wxScale} color={primaryColor} />
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: primaryColor }}>添加病历</Text>
        </Box>
      </Box>

      {/* ========== 病历列表 ========== */}
      <Box
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 56 * wxScale,
        }}
      >
        {filteredCases.length === 0 ? (
          // 空状态
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 64 * wxScale,
              paddingBottom: 64 * wxScale,
            }}
          >
            <Icon name="file-text" size={64 * wxScale} color={isDarkMode ? '#4a4a4a' : '#d9d9d9'} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textMuted }}>
              暂无病历记录
            </Text>
            <Box
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 9999,
                fontSize: 14 * wxScale,
                backgroundColor: primaryColor,
                cursor: 'pointer',
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>添加病历</Text>
            </Box>
          </Box>
        ) : (
          // 病历列表
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {filteredCases.map((caseItem) => (
              <Box
                key={caseItem.id}
                style={{
                  borderRadius: 12 * wxScale,
                  overflow: 'hidden',
                  backgroundColor: cardBg,
                  cursor: 'pointer',
                }}
              >
                {/* 病历头部 */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                    paddingTop: 8 * wxScale,
                    paddingBottom: 8 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                    <Box
                      style={{
                        paddingLeft: 8 * wxScale,
                        paddingRight: 8 * wxScale,
                        paddingTop: 2 * wxScale,
                        paddingBottom: 2 * wxScale,
                        borderRadius: 4 * wxScale,
                        backgroundColor: typeColors[caseItem.type] || textMuted,
                      }}
                    >
                      <Text style={{ fontSize: 12 * wxScale, fontWeight: 500, color: '#ffffff' }}>
                        {caseItem.typeText}
                      </Text>
                    </Box>
                    <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>{caseItem.visitDate}</Text>
                  </Box>
                  <Icon name="right" size={16 * wxScale} color={textMuted} />
                </Box>

                {/* 病历内容 */}
                <Box style={{ padding: 12 * wxScale }}>
                  <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
                    {caseItem.diagnosis}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4 * wxScale,
                      fontSize: 12 * wxScale,
                      color: textSecondary,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {caseItem.description}
                  </Text>

                  <Box style={{ marginTop: 12 * wxScale }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                      <Icon name="hospital" size={14 * wxScale} color={textMuted} />
                      <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
                        {caseItem.hospitalName} · {caseItem.departmentName}
                      </Text>
                    </Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8 * wxScale,
                        marginTop: 6 * wxScale,
                      }}
                    >
                      <Icon name="user" size={14 * wxScale} color={textMuted} />
                      <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
                        就诊人: {caseItem.patientName} · 医生: {caseItem.doctorName}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
