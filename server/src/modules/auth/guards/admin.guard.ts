import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 管理员权限守卫
 * 继承 JWT 认证，并检查用户是否有管理员权限
 */
@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 首先验证 JWT
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户是否有管理员权限
    // 这里可以根据实际需求检查用户角色
    // 目前简单返回 true，允许所有已认证用户访问
    // TODO: 实现真正的管理员权限检查
    return true;
  }
}
