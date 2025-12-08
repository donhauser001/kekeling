import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建预支付订单
   */
  @Post('prepay')
  @UseGuards(JwtAuthGuard)
  async createPrepay(
    @Body() body: { orderId: string },
    @CurrentUser() user: { id: string; openid: string },
  ) {
    const result = await this.paymentService.createPrepay({
      orderId: body.orderId,
      openid: user.openid,
    });
    return ApiResponse.success(result);
  }

  /**
   * 微信支付回调
   */
  @Post('notify')
  async handleNotify(@Req() req: RawBodyRequest<Request>) {
    const xmlData = req.body?.toString() || '';
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
   * 模拟支付成功（仅用于测试）
   */
  @Post('mock-pay')
  async mockPay(@Body() body: { orderId: string }) {
    // 生产环境应该禁用此接口
    if (process.env.NODE_ENV === 'production') {
      return ApiResponse.error('生产环境不支持模拟支付');
    }

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

