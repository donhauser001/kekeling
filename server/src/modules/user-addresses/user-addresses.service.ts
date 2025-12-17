import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserAddressDto, UpdateUserAddressDto } from './dto/user-address.dto';

@Injectable()
export class UserAddressesService {
  constructor(private prisma: PrismaService) { }

  // 最大地址数量限制
  private readonly MAX_ADDRESSES = 20;

  /**
   * 获取用户所有地址
   */
  async findAll(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  /**
   * 获取单个地址
   */
  async findById(userId: string, id: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    return address;
  }

  /**
   * 获取默认地址
   */
  async findDefault(userId: string) {
    return this.prisma.userAddress.findFirst({
      where: { userId, isDefault: true },
    });
  }

  /**
   * 创建地址
   */
  async create(userId: string, dto: CreateUserAddressDto) {
    // 检查地址数量限制
    const count = await this.prisma.userAddress.count({
      where: { userId },
    });

    if (count >= this.MAX_ADDRESSES) {
      throw new BadRequestException(`最多只能保存 ${this.MAX_ADDRESSES} 个地址`);
    }

    // 如果设为默认或者是第一个地址，需要取消其他默认地址
    const shouldSetDefault = dto.isDefault || count === 0;

    if (shouldSetDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        province: dto.province,
        city: dto.city,
        district: dto.district,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        tag: dto.tag,
        isDefault: shouldSetDefault,
      },
    });
  }

  /**
   * 更新地址
   */
  async update(userId: string, id: string, dto: UpdateUserAddressDto) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('地址不存在');
    }

    // 如果设为默认地址，取消其他默认地址
    if (dto.isDefault && !existing.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除地址
   */
  async remove(userId: string, id: string) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('地址不存在');
    }

    await this.prisma.userAddress.delete({
      where: { id },
    });

    // 如果删除的是默认地址，将最新的地址设为默认
    if (existing.isDefault) {
      const latestAddress = await this.prisma.userAddress.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (latestAddress) {
        await this.prisma.userAddress.update({
          where: { id: latestAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  /**
   * 设为默认地址
   */
  async setDefault(userId: string, id: string) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('地址不存在');
    }

    // 取消其他默认地址
    await this.prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // 设置当前地址为默认
    return this.prisma.userAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
