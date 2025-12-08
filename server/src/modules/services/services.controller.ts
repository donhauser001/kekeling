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
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, QueryServiceDto } from './dto/service.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('服务')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  @ApiOperation({ summary: '获取服务分类列表（兼容旧接口）' })
  async getCategories() {
    const data = await this.servicesService.getCategories();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取服务列表' })
  async findAll(@Query() query: QueryServiceDto) {
    const result = await this.servicesService.findAll(query);
    return ApiResponse.success(result);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门服务' })
  @ApiQuery({ name: 'limit', required: false, description: '获取数量' })
  async getHotServices(@Query('limit') limit?: number) {
    const data = await this.servicesService.getHotServices(
      limit ? Number(limit) : 6,
    );
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务详情' })
  @ApiParam({ name: 'id', description: '服务ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.servicesService.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建服务' })
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.servicesService.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新服务' })
  @ApiParam({ name: 'id', description: '服务ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const data = await this.servicesService.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除服务' })
  @ApiParam({ name: 'id', description: '服务ID' })
  async remove(@Param('id') id: string) {
    await this.servicesService.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Put('batch/status')
  @ApiOperation({ summary: '批量更新服务状态' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        status: { type: 'string', enum: ['active', 'inactive', 'draft'] },
      },
    },
  })
  async batchUpdateStatus(
    @Body() body: { ids: string[]; status: 'active' | 'inactive' | 'draft' },
  ) {
    const result = await this.servicesService.batchUpdateStatus(
      body.ids,
      body.status,
    );
    return ApiResponse.success(result);
  }
}
