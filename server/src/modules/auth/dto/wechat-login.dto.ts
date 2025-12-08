import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录 code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

