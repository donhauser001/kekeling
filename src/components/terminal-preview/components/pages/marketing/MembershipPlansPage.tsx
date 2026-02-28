/**
 * 会员套餐页面
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, Button
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Icon, Button } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { getWxBridge } from '../../../bridge'
import type { ThemeSettings, MembershipPlanOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { MembershipPlan } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface MembershipPlansPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 会员套餐列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - array: 覆盖数据
   */
  plansOverride?: MembershipPlanOverride[]
  /**
   * 导航回调
   */
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function MembershipPlansPage({
  themeSettings,
  isDarkMode,
  onBack,
  plansOverride,
  onNavigate,
}: MembershipPlansPageProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [apiPlans, setApiPlans] = useState<MembershipPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  // 购买相关状态
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean
    message: string
    orderId?: string
  } | null>(null)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#333' : '#eee'

  // 是否使用覆盖数据
  const hasOverride = plansOverride !== undefined

  // 获取会员套餐列表（仅在无覆盖时调用 API）
  const fetchPlans = () => {
    if (hasOverride) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getMembershipPlans()
      .then((data) => setApiPlans(data ?? []))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchPlans()
  }, [hasOverride])

  // 合并数据：覆盖优先
  const plans = useMemo<MembershipPlan[]>(() => {
    if (hasOverride && plansOverride) {
      return plansOverride.map((plan) => ({
        id: plan.id,
        name: plan.name ?? '套餐',
        description: plan.description ?? '',
        price: plan.price ?? 0,
        originalPrice: plan.originalPrice,
        duration: plan.durationDays ?? 30,
        recommended: plan.isRecommended,
      }))
    }
    return apiPlans
  }, [hasOverride, plansOverride, apiPlans])

  const isEmpty = !isLoading && plans.length === 0

  // 处理购买会员
  const handlePurchase = async () => {
    if (!selectedPlanId || isPurchasing) return

    const wxBridge = getWxBridge()
    setIsPurchasing(true)
    setPurchaseResult(null)

    try {
      // Step 1: 创建会员订单
      wxBridge.showToast({ title: '订单创建中...', icon: 'loading' })
      const orderResult = await previewApi.purchaseMembership(selectedPlanId)

      if (!orderResult.success || !orderResult.orderId) {
        setPurchaseResult({
          success: false,
          message: orderResult.message || '订单创建失败',
        })
        setIsPurchasing(false)
        return
      }

      console.log('[MembershipPlansPage] 订单创建成功:', orderResult.orderId)

      // Step 2: 获取支付参数
      wxBridge.showToast({ title: '正在调起支付...', icon: 'loading' })
      const paymentParams = await previewApi.getMembershipPaymentParams(orderResult.orderId)
      console.log('[MembershipPlansPage] 获取支付参数:', paymentParams)

      // 检查是否是 0 元订单（免支付）
      if ('freeOrder' in paymentParams && paymentParams.freeOrder) {
        // 0 元订单，已自动完成
        console.log('[MembershipPlansPage] 0元订单已自动完成')
        setPurchaseResult({
          success: true,
          message: '会员开通成功！',
          orderId: orderResult.orderId,
        })
        return
      }

      if (!('timeStamp' in paymentParams)) {
        setPurchaseResult({
          success: false,
          message: '支付参数异常，请稍后重试',
          orderId: orderResult.orderId,
        })
        return
      }

      // Step 3: 调起微信支付
      const payResult = await wxBridge.requestPayment({
        timeStamp: paymentParams.timeStamp,
        nonceStr: paymentParams.nonceStr,
        package: paymentParams.package,
        signType: paymentParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
        paySign: paymentParams.paySign,
      })

      if (payResult.success) {
        // 支付成功
        setPurchaseResult({
          success: true,
          message: '会员开通成功！',
          orderId: orderResult.orderId,
        })
      } else {
        // 支付取消或失败
        const errorMsg = payResult.errMsg || '支付未完成'
        if (errorMsg.includes('cancel')) {
          setPurchaseResult({
            success: false,
            message: '已取消支付，订单已保存，可稍后支付',
            orderId: orderResult.orderId,
          })
        } else {
          setPurchaseResult({
            success: false,
            message: errorMsg,
            orderId: orderResult.orderId,
          })
        }
      }
    } catch (error: any) {
      console.error('[MembershipPlansPage] 购买失败:', error)
      setPurchaseResult({
        success: false,
        message: error.message || '网络错误，请重试',
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  // 关闭结果提示
  const handleCloseResult = () => {
    if (purchaseResult?.success) {
      // 支付成功，跳转到订单列表
      onNavigate?.('user-orders')
    } else if (purchaseResult?.orderId) {
      // 支付失败但有订单，跳转到订单列表查看待支付订单
      onNavigate?.('user-orders')
    }
    setPurchaseResult(null)
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 导航栏 ========== */}
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
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>开通会员</Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  padding: 16 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Box
                      style={{
                        height: 16 * wxScale,
                        width: 80 * wxScale,
                        borderRadius: 4 * wxScale,
                        backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                        marginBottom: 8 * wxScale,
                      }}
                    />
                    <Box
                      style={{
                        height: 12 * wxScale,
                        width: 120 * wxScale,
                        borderRadius: 4 * wxScale,
                        backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                      }}
                    />
                  </Box>
                  <Box
                    style={{
                      height: 32 * wxScale,
                      width: 60 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* 请求失败 */}
        {isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="close" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              加载失败
            </Text>
            <Box
              onClick={fetchPlans}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>点击重试</Text>
            </Box>
          </Box>
        )}

        {/* 空状态 */}
        {isEmpty && !isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="vip-one" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              暂无可用套餐
            </Text>
          </Box>
        )}

        {/* 套餐列表 */}
        {!isLoading && !isError && plans.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部操作栏 */}
      {!isLoading && !isError && plans.length > 0 && (
        <Box
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16 * wxScale,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: borderColor,
          }}
        >
          <Button
            disabled={!selectedPlanId || isPurchasing}
            onClick={handlePurchase}
            style={{
              width: '100%',
              paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
              borderRadius: 9999,
              backgroundColor: primaryColor,
              opacity: selectedPlanId && !isPurchasing ? 1 : 0.5,
              border: 'none',
            }}
          >
            <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>
              {isPurchasing ? '处理中...' : selectedPlanId ? '立即开通' : '请选择套餐'}
            </Text>
          </Button>
        </Box>
      )}

      {/* 购买结果弹窗 */}
      {purchaseResult && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <Box
            style={{
              width: '80%',
              maxWidth: 300 * wxScale,
              padding: 24 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Icon
                name={purchaseResult.success ? 'check-one' : 'close-one'}
                size={48 * wxScale}
                color={purchaseResult.success ? '#10b981' : '#ef4444'}
              />
              <Text
                style={{
                  display: 'block',
                  marginTop: 16 * wxScale,
                  fontSize: 16 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                  textAlign: 'center',
                }}
              >
                {purchaseResult.success ? '开通成功' : purchaseResult.orderId ? '支付未完成' : '开通失败'}
              </Text>
              <Text
                style={{
                  display: 'block',
                  marginTop: 8 * wxScale,
                  fontSize: 14 * wxScale,
                  color: textSecondary,
                  textAlign: 'center',
                }}
              >
                {purchaseResult.message}
              </Text>
              <Button
                onClick={handleCloseResult}
                style={{
                  marginTop: 20 * wxScale,
                  paddingLeft: 32 * wxScale,
                  paddingRight: 32 * wxScale,
                  paddingTop: 10 * wxScale,
                  paddingBottom: 10 * wxScale,
                  borderRadius: 9999,
                  backgroundColor: primaryColor,
                  border: 'none',
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>
                  {purchaseResult.success ? '查看订单' : purchaseResult.orderId ? '查看订单' : '关闭'}
                </Text>
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* 底部留白（给操作栏腾出空间） */}
      <Box style={{ height: 96 * wxScale }} />
    </Box>
  )
}

// ============================================================================
// 套餐卡片子组件
// ============================================================================

interface PlanCardProps {
  plan: MembershipPlan
  isSelected: boolean
  onSelect: () => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function PlanCard({ plan, isSelected, onSelect, themeSettings, isDarkMode }: PlanCardProps) {
  const primaryColor = themeSettings.primaryColor
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price

  return (
    <Box
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: 16 * wxScale,
        paddingLeft: 40 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
        borderWidth: isSelected ? 2 : 0,
        borderStyle: 'solid',
        borderColor: isSelected ? primaryColor : 'transparent',
        cursor: 'pointer',
      }}
    >
      {/* 推荐标签 */}
      {plan.recommended && (
        <Box
          style={{
            position: 'absolute',
            top: -8 * wxScale,
            right: 16 * wxScale,
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: primaryColor,
          }}
        >
          <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>推荐</Text>
        </Box>
      )}

      {/* 选中指示器 */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: 12 * wxScale,
          transform: 'translateY(-50%)',
          width: 20 * wxScale,
          height: 20 * wxScale,
          borderRadius: 10 * wxScale,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: isSelected ? primaryColor : '#d1d5db',
          backgroundColor: isSelected ? primaryColor : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && <Icon name="check" size={12 * wxScale} color="#fff" />}
      </Box>

      {/* 套餐信息 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Text style={{ fontSize: 15 * wxScale, fontWeight: 500, color: textPrimary }}>
            {plan.name}
          </Text>
          <Text
            style={{
              display: 'block',
              marginTop: 4 * wxScale,
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
          >
            {plan.description}
          </Text>
        </Box>

        <Box style={{ textAlign: 'right' }}>
          <Box style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>¥</Text>
            <Text style={{ fontSize: 24 * wxScale, fontWeight: 700, color: primaryColor }}>
              {plan.price}
            </Text>
          </Box>
          {hasDiscount && (
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textSecondary,
                textDecoration: 'line-through',
              }}
            >
              ¥{plan.originalPrice}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}
