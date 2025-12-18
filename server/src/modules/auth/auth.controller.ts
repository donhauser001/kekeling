/**
 * 认证控制器
 *
 * ⚠️ 安全修复（P1-9）：
 * - 登录接口同时返回 Token 和设置 httpOnly Cookie
 * - 前端可逐步迁移到 Cookie 方案
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
 */

import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';
import {
  setTokenCookie,
  clearTokenCookie,
} from '../../common/utils/cookie';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('weixin')
  @ApiOperation({ summary: '微信登录' })
  async wechatLogin(
    @Body() dto: WechatLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.wechatLogin(dto);

    // 安全修复：设置 httpOnly Cookie
    setTokenCookie(res, result.token, false);

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

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // 清除用户 Cookie
    clearTokenCookie(res, false);
    return ApiResponse.success({ message: '退出成功' });
  }

  // ========== 管理员认证 ==========

  @Post('admin/login')
  @ApiOperation({ summary: '管理员登录' })
  async adminLogin(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.adminLogin(body.username, body.password);

    // 安全修复：设置 httpOnly Cookie（管理员）
    setTokenCookie(res, result.token, true);

    return ApiResponse.success(result);
  }

  @Post('admin/logout')
  @ApiOperation({ summary: '管理员退出登录' })
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    // 清除管理员 Cookie
    clearTokenCookie(res, true);
    return ApiResponse.success({ message: '退出成功' });
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
