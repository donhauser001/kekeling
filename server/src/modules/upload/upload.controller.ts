import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { extname, join } from 'path';
import { renameSync, existsSync, mkdirSync } from 'fs';
import { ApiResponse } from '../../common/response/api-response';

// 允许的子目录白名单
const ALLOWED_FOLDERS = ['brand', 'banner', 'avatar', 'service', 'hospital', 'doctor', 'escort', 'common'];

@ApiTags('上传')
@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: '子目录名称，如 brand, banner, avatar 等',
        },
      },
    },
  })
  async upload(
    @UploadedFile() file: any,
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

    // 重命名文件，添加扩展名并移动到子目录
    const ext = extname(file.originalname);
    const newFilename = `${file.filename}${ext}`;
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
      folder: subFolder,
    });
  }
}

