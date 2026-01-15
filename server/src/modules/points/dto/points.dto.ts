import { IsString, IsOptional, IsNumber, IsEnum, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========== 用户端 DTO ==========

export class CheckInDto {
  @ApiPropertyOptional({ description: '签到日期（可选，默认今天）' })
  @IsOptional()
  checkInDate?: string;
}

// ========== 管理端 DTO ==========

export class CreatePointRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '规则代码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '固定积分值' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: '按比例（如消费1元=1分）' })
  @Type(() => Number)
  @IsOptional()
  pointsRate?: number;

  @ApiPropertyOptional({ description: '每日获取上限' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyLimit?: number;

  @ApiPropertyOptional({ description: '总获取上限' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalLimit?: number;

  @ApiPropertyOptional({ description: '生效条件（JSON）' })
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdatePointRuleDto {
  @ApiPropertyOptional({ description: '规则名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '固定积分值' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: '按比例' })
  @Type(() => Number)
  @IsOptional()
  pointsRate?: number;

  @ApiPropertyOptional({ description: '每日获取上限' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyLimit?: number;

  @ApiPropertyOptional({ description: '总获取上限' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalLimit?: number;

  @ApiPropertyOptional({ description: '生效条件（JSON）' })
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class AdjustPointsDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '积分变更（正数增加，负数减少）' })
  @IsNumber()
  points: number;

  @ApiProperty({ description: '变更原因' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: '关联ID' })
  @IsString()
  @IsOptional()
  sourceId?: string;
}

// ========== 积分任务 DTO ==========

/**
 * 任务状态枚举
 */
export type PointsTaskStatus = 'pending' | 'completed' | 'claimed';

/**
 * 积分任务项
 */
export class PointsTaskItem {
  @ApiProperty({ description: '任务代码' })
  code: string;

  @ApiProperty({ description: '任务名称' })
  name: string;

  @ApiProperty({ description: '任务描述' })
  description: string;

  @ApiProperty({ description: '任务图标' })
  icon: string;

  @ApiProperty({ description: '奖励积分' })
  points: number;

  @ApiProperty({ description: '任务状态', enum: ['pending', 'completed', 'claimed'] })
  status: PointsTaskStatus;

  @ApiPropertyOptional({ description: '任务进度（如邀请好友进度）' })
  progress?: number;

  @ApiPropertyOptional({ description: '任务目标' })
  target?: number;
}

/**
 * 领取任务奖励 DTO
 */
export class ClaimTaskDto {
  @ApiProperty({ description: '任务代码', enum: ['daily_checkin', 'complete_profile', 'first_order', 'referral'] })
  @IsString()
  taskCode: string;
}

// ========== 积分设置 DTO ==========

/**
 * 签到设置
 */
export class CheckinSettingsDto {
  @ApiProperty({ description: '每日签到积分' })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiPropertyOptional({ description: '连续签到每天额外奖励' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  consecutiveBonus?: number;

  @ApiPropertyOptional({ description: '每日上限' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyLimit?: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}

/**
 * 完善个人信息奖励设置
 */
export class CompleteProfileSettingsDto {
  @ApiProperty({ description: '奖励积分' })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}

/**
 * 首单奖励设置
 */
export class FirstOrderSettingsDto {
  @ApiPropertyOptional({ description: '固定积分奖励' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: '按订单金额比例（如0.05表示5%）' })
  @Type(() => Number)
  @IsOptional()
  pointsRate?: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}

/**
 * 订单消费积分设置
 */
export class OrderCompleteSettingsDto {
  @ApiProperty({ description: '按订单金额比例（如0.01表示1%）' })
  @Type(() => Number)
  pointsRate: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}

/**
 * 积分设置统一更新 DTO
 */
export class UpdatePointsSettingsDto {
  @ApiPropertyOptional({ description: '签到设置' })
  @IsOptional()
  @Type(() => CheckinSettingsDto)
  checkin?: CheckinSettingsDto;

  @ApiPropertyOptional({ description: '完善个人信息奖励' })
  @IsOptional()
  @Type(() => CompleteProfileSettingsDto)
  completeProfile?: CompleteProfileSettingsDto;

  @ApiPropertyOptional({ description: '首单奖励设置' })
  @IsOptional()
  @Type(() => FirstOrderSettingsDto)
  firstOrder?: FirstOrderSettingsDto;

  @ApiPropertyOptional({ description: '订单消费积分设置' })
  @IsOptional()
  @Type(() => OrderCompleteSettingsDto)
  orderComplete?: OrderCompleteSettingsDto;
}
