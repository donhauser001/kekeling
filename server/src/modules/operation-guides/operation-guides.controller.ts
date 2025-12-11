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
import { OperationGuidesService } from './operation-guides.service';
import {
  CreateOperationGuideDto,
  UpdateOperationGuideDto,
  QueryOperationGuideDto,
} from './dto/operation-guide.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('操作规范')
@Controller('operation-guides')
export class OperationGuidesController {
  constructor(private readonly service: OperationGuidesService) { }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的操作规范（用于下拉选择）' })
  async findAllActive() {
    const data = await this.service.findAllActive();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取操作规范列表' })
  async findAll(@Query() query: QueryOperationGuideDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取操作规范详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建操作规范' })
  async create(@Body() dto: CreateOperationGuideDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put('batch-status')
  @ApiOperation({ summary: '批量更新状态' })
  async batchUpdateStatus(
    @Body() body: { ids: string[]; status: 'active' | 'inactive' | 'draft' },
  ) {
    const data = await this.service.batchUpdateStatus(body.ids, body.status);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新操作规范' })
  async update(@Param('id') id: string, @Body() dto: UpdateOperationGuideDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除操作规范' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}
