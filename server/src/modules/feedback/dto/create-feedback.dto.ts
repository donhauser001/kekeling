import { IsString, IsOptional, IsArray, MinLength, MaxLength, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFeedbackDto {
  @ApiProperty({
    description: '反馈类型',
    enum: ['suggestion', 'bug', 'service', 'experience', 'other'],
    example: 'suggestion',
  })
  @IsString()
  @IsIn(['suggestion', 'bug', 'service', 'experience', 'other'])
  type: string

  @ApiProperty({
    description: '反馈内容',
    example: '希望能增加预约提醒功能',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10, { message: '反馈内容不能少于10个字' })
  @MaxLength(2000, { message: '反馈内容不能超过2000个字' })
  content: string

  @ApiPropertyOptional({
    description: '联系方式（手机号或微信号）',
    example: '13800138000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact?: string

  @ApiPropertyOptional({
    description: '反馈截图',
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]
}

