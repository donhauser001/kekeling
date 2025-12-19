import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEscortApplicationDto } from './dto/create-application.dto';
import { ReviewAction, QueryApplicationsDto } from './dto/review-application.dto';

@Injectable()
export class EscortApplyService {
  private readonly logger = new Logger(EscortApplyService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * 提交陪诊员申请
   */
  async createApplication(userId: string, dto: CreateEscortApplicationDto) {
    // 1. 检查用户是否已是陪诊员
    const existingEscort = await this.prisma.escort.findFirst({
      where: { userId },
    });

    if (existingEscort) {
      throw new ConflictException('您已经是陪诊员，无需重复申请');
    }

    // 2. 检查是否有待审核的申请
    const pendingApplication = await this.prisma.escortApplication.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (pendingApplication) {
      throw new ConflictException('您已有待审核的申请，请耐心等待');
    }

    // 3. 检查手机号是否已被其他陪诊员使用
    const phoneUsed = await this.prisma.escort.findUnique({
      where: { phone: dto.phone },
    });

    if (phoneUsed) {
      throw new ConflictException('该手机号已被注册为陪诊员');
    }

    // 4. 如果有邀请码，验证并关联邀请人
    let inviterId: string | null = null;
    if (dto.inviteCode) {
      const inviter = await this.prisma.escort.findUnique({
        where: { inviteCode: dto.inviteCode },
        select: { id: true, name: true, status: true },
      });

      if (!inviter) {
        throw new BadRequestException('邀请码无效');
      }

      if (inviter.status !== 'active') {
        throw new BadRequestException('邀请人账号状态异常，无法使用此邀请码');
      }

      inviterId = inviter.id;
    }

    // 5. 创建申请记录
    const application = await this.prisma.escortApplication.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        idCard: dto.idCard,
        avatar: dto.avatar,
        gender: dto.gender,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        inviteCode: dto.inviteCode,
        inviterId,
        status: 'pending',
      },
    });

    this.logger.log(`新陪诊员申请: ${application.id} (${dto.name})`);

    return {
      id: application.id,
      status: application.status,
      message: '申请已提交，请等待审核',
    };
  }

  /**
   * 查询用户的申请状态
   */
  async getMyApplication(userId: string) {
    // 优先返回最近的申请
    const application = await this.prisma.escortApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        inviter: {
          select: { id: true, name: true },
        },
      },
    });

    if (!application) {
      return null;
    }

    return {
      id: application.id,
      name: application.name,
      phone: application.phone,
      avatar: application.avatar,
      gender: application.gender,
      status: application.status,
      rejectReason: application.rejectReason,
      inviter: application.inviter
        ? { id: application.inviter.id, name: application.inviter.name }
        : null,
      createdAt: application.createdAt,
      reviewedAt: application.reviewedAt,
    };
  }

  /**
   * 验证邀请码
   */
  async validateInviteCode(code: string) {
    const escort = await this.prisma.escort.findUnique({
      where: { inviteCode: code },
      select: { id: true, name: true, avatar: true, status: true },
    });

    if (!escort) {
      return { valid: false, message: '邀请码无效' };
    }

    if (escort.status !== 'active') {
      return { valid: false, message: '邀请人账号状态异常' };
    }

    return {
      valid: true,
      inviter: {
        id: escort.id,
        name: escort.name,
        avatar: escort.avatar,
      },
    };
  }

  /**
   * 获取申请列表（管理端）
   */
  async getApplications(query: QueryApplicationsDto) {
    const { status, keyword, page = 1, pageSize = 10 } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.escortApplication.count({ where }),
      this.prisma.escortApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
          inviter: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取申请详情（管理端）
   */
  async getApplicationDetail(id: string) {
    const application = await this.prisma.escortApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true, phone: true },
        },
        inviter: {
          select: { id: true, name: true, phone: true },
        },
        escort: {
          select: { id: true, name: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    return application;
  }

  /**
   * 审核申请
   */
  async reviewApplication(
    id: string,
    action: ReviewAction,
    reviewerId: string,
    rejectReason?: string,
  ) {
    const application = await this.prisma.escortApplication.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            distributionLevel: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('该申请已处理，无法重复审核');
    }

    if (action === ReviewAction.REJECT) {
      if (!rejectReason) {
        throw new BadRequestException('驳回时必须填写原因');
      }

      // 驳回申请
      await this.prisma.escortApplication.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectReason,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      this.logger.log(`陪诊员申请被驳回: ${id} (${application.name})`);

      return { message: '申请已驳回' };
    }

    // 审核通过：创建陪诊员记录
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 创建陪诊员记录
      const escort = await tx.escort.create({
        data: {
          userId: application.userId,
          name: application.name,
          phone: application.phone,
          idCard: application.idCard,
          avatar: application.avatar,
          gender: application.gender,
          emergencyContact: application.emergencyContact,
          emergencyPhone: application.emergencyPhone,
          status: 'active',
          workStatus: 'resting',
          // 如果有邀请人，建立分销关系
          parentId: application.inviterId,
          // 生成邀请码
          inviteCode: this.generateInviteCode(),
        },
      });

      // 2. 更新申请状态
      await tx.escortApplication.update({
        where: { id },
        data: {
          status: 'approved',
          escortId: escort.id,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // 3. 如果有邀请人，创建邀请记录
      if (application.inviterId && application.inviter) {
        await tx.escortInvitation.create({
          data: {
            inviterId: application.inviterId,
            inviterLevel: application.inviter.distributionLevel,
            inviteeId: escort.id,
            inviteCode: application.inviteCode!,
            status: 'active',
            activatedAt: new Date(),
          },
        });

        // 更新邀请人的团队统计
        await tx.escort.update({
          where: { id: application.inviterId },
          data: {
            teamSize: { increment: 1 },
            totalTeamSize: { increment: 1 },
          },
        });
      }

      // 4. 创建陪诊员钱包
      await tx.escortWallet.create({
        data: {
          escortId: escort.id,
        },
      });

      return escort;
    });

    this.logger.log(
      `陪诊员申请通过: ${id} (${application.name}) -> Escort: ${result.id}`,
    );

    return {
      message: '申请已通过',
      escortId: result.id,
    };
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
