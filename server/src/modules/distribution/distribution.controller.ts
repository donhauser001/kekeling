import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DistributionService } from './distribution.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@ApiTags('陪诊员-分销')
@Controller('escort/distribution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DistributionController {
  constructor(
    private distributionService: DistributionService,
    private prisma: PrismaService,
  ) { }

  @Get('invite-code')
  @ApiOperation({ summary: '获取/生成邀请码' })
  async getInviteCode(@Request() req) {
    const escort = await this.getEscortByUserId(req.user.sub);
    return {
      inviteCode: await this.distributionService.generateInviteCode(escort.id),
    };
  }

  @Post('invite')
  @ApiOperation({ summary: '使用邀请码建立关系' })
  async processInvitation(@Request() req, @Body() body: { inviteCode: string }) {
    const escort = await this.getEscortByUserId(req.user.sub);
    await this.distributionService.processInvitation(escort.id, body.inviteCode);
    return { success: true };
  }

  @Get('records')
  @ApiOperation({ summary: '获取分润记录' })
  async getDistributionRecords(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const escort = await this.getEscortByUserId(req.user.sub);
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 20;

    const where = { beneficiaryId: escort.id };

    const [data, total] = await Promise.all([
      this.prisma.distributionRecord.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNo: true,
              paidAmount: true,
            },
          },
          sourceEscort: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
      this.prisma.distributionRecord.count({ where }),
    ]);

    return {
      data: data.map((record) => ({
        ...record,
        amount: Number(record.amount),
        orderAmount: Number(record.orderAmount),
      })),
      total,
      page: p,
      pageSize: ps,
    };
  }

  private async getEscortByUserId(userId: string) {
    const escort = await this.prisma.escort.findFirst({
      where: { userId },
    });
    if (!escort) {
      throw new NotFoundException('您不是陪诊员');
    }
    return escort;
  }
}
