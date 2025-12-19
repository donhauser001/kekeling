import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  Length,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export class CreateEscortApplicationDto {
  @ApiProperty({ description: '真实姓名' })
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  @Length(2, 20, { message: '姓名长度应为2-20个字符' })
  name: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone: string;

  @ApiProperty({ description: '身份证号' })
  @IsString()
  @IsNotEmpty({ message: '身份证号不能为空' })
  @Matches(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, {
    message: '请输入正确的身份证号',
  })
  idCard: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: '性别', enum: Gender })
  @IsEnum(Gender, { message: '性别参数错误' })
  gender: Gender;

  @ApiPropertyOptional({ description: '紧急联系人姓名' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: '紧急联系人电话' })
  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的紧急联系人电话' })
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: '邀请码' })
  @IsString()
  @IsOptional()
  inviteCode?: string;
}
