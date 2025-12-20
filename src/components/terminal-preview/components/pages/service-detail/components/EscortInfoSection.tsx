/**
 * 陪诊员专属信息区块
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { Briefcase, Percent, BookOpen, ChevronUp, ChevronDown } from '../../../../ui/lucide-compat'
import { Box, Text, Button } from '../../../../ui/primitives'
import { SafeHTML } from '@/components/ui/safe-html'
import { isWxEnvironment, isBrowserEnvironment } from '../../../../platform/env'
import type { EscortInfoSectionProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function EscortInfoSection({
  service,
  themeSettings,
  colors,
  isDarkMode,
}: EscortInfoSectionProps) {
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null)
  const { cardBg: _cardBg, textPrimary, textSecondary, textMuted } = colors
  void _cardBg // 保留用于未来样式扩展

  return (
    <Box
      className='mx-3 mt-3 rounded-xl overflow-hidden'
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? `${themeSettings.primaryColor}15` : `${themeSettings.primaryColor}08`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `${themeSettings.primaryColor}40`,
      }}
    >
      {/* 区块标题 */}
      <Box
        className='flex items-center gap-2 px-4 py-3 border-b'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: `${themeSettings.primaryColor}30`,
        }}
      >
        <Briefcase size={16 * wxScale} color={themeSettings.primaryColor} />
        <Text
          className='text-sm font-semibold'
          style={{ fontSize: 14 * wxScale, fontWeight: 600, color: themeSettings.primaryColor }}
        >
          陪诊员专属信息
        </Text>
        <Box
          className='ml-auto text-[10px] px-2 py-0.5 rounded-full'
          style={{
            marginLeft: 'auto',
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 9999,
            backgroundColor: `${themeSettings.primaryColor}20`,
          }}
        >
          <Text style={{ fontSize: 10 * wxScale, color: themeSettings.primaryColor }}>
            仅您可见
          </Text>
        </Box>
      </Box>

      {/* 分成比例 */}
      <Box
        className='px-4 py-3'
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
        }}
      >
        <Box
          className='flex items-center justify-between'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            className='flex items-center gap-2'
            style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}
          >
            <Percent size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              className='text-sm font-medium'
              style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}
            >
              分成比例
            </Text>
          </Box>
          <Box
            className='flex items-center gap-2'
            style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}
          >
            <Text
              className='text-lg font-bold'
              style={{ fontSize: 18 * wxScale, fontWeight: 700, color: themeSettings.primaryColor }}
            >
              {service.commissionRate ?? 70}%
            </Text>
            <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
              (预计收入 ¥{((service.price * (service.commissionRate ?? 70)) / 100).toFixed(2)})
            </Text>
          </Box>
        </Box>
        {service.commissionNote && (
          <Text
            className='mt-2 text-xs pl-6'
            style={{
              marginTop: 8 * wxScale,
              fontSize: 12 * wxScale,
              paddingLeft: 24 * wxScale,
              color: textSecondary,
            }}
          >
            {service.commissionNote}
          </Text>
        )}
      </Box>

      {/* 操作规范 */}
      {service.operationGuides && service.operationGuides.length > 0 && (
        <Box
          className='px-4 py-3 border-t'
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: `${themeSettings.primaryColor}30`,
          }}
        >
          <Box
            className='flex items-center gap-2 mb-3'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              marginBottom: 12 * wxScale,
            }}
          >
            <BookOpen size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              className='text-sm font-medium'
              style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}
            >
              操作规范
            </Text>
            <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
              ({service.operationGuides.length}项)
            </Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
            {service.operationGuides.map((guide) => (
              <OperationGuideItem
                key={guide.id}
                guide={guide}
                isExpanded={expandedGuideId === guide.id}
                onToggle={() => setExpandedGuideId(expandedGuideId === guide.id ? null : guide.id)}
                themeSettings={themeSettings}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

/** 操作规范项 */
interface OperationGuideItemProps {
  guide: {
    id: string
    title: string
    summary?: string | null
    content: string
    category?: { name: string } | null
  }
  isExpanded: boolean
  onToggle: () => void
  themeSettings: EscortInfoSectionProps['themeSettings']
  colors: EscortInfoSectionProps['colors']
  isDarkMode: boolean
}

function OperationGuideItem({
  guide,
  isExpanded,
  onToggle,
  themeSettings,
  colors,
  isDarkMode,
}: OperationGuideItemProps) {
  const { cardBg, textPrimary, textSecondary, textMuted } = colors

  return (
    <Box
      className='rounded-lg overflow-hidden'
      style={{
        borderRadius: 8 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* 规范标题 */}
      <Button
        className='w-full flex items-center justify-between px-3 py-2.5 text-left'
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 10 * wxScale,
          paddingBottom: 10 * wxScale,
          textAlign: 'left',
        }}
        onClick={onToggle}
      >
        <Box
          className='flex items-center gap-2'
          style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}
        >
          <Box
            className='w-1.5 h-1.5 rounded-full'
            style={{
              width: 6 * wxScale,
              height: 6 * wxScale,
              borderRadius: 9999,
              backgroundColor: themeSettings.primaryColor,
            }}
          />
          <Text
            className='text-sm font-medium'
            style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}
          >
            {guide.title}
          </Text>
          {guide.category && (
            <Box
              className='text-[10px] px-1.5 py-0.5 rounded'
              style={{
                paddingLeft: 6 * wxScale,
                paddingRight: 6 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
              }}
            >
              <Text style={{ fontSize: 10 * wxScale, color: textMuted }}>
                {guide.category.name}
              </Text>
            </Box>
          )}
        </Box>
        {isExpanded ? (
          <ChevronUp size={16 * wxScale} color={textMuted} />
        ) : (
          <ChevronDown size={16 * wxScale} color={textMuted} />
        )}
      </Button>

      {/* 规范内容（展开时显示） */}
      {isExpanded && (
        <Box
          className='px-3 pb-3 border-t'
          style={{
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
          }}
        >
          {guide.summary && (
            <Text
              className='mt-2 text-xs'
              style={{
                marginTop: 8 * wxScale,
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              {guide.summary}
            </Text>
          )}
          <Box
            className='mt-2 text-xs leading-relaxed guide-content'
            style={{
              marginTop: 8 * wxScale,
              fontSize: 12 * wxScale,
              lineHeight: 1.6,
              color: textSecondary,
            }}
          >
            {isBrowserEnvironment() && (
              <style>{`
                .guide-content h1 { font-size: 1rem; font-weight: 700; margin: 12px 0 8px; color: ${textPrimary}; }
                .guide-content h2 { font-size: 0.875rem; font-weight: 600; margin: 10px 0 6px; color: ${textPrimary}; }
                .guide-content p { margin-bottom: 8px; line-height: 1.6; }
                .guide-content ul, .guide-content ol { padding-left: 16px; margin-bottom: 8px; }
                .guide-content li { margin-bottom: 4px; line-height: 1.5; }
                .guide-content strong { font-weight: 600; color: ${textPrimary}; }
                .guide-content blockquote { border-left: 3px solid ${themeSettings.primaryColor}; padding-left: 10px; margin: 8px 0; color: ${textMuted}; }
                .guide-content code { background: ${isDarkMode ? '#3a3a3a' : '#f3f4f6'}; padding: 2px 4px; border-radius: 4px; font-size: 0.7rem; }
              `}</style>
            )}
            <SafeHTML html={guide.content} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
