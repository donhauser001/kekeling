import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/response/api-response';
import { CommissionService } from '../../escort-app/commission.service';

class UpdateCommissionConfigDto {
  defaultRate?: number;
  minWithdrawAmount?: number;
  withdrawFeeRate?: number;
  withdrawFeeFixed?: number;
  settlementMode?: string;
  withdrawDaysOfWeek?: number[];
  withdrawTimeRange?: { start: string; end: string };
}

@ApiTags('管理后台 - 分成配置')
@Controller('admin/commission')
export class AdminCommissionController {
  constructor(private readonly commissionService: CommissionService) { }

  @Get('config')
  @ApiOperation({ summary: '获取分成配置' })
  async getConfig() {
    const data = await this.commissionService.getGlobalConfig();
    return ApiResponse.success(data);
  }

  @Put('config')
  @ApiOperation({ summary: '更新分成配置' })
  async updateConfig(@Body() dto: UpdateCommissionConfigDto) {
    const data = await this.commissionService.updateGlobalConfig(dto);
    return ApiResponse.success(data, '配置更新成功');
  }
}
