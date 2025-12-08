import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByOpenid(openid: string) {
    return this.prisma.user.findUnique({
      where: { openid },
    });
  }

  async updateProfile(id: string, data: { nickname?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}

