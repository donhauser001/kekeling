import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewApplicationDto {
  @ApiProperty({ description: '审核操作', enum: ReviewAction })
  @IsEnum(ReviewAction, { message: '审核操作参数错误' })
  action: ReviewAction;

  @ApiPropertyOptional({ description: '驳回原因（驳回时必填）' })
  @IsString()
  @IsOptional()
  rejectReason?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class QueryApplicationsDto {
  @ApiPropertyOptional({ description: '状态筛选' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '搜索关键词（姓名/手机号）' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  pageSize?: number;
}
