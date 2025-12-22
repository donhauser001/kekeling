/**
 * 团队成员页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: HTML 元素 → 跨平台原语
 * - 规则 4.1: 添加骨架屏
 * - 规则 11: 导航栏预留安全区域
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../../../ui/primitives'
import { previewApi } from '../../../../api'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { wxScale, wxSafeAreaTop, relationLabels } from './constants'
import type { DistributionMembersPageProps, TeamMember, RelationFilter } from './types'
import { MembersPageSkeleton, MemberCard } from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionMembersPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: DistributionMembersPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 筛选状态
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('all')

  // 获取团队成员数据
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    fetchMembers()
  }, [isEscort, relationFilter])

  const fetchMembers = async () => {
    try {
      const data = await previewApi.getDistributionMembers({
        relation: relationFilter === 'all' ? undefined : relationFilter,
      })
      setMembers(data.items || [])
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRetry = () => {
    setError(false)
    setLoading(true)
    fetchMembers()
  }

  const handleFilterChange = (filter: RelationFilter) => {
    if (filter !== relationFilter) {
      setRelationFilter(filter)
      setRefreshing(true)
    }
  }

  const handleBack = () => {
    onNavigate?.('distribution')
  }

  // 非 escort 视角
  if (!isEscort) {
    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
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
            <Box
              onClick={handleBack}
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              团队成员
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, padding: 16 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看团队成员"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // 加载中
  if (loading) {
    return <MembersPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
  }

  // 错误状态
  if (error) {
    return (
      <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
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
            <Box
              onClick={handleBack}
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              团队成员
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 48 * wxScale,
          }}
        >
          <Icon name="caution" size={48 * wxScale} color={textSecondary} />
          <Text
            style={{
              display: 'block',
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            加载失败
          </Text>
          <Box
            onClick={handleRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
              marginTop: 12 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: primaryColor,
            }}
          >
            <Icon name="refresh" size={16 * wxScale} color="#fff" />
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>重试</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // 主界面
  return (
    <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
      {/* 导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
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
          <Box
            onClick={handleBack}
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
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            团队成员
          </Text>
        </Box>
      </Box>

      {/* 筛选器 */}
      <Box
        style={{
          display: 'flex',
          gap: 8 * wxScale,
          padding: 12 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
        }}
      >
        {(['all', 'direct', 'indirect'] as const).map((filter) => (
          <Box
            key={filter}
            onClick={() => handleFilterChange(filter)}
            style={{
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 6 * wxScale,
              paddingBottom: 6 * wxScale,
              borderRadius: 16 * wxScale,
              backgroundColor: relationFilter === filter ? primaryColor : isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: relationFilter === filter ? '#fff' : textSecondary,
              }}
            >
              {relationLabels[filter]}
            </Text>
          </Box>
        ))}
      </Box>

      {/* 成员列表 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          opacity: refreshing ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {members.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Icon name="peoples" size={48 * wxScale} color={textSecondary} />
            <Text
              style={{
                display: 'block',
                marginTop: 12 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              暂无团队成员
            </Text>
            <Box
              onClick={() => onNavigate?.('distribution-invite')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4 * wxScale,
                marginTop: 16 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Icon name="share-three" size={16 * wxScale} color="#fff" />
              <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>去邀请</Text>
            </Box>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                primaryColor={primaryColor}
                isDarkMode={isDarkMode}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

