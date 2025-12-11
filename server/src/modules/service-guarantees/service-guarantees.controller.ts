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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceGuaranteesService } from './service-guarantees.service';
import {
  CreateServiceGuaranteeDto,
  UpdateServiceGuaranteeDto,
  QueryServiceGuaranteeDto,
} from './dto/service-guarantee.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('服务保障')
@Controller('service-guarantees')
export class ServiceGuaranteesController {
  constructor(private readonly service: ServiceGuaranteesService) { }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的服务保障（用于下拉选择）' })
  async findAllActive() {
    const data = await this.service.findAllActive();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取服务保障列表' })
  async findAll(@Query() query: QueryServiceGuaranteeDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务保障详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建服务保障' })
  async create(@Body() dto: CreateServiceGuaranteeDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新服务保障' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceGuaranteeDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除服务保障' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}
