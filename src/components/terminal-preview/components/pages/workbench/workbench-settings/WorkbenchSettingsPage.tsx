/**
 * 工作台设置页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery/useMutation → useState + useEffect
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
import { wxScale, wxSafeAreaTop } from './constants'
import type { WorkbenchSettingsPageProps, WorkbenchSettings } from './types'
import {
    SettingItem,
    SwitchItem,
    ProfileCard,
    SettingsPageSkeleton,
} from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchSettingsPage({
    themeSettings,
    isDarkMode,
    effectiveViewerRole,
    onNavigate,
    onLogin,
}: WorkbenchSettingsPageProps) {
    const isEscort = effectiveViewerRole === 'escort'
    const primaryColor = themeSettings.primaryColor

    // 颜色变量
    const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

    // 数据状态
    const [settings, setSettings] = useState<WorkbenchSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // 本地状态（乐观更新）
    const [autoAccept, setAutoAccept] = useState(false)
    const [updating, setUpdating] = useState(false)

    // 获取设置数据
    useEffect(() => {
        if (!isEscort) {
            setLoading(false)
            return
        }

        previewApi
            .getWorkbenchSettings()
            .then((data) => {
                setSettings(data)
                setAutoAccept(data.autoAcceptOrders)
            })
            .catch(() => {
                setError(true)
            })
            .finally(() => setLoading(false))
    }, [isEscort])

    // 切换自动接单
    const handleToggleAutoAccept = async () => {
        const newValue = !autoAccept
        setAutoAccept(newValue)
        setUpdating(true)
        try {
            await previewApi.updateWorkbenchSettings({ autoAcceptOrders: newValue })
        } catch (err) {
            // 回滚
            setAutoAccept(!newValue)
            console.error('更新失败:', err)
        } finally {
            setUpdating(false)
        }
    }

    const handleBack = () => {
        onNavigate?.('workbench')
    }

    // 非 escort 视角：显示权限提示
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
                            设置
                        </Text>
                    </Box>
                </Box>

                <Box style={{ flex: 1, padding: 16 * wxScale }}>
                    <PermissionPrompt
                        title="需要陪诊员身份"
                        description="请先登录陪诊员账号访问设置页面"
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
        return <SettingsPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
    }

    // 错误状态
    if (error || !settings) {
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
                            设置
                        </Text>
                    </Box>
                </Box>

                <Box
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16 * wxScale,
                    }}
                >
                    <Box style={{ textAlign: 'center' }}>
                        <Icon name="caution" size={48 * wxScale} color={textSecondary} />
                        <Text
                            style={{
                                display: 'block',
                                marginTop: 12 * wxScale,
                                fontSize: 14 * wxScale,
                                color: textSecondary,
                            }}
                        >
                            加载失败，请稍后重试
                        </Text>
                    </Box>
                </Box>
            </Box>
        )
    }

    // 主界面
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
                        设置
                    </Text>
                </Box>
            </Box>

            {/* 内容区域 */}
            <Box style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 * wxScale }}>
                {/* 个人资料卡片 */}
                <ProfileCard
                    profile={settings.profile}
                    isDarkMode={isDarkMode}
                    primaryColor={primaryColor}
                    onClick={() => onNavigate?.('escort-profile-edit')}
                />

                {/* 接单设置 */}
                <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, marginTop: 16 * wxScale }}>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 14 * wxScale,
                            fontWeight: 500,
                            marginBottom: 8 * wxScale,
                            color: textSecondary,
                        }}
                    >
                        接单设置
                    </Text>
                    <Box
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: 12 * wxScale,
                            overflow: 'hidden',
                        }}
                    >
                        <SwitchItem
                            icon="zap"
                            iconColor="#8b5cf6"
                            label="自动接单"
                            description="系统将自动接受符合条件的订单"
                            checked={autoAccept}
                            loading={updating}
                            onChange={handleToggleAutoAccept}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                            showBorder={false}
                        />
                    </Box>
                </Box>

                {/* 接单偏好 */}
                <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, marginTop: 16 * wxScale }}>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 14 * wxScale,
                            fontWeight: 500,
                            marginBottom: 8 * wxScale,
                            color: textSecondary,
                        }}
                    >
                        接单偏好
                    </Text>
                    <Box
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: 12 * wxScale,
                            overflow: 'hidden',
                        }}
                    >
                        <SettingItem
                            icon="setting"
                            iconColor="#3b82f6"
                            label="服务项目"
                            value={`已选 ${settings.preferences.serviceTypes.length} 项`}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                            onClick={() => onNavigate?.('workbench-service-types')}
                        />
                        <SettingItem
                            icon="hospital"
                            iconColor="#f59e0b"
                            label="服务医院"
                            value={`已选 ${settings.preferences.serviceAreas.length} 家`}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                        />
                        <SettingItem
                            icon="stethoscope"
                            iconColor="#ec4899"
                            label="擅长科室"
                            value={`已选 ${settings.preferences.departments?.length || 0} 个`}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                        />
                        {settings.preferences.workingHours && (
                            <SettingItem
                                icon="time"
                                iconColor="#14b8a6"
                                label="工作时间"
                                value={`${settings.preferences.workingHours.start} - ${settings.preferences.workingHours.end}`}
                                isDarkMode={isDarkMode}
                                primaryColor={primaryColor}
                                showBorder={false}
                            />
                        )}
                    </Box>
                </Box>

                {/* 通知设置 */}
                <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, marginTop: 16 * wxScale }}>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 14 * wxScale,
                            fontWeight: 500,
                            marginBottom: 8 * wxScale,
                            color: textSecondary,
                        }}
                    >
                        通知设置
                    </Text>
                    <Box
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: 12 * wxScale,
                            overflow: 'hidden',
                        }}
                    >
                        <SettingItem
                            icon="remind"
                            iconColor="#10b981"
                            label="新订单通知"
                            value={settings.notifications.newOrder ? '已开启' : '已关闭'}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                        />
                        <SettingItem
                            icon="remind"
                            iconColor="#3b82f6"
                            label="订单状态变更"
                            value={settings.notifications.orderStatus ? '已开启' : '已关闭'}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                        />
                        <SettingItem
                            icon="remind"
                            iconColor="#8b5cf6"
                            label="系统通知"
                            value={settings.notifications.system ? '已开启' : '已关闭'}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                        />
                        <SettingItem
                            icon="remind"
                            iconColor="#f59e0b"
                            label="营销通知"
                            value={settings.notifications.marketing ? '已开启' : '已关闭'}
                            isDarkMode={isDarkMode}
                            primaryColor={primaryColor}
                            showBorder={false}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

