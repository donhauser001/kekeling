/**
 * 服务内容（富文本区域）
 * 按《小程序页面改造规范》改造
 */

import { FileText, ImageIcon } from '../../../../ui/lucide-compat'
import { Box, Text } from '../../../../ui/primitives'
import { SafeHTML } from '@/components/ui/safe-html'
import { isWxEnvironment, isBrowserEnvironment } from '../../../../platform/env'
import type { ServiceRichContentProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceRichContent({
  content,
  themeSettings: _themeSettings,
  colors,
  isDarkMode,
}: ServiceRichContentProps) {
  void _themeSettings // 保留用于未来主题扩展
  const { cardBg, textPrimary: _textPrimary, textSecondary, textMuted } = colors
  void _textPrimary // 保留用于未来样式扩展

  return (
    <Box
      className='mx-3 mt-3 rounded-xl p-4'
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {content ? (
        <Box
          className='rich-content text-sm leading-relaxed'
          style={{ fontSize: 14 * wxScale, lineHeight: 1.6, color: textSecondary }}
        >
          {isBrowserEnvironment() && (
            <style>{`
              .rich-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
              .rich-content p { margin-bottom: 8px; }
              .rich-content ul, .rich-content ol { padding-left: 16px; margin-bottom: 8px; }
              .rich-content li { margin-bottom: 4px; }
              .rich-content h1, .rich-content h2, .rich-content h3 { font-weight: 600; margin: 12px 0 8px; }
            `}</style>
          )}
          <SafeHTML html={content} allowStyle />
        </Box>
      ) : (
        <Box
          className='flex flex-col items-center justify-center py-8 rounded-lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 32 * wxScale,
            paddingBottom: 32 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
          }}
        >
          <Box
            className='flex items-center gap-3 mb-2'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * wxScale,
              marginBottom: 8 * wxScale,
            }}
          >
            <FileText size={24 * wxScale} color={textMuted} />
            <ImageIcon size={24 * wxScale} color={textMuted} />
          </Box>
          <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
            服务详细内容
          </Text>
          <Text style={{ fontSize: 10 * wxScale, marginTop: 4 * wxScale, color: textMuted }}>
            可在服务管理中添加图文介绍
          </Text>
        </Box>
      )}
    </Box>
  )
}
