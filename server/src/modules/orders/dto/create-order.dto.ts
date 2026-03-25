import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '服务ID' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiPropertyOptional({ description: '医院ID（医院库选择时传）' })
  @IsString()
  @IsOptional()
  hospitalId?: string;

  @ApiPropertyOptional({ description: '医院模式：catalog=医院库，custom=自填医院' })
  @IsString()
  @IsOptional()
  hospitalMode?: string;

  @ApiPropertyOptional({ description: '自填医院名称' })
  @IsString()
  @IsOptional()
  hospitalName?: string;

  @ApiPropertyOptional({ description: '自填医院所在省' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '自填医院所在市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '就诊人ID' })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({ description: '预约日期', example: '2024-12-20' })
  @IsString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ description: '预约时间', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @ApiPropertyOptional({ description: '科室名称' })
  @IsString()
  @IsOptional()
  departmentName?: string;

  @ApiPropertyOptional({ description: '医生名称（自填医生时传）' })
  @IsString()
  @IsOptional()
  doctorName?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '优惠券ID' })
  @IsString()
  @IsOptional()
  couponId?: string;

  @ApiPropertyOptional({ description: '活动ID' })
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: '使用积分数' })
  @IsOptional()
  pointsToUse?: number;

  @ApiPropertyOptional({ description: '指定陪诊员ID（如果指定，订单将直接分配给该陪诊员）' })
  @IsString()
  @IsOptional()
  escortId?: string;
}
