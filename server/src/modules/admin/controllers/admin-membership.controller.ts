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
import { MembershipService } from '../../membership/membership.service';
import {
  CreateMembershipLevelDto,
  UpdateMembershipLevelDto,
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  CreateConsumeUpgradeRuleDto,
  GrantMembershipDto,
} from '../../membership/dto/membership.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-会员管理')
@Controller('admin/membership')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminMembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // ========== 等级管理 ==========

  @Get('levels')
  @ApiOperation({ summary: '获取等级列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getLevels(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.membershipService.getLevelsForAdmin({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('levels')
  @ApiOperation({ summary: '创建等级' })
  async createLevel(@Body() dto: CreateMembershipLevelDto) {
    const data = await this.membershipService.createLevel(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('levels/:id')
  @ApiOperation({ summary: '更新等级' })
  @ApiParam({ name: 'id', description: '等级ID' })
  async updateLevel(
    @Param('id') id: string,
    @Body() dto: UpdateMembershipLevelDto,
  ) {
    const data = await this.membershipService.updateLevel(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('levels/:id')
  @ApiOperation({ summary: '删除等级' })
  @ApiParam({ name: 'id', description: '等级ID' })
  async deleteLevel(@Param('id') id: string) {
    await this.membershipService.deleteLevel(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ========== 套餐管理 ==========

  @Get('plans')
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiQuery({ name: 'levelId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPlans(
    @Query('levelId') levelId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.membershipService.getPlansForAdmin({
      levelId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('plans')
  @ApiOperation({ summary: '创建套餐' })
  async createPlan(@Body() dto: CreateMembershipPlanDto) {
    const data = await this.membershipService.createPlan(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('plans/:id')
  @ApiOperation({ summary: '更新套餐' })
  @ApiParam({ name: 'id', description: '套餐ID' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateMembershipPlanDto,
  ) {
    const data = await this.membershipService.updatePlan(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: '删除套餐' })
  @ApiParam({ name: 'id', description: '套餐ID' })
  async deletePlan(@Param('id') id: string) {
    await this.membershipService.deletePlan(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ========== 会员用户管理 ==========

  @Get('users')
  @ApiOperation({ summary: '获取会员用户列表' })
  @ApiQuery({ name: 'levelId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getMembershipUsers(
    @Query('levelId') levelId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.membershipService.getMembershipUsers({
      levelId,
      status,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('grant')
  @ApiOperation({ summary: '手动发放会员' })
  async grantMembership(@Body() dto: GrantMembershipDto) {
    const data = await this.membershipService.grantMembership(dto);
    return ApiResponse.success(data, '发放成功');
  }

  // ========== 消费升级规则 ==========

  @Get('upgrade-rules')
  @ApiOperation({ summary: '获取消费升级规则列表' })
  @ApiQuery({ name: 'levelId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getUpgradeRules(
    @Query('levelId') levelId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.membershipService.getUpgradeRules({
      levelId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('upgrade-rules')
  @ApiOperation({ summary: '创建消费升级规则' })
  async createUpgradeRule(@Body() dto: CreateConsumeUpgradeRuleDto) {
    const data = await this.membershipService.createUpgradeRule(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('upgrade-rules/:id')
  @ApiOperation({ summary: '更新消费升级规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async updateUpgradeRule(
    @Param('id') id: string,
    @Body() dto: Partial<CreateConsumeUpgradeRuleDto>,
  ) {
    const data = await this.membershipService.updateUpgradeRule(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('upgrade-rules/:id')
  @ApiOperation({ summary: '删除消费升级规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async deleteUpgradeRule(@Param('id') id: string) {
    await this.membershipService.deleteUpgradeRule(id);
    return ApiResponse.success(null, '删除成功');
  }
}

