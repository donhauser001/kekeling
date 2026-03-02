import { Controller, Get, Put, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { SmsService } from '../escort-auth/sms.service';
import { ApiResponse } from '../../common/response/api-response';
import { type OrderSettings, type ThemeSettings, type BannerPosition, type BannerAreaConfig, type HomePageSettings, type SmsSettings, type MiniappSettings, type WechatPaySettings, type AlipaySettings, type MarketingSettings } from './dto/config.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminPublic } from '../auth/decorators/public-admin.decorator';

@ApiTags('系统配置')
@UseGuards(AdminGuard)
@Controller('config')
export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) { }

  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  async getAll() {
    const data = await this.configService.getAll();
    return ApiResponse.success(data);
  }

  @Put()
  @ApiOperation({ summary: '批量设置配置' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        configs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: {},
              remark: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async setMultiple(@Body() body: { configs: { key: string; value: any; remark?: string }[] }) {
    await this.configService.setMultiple(body.configs);
    return ApiResponse.success(null, '保存成功');
  }

  // ============================================
  // 订单设置专用接口（必须在通配路由之前）
  // ============================================

  @Get('order/settings')
  @ApiOperation({ summary: '获取订单设置' })
  async getOrderSettings() {
    const data = await this.configService.getOrderSettings();
    return ApiResponse.success(data);
  }

  @Put('order/settings')
  @ApiOperation({ summary: '更新订单设置' })
  async updateOrderSettings(@Body() body: Partial<OrderSettings>) {
    const data = await this.configService.updateOrderSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 主题设置专用接口
  // ============================================

  @Get('theme/settings')
  @AdminPublic()
  @ApiOperation({ summary: '获取主题设置' })
  async getThemeSettings() {
    const data = await this.configService.getThemeSettings();
    return ApiResponse.success(data);
  }

  @Get('theme')
  @AdminPublic()
  @ApiOperation({ summary: '获取主题设置（兼容旧路径）' })
  async getThemeLegacy() {
    const data = await this.configService.getThemeSettings();
    return ApiResponse.success(data);
  }

  @Put('theme/settings')
  @ApiOperation({ summary: '更新主题设置' })
  async updateThemeSettings(@Body() body: Partial<ThemeSettings>) {
    const data = await this.configService.updateThemeSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 轮播图设置专用接口
  // ============================================

  @Get('banner/settings')
  @ApiOperation({ summary: '获取所有轮播图区域设置' })
  async getBannerSettings() {
    const data = await this.configService.getBannerSettings();
    return ApiResponse.success(data);
  }

  @Get('banner/settings/:position')
  @ApiOperation({ summary: '获取指定区域轮播图设置' })
  @ApiParam({
    name: 'position',
    description: '轮播图位置：home, services, profile, service-detail, cases',
  })
  async getBannerAreaConfig(@Param('position') position: BannerPosition) {
    const data = await this.configService.getBannerAreaConfig(position);
    return ApiResponse.success(data);
  }

  @Put('banner/settings/:position')
  @ApiOperation({ summary: '更新指定区域轮播图设置' })
  @ApiParam({
    name: 'position',
    description: '轮播图位置：home, services, profile, service-detail, cases',
  })
  async updateBannerAreaConfig(
    @Param('position') position: BannerPosition,
    @Body() body: Partial<Pick<BannerAreaConfig, 'enabled' | 'width' | 'height'>>,
  ) {
    const data = await this.configService.updateBannerAreaConfig(position, body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 首页设置专用接口
  // ============================================

  @Get('homepage/settings')
  @ApiOperation({ summary: '获取首页设置' })
  async getHomePageSettings() {
    const data = await this.configService.getHomePageSettings();
    return ApiResponse.success(data);
  }

  @Put('homepage/settings')
  @ApiOperation({ summary: '更新首页设置' })
  async updateHomePageSettings(@Body() body: Partial<HomePageSettings>) {
    const data = await this.configService.updateHomePageSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 短信设置专用接口
  // ============================================

  @Get('sms/settings')
  @ApiOperation({ summary: '获取短信设置' })
  async getSmsSettings() {
    const data = await this.configService.getSmsSettings();
    // 敏感信息脱敏（AccessKeySecret 只显示部分）
    const maskedData = {
      ...data,
      accessKeySecret: data.accessKeySecret
        ? `${data.accessKeySecret.slice(0, 4)}****${data.accessKeySecret.slice(-4)}`
        : '',
    };
    return ApiResponse.success(maskedData);
  }

  @Put('sms/settings')
  @ApiOperation({ summary: '更新短信设置' })
  async updateSmsSettings(@Body() body: Partial<SmsSettings>) {
    const data = await this.configService.updateSmsSettings(body);
    // 敏感信息脱敏
    const maskedData = {
      ...data,
      accessKeySecret: data.accessKeySecret
        ? `${data.accessKeySecret.slice(0, 4)}****${data.accessKeySecret.slice(-4)}`
        : '',
    };
    return ApiResponse.success(maskedData, '保存成功');
  }

  @Post('sms/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '测试短信发送' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: '测试手机号' },
      },
      required: ['phone'],
    },
  })
  async testSmsSend(@Body() body: { phone: string }) {
    const { phone } = body;

    // 验证手机号格式
    if (!/^1\d{10}$/.test(phone)) {
      return ApiResponse.error('请输入正确的手机号');
    }

    // 生成测试验证码
    const code = Math.random().toString().slice(2, 8);

    try {
      // 发送短信
      const success = await this.smsService.sendVerificationCode(phone, code);

      if (success) {
        // 获取当前配置判断是否开发模式
        const settings = await this.configService.getSmsSettings();
        return ApiResponse.success(
          {
            success: true,
            devMode: settings.devMode,
            code: settings.devMode ? settings.devCode : undefined,
          },
          settings.devMode ? `开发模式，验证码为: ${settings.devCode}` : '测试短信已发送'
        );
      } else {
        return ApiResponse.error('短信发送失败，请检查配置');
      }
    } catch (error) {
      // 捕获异常，返回具体错误信息
      const errorMessage = error instanceof Error ? error.message : '短信发送失败';
      return ApiResponse.error(errorMessage);
    }
  }

  // ============================================
  // 小程序设置专用接口
  // ============================================

  @Get('miniapp/settings')
  @ApiOperation({ summary: '获取小程序设置' })
  async getMiniappSettings() {
    const data = await this.configService.getMiniappSettings();
    return ApiResponse.success(data);
  }

  @Put('miniapp/settings')
  @ApiOperation({ summary: '更新小程序设置' })
  async updateMiniappSettings(@Body() body: Partial<MiniappSettings>) {
    const data = await this.configService.updateMiniappSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 支付配置专用接口
  // ============================================

  @Get('payment/wechat')
  @ApiOperation({ summary: '获取微信支付配置' })
  async getWechatPaySettings() {
    const data = await this.configService.getWechatPaySettings();
    // 敏感信息脱敏
    const maskedData = {
      ...data,
      apiKey: data.apiKey ? `${data.apiKey.slice(0, 4)}****${data.apiKey.slice(-4)}` : '',
      apiV3Key: data.apiV3Key ? `${data.apiV3Key.slice(0, 4)}****${data.apiV3Key.slice(-4)}` : '',
      privateKey: data.privateKey ? '******（已配置）' : '',
    };
    return ApiResponse.success(maskedData);
  }

  @Put('payment/wechat')
  @ApiOperation({ summary: '更新微信支付配置' })
  async updateWechatPaySettings(@Body() body: Partial<WechatPaySettings>) {
    const data = await this.configService.updateWechatPaySettings(body);
    // 敏感信息脱敏
    const maskedData = {
      ...data,
      apiKey: data.apiKey ? `${data.apiKey.slice(0, 4)}****${data.apiKey.slice(-4)}` : '',
      apiV3Key: data.apiV3Key ? `${data.apiV3Key.slice(0, 4)}****${data.apiV3Key.slice(-4)}` : '',
      privateKey: data.privateKey ? '******（已配置）' : '',
    };
    return ApiResponse.success(maskedData, '保存成功');
  }

  @Get('payment/alipay')
  @ApiOperation({ summary: '获取支付宝配置' })
  async getAlipaySettings() {
    const data = await this.configService.getAlipaySettings();
    // 敏感信息脱敏
    const maskedData = {
      ...data,
      privateKey: data.privateKey ? '******（已配置）' : '',
      alipayPublicKey: data.alipayPublicKey ? '******（已配置）' : '',
    };
    return ApiResponse.success(maskedData);
  }

  @Put('payment/alipay')
  @ApiOperation({ summary: '更新支付宝配置' })
  async updateAlipaySettings(@Body() body: Partial<AlipaySettings>) {
    const data = await this.configService.updateAlipaySettings(body);
    // 敏感信息脱敏
    const maskedData = {
      ...data,
      privateKey: data.privateKey ? '******（已配置）' : '',
      alipayPublicKey: data.alipayPublicKey ? '******（已配置）' : '',
    };
    return ApiResponse.success(maskedData, '保存成功');
  }

  @Get('payment/settings')
  @ApiOperation({ summary: '获取完整支付配置' })
  async getPaymentSettings() {
    const data = await this.configService.getPaymentSettings();
    // 敏感信息脱敏
    const maskedData = {
      wechat: {
        ...data.wechat,
        apiKey: data.wechat.apiKey ? `${data.wechat.apiKey.slice(0, 4)}****${data.wechat.apiKey.slice(-4)}` : '',
        apiV3Key: data.wechat.apiV3Key ? `${data.wechat.apiV3Key.slice(0, 4)}****${data.wechat.apiV3Key.slice(-4)}` : '',
        privateKey: data.wechat.privateKey ? '******（已配置）' : '',
      },
      alipay: {
        ...data.alipay,
        privateKey: data.alipay.privateKey ? '******（已配置）' : '',
        alipayPublicKey: data.alipay.alipayPublicKey ? '******（已配置）' : '',
      },
    };
    return ApiResponse.success(maskedData);
  }

  // ============================================
  // 营销设置专用接口
  // ============================================

  @Get('marketing/settings')
  @ApiOperation({ summary: '获取营销设置' })
  async getMarketingSettings() {
    const data = await this.configService.getMarketingSettings();
    return ApiResponse.success(data);
  }

  @Put('marketing/settings')
  @ApiOperation({ summary: '更新营销设置' })
  async updateMarketingSettings(@Body() body: Partial<MarketingSettings>) {
    const data = await this.configService.updateMarketingSettings(body);
    return ApiResponse.success(data, '保存成功');
  }

  // ============================================
  // 通配路由（必须放在最后）
  // ============================================

  @Get(':key')
  @ApiOperation({ summary: '获取单个配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  async get(@Param('key') key: string) {
    const data = await this.configService.get(key);
    return ApiResponse.success(data);
  }

  @Put(':key')
  @ApiOperation({ summary: '设置单个配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { description: '配置值' },
        remark: { type: 'string', description: '备注' },
      },
    },
  })
  async set(
    @Param('key') key: string,
    @Body() body: { value: any; remark?: string },
  ) {
    await this.configService.set(key, body.value, body.remark);
    return ApiResponse.success(null, '保存成功');
  }

  @Delete(':key')
  @ApiOperation({ summary: '删除配置' })
  @ApiParam({ name: 'key', description: '配置键' })
  async delete(@Param('key') key: string) {
    await this.configService.delete(key);
    return ApiResponse.success(null, '删除成功');
  }
}
