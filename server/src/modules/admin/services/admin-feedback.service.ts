import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

export interface HandleFeedbackDto {
  status: 'processing' | 'resolved' | 'closed'
  handleNote: string
}

@Injectable()
export class AdminFeedbackService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取反馈列表
   */
  async findAll(params: {
    status?: string
    type?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) {
    const { status, type, startDate, endDate, page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.feedback.count({ where }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        typeLabel: this.getTypeLabel(item.type),
        statusLabel: this.getStatusLabel(item.status),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 获取反馈统计
   */
  async getStats() {
    const [total, pending, processing, resolved, closed] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.count({ where: { status: 'pending' } }),
      this.prisma.feedback.count({ where: { status: 'processing' } }),
      this.prisma.feedback.count({ where: { status: 'resolved' } }),
      this.prisma.feedback.count({ where: { status: 'closed' } }),
    ])

    // 按类型统计
    const byType = await this.prisma.feedback.groupBy({
      by: ['type'],
      _count: true,
    })

    return {
      total,
      pending,
      processing,
      resolved,
      closed,
      byType: byType.map((t) => ({
        type: t.type,
        typeLabel: this.getTypeLabel(t.type),
        count: t._count,
      })),
    }
  }

  /**
   * 获取反馈详情
   */
  async findById(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
      },
    })

    if (!feedback) {
      throw new NotFoundException('反馈不存在')
    }

    return {
      ...feedback,
      typeLabel: this.getTypeLabel(feedback.type),
      statusLabel: this.getStatusLabel(feedback.status),
    }
  }

  /**
   * 处理反馈
   */
  async handleFeedback(id: string, dto: HandleFeedbackDto, adminId: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } })
    if (!feedback) {
      throw new NotFoundException('反馈不存在')
    }

    return this.prisma.feedback.update({
      where: { id },
      data: {
        status: dto.status,
        handleNote: dto.handleNote,
        handlerId: adminId,
        handlerName: 'Admin', // TODO: 从管理员信息获取
        handledAt: new Date(),
      },
    })
  }

  /**
   * 获取类型标签
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      suggestion: '功能建议',
      bug: '问题反馈',
      service: '服务相关',
      experience: '体验优化',
      other: '其他',
    }
    return labels[type] || type
  }

  /**
   * 获取状态标签
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    }
    return labels[status] || status
  }
}

