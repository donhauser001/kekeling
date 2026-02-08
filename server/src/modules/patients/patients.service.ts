import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  // 获取用户的就诊人列表
  async findByUser(userId: string) {
    return this.prisma.patient.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // 创建就诊人
  async create(userId: string, dto: CreatePatientDto) {
    // 如果设为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.patient.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 转换 birthday 为 ISO-8601 DateTime 格式
    const data = { ...dto };
    if (data.birthday && typeof data.birthday === 'string') {
      // 如果是 YYYY-MM-DD 格式，转换为完整的 ISO DateTime
      if (/^\d{4}-\d{2}-\d{2}$/.test(data.birthday)) {
        data.birthday = new Date(data.birthday + 'T00:00:00.000Z').toISOString();
      }
    }

    return this.prisma.patient.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  // 更新就诊人
  async update(id: string, userId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, userId },
    });

    if (!patient) {
      throw new BadRequestException('就诊人不存在');
    }

    // 如果设为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.patient.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // 转换 birthday 为 ISO-8601 DateTime 格式
    const data = { ...dto };
    if (data.birthday && typeof data.birthday === 'string') {
      // 如果是 YYYY-MM-DD 格式，转换为完整的 ISO DateTime
      if (/^\d{4}-\d{2}-\d{2}$/.test(data.birthday)) {
        data.birthday = new Date(data.birthday + 'T00:00:00.000Z').toISOString();
      }
    }

    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  // 删除就诊人
  async delete(id: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, userId },
    });

    if (!patient) {
      throw new BadRequestException('就诊人不存在');
    }

    // 检查是否有关联订单
    const orderCount = await this.prisma.order.count({
      where: { patientId: id },
    });

    if (orderCount > 0) {
      throw new BadRequestException('该就诊人已有订单记录，无法删除');
    }

    return this.prisma.patient.delete({
      where: { id },
    });
  }

  // 设为默认
  async setDefault(id: string, userId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, userId },
    });

    if (!patient) {
      throw new BadRequestException('就诊人不存在');
    }

    // 取消其他默认
    await this.prisma.patient.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.patient.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}

