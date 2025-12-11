import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReferralsService } from '../../referrals/referrals.service';
import { ApiResponse } from '../../../common/response/api-response';
import {
  CreateReferralRuleDto,
  UpdateReferralRuleDto,
} from '../../referrals/dto/referral.dto';

@ApiTags('管理端-邀请系统')
@ApiBearerAuth()
@Controller('admin/referrals')
export class AdminReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // --- 邀请规则管理 ---
  @Post('rules')
  @ApiOperation({ summary: '创建邀请规则' })
  async createRule(@Body() dto: CreateReferralRuleDto) {
    const data = await this.referralsService.createReferralRule(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Get('rules')
  @ApiOperation({ summary: '获取邀请规则列表' })
  async getRules(
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.referralsService.getReferralRules({
      type,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return ApiResponse.success(data);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '更新邀请规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateReferralRuleDto,
  ) {
    const data = await this.referralsService.updateReferralRule(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除邀请规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async deleteRule(@Param('id') id: string) {
    await this.referralsService.deleteReferralRule(id);
    return ApiResponse.success(null, '删除成功');
  }

  // --- 邀请记录管理 ---
  @Get('records')
  @ApiOperation({ summary: '获取邀请记录列表' })
  async getRecords(
    @Query('inviterId') inviterId?: string,
    @Query('inviteeId') inviteeId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.referralsService.getReferralRecordsForAdmin({
      inviterId,
      inviteeId,
      type,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return ApiResponse.success(data);
  }

  @Post('records/:id/mark-suspicious')
  @ApiOperation({ summary: '标记可疑记录' })
  @ApiParam({ name: 'id', description: '记录ID' })
  async markSuspicious(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const data = await this.referralsService.markSuspicious(id, reason);
    return ApiResponse.success(data, '已标记为可疑');
  }
}

