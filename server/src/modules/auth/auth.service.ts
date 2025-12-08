import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 微信登录
  async wechatLogin(dto: WechatLoginDto) {
    const { code } = dto;

    // 调用微信接口获取 openid
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session`,
        {
          params: {
            appid,
            secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      );

      const { openid, session_key, unionid, errcode, errmsg } = response.data;

      if (errcode) {
        throw new UnauthorizedException(`微信登录失败: ${errmsg}`);
      }

      // 查找或创建用户
      let user = await this.prisma.user.findUnique({
        where: { openid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            openid,
            unionid,
          },
        });
      }

      // 生成 JWT Token
      const token = this.jwtService.sign({
        sub: user.id,
        openid: user.openid,
      });

      return {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
        isNewUser: !user.phone, // 没有手机号认为是新用户
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  // 绑定手机号 (通过微信 getPhoneNumber)
  async bindPhone(userId: string, code: string) {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      // 先获取 access_token
      const tokenRes = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token`,
        {
          params: {
            grant_type: 'client_credential',
            appid,
            secret,
          },
        },
      );

      const accessToken = tokenRes.data.access_token;

      // 获取手机号
      const phoneRes = await axios.post(
        `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
        { code },
      );

      const phoneInfo = phoneRes.data.phone_info;
      if (!phoneInfo) {
        throw new UnauthorizedException('获取手机号失败');
      }

      // 更新用户手机号
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { phone: phoneInfo.phoneNumber },
      });

      return {
        phone: user.phone,
      };
    } catch (error) {
      throw new UnauthorizedException('绑定手机号失败');
    }
  }

  // 验证 Token
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}

