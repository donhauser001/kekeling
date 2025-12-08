import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BindPhoneDto {
  @ApiProperty({ description: '手机号授权 code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

