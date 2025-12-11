import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========== 用户端 DTO ==========

export class PurchaseMembershipDto {
  @ApiProperty({ description: '套餐ID' })
  @IsString()
  planId: string;
}

export class RefundMembershipOrderDto {
  @ApiPropertyOptional({ description: '退款原因' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// ========== 管理端 DTO ==========

export class CreateMembershipLevelDto {
  @ApiProperty({ description: '等级名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '等级代码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '等级图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '等级颜色' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ description: '折扣率（0-100，90表示9折）' })
  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;

  @ApiProperty({ description: '超时费减免比例（0-100）' })
  @IsInt()
  @Min(0)
  @Max(100)
  overtimeFeeWaiver: number;

  @ApiProperty({ description: '权益详情（JSON）' })
  benefits: any;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateMembershipLevelDto {
  @ApiPropertyOptional({ description: '等级名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '等级图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '等级颜色' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: '折扣率（0-100）' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: '超时费减免比例（0-100）' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  overtimeFeeWaiver?: number;

  @ApiPropertyOptional({ description: '权益详情（JSON）' })
  @IsOptional()
  benefits?: any;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class CreateMembershipPlanDto {
  @ApiProperty({ description: '等级ID' })
  @IsString()
  levelId: string;

  @ApiProperty({ description: '套餐名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '套餐代码' })
  @IsString()
  code: string;

  @ApiProperty({ description: '价格' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: '原价' })
  @Type(() => Number)
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ description: '有效天数' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: '续费赠送天数' })
  @IsInt()
  @IsOptional()
  renewalBonus?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '卖点列表' })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '是否推荐' })
  @IsBoolean()
  @IsOptional()
  recommended?: boolean;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateMembershipPlanDto {
  @ApiPropertyOptional({ description: '套餐名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '价格' })
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '原价' })
  @Type(() => Number)
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({ description: '有效天数' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: '续费赠送天数' })
  @IsInt()
  @IsOptional()
  renewalBonus?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '卖点列表' })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '是否推荐' })
  @IsBoolean()
  @IsOptional()
  recommended?: boolean;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class CreateConsumeUpgradeRuleDto {
  @ApiProperty({ description: '等级ID' })
  @IsString()
  levelId: string;

  @ApiProperty({ description: '累计消费门槛' })
  @Type(() => Number)
  threshold: number;

  @ApiProperty({ description: '赠送会员天数' })
  @IsInt()
  @Min(1)
  grantDays: number;

  @ApiPropertyOptional({ description: '统计周期' })
  @IsEnum(['forever', 'yearly', 'monthly'])
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class GrantMembershipDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '等级ID' })
  @IsString()
  levelId: string;

  @ApiPropertyOptional({ description: '套餐ID' })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiProperty({ description: '会员天数' })
  @IsInt()
  @Min(1)
  days: number;

  @ApiPropertyOptional({ description: '来源' })
  @IsEnum(['purchase', 'consume', 'gift', 'compensate'])
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

