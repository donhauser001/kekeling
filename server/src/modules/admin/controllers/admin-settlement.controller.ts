/**
 * 结算配置管理 API
 */

import { Controller, Get, Put, Body, Logger , UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AdminSettlementService, UpdateSettlementConfigDto } from '../services/admin-settlement.service';
import { ApiResponse } from '../../../common/response/api-response';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('管理端-结算配置')
@UseGuards(AdminGuard)
@Controller('admin/settlement')
export class AdminSettlementController {
    private readonly logger = new Logger(AdminSettlementController.name);

    constructor(private readonly settlementService: AdminSettlementService) { }

    @Get('config')
    @ApiOperation({ summary: '获取结算配置' })
    async getConfig() {
        const config = await this.settlementService.getConfig();
        return ApiResponse.success(config);
    }

    @Put('config')
    @ApiOperation({ summary: '更新结算配置' })
    @ApiBody({ description: '结算配置' })
    async updateConfig(@Body() dto: UpdateSettlementConfigDto) {
        const config = await this.settlementService.updateConfig(dto);
        return ApiResponse.success(config, '配置已更新');
    }

    @Get('pending-unfreeze')
    @ApiOperation({ summary: '获取待解冻的资金统计' })
    async getPendingUnfreeze() {
        const stats = await this.settlementService.getPendingUnfreezeStats();
        return ApiResponse.success(stats);
    }
}

