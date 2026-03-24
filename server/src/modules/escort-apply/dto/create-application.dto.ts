import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  Length,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
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

  // ========== 新增字段（#27 陪诊员注册字段补齐）==========

  @ApiProperty({ description: '年龄（必填，可从身份证自动计算）' })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsInt({ message: '年龄必须为整数' })
  @Min(18, { message: '年龄不能小于18岁' })
  @Max(70, { message: '年龄不能大于70岁' })
  age: number;

  @ApiProperty({ description: '服务医院名称列表，支持自定义其他项', type: [String] })
  @IsArray({ message: '医院列表格式错误' })
  @ArrayMinSize(1, { message: '请至少选择一个服务医院' })
  @IsString({ each: true, message: '医院ID必须为字符串' })
  hospitals: string[];

  @ApiProperty({ description: '擅长科室列表，支持自定义其他项', type: [String] })
  @IsArray({ message: '科室列表格式错误' })
  @ArrayMinSize(1, { message: '请至少选择一个擅长科室' })
  @IsString({ each: true, message: '科室名称必须为字符串' })
  departments: string[];

  @ApiProperty({ description: '擅长病种（文本描述）' })
  @IsString()
  @IsNotEmpty({ message: '擅长病种不能为空' })
  @Length(0, 500, { message: '擅长病种描述不能超过500个字符' })
  specialties: string;

  @ApiProperty({ description: '既往产品线与产品名称组合文本，例如：设备：超声刀' })
  @IsString()
  @IsNotEmpty({ message: '既往产品线不能为空' })
  @Length(0, 500, { message: '服务领域描述不能超过500个字符' })
  serviceAreas: string;

  @ApiProperty({ description: '外语能力（如：英语/日语/韩语等）' })
  @IsString()
  @IsNotEmpty({ message: '外语能力不能为空' })
  @Length(0, 100, { message: '外语能力描述不能超过100个字符' })
  foreignLanguage: string;

  @ApiProperty({ description: '学历（高中/大专/本科/硕士/博士）' })
  @IsString()
  @IsNotEmpty({ message: '学历不能为空' })
  education: string;
}
