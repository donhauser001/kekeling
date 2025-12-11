import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { ApiResponse } from '../../common/response/api-response';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitePatientDto } from './dto/referral.dto';

@ApiTags('邀请系统')
@Controller('referrals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ReferralsController {
    constructor(private readonly referralsService: ReferralsService) { }

    @Get('invite-code')
    @ApiOperation({ summary: '获取我的邀请码' })
    async getInviteCode(@CurrentUser('sub') userId: string) {
        const data = await this.referralsService.getOrCreateInviteCode(userId);
        return ApiResponse.success(data);
    }

    @Get('stats')
    @ApiOperation({ summary: '获取邀请统计' })
    async getStats(@CurrentUser('sub') userId: string) {
        const data = await this.referralsService.getReferralStats(userId);
        return ApiResponse.success(data);
    }

    @Get('records')
    @ApiOperation({ summary: '获取邀请记录列表' })
    async getRecords(
        @CurrentUser('sub') userId: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        const data = await this.referralsService.getReferralRecords(userId, {
            type,
            status,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        return ApiResponse.success(data);
    }

    @Post('invite-patient')
    @ApiOperation({ summary: '邀请就诊人注册' })
    async invitePatient(
        @CurrentUser('sub') userId: string,
        @Body() dto: InvitePatientDto,
    ) {
        const data = await this.referralsService.invitePatient(userId, dto);
        return ApiResponse.success(data, '邀请已发送');
    }

    @Get('link')
    @ApiOperation({ summary: '获取邀请链接' })
    async getInviteLink(@CurrentUser('sub') userId: string) {
        const data = await this.referralsService.generateInviteLink(userId);
        return ApiResponse.success(data);
    }

    @Get('poster')
    @ApiOperation({ summary: '生成邀请海报' })
    async getInvitePoster(@CurrentUser('sub') userId: string) {
        const data = await this.referralsService.generateInvitePoster(userId);
        return ApiResponse.success(data);
    }
}

