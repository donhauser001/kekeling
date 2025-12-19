import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService as AppConfigService } from '../config/config.service';
import type { SmsSettings } from '../config/dto/config.dto';

/**
 * 阿里云短信服务
 *
 * 配置来源：系统配置（数据库）
 * - sms.enabled: 是否启用短信服务
 * - sms.access_key_id: 阿里云 AccessKey ID
 * - sms.access_key_secret: 阿里云 AccessKey Secret
 * - sms.sign_name: 短信签名（如：科科灵）
 * - sms.template_code: 短信模板编码（如：SMS_123456789）
 * - sms.dev_mode: 是否开发模式（true 时不调真实接口）
 * - sms.dev_code: 开发模式下的固定验证码
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  // 阿里云 API 配置
  private readonly endpoint = 'dysmsapi.aliyuncs.com';
  private readonly apiVersion = '2017-05-25';

  constructor(private appConfigService: AppConfigService) { }

  /**
   * 获取短信配置
   */
  private async getSmsConfig(): Promise<SmsSettings> {
    return this.appConfigService.getSmsSettings();
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否发送成功
   */
  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    const config = await this.getSmsConfig();

    // 检查是否启用短信服务
    if (!config.enabled) {
      this.logger.warn(`[短信服务未启用] 验证码: ${phone} -> ${code}`);
      return true; // 未启用时直接返回成功（方便开发测试）
    }

    // 开发模式：不调用真实接口
    if (config.devMode) {
      this.logger.warn(`[开发模式] 短信验证码: ${phone} -> ${code}`);
      return true;
    }

    const { accessKeyId, accessKeySecret, signName, templateCode } = config;

    if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
      this.logger.error('阿里云短信配置不完整');
      throw new BadRequestException('短信服务配置不完整，请联系管理员');
    }

    try {
      // 构建请求参数
      const params: Record<string, string> = {
        AccessKeyId: accessKeyId,
        Action: 'SendSms',
        Format: 'JSON',
        PhoneNumbers: phone,
        SignName: signName,
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: this.generateNonce(),
        SignatureVersion: '1.0',
        TemplateCode: templateCode,
        TemplateParam: JSON.stringify({ code }),
        Timestamp: new Date().toISOString().replace(/\.\d{3}/, ''),
        Version: this.apiVersion,
      };

      // 生成签名
      const signature = this.generateSignature(params, accessKeySecret);
      params.Signature = signature;

      // 发送请求
      const queryString = Object.keys(params)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

      const url = `https://${this.endpoint}/?${queryString}`;

      const response = await fetch(url, { method: 'GET' });
      const result = await response.json();

      if (result.Code === 'OK') {
        this.logger.log(`短信发送成功: ${phone}`);
        return true;
      } else {
        this.logger.error(`短信发送失败: ${result.Code} - ${result.Message}`);
        throw new BadRequestException(this.mapAliyunError(result.Code));
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('短信发送异常', error);
      throw new BadRequestException('短信发送失败，请稍后重试');
    }
  }

  /**
   * 验证验证码（开发模式下使用固定验证码）
   * @param inputCode 用户输入的验证码
   * @param expectedCode 期望的验证码（真实发送的）
   * @returns 是否匹配
   */
  async verifyCode(inputCode: string, expectedCode: string): Promise<boolean> {
    const config = await this.getSmsConfig();

    // 开发模式下使用固定验证码
    if (config.devMode) {
      return inputCode === config.devCode;
    }

    return inputCode === expectedCode;
  }

  /**
   * 生成随机字符串
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 生成阿里云 API 签名
   */
  private generateSignature(
    params: Record<string, string>,
    secret: string,
  ): string {
    // 1. 参数排序
    const sortedKeys = Object.keys(params).sort();

    // 2. 构建规范化请求字符串
    const canonicalizedQueryString = sortedKeys
      .map((k) => `${this.percentEncode(k)}=${this.percentEncode(params[k])}`)
      .join('&');

    // 3. 构建待签名字符串
    const stringToSign = `GET&${this.percentEncode('/')}&${this.percentEncode(canonicalizedQueryString)}`;

    // 4. 计算签名
    const hmac = crypto.createHmac('sha1', `${secret}&`);
    hmac.update(stringToSign);
    return hmac.digest('base64');
  }

  /**
   * URL 编码（符合阿里云规范）
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/\+/g, '%20')
      .replace(/\*/g, '%2A')
      .replace(/%7E/g, '~');
  }

  /**
   * 映射阿里云错误码
   */
  private mapAliyunError(code: string): string {
    const errorMap: Record<string, string> = {
      'isv.BUSINESS_LIMIT_CONTROL': '发送频率过高，请稍后再试',
      'isv.MOBILE_NUMBER_ILLEGAL': '手机号格式不正确',
      'isv.MOBILE_COUNT_OVER_LIMIT': '当日发送数量已达上限',
      'isv.TEMPLATE_MISSING_PARAMETERS': '短信模板参数错误',
      'isv.INVALID_PARAMETERS': '参数错误',
      'isv.AMOUNT_NOT_ENOUGH': '账户余额不足',
    };
    return errorMap[code] || '短信发送失败，请稍后重试';
  }
}
