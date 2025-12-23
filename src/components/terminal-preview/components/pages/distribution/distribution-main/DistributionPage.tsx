/**
 * 分销中心首页（预览器版本）
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
import { formatMoney, safeNumber, safeString } from '../../../../utils'
import { wxScale, wxSafeAreaTop } from './constants'
import type { DistributionPageProps, DistributionStats } from './types'
import { DistributionPageSkeleton, StatCard, QuickEntry } from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onBack,
  onLogin,
}: DistributionPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [stats, setStats] = useState<DistributionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 数据转换函数
  const transformStats = (data: DistributionStats): DistributionStats => ({
    ...data,
    totalTeamSize: safeNumber(data?.totalTeamSize),
    directCount: safeNumber(data?.directCount),
    indirectCount: safeNumber(data?.indirectCount),
    totalDistribution: safeNumber(data?.totalDistribution),
    monthlyDistribution: safeNumber(data?.monthlyDistribution),
    pendingDistribution: safeNumber(data?.pendingDistribution),
    currentLevel: safeString(data?.currentLevel, '初级'),
    nextLevel: data?.nextLevel ? safeString(data.nextLevel) : undefined,
    promotionProgress:
      data?.promotionProgress !== undefined
        ? safeNumber(data.promotionProgress)
        : undefined,
  })

  // 获取分销数据
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    previewApi
      .getDistributionStats()
      .then((data) => setStats(transformStats(data)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [isEscort])

  const handleRetry = () => {
    setError(false)
    setLoading(true)
    previewApi
      .getDistributionStats()
      .then((data) => setStats(transformStats(data)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  // 非 escort 视角：显示统一的 PermissionPrompt
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
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44 * wxScale,
              position: 'relative',
            }}
          >
            {/* 返回按钮 */}
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                padding: 8 * wxScale,
              }}
            >
              <Icon name="left" size={20 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              分销中心
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, padding: 16 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看分销数据"
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
    return <DistributionPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
  }

  // 错误状态
  if (error || !stats) {
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
              height: 44 * wxScale,
              position: 'relative',
            }}
          >
            {/* 返回按钮 */}
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                padding: 8 * wxScale,
              }}
            >
              <Icon name="left" size={20 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              分销中心
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
            paddingBottom: 48 * wxScale,
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
            height: 44 * wxScale,
            position: 'relative',
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              padding: 8 * wxScale,
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            分销中心
          </Text>
        </Box>
      </Box>

      {/* 内容区 */}
      <Box style={{ padding: 16 * wxScale }}>
        {/* 收入概览卡片 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: 'rgba(255,255,255,0.8)', marginBottom: 4 * wxScale }}>
            累计分润
          </Text>
          <Text style={{ fontSize: 28 * wxScale, fontWeight: 700, color: '#fff' }}>
            ¥{formatMoney(stats.totalDistribution)}
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: 24 * wxScale,
              marginTop: 16 * wxScale,
            }}
          >
            <Box>
              <Text style={{ fontSize: 12 * wxScale, color: 'rgba(255,255,255,0.6)' }}>
                本月分润
              </Text>
              <Text style={{ fontSize: 18 * wxScale, fontWeight: 600, color: '#fff' }}>
                ¥{formatMoney(stats.monthlyDistribution)}
              </Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 12 * wxScale, color: 'rgba(255,255,255,0.6)' }}>
                待结算
              </Text>
              <Text style={{ fontSize: 18 * wxScale, fontWeight: 600, color: '#fff' }}>
                ¥{formatMoney(stats.pendingDistribution)}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* 团队概览 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              marginBottom: 12 * wxScale,
              color: textPrimary,
            }}
          >
            团队概览
          </Text>
          <Box style={{ display: 'flex', justifyContent: 'space-around' }}>
            <StatCard label="团队总人数" value={stats.totalTeamSize} isDarkMode={isDarkMode} />
            <StatCard label="直属成员" value={stats.directCount} isDarkMode={isDarkMode} />
            <StatCard label="间接成员" value={stats.indirectCount} isDarkMode={isDarkMode} />
          </Box>
        </Box>

        {/* 等级与晋升进度 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12 * wxScale,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
              我的等级
            </Text>
            <Box
              onClick={() => onNavigate?.('distribution-promotion')}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>查看详情</Text>
              <Icon name="right" size={16 * wxScale} color={primaryColor} />
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
            <Box
              style={{
                width: 48 * wxScale,
                height: 48 * wxScale,
                borderRadius: 24 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${primaryColor}20`,
              }}
            >
              <Icon name="vip-one" size={24 * wxScale} color={primaryColor} />
            </Box>
            <Box>
              <Text style={{ fontSize: 16 * wxScale, fontWeight: 600, color: textPrimary }}>
                {stats.currentLevel}
              </Text>
              {stats.nextLevel && (
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                  下一等级：{stats.nextLevel}
                </Text>
              )}
            </Box>
          </Box>

          {/* 晋升进度条 */}
          {stats.promotionProgress !== undefined && stats.nextLevel && (
            <Box style={{ marginTop: 12 * wxScale }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4 * wxScale,
                }}
              >
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>晋升进度</Text>
                <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>
                  {stats.promotionProgress}%
                </Text>
              </Box>
              <Box
                style={{
                  height: 8 * wxScale,
                  borderRadius: 4 * wxScale,
                  overflow: 'hidden',
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                }}
              >
                <Box
                  style={{
                    width: `${stats.promotionProgress}%`,
                    height: '100%',
                    borderRadius: 4 * wxScale,
                    backgroundColor: primaryColor,
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* 快捷入口 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              marginBottom: 12 * wxScale,
              color: textPrimary,
            }}
          >
            快捷入口
          </Text>
          <Box style={{ display: 'flex', justifyContent: 'space-around' }}>
            <QuickEntry
              icon="peoples"
              label="团队成员"
              color="#3b82f6"
              onClick={() => onNavigate?.('distribution-members')}
            />
            <QuickEntry
              icon="transaction-order"
              label="分润记录"
              color="#10b981"
              onClick={() => onNavigate?.('distribution-records')}
            />
            <QuickEntry
              icon="gift"
              label="邀请好友"
              color="#f59e0b"
              onClick={() => onNavigate?.('distribution-invite')}
            />
            <QuickEntry
              icon="trending-up"
              label="晋升进度"
              color="#8b5cf6"
              onClick={() => onNavigate?.('distribution-promotion')}
            />
          </Box>
        </Box>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

