/**
 * 测试接口 (仅开发环境使用)
 * 
 * 用于 H5 开发时模拟微信支付等流程
 * 
 * ⚠️ 生产环境应禁用此模块
 */
import { Controller, Post, Param, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('测试接口 (开发环境)')
@Controller('test')
export class TestController {
  constructor(private prisma: PrismaService) {}

  /**
   * 💰 模拟支付成功
   * H5 开发时调用，强制将订单状态改为 paid
   */
  @Post('pay-order/:id')
  @ApiOperation({ summary: '模拟支付订单 (H5调试用)' })
  @ApiParam({ name: 'id', description: '订单ID' })
  async mockPayOrder(@Param('id') id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(`订单状态不是待支付，当前状态: ${order.status}`);
    }

    const now = new Date();
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'paid',
        paymentMethod: 'mock_h5',
        paymentTime: now,
        paidAt: now,
        transactionId: 'MOCK_' + Date.now(),
      },
    });

    console.log(`🧪 [Test] 模拟支付成功: ${order.orderNo}`);

    return ApiResponse.success(updatedOrder, '模拟支付成功');
  }

  /**
   * 🔄 强制更新订单状态
   * H5 开发时调用，可以跳过状态校验
   */
  @Post('update-order-status/:id')
  @ApiOperation({ summary: '强制更新订单状态 (H5调试用)' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({
    schema: {
      properties: {
        status: { type: 'string', enum: ['pending', 'paid', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'] },
      },
    },
  })
  async mockUpdateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    console.log(`🧪 [Test] 订单状态已更新: ${order.orderNo} -> ${status}`);

    return ApiResponse.success(updatedOrder, `订单状态已更新为 ${status}`);
  }

  /**
   * 🔐 模拟微信登录
   * H5 开发时调用，使用 mock code 返回测试用户
   */
  @Post('mock-login')
  @ApiOperation({ summary: '模拟微信登录 (H5调试用)' })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string', description: 'H5 模拟的 code' },
        phone: { type: 'string', description: '测试手机号' },
      },
    },
  })
  async mockLogin(
    @Body('code') code: string,
    @Body('phone') phone?: string,
  ) {
    // 检查是否是 H5 模拟 code
    if (!code?.startsWith('h5_dev_code_')) {
      throw new BadRequestException('无效的测试 code');
    }

    const testPhone = phone || '13800138000';

    // 查找或创建测试用户
    let user = await this.prisma.user.findUnique({
      where: { phone: testPhone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid: 'test_openid_' + Date.now(),
          phone: testPhone,
          nickname: '测试用户',
        },
      });
      console.log(`🧪 [Test] 创建测试用户: ${testPhone}`);
    }

    // 生成 mock token
    const token = 'mock_token_' + user.id + '_' + Date.now();

    console.log(`🧪 [Test] 模拟登录成功: ${testPhone}`);

    return ApiResponse.success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar,
      },
    }, '模拟登录成功');
  }

  /**
   * 👤 获取测试用户列表
   */
  @Get('users')
  @ApiOperation({ summary: '获取测试用户列表 (H5调试用)' })
  async getTestUsers(@Query('limit') limit?: number) {
    const users = await this.prisma.user.findMany({
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nickname: true,
        phone: true,
        openid: true,
        createdAt: true,
      },
    });

    return ApiResponse.success(users);
  }

  /**
   * 👨‍⚕️ 获取测试陪诊员列表
   */
  @Get('escorts')
  @ApiOperation({ summary: '获取测试陪诊员列表 (H5调试用)' })
  async getTestEscorts(@Query('limit') limit?: number) {
    const escorts = await this.prisma.escort.findMany({
      where: { deletedAt: null },
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        level: true,
        status: true,
        workStatus: true,
      },
    });

    return ApiResponse.success(escorts);
  }

  /**
   * 📋 快速创建测试订单
   */
  @Post('quick-order')
  @ApiOperation({ summary: '快速创建测试订单 (H5调试用)' })
  @ApiBody({
    schema: {
      properties: {
        serviceId: { type: 'string' },
        hospitalId: { type: 'string' },
        userId: { type: 'string' },
        status: { type: 'string', default: 'pending' },
      },
    },
  })
  async createQuickOrder(
    @Body() body: {
      serviceId?: string;
      hospitalId?: string;
      userId?: string;
      status?: string;
    },
  ) {
    // 获取默认数据
    const service = body.serviceId
      ? await this.prisma.service.findUnique({ where: { id: body.serviceId } })
      : await this.prisma.service.findFirst({ where: { status: 'active' } });

    const hospital = body.hospitalId
      ? await this.prisma.hospital.findUnique({ where: { id: body.hospitalId } })
      : await this.prisma.hospital.findFirst({ where: { status: 'active' } });

    const user = body.userId
      ? await this.prisma.user.findUnique({ where: { id: body.userId } })
      : await this.prisma.user.findFirst();

    if (!service || !hospital || !user) {
      throw new BadRequestException('缺少必要数据，请先 seed 数据库');
    }

    // 查找或创建测试就诊人
    let patient = await this.prisma.patient.findFirst({
      where: { userId: user.id },
    });

    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          userId: user.id,
          name: '测试就诊人',
          gender: 'male',
          birthday: new Date('1990-01-15'),
          phone: user.phone || '13800138000',
          relation: '本人',
        },
      });
    }

    // 生成订单号
    const orderNo = 'KKL' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.random().toString().slice(2, 8);

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        orderNo,
        userId: user.id,
        patientId: patient.id,
        serviceId: service.id,
        hospitalId: hospital.id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
        appointmentTime: '09:00-10:00',
        totalAmount: service.price,
        paidAmount: body.status === 'paid' ? service.price : 0,
        status: body.status || 'pending',
        paymentMethod: body.status === 'paid' ? 'mock_h5' : null,
        paymentTime: body.status === 'paid' ? new Date() : null,
      },
      include: {
        service: true,
        hospital: true,
        patient: true,
      },
    });

    console.log(`🧪 [Test] 创建测试订单: ${orderNo}`);

    return ApiResponse.success({
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
    }, '测试订单创建成功');
  }

  /**
   * 🗑️ 清理测试数据
   * ⚠️ 危险操作，仅清理 mock 开头的数据
   */
  @Post('cleanup')
  @ApiOperation({ summary: '清理测试数据 (危险操作)' })
  @ApiBody({
    schema: {
      properties: {
        confirm: { type: 'boolean', description: '确认清理' },
      },
    },
  })
  async cleanup(@Body('confirm') confirm: boolean) {
    if (!confirm) {
      throw new BadRequestException('请传入 confirm: true 确认清理');
    }

    // 仅删除 mock 支付的订单
    const deletedOrders = await this.prisma.order.deleteMany({
      where: { paymentMethod: 'mock_h5' },
    });

    // 删除测试用户 (openid 以 test_ 开头)
    const deletedUsers = await this.prisma.user.deleteMany({
      where: { openid: { startsWith: 'test_openid_' } },
    });

    console.log(`🧪 [Test] 清理完成: ${deletedOrders.count} 订单, ${deletedUsers.count} 用户`);

    return ApiResponse.success({
      deletedOrders: deletedOrders.count,
      deletedUsers: deletedUsers.count,
    }, '测试数据已清理');
  }

  /**
   * 🏃 模拟陪诊员抢单
   * H5 开发时调用，直接将订单分配给陪诊员
   */
  @Post('assign-escort/:orderId')
  @ApiOperation({ summary: '模拟陪诊员抢单 (H5调试用)' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiBody({
    schema: {
      properties: {
        escortId: { type: 'string', description: '陪诊员ID (可选, 不传则随机分配)' },
      },
    },
  })
  async mockAssignEscort(
    @Param('orderId') orderId: string,
    @Body('escortId') escortId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.status !== 'paid') {
      throw new BadRequestException(`订单状态不是待分配，当前状态: ${order.status}`);
    }

    // 获取陪诊员
    const escort = escortId
      ? await this.prisma.escort.findUnique({ where: { id: escortId } })
      : await this.prisma.escort.findFirst({ where: { status: 'active', deletedAt: null } });

    if (!escort) {
      throw new BadRequestException('找不到可用陪诊员');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'assigned',
        escortId: escort.id,
        assignedAt: new Date(),
      },
      include: {
        service: true,
        hospital: true,
        escort: true,
      },
    });

    console.log(`🧪 [Test] 订单已分配给陪诊员: ${order.orderNo} -> ${escort.name}`);

    return ApiResponse.success(updatedOrder, `订单已分配给 ${escort.name}`);
  }

  /**
   * 📋 获取可抢订单列表
   */
  @Get('pool-orders')
  @ApiOperation({ summary: '获取可抢订单列表 (H5调试用)' })
  async getPoolOrders(@Query('limit') limit?: number) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'paid',
        escortId: null,
      },
      include: {
        service: { select: { name: true } },
        hospital: { select: { name: true, shortName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit || 20,
    });

    return ApiResponse.success(orders.map(o => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      paidAmount: Number(o.paidAmount),
    })));
  }

  /**
   * 🔗 关联陪诊员账号到用户
   * H5 开发时调用，让测试用户成为陪诊员
   */
  @Post('link-escort-user')
  @ApiOperation({ summary: '关联陪诊员账号到用户 (H5调试用)' })
  @ApiBody({
    schema: {
      properties: {
        userId: { type: 'string', description: '用户ID' },
        escortId: { type: 'string', description: '陪诊员ID (可选, 不传则查找手机号匹配的)' },
      },
    },
  })
  async linkEscortUser(
    @Body('userId') userId: string,
    @Body('escortId') escortId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    let escort: any;

    if (escortId) {
      escort = await this.prisma.escort.findUnique({ where: { id: escortId } });
    } else if (user.phone) {
      // 尝试通过手机号匹配
      escort = await this.prisma.escort.findFirst({
        where: { phone: user.phone, deletedAt: null },
      });
    }

    if (!escort) {
      throw new BadRequestException('找不到对应的陪诊员记录');
    }

    // 关联
    const updatedEscort = await this.prisma.escort.update({
      where: { id: escort.id },
      data: { userId: user.id },
    });

    console.log(`🧪 [Test] 已关联: 用户 ${user.phone} <-> 陪诊员 ${escort.name}`);

    return ApiResponse.success(updatedEscort, `用户已关联为陪诊员 ${escort.name}`);
  }
}

