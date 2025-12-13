import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '性别', example: 'male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({ description: '出生日期', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birthday?: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsString()
  @IsOptional()
  idCard?: string;

  @ApiProperty({ description: '与用户关系', example: '本人' })
  @IsString()
  @IsNotEmpty()
  relation: string;

  @ApiPropertyOptional({ description: '是否默认' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) { }

