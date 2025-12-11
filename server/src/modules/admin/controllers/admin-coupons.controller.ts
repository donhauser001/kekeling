import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CouponsService } from '../../coupons/coupons.service';
import {
  CreateCouponTemplateDto,
  UpdateCouponTemplateDto,
  CreateCouponGrantRuleDto,
  BatchGrantCouponDto,
} from '../../coupons/dto/coupon.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-优惠券管理')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // ========== 模板管理 ==========

  @Get('templates')
  @ApiOperation({ summary: '获取优惠券模板列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getTemplates(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.couponsService.getTemplates({
      status,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('templates')
  @ApiOperation({ summary: '创建优惠券模板' })
  async createTemplate(@Body() dto: CreateCouponTemplateDto) {
    const data = await this.couponsService.createTemplate(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('templates/:id')
  @ApiOperation({ summary: '更新优惠券模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateCouponTemplateDto,
  ) {
    const data = await this.couponsService.updateTemplate(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: '删除优惠券模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  async deleteTemplate(@Param('id') id: string) {
    await this.couponsService.deleteTemplate(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ========== 批量发放 ==========

  @Post('batch-grant')
  @ApiOperation({ summary: '批量发放优惠券' })
  async batchGrant(@Body() dto: BatchGrantCouponDto) {
    const result = await this.couponsService.batchGrant(dto);
    return ApiResponse.success(result, '发放成功');
  }

  // ========== 发放规则 ==========

  @Get('grant-rules')
  @ApiOperation({ summary: '获取发放规则列表' })
  @ApiQuery({ name: 'templateId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getGrantRules(
    @Query('templateId') templateId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.couponsService.getGrantRules({
      templateId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('grant-rules')
  @ApiOperation({ summary: '创建发放规则' })
  async createGrantRule(@Body() dto: CreateCouponGrantRuleDto) {
    const data = await this.couponsService.createGrantRule(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('grant-rules/:id')
  @ApiOperation({ summary: '更新发放规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async updateGrantRule(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCouponGrantRuleDto>,
  ) {
    const data = await this.couponsService.updateGrantRule(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('grant-rules/:id')
  @ApiOperation({ summary: '删除发放规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async deleteGrantRule(@Param('id') id: string) {
    await this.couponsService.deleteGrantRule(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ========== 使用记录 ==========

  @Get('usage-records')
  @ApiOperation({ summary: '获取使用记录' })
  @ApiQuery({ name: 'templateId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getUsageRecords(
    @Query('templateId') templateId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.couponsService.getUsageRecords({
      templateId,
      userId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }
}

