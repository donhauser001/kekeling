import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '服务ID' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: '医院ID' })
  @IsString()
  @IsNotEmpty()
  hospitalId: string;

  @ApiProperty({ description: '就诊人ID' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

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

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

