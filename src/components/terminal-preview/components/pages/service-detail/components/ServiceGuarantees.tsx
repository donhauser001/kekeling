/**
 * 服务保障组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'

const wxScale = isWxEnvironment() ? 1.15 : 1

interface ServiceGuarantee {
  id: string
  name: string
  icon?: string
  description?: string
}

interface ServiceGuaranteesProps {
  guarantees: ServiceGuarantee[]
  colors: {
    cardBg: string
    textPrimary: string
  }
  isDarkMode: boolean
  onGuaranteeClick: (item: ServiceGuarantee) => void
}

export function ServiceGuarantees({
  guarantees,
  colors,
  isDarkMode,
  onGuaranteeClick,
}: ServiceGuaranteesProps) {
  const { cardBg, textPrimary } = colors

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
      <Text
        className='text-sm font-semibold'
        style={{
          fontSize: 14 * wxScale,
          fontWeight: 600,
          color: textPrimary,
        }}
      >
        服务保障
      </Text>
      <Box
        className='grid grid-cols-3 gap-2 mt-3'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8 * wxScale,
          marginTop: 12 * wxScale,
        }}
      >
        {guarantees.map((item) => (
          <Button
            key={item.id}
            className='flex flex-col items-center gap-2 py-3 rounded-lg'
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8 * wxScale,
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: isDarkMode ? '#1a3a2a' : '#ecfdf5',
            }}
            onClick={() => onGuaranteeClick(item)}
          >
            <Icon
              name={item.icon || 'check-one'}
              size={24 * wxScale}
              color="#10b981"
            />
            <Text
              style={{
                fontSize: 12 * wxScale,
                textAlign: 'center',
                color: '#10b981',
              }}
            >
              {item.name}
            </Text>
          </Button>
        ))}
      </Box>
    </Box>
  )
}
