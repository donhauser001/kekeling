import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
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

  @ApiProperty({ description: '年龄' })
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

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

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

