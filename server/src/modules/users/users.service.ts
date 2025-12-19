import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        escort: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!user) return null;

    // 添加陪诊员状态标识
    return {
      ...user,
      isEscort: !!user.escort && user.escort.status === 'active',
      escortId: user.escort?.id ?? null,
    };
  }

  async findByOpenid(openid: string) {
    return this.prisma.user.findUnique({
      where: { openid },
    });
  }

  async updateProfile(
    id: string,
    data: {
      nickname?: string;
      avatar?: string;
      gender?: string;
      birthday?: Date;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}

