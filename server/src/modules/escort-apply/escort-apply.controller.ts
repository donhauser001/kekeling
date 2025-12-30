import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { EscortApplyService } from './escort-apply.service';
import { CreateEscortApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto, QueryApplicationsDto } from './dto/review-application.dto';
import { SendVerifyCodeDto, VerifySmsCodeDto } from './dto/sms-verify.dto';
import { ApiResponse as ApiRes } from '../../common/response/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('陪诊员申请')
@Controller('escort-apply')
export class EscortApplyController {
  constructor(private readonly escortApplyService: EscortApplyService) { }

  // ============================================================================
  // 短信验证接口
  // ============================================================================

  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送短信验证码',
    description: '申请成为陪诊员前的手机号验证（60秒内只能发送一次）',
  })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '频率限制或参数错误' })
  async sendVerifyCode(@Body() dto: SendVerifyCodeDto, @Req() req: Request) {
    // 获取客户端 IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const result = await this.escortApplyService.sendVerifyCode(dto.phone, clientIp);
    return ApiRes.success(result);
  }

  @Post('sms/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '验证短信验证码',
    description: '验证手机号，验证成功后10分钟内可提交申请',
  })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 400, description: '验证码错误或已过期' })
  async verifySmsCode(@Body() dto: VerifySmsCodeDto) {
    const result = await this.escortApplyService.verifySmsCode(dto.phone, dto.code);
    return ApiRes.success(result);
  }

  // ============================================================================
  // 申请接口
  // ============================================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '提交陪诊员申请' })
  @ApiResponse({ status: 200, description: '申请提交成功' })
  @ApiResponse({ status: 400, description: '参数错误或邀请码无效' })
  @ApiResponse({ status: 409, description: '重复申请' })
  async createApplication(
    @Body() dto: CreateEscortApplicationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const result = await this.escortApplyService.createApplication(userId, dto);
    return ApiRes.success(result);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询我的申请状态' })
  @ApiResponse({ status: 200, description: '返回申请状态' })
  async getMyApplication(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const result = await this.escortApplyService.getMyApplication(userId);
    return ApiRes.success(result);
  }

  @Get('validate-invite/:code')
  @ApiOperation({ summary: '验证邀请码' })
  @ApiResponse({ status: 200, description: '返回邀请码验证结果' })
  async validateInviteCode(@Param('code') code: string) {
    const result = await this.escortApplyService.validateInviteCode(code);
    return ApiRes.success(result);
  }

  @Get('check-phone/:phone')
  @ApiOperation({ summary: '检查手机号是否可用' })
  @ApiResponse({ status: 200, description: '返回手机号可用性' })
  async checkPhoneAvailable(@Param('phone') phone: string) {
    const result = await this.escortApplyService.checkPhoneAvailable(phone);
    return ApiRes.success(result);
  }

  @Get('check-idcard/:idCard')
  @ApiOperation({ summary: '检查身份证号是否可用' })
  @ApiResponse({ status: 200, description: '返回身份证号可用性' })
  async checkIdCardAvailable(@Param('idCard') idCard: string) {
    const result = await this.escortApplyService.checkIdCardAvailable(idCard);
    return ApiRes.success(result);
  }

  @Post('public')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '公开提交陪诊员申请（无需登录）' })
  @ApiResponse({ status: 200, description: '申请提交成功' })
  @ApiResponse({ status: 400, description: '参数错误或手机号未验证' })
  @ApiResponse({ status: 409, description: '重复申请' })
  async createPublicApplication(@Body() dto: CreateEscortApplicationDto) {
    const result = await this.escortApplyService.createPublicApplication(dto);
    return ApiRes.success(result);
  }
}

@ApiTags('陪诊员申请管理')
@Controller('admin/escort-apply')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class EscortApplyAdminController {
  constructor(private readonly escortApplyService: EscortApplyService) { }

  @Get()
  @ApiOperation({ summary: '获取申请列表' })
  @ApiResponse({ status: 200, description: '返回申请列表' })
  async getApplications(@Query() query: QueryApplicationsDto) {
    const result = await this.escortApplyService.getApplications(query);
    return ApiRes.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取申请详情' })
  @ApiResponse({ status: 200, description: '返回申请详情' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async getApplicationDetail(@Param('id') id: string) {
    const result = await this.escortApplyService.getApplicationDetail(id);
    return ApiRes.success(result);
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '审核申请' })
  @ApiResponse({ status: 200, description: '审核完成' })
  @ApiResponse({ status: 400, description: '审核失败' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async reviewApplication(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || req.user?.sub || 'system';
    const result = await this.escortApplyService.reviewApplication(
      id,
      dto.action,
      reviewerId,
      dto.rejectReason,
    );
    return ApiRes.success(result);
  }
}
