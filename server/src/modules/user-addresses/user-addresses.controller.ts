import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto, UpdateUserAddressDto } from './dto/user-address.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('用户地址')
@Controller('user/addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserAddressesController {
  constructor(private readonly service: UserAddressesService) { }

  /**
   * 获取当前用户 ID
   * 支持 userToken (req.user.sub) 和 escortToken (req.user.userId)
   */
  private getUserId(req: any): string {
    return req.user.sub || req.user.userId || req.user.user?.id;
  }

  /**
   * 获取我的所有地址
   */
  @Get()
  @ApiOperation({ summary: '获取我的所有地址' })
  async findAll(@Request() req) {
    const userId = this.getUserId(req);
    const data = await this.service.findAll(userId);
    return ApiResponse.success(data);
  }

  /**
   * 获取默认地址
   */
  @Get('default')
  @ApiOperation({ summary: '获取默认地址' })
  async findDefault(@Request() req) {
    const userId = this.getUserId(req);
    const data = await this.service.findDefault(userId);
    return ApiResponse.success(data);
  }

  /**
   * 获取单个地址
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单个地址' })
  async findById(@Request() req, @Param('id') id: string) {
    const userId = this.getUserId(req);
    const data = await this.service.findById(userId, id);
    return ApiResponse.success(data);
  }

  /**
   * 创建地址
   */
  @Post()
  @ApiOperation({ summary: '创建地址' })
  async create(@Request() req, @Body() dto: CreateUserAddressDto) {
    const userId = this.getUserId(req);
    const data = await this.service.create(userId, dto);
    return ApiResponse.success(data, '地址创建成功');
  }

  /**
   * 更新地址
   */
  @Put(':id')
  @ApiOperation({ summary: '更新地址' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserAddressDto
  ) {
    const userId = this.getUserId(req);
    const data = await this.service.update(userId, id, dto);
    return ApiResponse.success(data, '地址更新成功');
  }

  /**
   * 删除地址
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除地址' })
  async remove(@Request() req, @Param('id') id: string) {
    const userId = this.getUserId(req);
    await this.service.remove(userId, id);
    return ApiResponse.success(null, '地址删除成功');
  }

  /**
   * 设为默认地址
   */
  @Post(':id/default')
  @ApiOperation({ summary: '设为默认地址' })
  async setDefault(@Request() req, @Param('id') id: string) {
    const userId = this.getUserId(req);
    const data = await this.service.setDefault(userId, id);
    return ApiResponse.success(data, '已设为默认地址');
  }
}
