import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
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

  @ApiProperty({ description: '规则代码', enum: ['order_consume', 'first_order', 'daily_checkin', 'review', 'referral'] })
  @IsEnum(['order_consume', 'first_order', 'daily_checkin', 'review', 'referral'])
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

