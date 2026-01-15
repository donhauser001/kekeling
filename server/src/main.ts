import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // HTTPS 配置（用于小程序开发环境）
  const sslKeyPath = join(process.cwd(), 'ssl', 'key.pem');
  const sslCertPath = join(process.cwd(), 'ssl', 'cert.pem');
  const httpsOptions = existsSync(sslKeyPath) && existsSync(sslCertPath)
    ? {
      key: readFileSync(sslKeyPath),
      cert: readFileSync(sslCertPath),
    }
    : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    rawBody: true, // 支持微信支付回调的 XML raw body
  });

  // ⚠️ 重要：CORS 必须在静态文件服务之前配置，否则字体文件无法跨域访问
  // 启用 CORS（支持 Cookie）
  app.enableCors({
    origin: true,
    credentials: true, // 允许携带 Cookie
  });

  // Cookie 解析中间件（安全修复 P1-9：支持 httpOnly Cookie）
  // @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
  app.use(cookieParser());

  // 静态文件服务 - 上传的文件（包括字体文件 /uploads/fonts/）
  // 小程序通过 wx.loadFontFace 从这里加载 iconfont 字体
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局响应拦截器 - 统一包装响应格式为 { code: 0, message: 'success', data: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('科科灵陪诊 API')
    .setDescription('科科灵陪诊服务后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3456;
  // 监听所有接口（0.0.0.0），支持小程序通过局域网访问
  await app.listen(port, '0.0.0.0');

  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`🚀 科科灵 API 服务已启动: ${protocol}://0.0.0.0:${port}`);
  console.log(`📚 API 文档: ${protocol}://localhost:${port}/api/docs`);
  if (httpsOptions) {
    console.log(`🔒 HTTPS 已启用（自签名证书，仅用于开发）`);
  }
}

bootstrap();

