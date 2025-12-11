import { Controller, Post, Get, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminEscortIdentityService } from '../services/admin-escort-identity.service';

@ApiTags('管理端-陪诊员身份管理')
@Controller('admin/escorts')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminEscortIdentityController {
  constructor(private readonly identityService: AdminEscortIdentityService) { }

  @Post(':id/bind')
  @ApiOperation({ summary: '绑定用户到陪诊员' })
  async bindEscort(
    @Param('id') escortId: string,
    @Body() body: { userId: string; reason?: string },
    @Request() req: any,
  ) {
    await this.identityService.bindEscort(escortId, body.userId, req.user.id, body.reason);
    return { success: true, message: '绑定成功' };
  }

  @Post(':id/unbind')
  @ApiOperation({ summary: '解除陪诊员绑定' })
  async unbindEscort(
    @Param('id') escortId: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    await this.identityService.unbindEscort(escortId, req.user.id, body.reason);
    return { success: true, message: '解绑成功' };
  }

  @Get(':id/audit-logs')
  @ApiOperation({ summary: '获取身份变更审计日志' })
  async getAuditLogs(
    @Param('id') escortId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    return this.identityService.getAuditLogs(escortId, parseInt(page), parseInt(pageSize));
  }
}
