import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========== 用户端 DTO ==========

export class InvitePatientDto {
  @ApiProperty({ description: '就诊人姓名' })
  @IsString()
  name: string;

  @ApiProperty({ description: '就诊人手机号' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: '就诊人性别' })
  @IsEnum(['male', 'female'])
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: '就诊人生日' })
  @IsOptional()
  birthday?: string;
}

// ========== 管理端 DTO ==========

export class CreateReferralRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '邀请类型', enum: ['user', 'patient'] })
  @IsEnum(['user', 'patient'])
  type: string;

  @ApiPropertyOptional({ description: '邀请人优惠券ID' })
  @IsString()
  @IsOptional()
  inviterCouponId?: string;

  @ApiPropertyOptional({ description: '邀请人积分' })
  @IsNumber()
  @IsOptional()
  inviterPoints?: number;

  @ApiPropertyOptional({ description: '被邀请人优惠券ID' })
  @IsString()
  @IsOptional()
  inviteeCouponId?: string;

  @ApiPropertyOptional({ description: '被邀请人积分' })
  @IsNumber()
  @IsOptional()
  inviteePoints?: number;

  @ApiPropertyOptional({ description: '是否需要首单', default: true })
  @IsBoolean()
  @IsOptional()
  requireFirstOrder?: boolean;

  @ApiPropertyOptional({ description: '每日邀请上限' })
  @IsNumber()
  @IsOptional()
  dailyLimit?: number;

  @ApiPropertyOptional({ description: '累计邀请上限' })
  @IsNumber()
  @IsOptional()
  totalLimit?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateReferralRuleDto {
  @ApiPropertyOptional({ description: '规则名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '邀请人优惠券ID' })
  @IsString()
  @IsOptional()
  inviterCouponId?: string;

  @ApiPropertyOptional({ description: '邀请人积分' })
  @IsNumber()
  @IsOptional()
  inviterPoints?: number;

  @ApiPropertyOptional({ description: '被邀请人优惠券ID' })
  @IsString()
  @IsOptional()
  inviteeCouponId?: string;

  @ApiPropertyOptional({ description: '被邀请人积分' })
  @IsNumber()
  @IsOptional()
  inviteePoints?: number;

  @ApiPropertyOptional({ description: '是否需要首单' })
  @IsBoolean()
  @IsOptional()
  requireFirstOrder?: boolean;

  @ApiPropertyOptional({ description: '每日邀请上限' })
  @IsNumber()
  @IsOptional()
  dailyLimit?: number;

  @ApiPropertyOptional({ description: '累计邀请上限' })
  @IsNumber()
  @IsOptional()
  totalLimit?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

