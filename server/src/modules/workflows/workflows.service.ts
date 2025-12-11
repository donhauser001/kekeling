import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  QueryWorkflowDto,
  UpdateWorkflowStatusDto,
} from './dto/workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) { }

  // 创建流程
  async create(dto: CreateWorkflowDto) {
    const { steps, ...data } = dto;

    return this.prisma.workflow.create({
      data: {
        ...data,
        steps: steps
          ? {
            create: steps.map((step, index) => ({
              name: step.name,
              description: step.description,
              type: step.type,
              sort: step.sort ?? index,
            })),
          }
          : undefined,
      },
      include: {
        steps: {
          orderBy: { sort: 'asc' },
        },
      },
    });
  }

  // 查询流程列表
  async findAll(query: QueryWorkflowDto) {
    const { category, keyword, status, page = 1, pageSize = 10 } = query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          steps: {
            orderBy: { sort: 'asc' },
          },
          _count: {
            select: { services: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // 获取流程详情
  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { sort: 'asc' },
        },
        services: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('流程不存在');
    }

    return workflow;
  }

  // 获取启用的流程（用于下拉选择）
  async findActive() {
    return this.prisma.workflow.findMany({
      where: { status: 'active' },
      include: {
        steps: {
          orderBy: { sort: 'asc' },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  // 更新流程
  async update(id: string, dto: UpdateWorkflowDto) {
    const { steps, ...data } = dto;

    // 检查流程是否存在
    await this.findOne(id);

    // 如果有步骤更新，先删除旧的再创建新的
    if (steps) {
      await this.prisma.workflowStep.deleteMany({
        where: { workflowId: id },
      });
    }

    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...data,
        steps: steps
          ? {
            create: steps.map((step, index) => ({
              name: step.name,
              description: step.description,
              type: step.type,
              sort: step.sort ?? index,
            })),
          }
          : undefined,
      },
      include: {
        steps: {
          orderBy: { sort: 'asc' },
        },
      },
    });
  }

  // 更新状态
  async updateStatus(id: string, dto: UpdateWorkflowStatusDto) {
    await this.findOne(id);

    return this.prisma.workflow.update({
      where: { id },
      data: { status: dto.status },
      include: {
        steps: {
          orderBy: { sort: 'asc' },
        },
      },
    });
  }

  // 删除流程
  async remove(id: string) {
    await this.findOne(id);

    // 先解除服务关联
    await this.prisma.service.updateMany({
      where: { workflowId: id },
      data: { workflowId: null },
    });

    // 删除流程（步骤会级联删除）
    await this.prisma.workflow.delete({
      where: { id },
    });

    return { success: true };
  }

  // 获取分类列表
  async getCategories() {
    const categories = await this.prisma.workflow.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.id,
    }));
  }
}
