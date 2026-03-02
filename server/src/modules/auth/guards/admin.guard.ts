import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ADMIN_PUBLIC_KEY } from '../decorators/public-admin.decorator';

/**
 * 管理员权限守卫
 * 继承 JWT 认证，并检查用户是否有管理员权限
 */
@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdminPublic = this.reflector.getAllAndOverride<boolean>(ADMIN_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isAdminPublic) {
      return true;
    }

    // 1) 先验证 JWT（未登录直接拦截）
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // 2) 再校验管理员身份与状态
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 仅允许管理员 token 访问
    if (!user || user.type !== 'admin') {
      throw new ForbiddenException('仅管理员可访问');
    }

    // 必须是激活状态
    if (user.admin?.status && user.admin.status !== 'active') {
      throw new ForbiddenException('管理员账号已禁用');
    }

    // 角色白名单
    const role = user.role ?? user.admin?.role;
    if (!role || !['admin', 'superadmin'].includes(role)) {
      throw new ForbiddenException('管理员角色无权限访问');
    }

    return true;
  }
}
