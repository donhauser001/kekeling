/**
 * 就诊人信息卡片
 * 显示就诊人的详细信息（陪诊员核心关注）
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import { User, Phone, CreditCard, Users } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import { SectionTitle, InfoRow } from './common'

interface PatientInfoCardProps {
  patient: {
    name: string
    phone?: string
    maskedPhone?: string
    gender?: string
    age?: number
    idCard?: string
    maskedIdCard?: string
    relation?: string
  }
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
  /** 是否显示完整手机号 */
  showFullPhone?: boolean
  /** 是否显示完整身份证号 */
  showFullIdCard?: boolean
  /** 是否显示拨打电话按钮 */
  showCallButton?: boolean
  /** 拨打电话回调 */
  onCall?: () => void
}

export function PatientInfoCard({
  patient,
  themeSettings,
  isDarkMode,
  wxScale,
  showFullPhone = false,
  showFullIdCard = false,
  showCallButton = false,
  onCall,
}: PatientInfoCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 显示的手机号
  const displayPhone = showFullPhone && patient.phone 
    ? patient.phone 
    : (patient.maskedPhone || patient.phone || '-')

  // 显示的身份证号
  const displayIdCard = showFullIdCard && patient.idCard
    ? patient.idCard
    : (patient.maskedIdCard || patient.idCard || '-')

  // 性别映射
  const genderMap: Record<string, string> = {
    male: '男',
    female: '女',
  }

  // 关系映射
  const relationMap: Record<string, string> = {
    self: '本人',
    parent: '父母',
    child: '子女',
    spouse: '配偶',
    other: '其他',
  }

  // 性别和年龄组合显示
  const genderText = patient.gender ? (genderMap[patient.gender] || patient.gender) : null
  const genderAgeText = [
    genderText,
    patient.age ? `${patient.age}岁` : null,
  ].filter(Boolean).join(' · ') || '-'

  // 关系显示文本
  const relationText = patient.relation ? (relationMap[patient.relation] || patient.relation) : null

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: `${themeSettings.primaryColor}30`,
      }}
    >
      {/* 标题带强调样式 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 12 * wxScale,
        }}
      >
        <Box
          style={{
            width: 4 * wxScale,
            height: 16 * wxScale,
            backgroundColor: themeSettings.primaryColor,
            borderRadius: 2 * wxScale,
            marginRight: 8 * wxScale,
          }}
        />
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 600,
            color: textPrimary,
          }}
        >
          就诊人信息
        </Text>
        {relationText && (
          <Box
            style={{
              marginLeft: 8 * wxScale,
              paddingLeft: 6 * wxScale,
              paddingRight: 6 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: `${themeSettings.primaryColor}20`,
            }}
          >
            <Text
              style={{
                fontSize: 11 * wxScale,
                color: themeSettings.primaryColor,
              }}
            >
              {relationText}
            </Text>
          </Box>
        )}
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12 * wxScale,
        }}
      >
        {/* 姓名 */}
        <InfoRow
          icon={<User size={16 * wxScale} color={themeSettings.primaryColor} />}
          label="就诊人姓名"
          value={patient.name}
          themeSettings={themeSettings}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          wxScale={wxScale}
        />

        {/* 性别/年龄 */}
        {(patient.gender || patient.age) && (
          <InfoRow
            icon={<Users size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="性别/年龄"
            value={genderAgeText}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
        )}

        {/* 联系电话 */}
        {(patient.phone || patient.maskedPhone) && (
          <InfoRow
            icon={<Phone size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="联系电话"
            value={displayPhone}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            action={showCallButton && patient.phone ? (
              <Box
                onClick={onCall}
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: '#10b98120',
                }}
              >
                <Phone size={14 * wxScale} color="#10b981" />
              </Box>
            ) : undefined}
          />
        )}

        {/* 身份证号 */}
        {(patient.idCard || patient.maskedIdCard) && (
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="身份证号"
            value={displayIdCard}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
        )}
      </Box>
    </Box>
  )
}

