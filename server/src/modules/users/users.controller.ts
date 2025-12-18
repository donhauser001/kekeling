import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('sub') userId: string) {
    const user = await this.usersService.findById(userId);
    return ApiResponse.success(user);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: {
      nickname?: string;
      avatar?: string;
      gender?: string;
      birthday?: string;
    },
  ) {
    // 转换 birthday 字符串为 Date 对象
    const updateData: {
      nickname?: string;
      avatar?: string;
      gender?: string;
      birthday?: Date;
    } = {
      nickname: data.nickname,
      avatar: data.avatar,
      gender: data.gender,
    };

    if (data.birthday) {
      updateData.birthday = new Date(data.birthday);
    }

    const user = await this.usersService.updateProfile(userId, updateData);
    return ApiResponse.success(user);
  }
}

