/**
 * 表单区域组件
 */

import { Box, Text, Input, Icon } from '../../../../ui/primitives'
import { wxScale, genderOptions, formatDisplayDate } from '../constants'
import type { FormSectionProps } from '../types'

export function FormSection({
    colors,
    nickname,
    setNickname,
    phone,
    gender,
    birthday,
    onGenderClick,
    onBirthdayClick,
    renderBindPhoneButton,
    onPhoneBindSuccess,
}: FormSectionProps) {
    const { cardBg, borderColor, textPrimary, textSecondary, textMuted } = colors
    const labelWidth = 88 * wxScale

    return (
        <Box
            style={{
                marginTop: 12 * wxScale,
                marginLeft: 12 * wxScale,
                marginRight: 12 * wxScale,
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                backgroundColor: cardBg,
            }}
        >
            {/* 昵称 */}
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                <Box style={{ width: labelWidth, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
                    <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>昵称</Text>
                    <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>：</Text>
                </Box>
                <Box style={{ flex: 1, minWidth: 0, marginLeft: 8 * wxScale }}>
                    <Input
                        value={nickname}
                        onChange={(val) => setNickname(val)}
                        placeholder="请输入昵称"
                        maxLength={20}
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            fontSize: 14 * wxScale,
                            color: textPrimary,
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                        }}
                    />
                </Box>
            </Box>

            {/* 手机号 */}
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                <Box style={{ width: labelWidth, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
                    <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>手机号</Text>
                    <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>：</Text>
                </Box>
                <Box style={{ flex: 1, minWidth: 0, marginLeft: 8 * wxScale }}>
                    {phone ? (
                        <Text
                            style={{
                                display: 'block',
                                textAlign: 'right',
                                fontSize: 14 * wxScale,
                                color: textPrimary,
                            }}
                        >
                            {phone}
                        </Text>
                    ) : renderBindPhoneButton ? (
                        renderBindPhoneButton({ onSuccess: onPhoneBindSuccess })
                    ) : (
                        <Text
                            style={{
                                display: 'block',
                                textAlign: 'right',
                                fontSize: 14 * wxScale,
                                color: textMuted,
                            }}
                        >
                            未绑定
                        </Text>
                    )}
                </Box>
            </Box>

            {/* 性别 */}
            <Box
                onClick={onGenderClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                }}
            >
                <Box style={{ width: labelWidth, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
                    <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>性别</Text>
                    <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>：</Text>
                </Box>
                <Text
                    style={{
                        flex: 1,
                        marginLeft: 8 * wxScale,
                        textAlign: 'right',
                        fontSize: 14 * wxScale,
                        color: gender ? textPrimary : textMuted,
                    }}
                >
                    {gender ? genderOptions.find((g) => g.value === gender)?.label : '未设置'}
                </Text>
                <Icon name="right" size={16 * wxScale} color={textMuted} />
            </Box>

            {/* 生日 */}
            <Box
                onClick={onBirthdayClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    cursor: 'pointer',
                }}
            >
                <Box style={{ width: labelWidth, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
                    <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>生日</Text>
                    <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>：</Text>
                </Box>
                <Text
                    style={{
                        flex: 1,
                        marginLeft: 8 * wxScale,
                        textAlign: 'right',
                        fontSize: 14 * wxScale,
                        color: birthday ? textPrimary : textMuted,
                    }}
                >
                    {formatDisplayDate(birthday)}
                </Text>
                <Icon name="right" size={16 * wxScale} color={textMuted} />
            </Box>
        </Box>
    )
}
