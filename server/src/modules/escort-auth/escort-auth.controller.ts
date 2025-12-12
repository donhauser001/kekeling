import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { EscortAuthService } from './escort-auth.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsLoginDto } from './dto/sms-login.dto';
import { ApiResponse as ApiRes } from '../../common/response/api-response';

@ApiTags('陪诊员认证')
@Controller('escort-auth')
export class EscortAuthController {
  constructor(private readonly escortAuthService: EscortAuthService) { }

  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送短信验证码',
    description: '向陪诊员手机号发送登录验证码（60秒内只能发送一次）',
  })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '手机号不存在或频率限制' })
  async sendSmsCode(@Body() dto: SendSmsDto, @Req() req: Request) {
    // 获取客户端 IP（支持反向代理）
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const result = await this.escortAuthService.sendSmsCode(dto.phone, clientIp);
    return ApiRes.success(result);
  }

  @Post('sms/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '短信验证码登录',
    description: '使用手机号和验证码登录，获取 escortToken',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        code: { type: 'number', example: 0 },
        data: {
          type: 'object',
          properties: {
            escortToken: { type: 'string', description: '陪诊员 Token' },
            escortProfile: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                phone: { type: 'string' },
                avatar: { type: 'string' },
                status: { type: 'string' },
                workStatus: { type: 'string' },
                level: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                rating: { type: 'number' },
                orderCount: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '手机号不存在' })
  @ApiResponse({ status: 401, description: '验证码错误或已过期' })
  @ApiResponse({ status: 403, description: '陪诊员账号未激活或被禁用' })
  async smsLogin(@Body() dto: SmsLoginDto) {
    const result = await this.escortAuthService.smsLogin(dto.phone, dto.code);
    return ApiRes.success(result);
  }
}

