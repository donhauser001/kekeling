import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * 阿里云短信服务
 *
 * 环境变量:
 * - ALIYUN_ACCESS_KEY_ID: 阿里云 AccessKey ID
 * - ALIYUN_ACCESS_KEY_SECRET: 阿里云 AccessKey Secret
 * - ALIYUN_SMS_SIGN_NAME: 短信签名（如：可客灵）
 * - ALIYUN_SMS_TEMPLATE_CODE: 短信模板编码（如：SMS_123456789）
 * - SMS_DEV_MODE: 是否开发模式（true 时不调真实接口，验证码固定为 123456）
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  // 阿里云 API 配置
  private readonly endpoint = 'dysmsapi.aliyuncs.com';
  private readonly apiVersion = '2017-05-25';

  constructor(private configService: ConfigService) { }

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否发送成功
   */
  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    // 开发模式：不调用真实接口
    const devMode = this.configService.get('SMS_DEV_MODE') === 'true';
    if (devMode) {
      this.logger.warn(`[开发模式] 短信验证码: ${phone} -> ${code}`);
      return true;
    }

    const accessKeyId = this.configService.get('ALIYUN_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get('ALIYUN_ACCESS_KEY_SECRET');
    const signName = this.configService.get('ALIYUN_SMS_SIGN_NAME');
    const templateCode = this.configService.get('ALIYUN_SMS_TEMPLATE_CODE');

    if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
      this.logger.error('阿里云短信配置不完整');
      throw new BadRequestException('短信服务未配置');
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

