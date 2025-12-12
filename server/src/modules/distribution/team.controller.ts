import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamService } from './team.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('陪诊员-团队')
@Controller('escort/team')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(
    private teamService: TeamService,
    private prisma: PrismaService,
  ) { }

  @Get('members')
  @ApiOperation({ summary: '获取团队成员列表' })
  async getTeamMembers(@Request() req, @Query() query: PaginationDto) {
    const escort = await this.getEscortByUserId(req.user.sub);
    return this.teamService.getTeamMembers(escort.id, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: '获取团队统计数据' })
  async getTeamStats(@Request() req) {
    const escort = await this.getEscortByUserId(req.user.sub);
    return this.teamService.getTeamStats(escort.id);
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
