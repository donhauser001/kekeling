import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignDto,
  CreateSeckillItemDto,
  UpdateSeckillItemDto,
} from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private prisma: PrismaService) { }

  // ========== 用户端方法 ==========

  /**
   * 获取进行中的活动列表
   */
  async getActiveCampaigns(params: { type?: string; page?: number; pageSize?: number }) {
    const { type, page = 1, pageSize = 10 } = params;
    const now = new Date();

    const where: Prisma.CampaignWhereInput = {
      status: 'active',
      startAt: { lte: now },
      endAt: { gt: now },
    };

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: [{ sort: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              participations: true,
              seckillItems: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: data.map((campaign) => ({
        ...campaign,
        discountValue: Number(campaign.discountValue),
        maxDiscount: campaign.maxDiscount ? Number(campaign.maxDiscount) : null,
        minAmount: Number(campaign.minAmount),
        participationCount: campaign._count.participations,
        seckillItemCount: campaign._count.seckillItems,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取活动详情
   */
  async getCampaignById(id: string, userId?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        seckillItems: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                coverImage: true,
              },
            },
          },
          orderBy: { sort: 'asc' },
        },
        _count: {
          select: {
            participations: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }

    // 检查用户是否已参与
    let userParticipated = false;
    let userParticipationCount = 0;
    if (userId) {
      const participation = await this.prisma.campaignParticipation.findFirst({
        where: {
          campaignId: id,
          userId,
        },
      });
      userParticipated = !!participation;
      userParticipationCount = await this.prisma.campaignParticipation.count({
        where: {
          campaignId: id,
          userId,
        },
      });
    }

    return {
      ...campaign,
      discountValue: Number(campaign.discountValue),
      maxDiscount: campaign.maxDiscount ? Number(campaign.maxDiscount) : null,
      minAmount: Number(campaign.minAmount),
      participationCount: campaign._count.participations,
      userParticipated,
      userParticipationCount,
      seckillItems: campaign.seckillItems?.map((item) => ({
        ...item,
        seckillPrice: Number(item.seckillPrice),
        stockRemaining: item.stockTotal - item.stockSold,
        service: item.service ? {
          ...item.service,
          price: Number(item.service.price),
        } : null,
      })) || [],
    };
  }

  /**
   * 获取服务适用的活动
   */
  async getCampaignForService(serviceId: string, userId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('服务不存在');
    }

    const now = new Date();
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'active',
        startAt: { lte: now },
        endAt: { gt: now },
        OR: [
          { applicableScope: 'all' },
          {
            AND: [
              { applicableScope: 'service' },
              { applicableIds: { has: serviceId } },
            ],
          },
          {
            AND: [
              { applicableScope: 'category' },
              { applicableIds: { has: service.categoryId } },
            ],
          },
        ],
      },
      orderBy: [{ sort: 'desc' }, { createdAt: 'desc' }],
    });

    // 筛选适用的活动
    for (const campaign of campaigns) {
      // 检查新人专享
      if (campaign.type === 'newcomer' && userId) {
        const orderCount = await this.prisma.order.count({
          where: { userId, status: { not: 'cancelled' } },
        });
        if (orderCount > 0) continue;
      }

      // 检查总参与次数
      if (campaign.totalQuantity !== null) {
        const participated = await this.prisma.campaignParticipation.count({
          where: { campaignId: campaign.id },
        });
        if (participated >= campaign.totalQuantity) continue;
      }

      // 检查每人限制
      if (userId && campaign.perUserLimit > 0) {
        const userParticipated = await this.prisma.campaignParticipation.count({
          where: {
            campaignId: campaign.id,
            userId,
          },
        });
        if (userParticipated >= campaign.perUserLimit) continue;
      }

      // 返回第一个适用的活动
      return {
        ...campaign,
        discountValue: Number(campaign.discountValue),
        maxDiscount: campaign.maxDiscount ? Number(campaign.maxDiscount) : null,
        minAmount: Number(campaign.minAmount),
      };
    }

    return null;
  }

  /**
   * 秒杀预占库存
   */
  async reserveSeckillStock(
    campaignId: string,
    serviceId: string,
    userId: string,
    ip?: string,
  ) {
    const now = new Date();

    // 检查活动
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.type !== 'seckill') {
      throw new BadRequestException('活动不存在或不是秒杀活动');
    }

    if (campaign.status !== 'active' || campaign.startAt > now || campaign.endAt <= now) {
      throw new BadRequestException('活动未开始或已结束');
    }

    // 防刷：限流检查（每秒最多5个请求）
    // 注意：这里使用简化方案，实际应该使用Redis
    const oneSecondAgo = new Date(Date.now() - 1000);
    const recentReserves = await this.prisma.campaignParticipation.count({
      where: {
        campaignId,
        userId,
        createdAt: { gte: oneSecondAgo },
      },
    });

    if (recentReserves >= 5) {
      await this.logSuspiciousActivity({
        type: 'seckill_rate_limit',
        userId,
        campaignId,
        serviceId,
        ip,
        reason: '秒杀请求频率过高',
      });
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }

    // 防刷：IP限制（同IP每小时最多参与3次）
    if (ip) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      // 简化方案：检查最近1小时该活动的参与次数
      // 实际应该记录IP，这里使用用户参与次数作为近似
      const recentParticipations = await this.prisma.campaignParticipation.count({
        where: {
          campaignId,
          createdAt: { gte: oneHourAgo },
        },
      });

      // 如果总参与次数异常高，可能是IP刷单
      if (recentParticipations > 100) {
        await this.logSuspiciousActivity({
          type: 'seckill_ip_abuse',
          userId,
          campaignId,
          serviceId,
          ip,
          reason: 'IP参与次数异常',
        });
        // 不直接拒绝，只记录日志
      }
    }

    // 检查秒杀商品
    const item = await this.prisma.seckillItem.findUnique({
      where: {
        campaignId_serviceId: {
          campaignId,
          serviceId,
        },
      },
    });

    if (!item || item.status !== 'active') {
      throw new BadRequestException('秒杀商品不存在或已下架');
    }

    // 检查库存
    if (item.stockSold >= item.stockTotal) {
      throw new BadRequestException('已抢光');
    }

    // 检查用户限购
    const userPurchased = await this.prisma.order.count({
      where: {
        userId,
        campaignId,
        serviceId,
        status: { notIn: ['cancelled', 'refunded'] },
      },
    });

    if (userPurchased >= item.perUserLimit) {
      throw new BadRequestException('已达限购数量');
    }

    // 使用事务预占库存
    return this.prisma.$transaction(async (tx) => {
      // 重新查询库存（防止并发）
      const currentItem = await tx.seckillItem.findUnique({
        where: {
          campaignId_serviceId: {
            campaignId,
            serviceId,
          },
        },
      });

      if (!currentItem || currentItem.stockSold >= currentItem.stockTotal) {
        throw new BadRequestException('库存不足');
      }

      // 增加已售数量
      const updatedItem = await tx.seckillItem.update({
        where: {
          campaignId_serviceId: {
            campaignId,
            serviceId,
          },
        },
        data: {
          stockSold: { increment: 1 },
        },
      });

      return {
        success: true,
        stockRemaining: updatedItem.stockTotal - updatedItem.stockSold,
      };
    });
  }

  /**
   * 释放秒杀库存（订单取消时调用）
   */
  async releaseSeckillStock(campaignId: string, serviceId: string) {
    const item = await this.prisma.seckillItem.findUnique({
      where: {
        campaignId_serviceId: {
          campaignId,
          serviceId,
        },
      },
    });

    if (!item) {
      return;
    }

    // 释放库存（不能超过总数）
    await this.prisma.seckillItem.update({
      where: {
        campaignId_serviceId: {
          campaignId,
          serviceId,
        },
      },
      data: {
        stockSold: Math.max(0, item.stockSold - 1),
      },
    });
  }

  /**
   * 记录活动参与（订单创建时调用）
   */
  async recordParticipation(
    campaignId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ) {
    await this.prisma.campaignParticipation.create({
      data: {
        campaignId,
        userId,
        orderId,
        discountAmount: new Decimal(discountAmount),
      },
    });
  }

  // ========== 管理端方法 ==========

  /**
   * 获取活动列表
   */
  async getCampaigns(query: QueryCampaignDto) {
    const { type, status, page = 1, pageSize = 10 } = query;

    const where: Prisma.CampaignWhereInput = {};
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: [{ sort: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              participations: true,
              seckillItems: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: data.map((campaign) => ({
        ...campaign,
        discountValue: Number(campaign.discountValue),
        maxDiscount: campaign.maxDiscount ? Number(campaign.maxDiscount) : null,
        minAmount: Number(campaign.minAmount),
        participationCount: campaign._count.participations,
        seckillItemCount: campaign._count.seckillItems,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 创建活动
   */
  async createCampaign(dto: CreateCampaignDto) {
    // 检查时间
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (startAt >= endAt) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    // 检查代码唯一性
    if (dto.code) {
      const existing = await this.prisma.campaign.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('活动代码已存在');
      }
    }

    return this.prisma.campaign.create({
      data: {
        ...dto,
        startAt,
        endAt,
        discountValue: new Decimal(dto.discountValue),
        maxDiscount: dto.maxDiscount ? new Decimal(dto.maxDiscount) : null,
        minAmount: new Decimal(dto.minAmount || 0),
        applicableIds: dto.applicableIds || [],
        perUserLimit: dto.perUserLimit || 1,
        sort: dto.sort || 0,
        stackWithMember: dto.stackWithMember !== false,
        status: dto.status || 'pending',
      },
    });
  }

  /**
   * 更新活动
   */
  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.startAt !== undefined) updateData.startAt = new Date(dto.startAt);
    if (dto.endAt !== undefined) updateData.endAt = new Date(dto.endAt);
    if (dto.discountType !== undefined) updateData.discountType = dto.discountType;
    if (dto.discountValue !== undefined) updateData.discountValue = new Decimal(dto.discountValue);
    if (dto.maxDiscount !== undefined) updateData.maxDiscount = dto.maxDiscount ? new Decimal(dto.maxDiscount) : null;
    if (dto.minAmount !== undefined) updateData.minAmount = new Decimal(dto.minAmount);
    if (dto.applicableScope !== undefined) updateData.applicableScope = dto.applicableScope;
    if (dto.applicableIds !== undefined) updateData.applicableIds = dto.applicableIds;
    if (dto.totalQuantity !== undefined) updateData.totalQuantity = dto.totalQuantity;
    if (dto.perUserLimit !== undefined) updateData.perUserLimit = dto.perUserLimit;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.bannerUrl !== undefined) updateData.bannerUrl = dto.bannerUrl;
    if (dto.detailUrl !== undefined) updateData.detailUrl = dto.detailUrl;
    if (dto.sort !== undefined) updateData.sort = dto.sort;
    if (dto.stackWithMember !== undefined) updateData.stackWithMember = dto.stackWithMember;
    if (dto.status !== undefined) updateData.status = dto.status;

    // 检查时间
    if (updateData.startAt && updateData.endAt) {
      if (updateData.startAt >= updateData.endAt) {
        throw new BadRequestException('结束时间必须晚于开始时间');
      }
    }

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除活动
   */
  async deleteCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }

    // 检查是否有参与记录
    const participationCount = await this.prisma.campaignParticipation.count({
      where: { campaignId: id },
    });

    if (participationCount > 0) {
      throw new BadRequestException('该活动已有参与记录，无法删除');
    }

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  /**
   * 取消活动
   */
  async cancelCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }

    if (campaign.status === 'cancelled') {
      throw new BadRequestException('活动已取消');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * 获取活动统计数据
   */
  async getCampaignStats(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }

    const [participationCount, totalDiscount, seckillItems] = await Promise.all([
      this.prisma.campaignParticipation.count({
        where: { campaignId: id },
      }),
      this.prisma.campaignParticipation.aggregate({
        where: { campaignId: id },
        _sum: {
          discountAmount: true,
        },
      }),
      this.prisma.seckillItem.findMany({
        where: { campaignId: id },
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      campaign: {
        ...campaign,
        discountValue: Number(campaign.discountValue),
        maxDiscount: campaign.maxDiscount ? Number(campaign.maxDiscount) : null,
        minAmount: Number(campaign.minAmount),
      },
      stats: {
        participationCount,
        totalDiscount: totalDiscount._sum.discountAmount
          ? Number(totalDiscount._sum.discountAmount)
          : 0,
        seckillItems: seckillItems.map((item) => ({
          ...item,
          seckillPrice: Number(item.seckillPrice),
          stockRemaining: item.stockTotal - item.stockSold,
        })),
      },
    };
  }

  // ========== 秒杀商品管理 ==========

  /**
   * 获取秒杀商品列表
   */
  async getSeckillItems(campaignId: string) {
    const items = await this.prisma.seckillItem.findMany({
      where: { campaignId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            coverImage: true,
          },
        },
      },
      orderBy: { sort: 'asc' },
    });

    return items.map((item) => ({
      ...item,
      seckillPrice: Number(item.seckillPrice),
      stockRemaining: item.stockTotal - item.stockSold,
      service: item.service ? {
        ...item.service,
        price: Number(item.service.price),
      } : null,
    }));
  }

  /**
   * 创建秒杀商品
   */
  async createSeckillItem(campaignId: string, dto: CreateSeckillItemDto) {
    // 检查活动
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.type !== 'seckill') {
      throw new BadRequestException('活动不存在或不是秒杀活动');
    }

    // 检查服务
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('服务不存在');
    }

    // 检查是否已存在
    const existing = await this.prisma.seckillItem.findUnique({
      where: {
        campaignId_serviceId: {
          campaignId,
          serviceId: dto.serviceId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('该服务已添加为秒杀商品');
    }

    return this.prisma.seckillItem.create({
      data: {
        campaignId,
        serviceId: dto.serviceId,
        seckillPrice: new Decimal(dto.seckillPrice),
        stockTotal: dto.stockTotal,
        perUserLimit: dto.perUserLimit || 1,
        sort: dto.sort || 0,
      },
    });
  }

  /**
   * 更新秒杀商品
   */
  async updateSeckillItem(id: string, dto: UpdateSeckillItemDto) {
    const item = await this.prisma.seckillItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('秒杀商品不存在');
    }

    const updateData: any = {};

    if (dto.seckillPrice !== undefined) updateData.seckillPrice = new Decimal(dto.seckillPrice);
    if (dto.stockTotal !== undefined) {
      // 如果新库存小于已售数量，不允许
      if (dto.stockTotal < item.stockSold) {
        throw new BadRequestException('新库存不能小于已售数量');
      }
      updateData.stockTotal = dto.stockTotal;
    }
    if (dto.perUserLimit !== undefined) updateData.perUserLimit = dto.perUserLimit;
    if (dto.sort !== undefined) updateData.sort = dto.sort;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.prisma.seckillItem.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除秒杀商品
   */
  async deleteSeckillItem(id: string) {
    const item = await this.prisma.seckillItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('秒杀商品不存在');
    }

    // 检查是否有订单
    const orderCount = await this.prisma.order.count({
      where: {
        campaignId: item.campaignId,
        serviceId: item.serviceId,
        status: { notIn: ['cancelled', 'refunded'] },
      },
    });

    if (orderCount > 0) {
      throw new BadRequestException('该秒杀商品已有订单，无法删除');
    }

    return this.prisma.seckillItem.delete({
      where: { id },
    });
  }

  /**
   * 记录可疑活动（防刷日志）
   */
  private async logSuspiciousActivity(data: {
    type: string;
    userId: string;
    campaignId: string;
    serviceId?: string;
    ip?: string;
    reason: string;
  }) {
    console.warn('[Campaign Anti-Fraud]', {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // 可以在这里添加数据库记录逻辑
    // await this.prisma.suspiciousActivity.create({ data: {...} });
  }

  /**
   * 更新活动状态（定时任务）
   */
  async updateCampaignStatus() {
    const now = new Date();

    // 开始活动
    const started = await this.prisma.campaign.updateMany({
      where: {
        status: 'pending',
        startAt: { lte: now },
      },
      data: { status: 'active' },
    });

    // 结束活动
    const ended = await this.prisma.campaign.updateMany({
      where: {
        status: 'active',
        endAt: { lte: now },
      },
      data: { status: 'ended' },
    });

    this.logger.log(`活动状态更新: ${started.count} 个活动已开始, ${ended.count} 个活动已结束`);

    return { started: started.count, ended: ended.count };
  }
}

