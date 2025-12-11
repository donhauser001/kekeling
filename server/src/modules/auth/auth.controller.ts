import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('weixin')
  @ApiOperation({ summary: '微信登录' })
  async wechatLogin(@Body() dto: WechatLoginDto) {
    const result = await this.authService.wechatLogin(dto);
    return ApiResponse.success(result);
  }

  @Post('bind-phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定手机号' })
  async bindPhone(
    @CurrentUser('sub') userId: string,
    @Body() dto: BindPhoneDto,
  ) {
    const result = await this.authService.bindPhone(userId, dto.code);
    return ApiResponse.success(result);
  }

  // ========== 管理员认证 ==========

  @Post('admin/login')
  @ApiOperation({ summary: '管理员登录' })
  async adminLogin(@Body() body: { username: string; password: string }) {
    const result = await this.authService.adminLogin(body.username, body.password);
    return ApiResponse.success(result);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建管理员账号（需要超级管理员权限）' })
  async createAdmin(
    @CurrentUser() currentUser: any,
    @Body() body: {
      username: string;
      password: string;
      name: string;
      email?: string;
      phone?: string;
      role?: string;
    },
  ) {
    // 检查当前用户是否是超级管理员
    if (currentUser.type !== 'admin' || currentUser.role !== 'superadmin') {
      throw new Error('没有权限创建管理员');
    }
    const result = await this.authService.createAdmin(body);
    return ApiResponse.success(result);
  }
}

