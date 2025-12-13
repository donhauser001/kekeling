/**
 * 分销中心团队成员页面（预览器版本）
 *
 * Step 11.3: distribution-members
 * - page key: 'distribution-members'
 * - API: previewApi.getDistributionMembers(params?)
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 * - 支持 relation 筛选（direct / indirect）
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, RefreshCw, User } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole, DistributionMember } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { formatMoney, getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'
import { getRefreshingClass } from '../../PageTransition'

// ============================================================================
// 类型定义
// ============================================================================

export interface DistributionMembersPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  /** 路由参数：relation 筛选 */
  pageParams?: Record<string, string>
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

type RelationFilter = 'all' | 'direct' | 'indirect'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionMembersPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  pageParams,
  onNavigate,
  onLogin,
}: DistributionMembersPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 筛选状态 - 从 pageParams 初始化
  const [relationFilter, setRelationFilter] = useState<RelationFilter>(
    (pageParams?.relation as RelationFilter) || 'all'
  )

  // ⚠️ 非 escort 视角时不发请求
  // 筛选参数变化触发 queryKey 变化，自动重新请求
  const {
    data: membersData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'distribution', 'members', relationFilter],
    queryFn: () =>
      previewApi.getDistributionMembers(
        relationFilter === 'all' ? undefined : { relation: relationFilter }
      ),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            团队成员
          </h1>
        </div>

        {/* 权限提示 */}
        <PermissionPrompt
          title="需要陪诊员身份"
          description="请先登录陪诊员账号查看团队成员"
          onLogin={onLogin}
          showDebugInject={process.env.NODE_ENV === 'development'}
          primaryColor={themeSettings.primaryColor}
          isDarkMode={isDarkMode}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
    >
      {/* 标题栏 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={() => onNavigate?.('distribution')}
          className="w-8 h-8 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
          团队成员
        </h1>
      </div>

      {/* 筛选标签 */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {(['all', 'direct', 'indirect'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setRelationFilter(filter)}
              className="px-4 py-1.5 rounded-full text-sm transition-colors"
              style={{
                backgroundColor:
                  relationFilter === filter
                    ? themeSettings.primaryColor
                    : isDarkMode
                      ? '#2a2a2a'
                      : '#fff',
                color:
                  relationFilter === filter
                    ? '#fff'
                    : isDarkMode
                      ? '#9ca3af'
                      : '#6b7280',
              }}
            >
              {filter === 'all' ? '全部' : filter === 'direct' ? '直属' : '间接'}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              加载失败
            </div>
            <button
              onClick={() => refetch()}
              className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        )}

        {/* 空态 - Step 14.21: 添加邀请按钮 */}
        {!isLoading && !isError && membersData && membersData.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">👥</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              暂无{relationFilter === 'direct' ? '直属' : relationFilter === 'indirect' ? '间接' : ''}成员
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('distribution-invite')}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                去邀请
              </button>
            )}
          </div>
        )}

        {/* 成员列表 - Step 14.10-C: 刷新过渡效果 */}
        {!isLoading && !isError && membersData && membersData.items.length > 0 && (
          <div className={`space-y-3 pb-4 ${getRefreshingClass(isFetching, membersData.items.length > 0)}`}>
            {membersData.items.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 成员卡片子组件
// ============================================================================

interface MemberCardProps {
  member: DistributionMember
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function MemberCard({ member, themeSettings, isDarkMode }: MemberCardProps) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
    >
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${themeSettings.primaryColor}15`,
            color: themeSettings.primaryColor,
          }}
        >
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {member.name}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor:
                  member.relation === 'direct'
                    ? `${themeSettings.primaryColor}15`
                    : isDarkMode
                      ? '#3a3a3a'
                      : '#f3f4f6',
                color:
                  member.relation === 'direct'
                    ? themeSettings.primaryColor
                    : isDarkMode
                      ? '#9ca3af'
                      : '#6b7280',
              }}
            >
              {member.relation === 'direct' ? '直属' : '间接'}
            </span>
          </div>
          <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
            {member.phone} · {member.level}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="flex gap-6 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <div className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
            累计订单
          </div>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {member.totalOrders}
          </div>
        </div>
        <div>
          <div className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
            累计分润
          </div>
          <div className="text-sm font-semibold" style={{ color: themeSettings.primaryColor }}>
            ¥{formatMoney(member.totalDistribution)}
          </div>
        </div>
        <div>
          <div className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
            加入时间
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {member.joinedAt}
          </div>
        </div>
      </div>
    </div>
  )
}
