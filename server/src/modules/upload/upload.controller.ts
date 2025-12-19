/**
 * 文件上传控制器
 *
 * ⚠️ 安全修复（P1-9）：
 * - 添加 JWT 鉴权守卫
 * - 添加 MIME 类型白名单校验
 * - 添加文件大小限制
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
 */

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { extname, join } from 'path';
import { renameSync, existsSync, mkdirSync } from 'fs';
import { ApiResponse } from '../../common/response/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';

// 允许的子目录白名单
const ALLOWED_FOLDERS = ['brand', 'banner', 'avatar', 'service', 'hospital', 'doctor', 'escort', 'common', 'posters'];

// 允许的 MIME 类型白名单
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 最大文件大小（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * MIME 类型校验过滤器
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  // 检查 MIME 类型
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `不支持的文件类型: ${file.mimetype}。允许的类型: ${ALLOWED_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }

  // 检查文件扩展名（防止 MIME 欺骗）
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return callback(
      new BadRequestException(
        `不支持的文件扩展名: ${ext}。允许的扩展名: ${allowedExtensions.join(', ')}`,
      ),
      false,
    );
  }

  callback(null, true);
};

@ApiTags('上传')
@Controller('upload')
@UseGuards(JwtAuthGuard) // 安全修复：强制鉴权
@ApiBearerAuth()
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'temp');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件（需要登录）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文件（支持 jpg/png/gif/webp/svg，最大 5MB）',
        },
        folder: {
          type: 'string',
          description: '子目录名称，如 brand, banner, avatar 等',
        },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 验证并规范化目录名
    let subFolder = 'common';
    if (folder && ALLOWED_FOLDERS.includes(folder)) {
      subFolder = folder;
    }

    // 确保目标目录存在
    const uploadDir = join(process.cwd(), 'uploads', subFolder);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 移动文件到目标目录（文件名已包含扩展名）
    const newFilename = file.filename;
    const newPath = join(uploadDir, newFilename);

    try {
      renameSync(file.path, newPath);
    } catch (e) {
      // 忽略重命名错误
    }

    // 返回可访问的 URL
    const url = `/uploads/${subFolder}/${newFilename}`;

    return ApiResponse.success({
      url,
      filename: newFilename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: subFolder,
    });
  }
}
