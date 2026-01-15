import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  /**
   * 创建预支付订单
   */
  @Post('prepay')
  @UseGuards(JwtAuthGuard)
  async createPrepay(
    @Body() body: { orderId: string },
    @CurrentUser() currentUser: any,
  ) {
    // 调试日志：检查 currentUser 结构
    console.log('[Payment:prepay] currentUser 结构:', JSON.stringify({
      hasOpenid: !!currentUser?.openid,
      hasSub: !!currentUser?.sub,
      hasUserObj: !!currentUser?.user,
      userObjOpenid: currentUser?.user?.openid,
      keys: Object.keys(currentUser || {}),
    }));
    
    // openid 可能在顶层（payload spread）或 user 对象中
    const openid = currentUser?.openid || currentUser?.user?.openid;
    
    if (!openid) {
      console.error('[Payment:prepay] 用户 openid 缺失，无法发起支付', {
        userId: currentUser?.sub || currentUser?.user?.id,
      });
      throw new BadRequestException('用户未绑定微信，无法发起支付');
    }
    
    console.log('[Payment:prepay] 发起支付:', { orderId: body.orderId, openid: openid.substring(0, 10) + '...' });
    
    const result = await this.paymentService.createPrepay({
      orderId: body.orderId,
      openid,
    });
    return ApiResponse.success(result);
  }

  /**
   * 创建会员订单预支付
   */
  @Post('membership-prepay')
  @UseGuards(JwtAuthGuard)
  async createMembershipPrepay(
    @Body() body: { orderId: string },
    @CurrentUser() currentUser: any,
  ) {
    // openid 可能在顶层或 user 对象中
    const openid = currentUser?.openid || currentUser?.user?.openid;
    
    if (!openid) {
      console.error('[Payment:membership-prepay] 用户 openid 缺失，无法发起支付', {
        userId: currentUser?.sub || currentUser?.user?.id,
      });
      throw new BadRequestException('用户未绑定微信，无法发起支付');
    }
    
    console.log('[Payment:membership-prepay] 发起会员支付:', { orderId: body.orderId, openid: openid.substring(0, 10) + '...' });
    
    const result = await this.paymentService.createMembershipPrepay({
      orderId: body.orderId,
      openid,
    });
    return ApiResponse.success(result);
  }

  /**
   * 微信支付回调
   * 接收微信服务器发送的 XML 格式支付结果通知
   */
  @Post('notify')
  async handleNotify(@Req() req: Request) {
    // 通过自定义中间件读取的原始 XML 数据
    const xmlData = (req as any).rawXmlBody || '';
    
    console.log('[Payment:notify] 收到回调请求, 数据长度:', xmlData.length, ', 前100字符:', xmlData.substring(0, 100));
    
    const result = await this.paymentService.handlePaymentNotify(xmlData);

    // 返回微信要求的 XML 格式
    if (result.success) {
      return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
    } else {
      return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[' + result.message + ']]></return_msg></xml>';
    }
  }

  /**
   * 查询支付状态
   */
  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  async queryStatus(@Param('orderId') orderId: string) {
    const result = await this.paymentService.queryPaymentStatus(orderId);
    return ApiResponse.success(result);
  }

  /**
   * 模拟支付成功（仅用于开发/测试环境）
   *
   * ⚠️ 安全修复（P1-10）：
   * - 生产环境完全禁用
   * - 需要显式开启 ENABLE_MOCK_PAYMENT=true
   *
   * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-10
   */
  @Post('mock-pay')
  async mockPay(@Body() body: { orderId: string }) {
    // 安全修复：双重检查，生产环境完全禁用
    const isProduction = process.env.NODE_ENV === 'production';
    const isMockEnabled = process.env.ENABLE_MOCK_PAYMENT === 'true';

    if (isProduction) {
      return ApiResponse.error('生产环境禁止使用模拟支付', 403);
    }

    if (!isMockEnabled) {
      return ApiResponse.error(
        '模拟支付未启用。如需测试，请设置环境变量 ENABLE_MOCK_PAYMENT=true',
        403,
      );
    }

    console.warn(
      `[Payment] ⚠️ 警告：模拟支付被调用，orderId=${body.orderId}。仅限开发环境使用！`,
    );

    const result = await this.paymentService.mockPaymentSuccess(body.orderId);
    return ApiResponse.success(result);
  }

  /**
   * 申请退款
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async requestRefund(
    @Body() body: { orderId: string; reason: string },
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.paymentService.requestRefund(body.orderId, body.reason);
    return ApiResponse.success(result);
  }
}

