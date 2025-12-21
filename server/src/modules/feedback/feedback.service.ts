import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFeedbackDto } from './dto/create-feedback.dto'

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) { }

  /**
   * 提交意见反馈
   */
  async create(userId: string | null, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        contact: dto.contact,
        images: dto.images || [],
        status: 'pending',
      },
    })

    return {
      id: feedback.id,
      status: feedback.status,
    }
  }

  /**
   * 获取用户的反馈列表
   */
  async findByUser(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.feedback.count({
        where: { userId },
      }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 获取所有反馈列表（管理员）
   */
  async findAll(params: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }) {
    const { page = 1, pageSize = 10, type, status } = params
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

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
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 获取单个反馈详情
   */
  async findOne(id: string) {
    return this.prisma.feedback.findUnique({
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
  }

  /**
   * 处理反馈（管理员）
   */
  async handle(
    id: string,
    handlerId: string,
    handlerName: string,
    handleNote: string,
    status: 'processing' | 'resolved' | 'closed',
  ) {
    return this.prisma.feedback.update({
      where: { id },
      data: {
        status,
        handlerId,
        handlerName,
        handleNote,
        handledAt: new Date(),
      },
    })
  }
}

