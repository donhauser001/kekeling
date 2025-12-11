import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录 code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: '邀请码（新用户注册时使用）' })
  @IsString()
  @IsOptional()
  inviteCode?: string;
}

