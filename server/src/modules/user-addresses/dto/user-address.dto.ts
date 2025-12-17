import { IsString, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserAddressDto {
  @ApiProperty({ description: '收货人姓名' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone: string;

  @ApiProperty({ description: '省' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  province: string;

  @ApiProperty({ description: '市' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  city: string;

  @ApiProperty({ description: '区/县' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  district: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '标签（家、公司、学校等）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tag?: string;

  @ApiPropertyOptional({ description: '是否设为默认地址', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateUserAddressDto {
  @ApiPropertyOptional({ description: '收货人姓名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone?: string;

  @ApiPropertyOptional({ description: '省' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  province?: string;

  @ApiPropertyOptional({ description: '市' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ description: '区/县' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  district?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '标签（家、公司、学校等）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tag?: string;

  @ApiPropertyOptional({ description: '是否设为默认地址' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
