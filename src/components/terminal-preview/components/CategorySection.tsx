/**
 * 服务分类区域组件
 */

import type { ServiceCategory, ThemeSettings } from '../types'
import { isWxEnvironment } from '../platform/env'
import { Box, Text, Icon } from '../ui/primitives'
import { getIconName } from '../icons'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

interface CategorySectionProps {
  categories: ServiceCategory[]
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 分类点击回调，传递分类 ID */
  onCategoryClick?: (categoryId: string) => void
}

function chunkIntoRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

function CategoryCard({
  category,
  index,
  primaryColor,
  isDarkMode = false,
  onClick,
}: {
  category: ServiceCategory
  index: number
  primaryColor: string
  isDarkMode?: boolean
  onClick?: () => void
}) {
  const color = category.color || (index === 0 ? primaryColor : '#22c55e')

  return (
    <Box
      className='flex flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-5 shadow-sm cursor-pointer transition-all active:scale-[0.98]'
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12 * wxScale,
        borderRadius: 16,
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        paddingTop: 20 * wxScale,
        paddingBottom: 20 * wxScale,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      }}
      onClick={onClick}
    >
      {/* 左侧内容 */}
        <Box className='flex-1 min-w-0' style={{ flex: 1, minWidth: 0 }}>
          {/* 标题 */}
          <Box className='mb-1.5' style={{ marginBottom: 6 * wxScale }}>
            <Text
              style={{
                display: 'block',
                fontSize: 18 * wxScale,
                fontWeight: 600,
                color,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {category.name}
            </Text>
          </Box>
          {/* 描述 */}
          <Text style={{ fontSize: 13 * wxScale, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
            {category.description || '专业服务，用心陪伴'}
          </Text>
      </Box>
      {/* 右侧图标 */}
      <Box
        style={{
          display: 'flex',
          width: 36 * wxScale,
          height: 36 * wxScale,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          backgroundColor: `${color}15`,
        }}
      >
        <Icon name={getIconName(category.icon || category.name || '')} size={18 * wxScale} color={color} />
      </Box>
    </Box>
  )
}

// 占位分类（无数据时显示）
function PlaceholderCategories({
  primaryColor,
  isDarkMode = false,
}: {
  primaryColor: string
  isDarkMode?: boolean
}) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const descColor = isDarkMode ? '#6b7280' : '#9ca3af'
  const placeholderCategories = [
    { name: '陪诊服务', description: '专业陪诊全程服务', color: primaryColor, icon: 'stethoscope' },
    { name: '代办服务', description: '快捷代办省时省心', color: '#22c55e', icon: 'truck' },
    { name: '全程陪诊', description: '就医流程贴心陪护', color: primaryColor, icon: 'stethoscope' },
    { name: '代办挂号', description: '快速协助预约挂号', color: '#f59e0b', icon: 'calendar' },
    { name: '代取报告', description: '报告资料安心代取', color: '#3b82f6', icon: 'file-text' },
    { name: '代办病历', description: '病历整理高效省心', color: '#8b5cf6', icon: 'folder' },
  ]
  const placeholderRows = chunkIntoRows(placeholderCategories, 2)

  return (
    <Box>
      {placeholderRows.map((row, rowIndex) => (
        <Box
          key={`placeholder-row-${rowIndex}`}
          style={{
            display: 'flex',
            marginBottom: rowIndex === placeholderRows.length - 1 ? 0 : 10 * wxScale,
          }}
        >
          {row.map((category, columnIndex) => (
            <Box
              key={category.name}
              style={{
                display: 'flex',
                flex: 1,
                minWidth: 0,
                marginRight: columnIndex === 0 && row.length > 1 ? 10 * wxScale : 0,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12 * wxScale,
                  borderRadius: 16,
                  paddingLeft: 12 * wxScale,
                  paddingRight: 12 * wxScale,
                  paddingTop: 20 * wxScale,
                  paddingBottom: 20 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ marginBottom: 6 * wxScale }}>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: 18 * wxScale,
                        fontWeight: 600,
                        color: category.color,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {category.name}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: 13 * wxScale, color: descColor }}>{category.description}</Text>
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    width: 36 * wxScale,
                    height: 36 * wxScale,
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: `${category.color}15`,
                  }}
                >
                  <Icon name={getIconName(category.icon)} size={18 * wxScale} color={category.color} />
                </Box>
              </Box>
            </Box>
          ))}
          {row.length === 1 ? <Box style={{ flex: 1 }} /> : null}
        </Box>
      ))}
    </Box>
  )
}

export function CategorySection({
  categories,
  themeSettings,
  isDarkMode = false,
  onCategoryClick,
}: CategorySectionProps) {
  // 置顶分类
  const pinnedCategories = categories.filter((c) => c.isPinned).slice(0, 2)
  // 非置顶分类
  const otherCategories = categories.filter((c) => !c.isPinned)
  const otherCategoryRows = chunkIntoRows(otherCategories, 2)

  return (
    <Box style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale, paddingTop: 12 * wxScale, paddingBottom: 12 * wxScale }}>
      {/* 置顶分类 - 左右两个大卡片 */}
      {pinnedCategories.length > 0 && (
        <Box style={{ display: 'flex', gap: 10 * wxScale, marginBottom: 12 * wxScale }}>
          {pinnedCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              primaryColor={themeSettings.primaryColor}
              isDarkMode={isDarkMode}
              onClick={() => onCategoryClick?.(category.id)}
            />
          ))}
        </Box>
      )}

      {/* 非置顶分类 - 同样的大卡片布局，置顶项仍单独显示在最上方 */}
      {otherCategories.length > 0 && (
        <Box>
          {otherCategoryRows.map((row, rowIndex) => (
            <Box
              key={`other-row-${rowIndex}`}
              style={{
                display: 'flex',
                marginBottom: rowIndex === otherCategoryRows.length - 1 ? 0 : 10 * wxScale,
              }}
            >
              {row.map((category, columnIndex) => (
                <Box
                  key={category.id}
                  style={{
                    display: 'flex',
                    flex: 1,
                    minWidth: 0,
                    marginRight: columnIndex === 0 && row.length > 1 ? 10 * wxScale : 0,
                  }}
                >
                  <CategoryCard
                    category={category}
                    index={otherCategories.indexOf(category) + pinnedCategories.length}
                    primaryColor={themeSettings.primaryColor}
                    isDarkMode={isDarkMode}
                    onClick={() => onCategoryClick?.(category.id)}
                  />
                </Box>
              ))}
              {row.length === 1 ? <Box style={{ flex: 1 }} /> : null}
            </Box>
          ))}
        </Box>
      )}

      {/* 无分类数据时的占位 */}
      {categories.length === 0 && (
        <PlaceholderCategories primaryColor={themeSettings.primaryColor} isDarkMode={isDarkMode} />
      )}
    </Box>
  )
}
