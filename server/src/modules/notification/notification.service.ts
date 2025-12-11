import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// 通知事件类型
export type NotificationEvent =
  | 'order_paid'           // 订单支付成功
  | 'order_assigned'       // 订单被派单
  | 'order_grabbed'        // 订单被抢单
  | 'order_grabbed_fail'   // 抢单失败
  | 'new_order_available'   // 新订单可抢
  | 'order_reminder'       // 服务提醒（提前30分钟）
  | 'order_user_cancelled' // 用户取消订单（通知陪诊员）
  | 'escort_arrived'       // 陪诊员到达
  | 'service_started'      // 服务开始
  | 'service_completed'    // 服务完成
  | 'order_cancelled'      // 订单取消
  | 'income_settled'       // 收入入账
  | 'escort_reviewed'      // 收到评价
  | 'escort_review_approved'  // 陪诊员审核通过
  | 'escort_review_rejected'  // 陪诊员审核拒绝
  | 'escort_level_upgraded'   // 陪诊员等级提升
  | 'escort_cert_expiring'    // 证书即将过期
  | 'withdrawal_approved'  // 提现审核通过
  | 'withdrawal_rejected'  // 提现审核拒绝
  | 'withdrawal_completed' // 提现完成
  | 'complaint_submitted'  // 投诉已提交
  | 'complaint_resolved'   // 投诉已处理
  | 'escort_late_warning'  // 陪诊员迟到警告
  | 'escort_no_show'       // 陪诊员爽约
  | 'system_notice';       // 系统通知

// 通知参数接口
export interface SendNotificationParams {
  event: NotificationEvent;
  recipientId: string;
  recipientType: 'user' | 'escort';
  data?: Record<string, any>;
  relatedType?: string;
  relatedId?: string;
}

// 频控结果
interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

// 默认消息模板配置
const DEFAULT_TEMPLATES: Record<NotificationEvent, { title: string; content: string; category: string }> = {
  order_paid: {
    title: '订单支付成功',
    content: '您的订单 {{orderNo}} 已支付成功，等待陪诊员接单',
    category: 'order',
  },
  order_assigned: {
    title: '订单已分配陪诊员',
    content: '您的订单 {{orderNo}} 已分配陪诊员 {{escortName}}，请保持电话畅通',
    category: 'order',
  },
  order_grabbed: {
    title: '新订单已接',
    content: '您已成功接单 {{orderNo}}，请按时到达服务地点',
    category: 'order',
  },
  order_grabbed_fail: {
    title: '抢单失败',
    content: '订单 {{orderNo}} 已被其他陪诊员抢走',
    category: 'order',
  },
  new_order_available: {
    title: '新订单可抢',
    content: '有新的订单 {{orderNo}} 可抢，{{hospitalName}}，{{appointmentTime}}',
    category: 'order',
  },
  order_reminder: {
    title: '服务提醒',
    content: '您有订单 {{orderNo}} 将在30分钟后开始，请提前准备',
    category: 'order',
  },
  order_user_cancelled: {
    title: '订单已取消',
    content: '订单 {{orderNo}} 已被用户取消',
    category: 'order',
  },
  income_settled: {
    title: '收入已到账',
    content: '订单 {{orderNo}} 的分成 ¥{{amount}} 已到账',
    category: 'escort',
  },
  escort_arrived: {
    title: '陪诊员已到达',
    content: '陪诊员 {{escortName}} 已到达 {{hospitalName}}，请前往汇合',
    category: 'order',
  },
  service_started: {
    title: '服务已开始',
    content: '订单 {{orderNo}} 的陪诊服务已开始',
    category: 'order',
  },
  service_completed: {
    title: '服务已完成',
    content: '订单 {{orderNo}} 的陪诊服务已完成，请为陪诊员评价',
    category: 'order',
  },
  order_cancelled: {
    title: '订单已取消',
    content: '订单 {{orderNo}} 已取消，{{reason}}',
    category: 'order',
  },
  escort_reviewed: {
    title: '收到新评价',
    content: '您收到一条新评价，评分 {{rating}} 星',
    category: 'escort',
  },
  escort_review_approved: {
    title: '审核通过',
    content: '恭喜！您的陪诊员申请已通过审核，现在可以开始接单了',
    category: 'escort',
  },
  escort_review_rejected: {
    title: '审核未通过',
    content: '您的陪诊员申请未通过审核，原因：{{note}}。如有疑问请联系客服',
    category: 'escort',
  },
  escort_level_upgraded: {
    title: '等级提升',
    content: '恭喜！您的等级已提升至 {{levelName}}，享受更高分成比例',
    category: 'escort',
  },
  escort_cert_expiring: {
    title: '证书即将过期',
    content: '您的{{certName}}将在{{days}}天后过期，请及时更新',
    category: 'escort',
  },
  withdrawal_approved: {
    title: '提现审核通过',
    content: '您的提现申请 ¥{{amount}} 已审核通过，预计1-3个工作日到账',
    category: 'escort',
  },
  withdrawal_rejected: {
    title: '提现审核未通过',
    content: '您的提现申请 ¥{{amount}} 未通过，原因：{{reason}}',
    category: 'escort',
  },
  withdrawal_completed: {
    title: '提现已到账',
    content: '您的提现 ¥{{amount}} 已到账，请查收',
    category: 'escort',
  },
  complaint_submitted: {
    title: '投诉已提交',
    content: '您对订单 {{orderNo}} 的投诉已提交，我们将尽快处理',
    category: 'order',
  },
  complaint_resolved: {
    title: '投诉已处理',
    content: '您对订单 {{orderNo}} 的投诉已处理，{{resolution}}',
    category: 'order',
  },
  escort_late_warning: {
    title: '迟到提醒',
    content: '您在订单 {{orderNo}} 中已迟到 {{minutes}} 分钟，请尽快到达',
    category: 'escort',
  },
  escort_no_show: {
    title: '爽约通知',
    content: '您在订单 {{orderNo}} 中未按时到达，订单已被取消',
    category: 'escort',
  },
  system_notice: {
    title: '系统通知',
    content: '{{content}}',
    category: 'system',
  },
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private accessTokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  /**
   * 发送通知（主入口）
   */
  async send(params: SendNotificationParams): Promise<boolean> {
    const { event, recipientId, recipientType, data = {}, relatedType, relatedId } = params;

    try {
      // 获取模板配置
      const template = await this.getTemplate(event);
      if (!template) {
        this.logger.warn(`未找到通知模板: ${event}`);
        return false;
      }

      // 检查频控
      const rateLimitCheck = await this.checkRateLimit(event, recipientId);
      if (!rateLimitCheck.allowed) {
        this.logger.debug(`频控限制: ${event} -> ${recipientId}, 原因: ${rateLimitCheck.reason}`);
        return false;
      }

      // 渲染消息内容
      const title = this.renderTemplate(template.title, data);
      const content = this.renderTemplate(template.content, data);

      // 发送站内消息
      if (template.channels.includes('in_app')) {
        await this.sendInAppMessage({
          recipientId,
          recipientType,
          templateCode: event,
          title,
          content,
          category: template.category,
          relatedType,
          relatedId,
          extra: data,
        });
      }

      // 记录通知日志
      await this.logNotification({
        recipientId,
        recipientType,
        templateCode: event,
        channel: 'in_app',
        title,
        content,
        status: 'sent',
        relatedType,
        relatedId,
      });

      // 发送微信订阅消息
      if (template.channels.includes('wechat')) {
        try {
          await this.sendWechatMessage({
            recipientId,
            recipientType,
            templateCode: event,
            title,
            content,
            data,
            relatedType,
            relatedId,
          });
        } catch (error) {
          this.logger.warn(`微信订阅消息发送失败: ${event} -> ${recipientId}`, error);
          // 微信消息发送失败不影响站内消息，只记录警告
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`发送通知失败: ${event} -> ${recipientId}`, error);

      // 记录失败日志
      await this.logNotification({
        recipientId,
        recipientType,
        templateCode: event,
        channel: 'in_app',
        title: '',
        content: '',
        status: 'failed',
        errorMessage: error.message,
        relatedType,
        relatedId,
      });

      return false;
    }
  }

  /**
   * 获取消息模板
   */
  private async getTemplate(code: string): Promise<{
    title: string;
    content: string;
    category: string;
    channels: string[];
    rateLimit?: number;
    cooldown?: number;
  } | null> {
    // 先从数据库查找
    const dbTemplate = await this.prisma.messageTemplate.findUnique({
      where: { code, status: 'active' },
    });

    if (dbTemplate) {
      return {
        title: dbTemplate.title,
        content: dbTemplate.content,
        category: dbTemplate.category,
        channels: dbTemplate.channels,
        rateLimit: dbTemplate.rateLimit ?? undefined,
        cooldown: dbTemplate.cooldown ?? undefined,
      };
    }

    // 使用默认模板
    const defaultTemplate = DEFAULT_TEMPLATES[code as NotificationEvent];
    if (defaultTemplate) {
      return {
        ...defaultTemplate,
        channels: ['in_app'],
      };
    }

    return null;
  }

  /**
   * 检查频控
   */
  private async checkRateLimit(templateCode: string, recipientId: string): Promise<RateLimitResult> {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { code: templateCode },
    });

    if (!template) {
      return { allowed: true };
    }

    // 检查冷却时间
    if (template.cooldown) {
      const cooldownTime = new Date(Date.now() - template.cooldown * 1000);
      const recentLog = await this.prisma.notificationLog.findFirst({
        where: {
          recipientId,
          templateCode,
          status: 'sent',
          createdAt: { gte: cooldownTime },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentLog) {
        return { allowed: false, reason: '冷却时间未到' };
      }
    }

    // 检查每小时发送限制
    if (template.rateLimit) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const count = await this.prisma.notificationLog.count({
        where: {
          recipientId,
          templateCode,
          status: 'sent',
          createdAt: { gte: oneHourAgo },
        },
      });

      if (count >= template.rateLimit) {
        return { allowed: false, reason: '超过每小时发送限制' };
      }
    }

    return { allowed: true };
  }

  /**
   * 发送站内消息
   */
  private async sendInAppMessage(params: {
    recipientId: string;
    recipientType: 'user' | 'escort';
    templateCode: string;
    title: string;
    content: string;
    category: string;
    relatedType?: string;
    relatedId?: string;
    extra?: Record<string, any>;
  }): Promise<void> {
    // 如果是陪诊员，需要获取关联的用户ID
    let userId = params.recipientId;
    if (params.recipientType === 'escort') {
      const escort = await this.prisma.escort.findUnique({
        where: { id: params.recipientId },
        select: { userId: true },
      });
      if (escort?.userId) {
        userId = escort.userId;
      } else {
        this.logger.warn(`陪诊员 ${params.recipientId} 未绑定用户，无法发送站内消息`);
        return;
      }
    }

    await this.prisma.message.create({
      data: {
        userId,
        templateCode: params.templateCode,
        title: params.title,
        content: params.content,
        category: params.category,
        relatedType: params.relatedType,
        relatedId: params.relatedId,
        extra: params.extra ? JSON.stringify(params.extra) : null,
      },
    });
  }

  /**
   * 记录通知日志
   */
  private async logNotification(params: {
    recipientId: string;
    recipientType: string;
    templateCode: string;
    channel: string;
    title: string;
    content: string;
    status: string;
    errorMessage?: string;
    relatedType?: string;
    relatedId?: string;
  }): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        recipientId: params.recipientId,
        recipientType: params.recipientType,
        templateCode: params.templateCode,
        channel: params.channel,
        title: params.title,
        content: params.content,
        status: params.status,
        errorMessage: params.errorMessage,
        sentAt: params.status === 'sent' ? new Date() : null,
        relatedType: params.relatedType,
        relatedId: params.relatedId,
      },
    });
  }

  /**
   * 渲染模板
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * 获取用户消息列表
   */
  async getUserMessages(
    userId: string,
    params: { category?: string; isRead?: boolean; page?: number; limit?: number },
  ) {
    const { category, isRead, page = 1, limit = 20 } = params;

    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      items: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string): Promise<{ total: number; byCategory: Record<string, number> }> {
    const [total, categories] = await Promise.all([
      this.prisma.message.count({
        where: { userId, isRead: false },
      }),
      this.prisma.message.groupBy({
        by: ['category'],
        where: { userId, isRead: false },
        _count: true,
      }),
    ]);

    const byCategory: Record<string, number> = {};
    categories.forEach((c) => {
      byCategory[c.category] = c._count;
    });

    return { total, byCategory };
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(userId: string, messageIds: string[]): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * 标记全部已读
   */
  async markAllAsRead(userId: string, category?: string): Promise<number> {
    const where: any = { userId, isRead: false };
    if (category) {
      where.category = category;
    }

    const result = await this.prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * 删除消息
   */
  async deleteMessages(userId: string, messageIds: string[]): Promise<number> {
    const result = await this.prisma.message.deleteMany({
      where: {
        id: { in: messageIds },
        userId,
      },
    });

    return result.count;
  }

  /**
   * 发送微信订阅消息
   * 基础框架实现，需要配置模板ID后使用
   */
  private async sendWechatMessage(params: {
    recipientId: string;
    recipientType: 'user' | 'escort';
    templateCode: string;
    title: string;
    content: string;
    data: Record<string, any>;
    relatedType?: string;
    relatedId?: string;
  }): Promise<void> {
    const { recipientId, recipientType, templateCode, data } = params;

    // 获取用户 openid
    let openid: string | null = null;
    if (recipientType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: recipientId },
        select: { openId: true },
      });
      openid = user?.openId || null;
    } else if (recipientType === 'escort') {
      const escort = await this.prisma.escort.findUnique({
        where: { id: recipientId },
        include: { user: { select: { openId: true } } },
      });
      openid = escort?.user?.openId || null;
    }

    if (!openid) {
      this.logger.warn(`用户 ${recipientId} 未绑定微信 openid，无法发送订阅消息`);
      return;
    }

    // 获取微信配置
    const appId = this.configService.get<string>('WECHAT_APPID') || this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_SECRET') || this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      this.logger.warn('微信 AppID 或 AppSecret 未配置，无法发送订阅消息');
      return;
    }

    // 获取 access_token
    const accessToken = await this.getWechatAccessToken(appId, appSecret);
    if (!accessToken) {
      this.logger.error('获取微信 access_token 失败');
      return;
    }

    // 获取模板ID（从数据库或配置）
    const templateId = await this.getWechatTemplateId(templateCode);
    if (!templateId) {
      this.logger.warn(`未找到模板 ${templateCode} 对应的微信模板ID，跳过发送`);
      return;
    }

    // 构建订阅消息数据
    const templateData = this.buildWechatTemplateData(templateCode, data);

    // 调用微信订阅消息 API
    try {
      const response = await fetch(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            touser: openid,
            template_id: templateId,
            page: this.getWechatPagePath(params.relatedType, params.relatedId),
            data: templateData,
          }),
        },
      );

      const result = await response.json();

      if (result.errcode === 0) {
        this.logger.log(`微信订阅消息发送成功: ${templateCode} -> ${openid}`);
      } else {
        this.logger.error(
          `微信订阅消息发送失败: ${templateCode} -> ${openid}, 错误: ${result.errmsg || result.errcode}`,
        );
        throw new Error(`微信订阅消息发送失败: ${result.errmsg || result.errcode}`);
      }
    } catch (error) {
      this.logger.error(`调用微信订阅消息 API 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取微信 access_token
   * 带缓存机制，避免频繁请求
   */
  private async getWechatAccessToken(appId: string, appSecret: string): Promise<string | null> {
    // 检查缓存
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    try {
      const response = await fetch(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
      );
      const result = await response.json();

      if (result.access_token) {
        // 缓存 token（提前5分钟过期，确保安全）
        this.accessTokenCache = {
          token: result.access_token,
          expiresAt: Date.now() + (result.expires_in - 300) * 1000,
        };
        return result.access_token;
      } else {
        this.logger.error(`获取微信 access_token 失败: ${result.errmsg || result.errcode}`);
        return null;
      }
    } catch (error) {
      this.logger.error('调用微信 access_token API 失败:', error);
      return null;
    }
  }

  /**
   * 获取微信模板ID
   * 从环境变量获取（格式：WECHAT_TEMPLATE_${TEMPLATE_CODE}）
   * 例如：WECHAT_TEMPLATE_ORDER_ASSIGNED=xxx
   */
  private async getWechatTemplateId(templateCode: string): Promise<string | null> {
    // 从环境变量获取（格式：WECHAT_TEMPLATE_${TEMPLATE_CODE}）
    const envKey = `WECHAT_TEMPLATE_${templateCode.toUpperCase().replace(/-/g, '_')}`;
    const templateId = this.configService.get<string>(envKey);

    if (!templateId) {
      this.logger.warn(
        `未找到模板 ${templateCode} 的微信模板ID，请在环境变量中配置 ${envKey}`,
      );
    }

    return templateId || null;
  }

  /**
   * 构建微信订阅消息模板数据
   * 根据模板代码和变量数据构建符合微信格式的数据
   */
  private buildWechatTemplateData(
    templateCode: string,
    data: Record<string, any>,
  ): Record<string, { value: string }> {
    // 默认模板数据格式（可根据实际申请的模板调整）
    const templateData: Record<string, { value: string }> = {};

    // 根据不同的模板代码构建不同的数据
    switch (templateCode) {
      case 'order_assigned':
      case 'order_grabbed':
        templateData.thing1 = { value: data.orderNo || '订单' };
        templateData.name2 = { value: data.escortName || '陪诊员' };
        templateData.time3 = { value: data.appointmentTime || new Date().toLocaleString() };
        break;
      case 'escort_review_approved':
        templateData.thing1 = { value: '审核通过' };
        templateData.thing2 = { value: '您的陪诊员申请已通过审核' };
        break;
      case 'escort_review_rejected':
        templateData.thing1 = { value: '审核未通过' };
        templateData.thing2 = { value: data.note || '审核未通过' };
        break;
      case 'escort_level_upgraded':
        templateData.thing1 = { value: '等级提升' };
        templateData.name2 = { value: data.levelName || '新等级' };
        break;
      case 'escort_cert_expiring':
        templateData.thing1 = { value: data.certName || '证书' };
        templateData.number2 = { value: String(data.days || 0) };
        templateData.date3 = { value: data.expireDate || '' };
        break;
      default:
        // 通用格式：使用 content 作为主要信息
        templateData.thing1 = { value: data.title || '通知' };
        templateData.thing2 = { value: data.content || '' };
    }

    return templateData;
  }

  /**
   * 获取微信小程序页面路径
   * 根据相关类型和ID生成跳转路径
   */
  private getWechatPagePath(relatedType?: string, relatedId?: string): string {
    if (!relatedType || !relatedId) {
      return 'pages/index/index';
    }

    const pathMap: Record<string, string> = {
      order: `pages/orders/detail?id=${relatedId}`,
      escort: `pages/escort/detail?id=${relatedId}`,
    };

    return pathMap[relatedType] || 'pages/index/index';
  }
}
