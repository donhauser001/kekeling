import { Controller, Get, Patch, Body, UseGuards, Request, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscortAppService } from './escort-app.service';
import { ApiResponse as ApiRes } from '../../common/response/api-response';

/**
 * 陪诊员工作台 API 控制器
 * 路由前缀: /escort-app/workbench
 * 
 * 此控制器专门处理小程序工作台相关的 API，
 * 使用 escort token 认证（req.user.isEscort = true）
 */
@Controller('escort-app/workbench')
@UseGuards(JwtAuthGuard)
export class EscortAppWorkbenchController {
  private readonly logger = new Logger(EscortAppWorkbenchController.name);

  constructor(private readonly escortAppService: EscortAppService) { }

  /**
   * 获取 escortId（从 escort token 中提取）
   */
  private getEscortId(req: any): string | null {
    this.logger.debug(`[getEscortId] req.user: ${JSON.stringify(req.user)}`);
    if (req.user?.isEscort && req.user?.escortId) {
      return req.user.escortId;
    }
    return null;
  }

  /**
   * 获取工作台设置
   * GET /escort-app/workbench/settings
   */
  @Get('settings')
  async getSettings(@Request() req) {
    const escortId = this.getEscortId(req);
    if (!escortId) {
      this.logger.warn(`[getSettings] 无效的陪诊员身份: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('需要陪诊员身份');
    }
    const result = await this.escortAppService.getWorkbenchSettingsByEscortId(escortId);
    return ApiRes.success(result);
  }

  /**
   * 更新工作台设置（在线状态、自动接单等）
   * PATCH /escort-app/workbench/settings
   */
  @Patch('settings')
  async updateSettings(
    @Request() req,
    @Body() body: {
      onlineStatus?: 'working' | 'resting';
      autoAcceptOrders?: boolean;
    },
  ) {
    this.logger.debug(`[updateSettings] body: ${JSON.stringify(body)}`);
    const escortId = this.getEscortId(req);
    if (!escortId) {
      this.logger.warn(`[updateSettings] 无效的陪诊员身份: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('需要陪诊员身份');
    }
    const result = await this.escortAppService.updateWorkbenchSettingsByEscortId(escortId, body);
    return ApiRes.success(result);
  }

  /**
   * 更新接单偏好设置
   * PATCH /escort-app/workbench/preferences
   */
  @Patch('preferences')
  async updatePreferences(
    @Request() req,
    @Body() body: {
      serviceTypes?: string[];
      serviceAreas?: string[];
      departments?: string[];
      workingHours?: {
        start: string;
        end: string;
      };
    },
  ) {
    this.logger.debug(`[updatePreferences] body: ${JSON.stringify(body)}`);
    const escortId = this.getEscortId(req);
    if (!escortId) {
      this.logger.warn(`[updatePreferences] 无效的陪诊员身份: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('需要陪诊员身份');
    }
    const result = await this.escortAppService.updateWorkbenchPreferences(escortId, body);
    return ApiRes.success(result);
  }

  /**
   * 更新通知设置
   * PATCH /escort-app/workbench/notifications
   */
  @Patch('notifications')
  async updateNotifications(
    @Request() req,
    @Body() body: {
      newOrder?: boolean;
      orderStatus?: boolean;
      system?: boolean;
      marketing?: boolean;
    },
  ) {
    this.logger.debug(`[updateNotifications] body: ${JSON.stringify(body)}`);
    const escortId = this.getEscortId(req);
    if (!escortId) {
      this.logger.warn(`[updateNotifications] 无效的陪诊员身份: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('需要陪诊员身份');
    }
    const result = await this.escortAppService.updateWorkbenchNotifications(escortId, body);
    return ApiRes.success(result);
  }
}

