import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSettingDto, UpdateSettingDto, QuerySettingDto, BatchUpdateSettingsDto } from './dto/setting.dto';

// 默认设置配置
const DEFAULT_SETTINGS = [
    // 基础设置
    { key: 'site_name', value: '科科灵陪诊', label: '网站名称', type: 'text', group: 'general', sort: 1 },
    { key: 'site_description', value: '专业陪诊服务平台', label: '网站描述', type: 'textarea', group: 'general', sort: 2 },
    { key: 'site_logo', value: '', label: '网站Logo', type: 'image', group: 'general', sort: 3 },
    { key: 'site_favicon', value: '', label: '网站图标', type: 'image', group: 'general', sort: 4 },
    { key: 'site_keywords', value: '陪诊,医疗,健康,服务', label: '网站关键词', type: 'text', group: 'general', sort: 5 },
    { key: 'site_icp', value: '', label: 'ICP备案号', type: 'text', group: 'general', sort: 6 },
    { key: 'site_copyright', value: '© 2024 科科灵陪诊. All rights reserved.', label: '版权信息', type: 'text', group: 'general', sort: 7 },

    // SEO 设置
    { key: 'seo_title', value: '科科灵陪诊 - 专业陪诊服务平台', label: 'SEO标题', type: 'text', group: 'seo', sort: 1 },
    { key: 'seo_description', value: '科科灵提供专业的陪诊服务，让您的就医之路更轻松', label: 'SEO描述', type: 'textarea', group: 'seo', sort: 2 },
    { key: 'seo_keywords', value: '陪诊服务,医院陪诊,就医陪护', label: 'SEO关键词', type: 'text', group: 'seo', sort: 3 },

    // 联系方式
    { key: 'contact_phone', value: '', label: '联系电话', type: 'text', group: 'contact', sort: 1 },
    { key: 'contact_email', value: '', label: '联系邮箱', type: 'text', group: 'contact', sort: 2 },
    { key: 'contact_address', value: '', label: '联系地址', type: 'textarea', group: 'contact', sort: 3 },
    { key: 'contact_wechat', value: '', label: '微信公众号', type: 'text', group: 'contact', sort: 4 },
    { key: 'contact_qq', value: '', label: 'QQ客服', type: 'text', group: 'contact', sort: 5 },

    // 社交媒体
    { key: 'social_wechat_qr', value: '', label: '微信二维码', type: 'image', group: 'social', sort: 1 },
    { key: 'social_weibo', value: '', label: '微博链接', type: 'text', group: 'social', sort: 2 },
    { key: 'social_douyin', value: '', label: '抖音号', type: 'text', group: 'social', sort: 3 },
];

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    /**
     * 获取所有设置（公开接口，按分组返回）
     */
    async getAllSettings() {
        const settings = await this.prisma.cmsSetting.findMany({
            orderBy: [{ group: 'asc' }, { sort: 'asc' }],
        });

        // 转换为键值对格式
        const result: Record<string, any> = {};
        for (const setting of settings) {
            result[setting.key] = setting.value;
        }

        return result;
    }

    /**
     * 获取设置列表（管理后台）
     */
    async findAll(query: QuerySettingDto) {
        const { group, keyword } = query;

        const where: Prisma.CmsSettingWhereInput = {};

        if (group) {
            where.group = group;
        }

        if (keyword) {
            where.OR = [
                { key: { contains: keyword, mode: 'insensitive' } },
                { label: { contains: keyword, mode: 'insensitive' } },
            ];
        }

        return this.prisma.cmsSetting.findMany({
            where,
            orderBy: [{ group: 'asc' }, { sort: 'asc' }],
        });
    }

    /**
     * 按分组获取设置
     */
    async findByGroup(group: string) {
        return this.prisma.cmsSetting.findMany({
            where: { group },
            orderBy: { sort: 'asc' },
        });
    }

    /**
     * 获取单个设置
     */
    async findByKey(key: string) {
        const setting = await this.prisma.cmsSetting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundException('设置不存在');
        }

        return setting;
    }

    /**
     * 创建设置
     */
    async create(dto: CreateSettingDto) {
        const existing = await this.prisma.cmsSetting.findUnique({
            where: { key: dto.key },
        });

        if (existing) {
            throw new BadRequestException('该设置键名已存在');
        }

        return this.prisma.cmsSetting.create({
            data: {
                key: dto.key,
                value: dto.value,
                label: dto.label,
                type: dto.type ?? 'text',
                group: dto.group ?? 'general',
                options: dto.options,
                sort: dto.sort ?? 0,
            },
        });
    }

    /**
     * 更新设置（通过ID）
     */
    async update(id: string, dto: UpdateSettingDto) {
        const existing = await this.prisma.cmsSetting.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('设置不存在');
        }

        return this.prisma.cmsSetting.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * 更新设置（通过Key）
     */
    async updateByKey(key: string, value: string) {
        const existing = await this.prisma.cmsSetting.findUnique({
            where: { key },
        });

        if (!existing) {
            throw new NotFoundException('设置不存在');
        }

        return this.prisma.cmsSetting.update({
            where: { key },
            data: { value },
        });
    }

    /**
     * 批量更新设置
     */
    async batchUpdate(dto: BatchUpdateSettingsDto) {
        await this.prisma.$transaction(
            dto.settings.map((item) =>
                this.prisma.cmsSetting.upsert({
                    where: { key: item.key },
                    update: { value: item.value },
                    create: {
                        key: item.key,
                        value: item.value,
                        label: item.key,
                        type: 'text',
                        group: 'general',
                        sort: 0,
                    },
                }),
            ),
        );
        return { success: true };
    }

    /**
     * 删除设置
     */
    async remove(id: string) {
        const existing = await this.prisma.cmsSetting.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('设置不存在');
        }

        return this.prisma.cmsSetting.delete({
            where: { id },
        });
    }

    /**
     * 初始化默认设置（应用启动时调用）
     */
    async ensureDefaultSettings() {
        for (const setting of DEFAULT_SETTINGS) {
            const existing = await this.prisma.cmsSetting.findUnique({
                where: { key: setting.key },
            });

            if (!existing) {
                await this.prisma.cmsSetting.create({
                    data: setting,
                });
                console.log(`[CMS] 默认设置 "${setting.label}" 已创建`);
            }
        }
    }

    /**
     * 获取分组列表
     */
    getGroups() {
        return [
            { value: 'general', label: '基础设置', description: '网站基本信息配置' },
            { value: 'seo', label: 'SEO设置', description: '搜索引擎优化配置' },
            { value: 'contact', label: '联系方式', description: '联系信息配置' },
            { value: 'social', label: '社交媒体', description: '社交媒体账号配置' },
        ];
    }
}

