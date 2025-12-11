import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';

// DTO 类型定义
export interface CreateEscortDto {
  name: string;
  gender: 'male' | 'female';
  phone: string;
  avatar?: string;
  idCard?: string;
  cityCode?: string;
  levelCode?: 'senior' | 'intermediate' | 'junior' | 'trainee';
  experience?: string;
  introduction?: string;
  tags?: string[];
  certificates?: Array<{ name: string; url: string; expireDate?: string; verified?: boolean }>;
  hospitalIds?: string[];
  // Phase1 新增字段
  emergencyContact?: string;
  emergencyPhone?: string;
  healthCertExpiry?: Date;
  serviceRadius?: number;
  serviceHours?: Record<string, Array<{ start: string; end: string }>>;
  maxDailyOrders?: number;
}

export interface UpdateEscortDto {
  name?: string;
  gender?: 'male' | 'female';
  phone?: string;
  avatar?: string;
  idCard?: string;
  cityCode?: string;
  levelCode?: 'senior' | 'intermediate' | 'junior' | 'trainee';
  experience?: string;
  introduction?: string;
  tags?: string[];
  certificates?: Array<{ name: string; url: string; expireDate?: string; verified?: boolean }>;
  status?: 'pending' | 'active' | 'inactive' | 'suspended';
  workStatus?: 'resting' | 'working' | 'busy';
  // Phase1 新增字段
  emergencyContact?: string;
  emergencyPhone?: string;
  healthCertExpiry?: Date;
  serviceRadius?: number;
  serviceHours?: Record<string, Array<{ start: string; end: string }>>;
  maxDailyOrders?: number;
}

export interface AssociateHospitalDto {
  hospitalId: string;
  familiarDepts?: string[];
}

@Injectable()
export class AdminEscortsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  // ============================================
  // 查询方法
  // ============================================

  /**
   * 获取陪诊员列表（分页、筛选）
   */
  async findAll(params: {
    status?: string;
    workStatus?: string;
    levelCode?: string;
    cityCode?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, workStatus, levelCode, cityCode, keyword, page = 1, pageSize = 10 } = params;

    const where: any = {
      deletedAt: null,  // 过滤已软删除的记录
    };
    if (status) where.status = status;
    if (workStatus) where.workStatus = workStatus;
    if (levelCode) where.levelCode = levelCode;
    if (cityCode) where.cityCode = cityCode;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword } },
        { introduction: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.escort.findMany({
        where,
        include: {
          hospitals: {
            include: { hospital: { select: { id: true, name: true } } },
          },
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
          level: true, // 包含等级信息
          wallet: {
            select: { balance: true, totalEarned: true },
          },
        },
        orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.escort.count({ where }),
    ]);

    // 转换数据格式
    const formattedData = data.map((escort) => ({
      ...escort,
      tags: escort.tags || [],  // ✅ tags 现在是原生数组，无需 JSON.parse
      certificates: escort.certificates ? JSON.parse(escort.certificates) : [],
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
    }));

    return { data: formattedData, total, page, pageSize };
  }

  /**
   * 获取陪诊员详情
   */
  async findById(id: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { id, deletedAt: null },
      include: {
        hospitals: {
          include: { hospital: { select: { id: true, name: true, address: true } } },
        },
        user: {
          select: { id: true, nickname: true, avatar: true, phone: true },
        },
        level: true, // 包含等级信息
        wallet: true, // 包含钱包信息
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    return {
      ...escort,
      tags: escort.tags || [],  // ✅ tags 现在是原生数组
      certificates: escort.certificates ? JSON.parse(escort.certificates) : [],
      hospitals: escort.hospitals.map((eh) => ({
        ...eh.hospital,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
      orderCount: escort._count.orders,
    };
  }

  /**
   * 获取可派单的陪诊员
   */
  async getAvailable(params: { hospitalId?: string; cityCode?: string }) {
    const { hospitalId, cityCode } = params;

    const where: any = {
      deletedAt: null,  // ✅ 过滤已软删除的记录
      status: 'active',
      workStatus: 'working', // 只返回正在接单的陪诊员
    };

    if (cityCode) {
      where.cityCode = cityCode;
    }

    if (hospitalId) {
      where.hospitals = {
        some: { hospitalId },
      };
    }

    const data = await this.prisma.escort.findMany({
      where,
      include: {
        hospitals: {
          include: { hospital: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
    });

    return data.map((escort) => ({
      ...escort,
      tags: escort.tags || [],  // ✅ tags 现在是原生数组
      hospitals: escort.hospitals.map((eh) => ({
        id: eh.hospital.id,
        name: eh.hospital.name,
        familiarDepts: eh.familiarDepts ? JSON.parse(eh.familiarDepts) : [],
      })),
    }));
  }

  // ============================================
  // 创建/更新/删除
  // ============================================

  /**
   * 创建陪诊员
   */
  async create(dto: CreateEscortDto) {
    // 检查手机号是否已存在
    const existing = await this.prisma.escort.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new BadRequestException('该手机号已被注册');
    }

    const { hospitalIds, tags, certificates, serviceHours, ...data } = dto;

    // 创建陪诊员
    const escort = await this.prisma.escort.create({
      data: {
        ...data,
        levelCode: data.levelCode || 'trainee', // 默认实习等级
        tags: tags || [],
        certificates: certificates ? JSON.stringify(certificates) : null,
        serviceHours: serviceHours ? JSON.stringify(serviceHours) : null,
        status: 'pending', // 新建默认待审核
        workStatus: 'resting',
      },
    });

    // 关联医院
    if (hospitalIds?.length) {
      await this.prisma.escortHospital.createMany({
        data: hospitalIds.map((hospitalId) => ({
          escortId: escort.id,
          hospitalId,
        })),
      });
    }

    return this.findById(escort.id);
  }

  /**
   * 更新陪诊员信息
   */
  async update(id: string, dto: UpdateEscortDto) {
    // 检查是否存在
    const existing = await this.prisma.escort.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 如果修改手机号，检查是否冲突
    if (dto.phone && dto.phone !== existing.phone) {
      const phoneExists = await this.prisma.escort.findUnique({
        where: { phone: dto.phone },
      });
      if (phoneExists) {
        throw new BadRequestException('该手机号已被其他陪诊员使用');
      }
    }

    const { tags, certificates, serviceHours, ...data } = dto;

    const updateData: any = { ...data };
    if (tags !== undefined) {
      updateData.tags = tags || [];
    }
    if (certificates !== undefined) {
      updateData.certificates = certificates ? JSON.stringify(certificates) : null;
    }
    if (serviceHours !== undefined) {
      updateData.serviceHours = serviceHours ? JSON.stringify(serviceHours) : null;
    }

    await this.prisma.escort.update({
      where: { id },
      data: updateData,
    });

    return this.findById(id);
  }

  /**
   * 删除陪诊员 (软删除)
   * ✅ 改为软删除：设置 deletedAt，保留历史订单关联
   */
  async delete(id: string) {
    // 检查是否存在
    const escort = await this.prisma.escort.findUnique({
      where: { id, deletedAt: null },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查是否有进行中的订单
    const activeOrders = await this.prisma.order.count({
      where: {
        escortId: id,
        status: { in: ['pending', 'paid', 'confirmed', 'in_progress'] },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        `该陪诊员还有 ${activeOrders} 个进行中的订单，无法删除。请先处理完订单后再删除。`,
      );
    }

    // ✅ 软删除：设置 deletedAt 时间戳
    await this.prisma.escort.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'inactive',
      },
    });

    return { success: true };
  }

  /**
   * 审核陪诊员
   */
  async review(id: string, action: 'approve' | 'reject', note?: string, adminId?: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { id, deletedAt: null },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    if (escort.status !== 'pending') {
      throw new BadRequestException('只能审核待审核状态的陪诊员');
    }

    const newStatus = action === 'approve' ? 'active' : 'inactive';

    const updated = await this.prisma.$transaction(async (tx) => {
      // 更新陪诊员状态和审核信息
      const updatedEscort = await tx.escort.update({
        where: { id },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewNote: note,
          inactiveReason: action === 'reject' ? note : null,
        },
      });

      // 如果审核通过，自动创建钱包（如果不存在）
      if (action === 'approve') {
        const existingWallet = await tx.escortWallet.findUnique({
          where: { escortId: id },
        });
        if (!existingWallet) {
          await tx.escortWallet.create({
            data: {
              escortId: id,
              balance: 0,
              frozenBalance: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
            },
          });
        }
      }

      return updatedEscort;
    });

    // 发送审核结果通知
    if (updated.userId) {
      try {
        await this.notificationService.send({
          event: action === 'approve' ? 'escort_review_approved' : 'escort_review_rejected',
          recipientId: updated.id,
          recipientType: 'escort',
          data: {
            escortName: updated.name,
            action,
            note: note || (action === 'reject' ? '审核未通过' : ''),
          },
          relatedType: 'escort',
          relatedId: updated.id,
        });
      } catch (error) {
        // 通知发送失败不影响审核流程，只记录日志
        console.error('发送审核通知失败:', error);
      }
    }

    return this.findById(updated.id);
  }

  /**
   * 更新陪诊员状态
   */
  async updateStatus(id: string, status: string, reason?: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { id, deletedAt: null },
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 如果是停用或封禁，需要检查是否有进行中订单
    if (status === 'inactive' || status === 'suspended') {
      const activeOrders = await this.prisma.order.count({
        where: {
          escortId: id,
          status: { in: ['assigned', 'arrived', 'in_progress'] },
        },
      });
      if (activeOrders > 0) {
        throw new BadRequestException(`该陪诊员还有 ${activeOrders} 个进行中的订单，无法停用`);
      }
    }

    return this.prisma.escort.update({
      where: { id },
      data: {
        status,
        inactiveReason: status === 'inactive' || status === 'suspended' ? reason : null,
        workStatus: status !== 'active' ? 'resting' : escort.workStatus,
      },
    });
  }

  /**
   * 更新接单状态
   */
  async updateWorkStatus(id: string, workStatus: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { id, deletedAt: null },  // ✅ 过滤已软删除的记录
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 只有 active 状态的陪诊员才能切换接单状态
    if (escort.status !== 'active') {
      throw new BadRequestException('只有已激活的陪诊员才能切换接单状态');
    }

    return this.prisma.escort.update({
      where: { id },
      data: { workStatus },
    });
  }

  // ============================================
  // 医院关联
  // ============================================

  /**
   * 关联医院
   */
  async associateHospital(escortId: string, dto: AssociateHospitalDto) {
    // 检查陪诊员是否存在
    const escort = await this.prisma.escort.findFirst({
      where: { id: escortId, deletedAt: null },  // ✅ 过滤已软删除的记录
    });

    if (!escort) {
      throw new NotFoundException('陪诊员不存在');
    }

    // 检查医院是否存在
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });

    if (!hospital) {
      throw new NotFoundException('医院不存在');
    }

    // upsert 关联
    return this.prisma.escortHospital.upsert({
      where: {
        escortId_hospitalId: {
          escortId,
          hospitalId: dto.hospitalId,
        },
      },
      create: {
        escortId,
        hospitalId: dto.hospitalId,
        familiarDepts: dto.familiarDepts ? JSON.stringify(dto.familiarDepts) : null,
      },
      update: {
        familiarDepts: dto.familiarDepts ? JSON.stringify(dto.familiarDepts) : null,
      },
    });
  }

  /**
   * 解除医院关联
   */
  async dissociateHospital(escortId: string, hospitalId: string) {
    return this.prisma.escortHospital.delete({
      where: {
        escortId_hospitalId: {
          escortId,
          hospitalId,
        },
      },
    }).catch(() => {
      throw new NotFoundException('未找到该关联');
    });
  }

  /**
   * 批量更新医院关联
   */
  async updateHospitals(escortId: string, hospitalIds: string[], familiarDeptsMap?: Record<string, string[]>) {
    // 删除现有关联
    await this.prisma.escortHospital.deleteMany({
      where: { escortId },
    });

    // 创建新关联
    if (hospitalIds.length > 0) {
      await this.prisma.escortHospital.createMany({
        data: hospitalIds.map((hospitalId) => ({
          escortId,
          hospitalId,
          familiarDepts: familiarDeptsMap?.[hospitalId]
            ? JSON.stringify(familiarDeptsMap[hospitalId])
            : null,
        })),
      });
    }

    return this.findById(escortId);
  }

  // ============================================
  // 等级管理
  // ============================================

  /**
   * 检查并升级陪诊员等级
   * 根据经验、订单数、评分自动检测是否满足升级条件
   */
  async checkAndUpgradeLevel(escortId: string): Promise<boolean> {
    const escort = await this.prisma.escort.findUnique({
      where: { id: escortId },
      include: { level: true },
    });

    if (!escort) {
      return false;
    }

    // 获取所有激活的等级，按 sort 降序（从高到低）
    const levels = await this.prisma.escortLevel.findMany({
      where: { status: 'active' },
      orderBy: { sort: 'desc' },
    });

    if (levels.length === 0) {
      return false;
    }

    // 计算从业月数（从创建时间开始）
    const now = new Date();
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
            where: { id: escortId },
            data: { levelCode: level.code },
          });

          // 发送升级通知
          if (escort.userId) {
            try {
              await this.notificationService.send({
                event: 'escort_level_upgraded',
                recipientId: escortId,
                recipientType: 'escort',
                data: {
                  escortName: escort.name,
                  levelName: level.name,
                  levelCode: level.code,
                },
                relatedType: 'escort',
                relatedId: escortId,
              });
            } catch (error) {
              console.error('发送升级通知失败:', error);
            }
          }

          return true;
        }
        // 已经是最适合的等级，无需升级
        break;
      }
    }

    return false;
  }

  // ============================================
  // 统计
  // ============================================

  /**
   * 获取陪诊员统计数据
   */
  async getStats() {
    // ✅ 过滤已软删除的记录
    const [total, active, working, busy, pending] = await Promise.all([
      this.prisma.escort.count({ where: { deletedAt: null } }),
      this.prisma.escort.count({ where: { deletedAt: null, status: 'active' } }),
      this.prisma.escort.count({ where: { deletedAt: null, status: 'active', workStatus: 'working' } }),
      this.prisma.escort.count({ where: { deletedAt: null, status: 'active', workStatus: 'busy' } }),
      this.prisma.escort.count({ where: { deletedAt: null, status: 'pending' } }),
    ]);

    return {
      total,
      active,
      working,
      busy,
      pending,
      inactive: total - active - pending,
    };
  }
}
