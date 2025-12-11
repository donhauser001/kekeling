import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { DispatchService } from '../escort-app/dispatch.service';
import { NotificationService } from '../notification/notification.service';
import { DistributionService } from '../distribution/distribution.service';

@Injectable()
export class TasksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TasksService.name);
  private dailyResetTimer: NodeJS.Timeout | null = null;
  private autoDispatchTimer: NodeJS.Timeout | null = null;
  private lateCheckTimer: NodeJS.Timeout | null = null;
  private membershipExpireTimer: NodeJS.Timeout | null = null;
  private levelUpgradeTimer: NodeJS.Timeout | null = null;
  private certificateExpiryTimer: NodeJS.Timeout | null = null;
  private promotionCheckTimer: NodeJS.Timeout | null = null;
  private distributionSettlementTimer: NodeJS.Timeout | null = null;
  private orderReminderTimer: NodeJS.Timeout | null = null;
  private membershipService: any;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private dispatchService: DispatchService,
    private notificationService: NotificationService,
    private distributionService: DistributionService,
  ) { }

  onModuleInit() {
    // 启动每日重置任务
    this.scheduleDailyReset();
    // 启动自动派单任务
    this.scheduleAutoDispatch();
    // 启动迟到检测任务
    this.scheduleLateCheck();
    // 启动会员到期提醒任务
    this.scheduleMembershipExpireCheck();
    // 启动积分过期清理任务
    this.schedulePointsExpireCheck();
    // 启动活动状态更新任务
    this.scheduleCampaignStatusUpdate();
    // 启动等级升级检测任务
    this.scheduleLevelUpgradeCheck();
    // 启动证书过期提醒任务
    this.scheduleCertificateExpiryCheck();
    // 启动晋升检查任务
    this.schedulePromotionCheck();
    // 启动分润结算任务
    this.scheduleDistributionSettlement();
    // 启动优惠券过期标记任务
    this.scheduleCouponExpireCheck();
    // 启动会员每月优惠券发放任务
    this.scheduleMemberMonthlyCoupons();
    // 启动生日优惠券发放任务
    this.scheduleBirthdayCoupons();
    // 启动服务提醒任务
    this.scheduleOrderReminder();
    this.logger.log('定时任务服务已启动');
  }

  onModuleDestroy() {
    // 清理定时器
    if (this.dailyResetTimer) {
      clearInterval(this.dailyResetTimer);
    }
    if (this.autoDispatchTimer) {
      clearInterval(this.autoDispatchTimer);
    }
    if (this.lateCheckTimer) {
      clearInterval(this.lateCheckTimer);
    }
    if (this.membershipExpireTimer) {
      clearInterval(this.membershipExpireTimer);
    }
    if (this.levelUpgradeTimer) {
      clearInterval(this.levelUpgradeTimer);
    }
    if (this.certificateExpiryTimer) {
      clearInterval(this.certificateExpiryTimer);
    }
    if (this.promotionCheckTimer) {
      clearInterval(this.promotionCheckTimer);
    }
    if (this.distributionSettlementTimer) {
      clearInterval(this.distributionSettlementTimer);
    }
    if (this.orderReminderTimer) {
      clearInterval(this.orderReminderTimer);
    }
    this.logger.log('定时任务服务已停止');
  }

  /**
   * 计算距离下一个凌晨0点的毫秒数
   */
  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  /**
   * 调度每日重置任务
   */
  private scheduleDailyReset() {
    // 首次执行：等到凌晨0点
    const msUntilMidnight = this.getMillisecondsUntilMidnight();
    this.logger.log(`下次每日重置将在 ${Math.round(msUntilMidnight / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次重置
      this.resetDailyOrderCounts();

      // 然后每24小时执行一次
      this.dailyResetTimer = setInterval(() => {
        this.resetDailyOrderCounts();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  /**
   * 重置所有陪诊员的每日接单数
   */
  async resetDailyOrderCounts() {
    const startTime = Date.now();
    this.logger.log('开始执行每日接单数重置...');

    try {
      const result = await this.prisma.escort.updateMany({
        where: { currentDailyOrders: { gt: 0 } },
        data: { currentDailyOrders: 0 },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `每日接单数重置完成: 更新了 ${result.count} 条记录, 耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('每日接单数重置失败:', error);
    }
  }

  /**
   * 检查订单超时（可选：未来可扩展）
   */
  async checkOrderTimeouts() {
    const now = new Date();

    // 查找派单超时的订单
    const overdueAssignments = await this.prisma.order.findMany({
      where: {
        status: 'paid',
        assignDeadline: { lt: now },
      },
      take: 100,
    });

    if (overdueAssignments.length > 0) {
      this.logger.warn(`发现 ${overdueAssignments.length} 个派单超时订单`);
      // TODO: 触发告警或自动处理
    }

    // 查找服务超时的订单
    const overdueServices = await this.prisma.order.findMany({
      where: {
        status: { in: ['assigned', 'arrived'] },
        serviceDeadline: { lt: now },
      },
      take: 100,
    });

    if (overdueServices.length > 0) {
      this.logger.warn(`发现 ${overdueServices.length} 个服务超时订单`);
      // TODO: 触发告警或自动处理
    }
  }

  /**
   * 更新陪诊员活跃状态（可选：未来可扩展）
   */
  async updateEscortActivity() {
    // 将超过24小时未活跃且状态为working的陪诊员自动设为resting
    const inactiveThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.prisma.escort.updateMany({
      where: {
        workStatus: 'working',
        lastActiveAt: { lt: inactiveThreshold },
      },
      data: {
        workStatus: 'resting',
        inactiveReason: '超过24小时未活跃，自动设为休息状态',
      },
    });

    if (result.count > 0) {
      this.logger.log(`已将 ${result.count} 个长时间未活跃的陪诊员设为休息状态`);
    }
  }

  /**
   * 调度自动派单任务
   * 每5分钟执行一次
   */
  private scheduleAutoDispatch() {
    // 5分钟执行一次
    const intervalMs = 5 * 60 * 1000;
    this.logger.log(`自动派单任务已启动，间隔 ${intervalMs / 1000} 秒`);

    this.autoDispatchTimer = setInterval(async () => {
      try {
        await this.dispatchService.autoDispatchPendingOrders();
      } catch (error) {
        this.logger.error('自动派单任务执行失败:', error);
      }
    }, intervalMs);
  }

  /**
   * 调度迟到检测任务
   * 每10分钟执行一次
   */
  private scheduleLateCheck() {
    const intervalMs = 10 * 60 * 1000;
    this.logger.log(`迟到检测任务已启动，间隔 ${intervalMs / 1000} 秒`);

    this.lateCheckTimer = setInterval(async () => {
      try {
        await this.checkEscortLate();
      } catch (error) {
        this.logger.error('迟到检测任务执行失败:', error);
      }
    }, intervalMs);
  }

  /**
   * 检测陪诊员迟到
   * 订单预约时间已过30分钟但陪诊员未到达
   */
  async checkEscortLate() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找已派单但未到达的订单
    const assignedOrders = await this.prisma.order.findMany({
      where: {
        status: 'assigned',
        appointmentDate: today,
        escortId: { not: null },
      },
      include: {
        escort: true,
      },
    });

    let lateCount = 0;

    for (const order of assignedOrders) {
      // 解析预约时间
      const [hours, minutes] = order.appointmentTime.split(':').map(Number);
      const appointmentDateTime = new Date(order.appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // 计算迟到时间（分钟）
      const lateMinutes = Math.floor((now.getTime() - appointmentDateTime.getTime()) / 1000 / 60);

      // 超过30分钟未到达，记录迟到
      if (lateMinutes > 30) {
        lateCount++;

        // 检查是否已经记录过迟到
        const existingLog = await this.prisma.orderLog.findFirst({
          where: {
            orderId: order.id,
            action: 'escort_late',
          },
        });

        if (!existingLog) {
          // 记录迟到日志
          await this.prisma.orderLog.create({
            data: {
              orderId: order.id,
              action: 'escort_late',
              operatorType: 'system',
              remark: `陪诊员 ${order.escort?.name} 迟到 ${lateMinutes} 分钟`,
              extra: JSON.stringify({
                escortId: order.escortId,
                escortName: order.escort?.name,
                appointmentTime: order.appointmentTime,
                lateMinutes,
              }),
            },
          });

          this.logger.warn(
            `订单 ${order.orderNo}: 陪诊员 ${order.escort?.name} 迟到 ${lateMinutes} 分钟`,
          );

          // TODO: 发送通知给用户和管理员
          // await notificationService.send({
          //   event: 'escort_late',
          //   recipientId: order.userId,
          //   data: { orderNo: order.orderNo, lateMinutes },
          // });
        }
      }
    }

    if (lateCount > 0) {
      this.logger.log(`迟到检测完成: 发现 ${lateCount} 个迟到订单`);
    }
  }

  /**
   * 检测陪诊员爽约
   * 订单预约时间已过2小时但陪诊员仍未到达
   */
  async checkNoShow() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找已派单但未到达、且已超时2小时的订单
    const assignedOrders = await this.prisma.order.findMany({
      where: {
        status: 'assigned',
        appointmentDate: today,
        escortId: { not: null },
      },
      include: {
        escort: true,
      },
    });

    for (const order of assignedOrders) {
      const [hours, minutes] = order.appointmentTime.split(':').map(Number);
      const appointmentDateTime = new Date(order.appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const lateMinutes = Math.floor((now.getTime() - appointmentDateTime.getTime()) / 1000 / 60);

      // 超过2小时未到达，标记为爽约
      if (lateMinutes > 120) {
        // 检查是否已经处理过
        const existingLog = await this.prisma.orderLog.findFirst({
          where: {
            orderId: order.id,
            action: 'escort_no_show',
          },
        });

        if (!existingLog) {
          await this.prisma.$transaction(async (tx) => {
            // 记录爽约日志
            await tx.orderLog.create({
              data: {
                orderId: order.id,
                action: 'escort_no_show',
                operatorType: 'system',
                remark: `陪诊员 ${order.escort?.name} 爽约，超时 ${lateMinutes} 分钟未到达`,
                extra: JSON.stringify({
                  escortId: order.escortId,
                  escortName: order.escort?.name,
                  lateMinutes,
                }),
              },
            });

            // 取消订单分配，重新进入待派单状态
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'paid',
                escortId: null,
                assignedAt: null,
                assignMethod: null,
              },
            });

            // 减少陪诊员订单数
            if (order.escortId) {
              await tx.escort.update({
                where: { id: order.escortId },
                data: {
                  orderCount: { decrement: 1 },
                  currentDailyOrders: { decrement: 1 },
                },
              });
            }
          });

          this.logger.warn(
            `订单 ${order.orderNo}: 陪诊员 ${order.escort?.name} 爽约，订单已重新进入待派单`,
          );

          // TODO: 发送通知给用户
          // TODO: 对陪诊员进行处罚
        }
      }
    }
  }

  /**
   * 调度积分过期清理任务
   * 每天凌晨2点执行
   */
  private schedulePointsExpireCheck() {
    // 计算距离下一个凌晨2点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`积分过期清理任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次清理
      this.expirePoints();

      // 然后每24小时执行一次
      setInterval(() => {
        this.expirePoints();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 清理过期积分
   */
  async expirePoints() {
    const startTime = Date.now();
    this.logger.log('开始执行积分过期清理...');

    try {
      const { PointsService } = await import('../points/points.service');
      const pointsService = new PointsService(this.prisma);
      const result = await pointsService.expirePoints();

      const duration = Date.now() - startTime;
      this.logger.log(
        `积分过期清理完成: 清理了 ${result.expiredCount} 条记录，${result.expiredPoints} 积分，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('积分过期清理失败:', error);
    }
  }

  /**
   * 调度活动状态更新任务
   * 每分钟执行一次
   */
  private scheduleCampaignStatusUpdate() {
    // 立即执行一次
    this.updateCampaignStatus();

    // 然后每分钟执行一次
    setInterval(() => {
      this.updateCampaignStatus();
    }, 60 * 1000);

    this.logger.log('活动状态更新任务已启动（每分钟执行）');
  }

  /**
   * 更新活动状态
   */
  async updateCampaignStatus() {
    try {
      const { CampaignsService } = await import('../campaigns/campaigns.service');
      const campaignsService = new CampaignsService(this.prisma, this.redis);
      const result = await campaignsService.updateCampaignStatus();
      if (result.started > 0 || result.ended > 0) {
        this.logger.log(`活动状态更新: ${result.started} 个活动已开始, ${result.ended} 个活动已结束`);
      }
    } catch (error) {
      this.logger.error('活动状态更新失败:', error);
    }
  }

  /**
   * 调度会员到期提醒任务
   * 每天凌晨1点执行
   */
  private scheduleMembershipExpireCheck() {
    // 计算距离下一个凌晨1点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`会员到期提醒任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次检查
      this.checkMembershipExpiration();

      // 然后每24小时执行一次
      this.membershipExpireTimer = setInterval(() => {
        this.checkMembershipExpiration();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 检查会员到期
   * 1. 标记已过期的会员
   * 2. 发送7天内到期提醒
   */
  async checkMembershipExpiration() {
    const startTime = Date.now();
    this.logger.log('开始执行会员到期检查...');

    try {
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      // 1. 标记已过期的会员
      const expiredResult = await this.prisma.userMembership.updateMany({
        where: {
          status: 'active',
          expireAt: { lte: now },
        },
        data: {
          status: 'expired',
        },
      });

      if (expiredResult.count > 0) {
        this.logger.log(`已标记 ${expiredResult.count} 个过期会员`);
      }

      // 2. 查找7天内到期的会员（用于发送提醒）
      const expiringSoon = await this.prisma.userMembership.findMany({
        where: {
          status: 'active',
          expireAt: {
            gte: now,
            lte: sevenDaysLater,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
            },
          },
          level: true,
        },
      });

      if (expiringSoon.length > 0) {
        this.logger.log(`发现 ${expiringSoon.length} 个即将到期的会员，需要发送提醒`);
        // TODO: 发送到期提醒通知
        // for (const membership of expiringSoon) {
        //   const daysLeft = Math.ceil(
        //     (membership.expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        //   );
        //   await notificationService.send({
        //     event: 'membership_expiring',
        //     recipientId: membership.userId,
        //     data: { daysLeft, expireAt: membership.expireAt },
        //   });
        // }
      }

      const duration = Date.now() - startTime;
      this.logger.log(`会员到期检查完成，耗时 ${duration}ms`);
    } catch (error) {
      this.logger.error('会员到期检查失败:', error);
    }
  }

  /**
   * 调度等级升级检测任务
   * 每天凌晨3点执行
   */
  private scheduleLevelUpgradeCheck() {
    // 计算距离下一个凌晨3点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`等级升级检测任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次检测
      this.checkAndUpgradeLevels();

      // 然后每24小时执行一次
      this.levelUpgradeTimer = setInterval(() => {
        this.checkAndUpgradeLevels();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 检查并升级所有陪诊员等级
   */
  async checkAndUpgradeLevels() {
    const startTime = Date.now();
    this.logger.log('开始执行等级升级检测...');

    try {
      // 获取所有激活的等级，按 sort 降序（从高到低）
      const levels = await this.prisma.escortLevel.findMany({
        where: { status: 'active' },
        orderBy: { sort: 'desc' },
      });

      if (levels.length === 0) {
        this.logger.warn('未找到激活的等级配置');
        return;
      }

      // 获取所有已激活的陪诊员
      const escorts = await this.prisma.escort.findMany({
        where: {
          status: 'active',
          deletedAt: null,
        },
        include: { level: true },
      });

      let upgradedCount = 0;
      const now = new Date();

      for (const escort of escorts) {
        // 计算从业月数（从创建时间开始）
        const createdAt = escort.createdAt;
        const monthsOfExperience = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
        );

        // 从高到低检查是否满足升级条件
        for (const level of levels) {
          // 检查是否满足升级条件
          const meetsExperience = !level.minExperience || monthsOfExperience >= level.minExperience;
          const meetsOrders = !level.minOrderCount || escort.orderCount >= level.minOrderCount;
          const meetsRating = !level.minRating || escort.rating >= level.minRating;

          if (meetsExperience && meetsOrders && meetsRating) {
            // 如果当前等级不同，则升级
            if (escort.levelCode !== level.code) {
              await this.prisma.escort.update({
                where: { id: escort.id },
                data: { levelCode: level.code },
              });

              // 发送升级通知
              if (escort.userId) {
                try {
                  await this.notificationService.send({
                    event: 'escort_level_upgraded',
                    recipientId: escort.id,
                    recipientType: 'escort',
                    data: {
                      escortName: escort.name,
                      levelName: level.name,
                      levelCode: level.code,
                    },
                    relatedType: 'escort',
                    relatedId: escort.id,
                  });
                } catch (error) {
                  this.logger.error(`发送升级通知失败 (${escort.id}):`, error);
                }
              }

              upgradedCount++;
              this.logger.log(
                `陪诊员 ${escort.name} (${escort.id}) 等级已提升至 ${level.name}`,
              );
            }
            // 已经是最适合的等级，无需升级
            break;
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `等级升级检测完成: 检测了 ${escorts.length} 个陪诊员，升级了 ${upgradedCount} 个，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('等级升级检测失败:', error);
    }
  }

  /**
   * 调度证书过期提醒任务
   * 每天凌晨4点执行
   */
  private scheduleCertificateExpiryCheck() {
    // 计算距离下一个凌晨4点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(4, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`证书过期提醒任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次检测
      this.checkCertificateExpiry();

      // 然后每24小时执行一次
      this.certificateExpiryTimer = setInterval(() => {
        this.checkCertificateExpiry();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 检查证书过期提醒
   * 检测30天内到期的健康证和证书
   */
  async checkCertificateExpiry() {
    const startTime = Date.now();
    this.logger.log('开始执行证书过期提醒检测...');

    try {
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      // 1. 检查健康证过期（healthCertExpiry 字段）
      const escortsWithExpiringHealthCert = await this.prisma.escort.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          healthCertExpiry: {
            gte: now,
            lte: thirtyDaysLater,
          },
        },
      });

      let notifiedCount = 0;

      // 发送健康证过期提醒
      for (const escort of escortsWithExpiringHealthCert) {
        if (escort.userId) {
          try {
            const daysUntilExpiry = Math.ceil(
              (escort.healthCertExpiry!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            await this.notificationService.send({
              event: 'escort_cert_expiring',
              recipientId: escort.id,
              recipientType: 'escort',
              data: {
                escortName: escort.name,
                certName: '健康证',
                days: daysUntilExpiry,
                expireDate: escort.healthCertExpiry!.toISOString().split('T')[0],
              },
              relatedType: 'escort',
              relatedId: escort.id,
            });

            notifiedCount++;
          } catch (error) {
            this.logger.error(`发送健康证过期提醒失败 (${escort.id}):`, error);
          }
        }
      }

      // 2. 检查证书 JSON 字段中的过期证书
      const allActiveEscorts = await this.prisma.escort.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          certificates: { not: null },
        },
      });

      for (const escort of allActiveEscorts) {
        if (!escort.certificates) continue;

        try {
          const certificates = JSON.parse(escort.certificates) as Array<{
            name: string;
            expireDate?: string;
          }>;

          const expiringCerts = certificates.filter((cert) => {
            if (!cert.expireDate) return false;
            const expireDate = new Date(cert.expireDate);
            return expireDate >= now && expireDate <= thirtyDaysLater;
          });

          if (expiringCerts.length > 0 && escort.userId) {
            for (const cert of expiringCerts) {
              const daysUntilExpiry = Math.ceil(
                (new Date(cert.expireDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              try {
                await this.notificationService.send({
                  event: 'escort_cert_expiring',
                  recipientId: escort.id,
                  recipientType: 'escort',
                  data: {
                    escortName: escort.name,
                    certName: cert.name,
                    days: daysUntilExpiry,
                    expireDate: cert.expireDate,
                  },
                  relatedType: 'escort',
                  relatedId: escort.id,
                });

                notifiedCount++;
              } catch (error) {
                this.logger.error(`发送证书过期提醒失败 (${escort.id}, ${cert.name}):`, error);
              }
            }
          }
        } catch (error) {
          this.logger.error(`解析证书 JSON 失败 (${escort.id}):`, error);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `证书过期提醒检测完成: 发送了 ${notifiedCount} 条提醒，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('证书过期提醒检测失败:', error);
    }
  }

  /**
   * 调度晋升检查任务
   * 每天凌晨5点执行
   */
  private schedulePromotionCheck() {
    // 计算距离下一个凌晨5点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`晋升检查任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次检测
      this.checkPromotions();

      // 然后每24小时执行一次
      this.promotionCheckTimer = setInterval(() => {
        this.checkPromotions();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 检查所有陪诊员的晋升条件
   */
  async checkPromotions() {
    const startTime = Date.now();
    this.logger.log('开始执行晋升检查...');

    try {
      const { PromotionService } = await import('../distribution/promotion.service');
      const promotionService = new PromotionService(this.prisma, this.notificationService);

      // 获取所有激活的陪诊员（L3 和 L2）
      const escorts = await this.prisma.escort.findMany({
        where: {
          status: 'active',
          deletedAt: null,
          distributionLevel: { in: [2, 3] },
        },
      });

      let promotedCount = 0;

      for (const escort of escorts) {
        try {
          const promoted = await promotionService.checkAndPromote(escort.id);
          if (promoted) {
            promotedCount++;
            this.logger.log(`陪诊员 ${escort.name} (${escort.id}) 已晋升`);
          }
        } catch (error) {
          this.logger.error(`检查晋升失败 (${escort.id}):`, error);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `晋升检查完成: 检测了 ${escorts.length} 个陪诊员，晋升了 ${promotedCount} 个，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('晋升检查失败:', error);
    }
  }

  /**
   * 调度分润结算任务
   * 每天凌晨6点执行
   */
  private scheduleDistributionSettlement() {
    // 计算距离下一个凌晨6点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`分润结算任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次检测
      this.checkAndSettleDistributionRecords();

      // 然后每24小时执行一次
      this.distributionSettlementTimer = setInterval(() => {
        this.checkAndSettleDistributionRecords();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 检查并结算分润记录（订单完成后7天）
   */
  async checkAndSettleDistributionRecords() {
    const startTime = Date.now();
    this.logger.log('开始执行分润结算检查...');

    try {
      // 计算7天前的日期
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // 查询订单完成时间超过7天且有待结算分润记录的订单
      const ordersToSettle = await this.prisma.order.findMany({
        where: {
          status: 'completed',
          completedAt: {
            lte: sevenDaysAgo,
          },
          distributionRecords: {
            some: {
              status: 'pending',
            },
          },
        },
        select: {
          id: true,
          orderNo: true,
          completedAt: true,
          distributionRecords: {
            where: {
              status: 'pending',
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (ordersToSettle.length === 0) {
        this.logger.log('没有需要结算的分润记录');
        return;
      }

      let settledCount = 0;
      let errorCount = 0;

      for (const order of ordersToSettle) {
        try {
          await this.distributionService.settleDistributionRecords(order.id);
          settledCount++;
          this.logger.log(`订单 ${order.orderNo} (${order.id}) 的分润已结算`);
        } catch (error) {
          errorCount++;
          this.logger.error(`结算订单 ${order.orderNo} (${order.id}) 的分润失败:`, error);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `分润结算检查完成: 处理了 ${ordersToSettle.length} 个订单，成功 ${settledCount} 个，失败 ${errorCount} 个，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('分润结算检查失败:', error);
    }
  }

  /**
   * 调度优惠券过期标记任务
   * 每天凌晨1点执行
   */
  private scheduleCouponExpireCheck() {
    // 计算距离下一个凌晨1点的毫秒数
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0);
    const msUntilNext = tomorrow.getTime() - now.getTime();

    this.logger.log(`优惠券过期标记任务将在 ${Math.round(msUntilNext / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次标记
      this.markExpiredCoupons();

      // 然后每24小时执行一次
      setInterval(() => {
        this.markExpiredCoupons();
      }, 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 标记过期优惠券
   */
  async markExpiredCoupons() {
    const startTime = Date.now();
    this.logger.log('开始执行优惠券过期标记...');

    try {
      const { CouponsService } = await import('../coupons/coupons.service');
      const couponsService = new CouponsService(this.prisma, this.redis);
      const result = await couponsService.markExpiredCoupons();

      const duration = Date.now() - startTime;
      this.logger.log(
        `优惠券过期标记完成: 标记了 ${result.count} 张过期优惠券，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('优惠券过期标记失败:', error);
    }
  }

  /**
   * 调度会员每月优惠券发放任务
   * 每月1号凌晨0点执行
   */
  private scheduleMemberMonthlyCoupons() {
    // 计算距离下一个1号凌晨0点的毫秒数
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    const msUntilNext = nextMonth.getTime() - now.getTime();

    this.logger.log(`会员每月优惠券发放任务将在 ${Math.round(msUntilNext / 1000 / 60 / 60)} 小时后执行`);

    setTimeout(() => {
      // 执行一次发放
      this.grantMemberMonthlyCoupons();

      // 然后每30天执行一次（简化处理，实际应该按月份）
      setInterval(() => {
        this.grantMemberMonthlyCoupons();
      }, 30 * 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  /**
   * 发放会员每月优惠券
   */
  async grantMemberMonthlyCoupons() {
    const startTime = Date.now();
    this.logger.log('开始执行会员每月优惠券发放...');

    try {
      if (!this.membershipService) {
        const { MembershipService } = await import('../membership/membership.service');
        this.membershipService = new MembershipService(this.prisma);
      }
      await this.membershipService.grantMemberMonthlyCoupons();

      const duration = Date.now() - startTime;
      this.logger.log(`会员每月优惠券发放完成，耗时 ${duration}ms`);
    } catch (error) {
      this.logger.error('会员每月优惠券发放失败:', error);
    }
  }

  /**
   * 调度生日优惠券发放任务
   * 每天凌晨0点执行
   */
  private scheduleBirthdayCoupons() {
    // 计算距离下一个凌晨0点的毫秒数
    const msUntilMidnight = this.getMillisecondsUntilMidnight();
    this.logger.log(`生日优惠券发放任务将在 ${Math.round(msUntilMidnight / 1000 / 60)} 分钟后执行`);

    setTimeout(() => {
      // 执行一次发放
      this.grantBirthdayCoupons();

      // 然后每24小时执行一次
      setInterval(() => {
        this.grantBirthdayCoupons();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  /**
   * 发放生日优惠券
   */
  async grantBirthdayCoupons() {
    const startTime = Date.now();
    this.logger.log('开始执行生日优惠券发放...');

    try {
      const { CouponsService } = await import('../coupons/coupons.service');
      const couponsService = new CouponsService(this.prisma, this.redis);
      const result = await couponsService.grantBirthdayCoupons();

      const duration = Date.now() - startTime;
      this.logger.log(
        `生日优惠券发放完成: 处理了 ${result.total} 个生日用户，发放了 ${result.granted} 张优惠券，耗时 ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('生日优惠券发放失败:', error);
    }
  }

  /**
   * 调度服务提醒任务
   * 每5分钟执行一次，检查30分钟后开始的订单
   */
  private scheduleOrderReminder() {
    // 立即执行一次
    this.checkAndSendOrderReminders();

    // 然后每5分钟执行一次
    this.orderReminderTimer = setInterval(() => {
      this.checkAndSendOrderReminders();
    }, 5 * 60 * 1000);

    this.logger.log('服务提醒任务已启动（每5分钟执行一次）');
  }

  /**
   * 检查并发送服务提醒
   * 提前30分钟提醒陪诊员
   */
  async checkAndSendOrderReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟后

      // 查询30分钟后开始且状态为 assigned 或 arrived 的订单
      const orders = await this.prisma.order.findMany({
        where: {
          status: { in: ['assigned', 'arrived'] },
          appointmentDate: {
            gte: new Date(reminderTime.getFullYear(), reminderTime.getMonth(), reminderTime.getDate()),
            lte: new Date(reminderTime.getFullYear(), reminderTime.getMonth(), reminderTime.getDate() + 1),
          },
          escortId: { not: null },
        },
        include: {
          escort: {
            include: { user: { select: { id: true } } },
          },
          hospital: { select: { name: true, shortName: true } },
        },
      });

      let sentCount = 0;
      for (const order of orders) {
        // 解析预约时间
        const appointmentDateTime = new Date(order.appointmentDate);
        const [hours, minutes] = order.appointmentTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        // 检查是否在30分钟前后5分钟内
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        if (timeDiff >= 25 * 60 * 1000 && timeDiff <= 35 * 60 * 1000) {
          // 发送提醒
          if (order.escort?.user?.id) {
            await this.notificationService.send({
              event: 'order_reminder',
              recipientId: order.escort.user.id,
              recipientType: 'escort',
              data: {
                orderNo: order.orderNo,
                appointmentTime: `${order.appointmentDate} ${order.appointmentTime}`,
                hospitalName: order.hospital?.name || order.hospital?.shortName || '',
              },
              relatedType: 'order',
              relatedId: order.id,
            });

            // 注意：这里可以后续添加reminderSentAt字段来避免重复提醒

            sentCount++;
          }
        }
      }

      if (sentCount > 0) {
        this.logger.log(`服务提醒任务完成: 发送了 ${sentCount} 条提醒`);
      }
    } catch (error) {
      this.logger.error('服务提醒任务失败:', error);
    }
  }
}
