/**
 * 服务信息选项卡（亮点/流程/须知）
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { ArrowRight, CheckCircle, Sparkles, GitBranch, AlertCircle } from '../../../../ui/lucide-compat'
import { Box, Text, Button } from '../../../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../../../platform/env'
import { useHorizontalDrag } from '../hooks'
import type { ServiceInfoTabsProps, InfoTabType, WorkflowStep } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceInfoTabs({
  service,
  themeSettings,
  colors,
  isDarkMode,
}: ServiceInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<InfoTabType>('highlights')
  const { cardBg, textPrimary: _textPrimary, textSecondary, textMuted } = colors
  void _textPrimary // 保留用于未来样式扩展
  const workflowDrag = useHorizontalDrag()

  // 服务亮点
  const highlights = service?.serviceIncludes?.map(item => item.text) || [
    '专业陪诊团队',
    '全程一对一服务',
    '熟悉医院流程',
    '贴心关怀照顾',
  ]

  // 服务流程
  const defaultWorkflowSteps: WorkflowStep[] = [
    { id: '1', name: '下单预约', type: 'start' },
    { id: '2', name: '陪诊员接单', type: 'action' },
    { id: '3', name: '到达医院', type: 'action' },
    { id: '4', name: '全程陪诊', type: 'action' },
    { id: '5', name: '服务完成', type: 'end' },
  ]
  const workflowSteps: WorkflowStep[] = service?.workflow?.steps?.length
    ? service.workflow.steps.map(step => ({
      id: step.id,
      name: step.name,
      type: step.type as 'start' | 'action' | 'end',
    }))
    : defaultWorkflowSteps

  // 服务须知
  const defaultNotices = [
    '请提前一天预约服务',
    '服务当天请携带有效身份证件',
    '如需取消请提前4小时通知',
    '服务时间以实际就诊时长为准',
  ]
  const notices = service?.serviceNotes?.length
    ? service.serviceNotes.map(item => `${item.title}：${item.content}`)
    : defaultNotices

  // 流程步骤类型颜色
  const stepTypeColors = {
    start: { bg: isDarkMode ? '#166534' : '#dcfce7', text: isDarkMode ? '#86efac' : '#166534' },
    action: { bg: isDarkMode ? '#1e40af' : '#dbeafe', text: isDarkMode ? '#93c5fd' : '#1e40af' },
    end: { bg: isDarkMode ? '#6b21a8' : '#f3e8ff', text: isDarkMode ? '#d8b4fe' : '#6b21a8' },
  }

  // 选项卡配置
  const tabs: { key: InfoTabType; label: string; icon: React.ReactNode }[] = [
    { key: 'highlights', label: '服务亮点', icon: <Sparkles size={14 * wxScale} color={activeTab === 'highlights' ? themeSettings.primaryColor : textMuted} /> },
    { key: 'workflow', label: '服务流程', icon: <GitBranch size={14 * wxScale} color={activeTab === 'workflow' ? themeSettings.primaryColor : textMuted} /> },
    { key: 'notice', label: '服务须知', icon: <AlertCircle size={14 * wxScale} color={activeTab === 'notice' ? themeSettings.primaryColor : textMuted} /> },
  ]

  return (
    <Box
      className='mx-3 mt-3 rounded-xl overflow-hidden'
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* 选项卡头部 */}
      <Box
        className='flex border-b'
        style={{
          display: 'flex',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
        }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            className='flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative'
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6 * wxScale,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              fontSize: 12 * wxScale,
              fontWeight: 500,
              color: activeTab === tab.key ? themeSettings.primaryColor : textMuted,
              position: 'relative',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: activeTab === tab.key ? themeSettings.primaryColor : textMuted,
              }}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <Box
                className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full'
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32 * wxScale,
                  height: 2 * wxScale,
                  borderRadius: 9999,
                  backgroundColor: themeSettings.primaryColor,
                }}
              />
            )}
          </Button>
        ))}
      </Box>

      {/* 选项卡内容 */}
      <Box style={{ padding: 16 * wxScale }}>
        {/* 服务亮点 */}
        {activeTab === 'highlights' && (
          <Box
            className='grid grid-cols-2 gap-2'
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8 * wxScale,
            }}
          >
            {highlights.map((item, index) => (
              <Box
                key={index}
                className='flex items-center gap-2 px-3 py-2 rounded-lg'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8 * wxScale,
                  paddingLeft: 12 * wxScale,
                  paddingRight: 12 * wxScale,
                  paddingTop: 8 * wxScale,
                  paddingBottom: 8 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
                }}
              >
                <CheckCircle size={16 * wxScale} color="#10b981" />
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{item}</Text>
              </Box>
            ))}
          </Box>
        )}

        {/* 服务流程 */}
        {activeTab === 'workflow' && (
          <Box
            ref={workflowDrag.ref}
            className='overflow-x-auto cursor-grab active:cursor-grabbing select-none'
            style={{
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            {...workflowDrag.handlers}
          >
            {isBrowserEnvironment() && (
              <style>{`div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }`}</style>
            )}
            <Box
              className='flex items-center gap-1 py-1'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4 * wxScale,
                paddingTop: 4 * wxScale,
                paddingBottom: 4 * wxScale,
              }}
            >
              {workflowSteps.map((step, index) => (
                <Box
                  key={step.id}
                  className='flex items-center'
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <Box
                    className='rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap font-medium'
                    style={{
                      borderRadius: 8 * wxScale,
                      paddingLeft: 10 * wxScale,
                      paddingRight: 10 * wxScale,
                      paddingTop: 6 * wxScale,
                      paddingBottom: 6 * wxScale,
                      fontSize: 12 * wxScale,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      backgroundColor: stepTypeColors[step.type].bg,
                      color: stepTypeColors[step.type].text,
                    }}
                  >
                    <Text style={{ fontSize: 12 * wxScale, color: stepTypeColors[step.type].text }}>
                      {step.name}
                    </Text>
                  </Box>
                  {index < workflowSteps.length - 1 && (
                    <Box style={{ marginLeft: 4 * wxScale, marginRight: 4 * wxScale }}>
                      <ArrowRight size={14 * wxScale} color={textMuted} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* 服务须知 */}
        {activeTab === 'notice' && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
            {notices.map((item, index) => (
              <Box
                key={index}
                className='flex items-start gap-2'
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8 * wxScale,
                }}
              >
                <Box
                  className='mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0'
                  style={{
                    marginTop: 6 * wxScale,
                    width: 6 * wxScale,
                    height: 6 * wxScale,
                    borderRadius: 9999,
                    flexShrink: 0,
                    backgroundColor: themeSettings.primaryColor,
                  }}
                />
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{item}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
