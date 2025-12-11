import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  QueryWorkflowDto,
  UpdateWorkflowStatusDto,
} from './dto/workflow.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('流程管理')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) { }

  @Post()
  @ApiOperation({ summary: '创建流程' })
  async create(@Body() dto: CreateWorkflowDto) {
    const data = await this.workflowsService.create(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Get()
  @ApiOperation({ summary: '获取流程列表' })
  async findAll(@Query() query: QueryWorkflowDto) {
    const data = await this.workflowsService.findAll(query);
    return ApiResponse.success(data);
  }

  @Get('active')
  @ApiOperation({ summary: '获取启用的流程（用于下拉选择）' })
  async findActive() {
    const data = await this.workflowsService.findActive();
    return ApiResponse.success(data);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取流程分类列表' })
  async getCategories() {
    const data = await this.workflowsService.getCategories();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取流程详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.workflowsService.findOne(id);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新流程' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    const data = await this.workflowsService.update(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新流程状态' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowStatusDto,
  ) {
    const data = await this.workflowsService.updateStatus(id, dto);
    return ApiResponse.success(data, '状态更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除流程' })
  async remove(@Param('id') id: string) {
    const data = await this.workflowsService.remove(id);
    return ApiResponse.success(data, '删除成功');
  }
}
