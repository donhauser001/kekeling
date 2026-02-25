/**
 * 用户头部组件
 * 按《小程序页面改造规范》改造
 *
 * 陪诊员视角逻辑：
 * - isEscortMode: 是否处于陪诊员视角（由 escortToken 推导）
 * - hasEscortQualification: 是否有陪诊员资质（后端返回）
 * - 只有 isEscortMode 为 true 时才显示退出按钮
 * - 退出按钮调用 onExitEscortMode，清除 escortToken
 */

import { Box, Text, Image, Icon } from '../../../../ui/primitives'
import { isWxEnvironment, getFullImageUrl } from '../../../../platform/env'
import type { UserHeaderProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

// 小程序头部安全区域
const wxStatusBarHeight = 44
const wxSafeAreaTop = isWxEnvironment() ? wxStatusBarHeight : 0

export function UserHeader({
  userProfile,
  isEscortMode,
  hasEscortQualification,
  primaryColor,
  onSettingsClick,
  onExitEscortMode,
}: UserHeaderProps) {
  return (
    <Box
      style={{
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: wxSafeAreaTop + 32 * wxScale,
        paddingBottom: 24 * wxScale,
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      {/* 陪诊员模式提示条 - 只有处于陪诊员视角时才显示 */}
      {isEscortMode && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 8 * wxScale,
            paddingBottom: 8 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            <Icon name="workbench" size={16 * wxScale} color="#fff" />
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>陪诊员模式</Text>
          </Box>
          <Box
            onClick={onExitEscortMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 4 * wxScale,
              paddingBottom: 4 * wxScale,
              borderRadius: 4 * wxScale,
            }}
          >
            <Icon name="return" size={12 * wxScale} color="rgba(255, 255, 255, 0.8)" />
            <Text style={{ fontSize: 12 * wxScale, color: 'rgba(255, 255, 255, 0.8)' }}>
              退出
            </Text>
          </Box>
        </Box>
      )}

      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
        {/* 头像 */}
        <Box
          style={{
            width: 64 * wxScale,
            height: 64 * wxScale,
            borderRadius: 32 * wxScale,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {userProfile?.avatar ? (
            <Image
              src={getFullImageUrl(userProfile.avatar) || userProfile.avatar}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Icon name="user" size={32 * wxScale} color="#fff" />
          )}
        </Box>

        {/* 用户信息 */}
        <Box style={{ flex: 1 }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
            <Text style={{ fontSize: 18 * wxScale, fontWeight: 600, color: '#fff' }}>
              {userProfile?.nickname || '微信用户'}
            </Text>
            {/* 陪诊员标签 - 仅陪诊员视角显示 */}
            {isEscortMode && hasEscortQualification && (
              <Box
                style={{
                  paddingLeft: 6 * wxScale,
                  paddingRight: 6 * wxScale,
                  paddingTop: 2 * wxScale,
                  paddingBottom: 2 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text style={{ fontSize: 10 * wxScale, color: '#fff' }}>陪诊员</Text>
              </Box>
            )}
          </Box>
          <Text
            style={{
              display: 'block',
              marginTop: 4 * wxScale,
              fontSize: 14 * wxScale,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {userProfile?.phone || '未绑定手机'}
          </Text>
        </Box>

        {/* 设置按钮 */}
        <Box
          onClick={onSettingsClick}
          style={{
            padding: 8 * wxScale,
            borderRadius: 20 * wxScale,
          }}
        >
          <Icon name="setting" size={20 * wxScale} color="#fff" />
        </Box>
      </Box>
    </Box>
  )
}
