import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ORDER_CONFIG_KEYS,
  ORDER_CONFIG_DEFAULTS,
  THEME_CONFIG_KEYS,
  THEME_CONFIG_DEFAULTS,
  BANNER_CONFIG_KEYS,
  BANNER_CONFIG_DEFAULTS,
  BANNER_AREAS,
  HOME_CONFIG_KEYS,
  HOME_CONFIG_DEFAULTS,
  type OrderSettings,
  type ThemeSettings,
  type BannerSettings,
  type BannerAreaConfig,
  type BannerPosition,
  type HomePageSettings,
} from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取单个配置
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const config = await this.prisma.config.findUnique({
      where: { key },
    });

    if (!config) {
      return defaultValue as T;
    }

    try {
      return JSON.parse(config.value) as T;
    } catch {
      return config.value as T;
    }
  }

  /**
   * 设置单个配置
   */
  async set(key: string, value: any, remark?: string): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await this.prisma.config.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        remark,
      },
      update: {
        value: stringValue,
        remark: remark !== undefined ? remark : undefined,
      },
    });
  }

  /**
   * 批量获取配置
   */
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    const configs = await this.prisma.config.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, any> = {};
    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }

    return result;
  }

  /**
   * 批量设置配置
   */
  async setMultiple(configs: { key: string; value: any; remark?: string }[]): Promise<void> {
    const operations = configs.map((config) => {
      const stringValue =
        typeof config.value === 'string' ? config.value : JSON.stringify(config.value);

      return this.prisma.config.upsert({
        where: { key: config.key },
        create: {
          key: config.key,
          value: stringValue,
          remark: config.remark,
        },
        update: {
          value: stringValue,
          remark: config.remark,
        },
      });
    });

    await this.prisma.$transaction(operations);
  }

  /**
   * 获取所有配置
   */
  async getAll(): Promise<Record<string, any>> {
    const configs = await this.prisma.config.findMany();

    const result: Record<string, any> = {};
    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }

    return result;
  }

  /**
   * 删除配置
   */
  async delete(key: string): Promise<void> {
    await this.prisma.config.delete({
      where: { key },
    }).catch(() => {
      // 忽略不存在的情况
    });
  }

  // ============================================
  // 订单设置专用方法
  // ============================================

  /**
   * 获取订单设置
   */
  async getOrderSettings(): Promise<OrderSettings> {
    const keys = Object.values(ORDER_CONFIG_KEYS);
    const configs = await this.getMultiple(keys);

    return {
      autoCancelMinutes:
        configs[ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES],
      autoCompleteHours:
        configs[ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS],
      platformFeeRate:
        configs[ORDER_CONFIG_KEYS.PLATFORM_FEE_RATE] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.PLATFORM_FEE_RATE],
      dispatchMode:
        configs[ORDER_CONFIG_KEYS.DISPATCH_MODE] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.DISPATCH_MODE],
      grabTimeoutMinutes:
        configs[ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES],
      allowRefundBeforeStart:
        configs[ORDER_CONFIG_KEYS.ALLOW_REFUND_BEFORE_START] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.ALLOW_REFUND_BEFORE_START],
      refundFeeRate:
        configs[ORDER_CONFIG_KEYS.REFUND_FEE_RATE] ??
        ORDER_CONFIG_DEFAULTS[ORDER_CONFIG_KEYS.REFUND_FEE_RATE],
    };
  }

  /**
   * 更新订单设置
   */
  async updateOrderSettings(settings: Partial<OrderSettings>): Promise<OrderSettings> {
    const configs: { key: string; value: any }[] = [];

    if (settings.autoCancelMinutes !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES,
        value: settings.autoCancelMinutes,
      });
    }
    if (settings.autoCompleteHours !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS,
        value: settings.autoCompleteHours,
      });
    }
    if (settings.platformFeeRate !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.PLATFORM_FEE_RATE,
        value: settings.platformFeeRate,
      });
    }
    if (settings.dispatchMode !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.DISPATCH_MODE,
        value: settings.dispatchMode,
      });
    }
    if (settings.grabTimeoutMinutes !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES,
        value: settings.grabTimeoutMinutes,
      });
    }
    if (settings.allowRefundBeforeStart !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.ALLOW_REFUND_BEFORE_START,
        value: settings.allowRefundBeforeStart,
      });
    }
    if (settings.refundFeeRate !== undefined) {
      configs.push({
        key: ORDER_CONFIG_KEYS.REFUND_FEE_RATE,
        value: settings.refundFeeRate,
      });
    }

    if (configs.length > 0) {
      await this.setMultiple(configs);
    }

    return this.getOrderSettings();
  }

  // ============================================
  // 主题设置专用方法
  // ============================================

  /**
   * 获取主题设置
   */
  async getThemeSettings(): Promise<ThemeSettings> {
    const keys = Object.values(THEME_CONFIG_KEYS);
    const configs = await this.getMultiple(keys);

    return {
      primaryColor:
        configs[THEME_CONFIG_KEYS.PRIMARY_COLOR] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.PRIMARY_COLOR],
      defaultThemeMode:
        configs[THEME_CONFIG_KEYS.DEFAULT_THEME_MODE] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.DEFAULT_THEME_MODE],
      brandName:
        configs[THEME_CONFIG_KEYS.BRAND_NAME] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.BRAND_NAME],
      brandSlogan:
        configs[THEME_CONFIG_KEYS.BRAND_SLOGAN] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.BRAND_SLOGAN],
      headerLogo:
        configs[THEME_CONFIG_KEYS.HEADER_LOGO] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.HEADER_LOGO],
      headerLogoDark:
        configs[THEME_CONFIG_KEYS.HEADER_LOGO_DARK] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.HEADER_LOGO_DARK],
      footerLogo:
        configs[THEME_CONFIG_KEYS.FOOTER_LOGO] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.FOOTER_LOGO],
      footerLogoDark:
        configs[THEME_CONFIG_KEYS.FOOTER_LOGO_DARK] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.FOOTER_LOGO_DARK],
      headerShowName:
        configs[THEME_CONFIG_KEYS.HEADER_SHOW_NAME] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.HEADER_SHOW_NAME],
      headerShowSlogan:
        configs[THEME_CONFIG_KEYS.HEADER_SHOW_SLOGAN] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.HEADER_SHOW_SLOGAN],
      footerShowName:
        configs[THEME_CONFIG_KEYS.FOOTER_SHOW_NAME] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.FOOTER_SHOW_NAME],
      footerShowSlogan:
        configs[THEME_CONFIG_KEYS.FOOTER_SHOW_SLOGAN] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.FOOTER_SHOW_SLOGAN],
      headerLayout:
        configs[THEME_CONFIG_KEYS.HEADER_LAYOUT] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.HEADER_LAYOUT],
      footerLayout:
        configs[THEME_CONFIG_KEYS.FOOTER_LAYOUT] ??
        THEME_CONFIG_DEFAULTS[THEME_CONFIG_KEYS.FOOTER_LAYOUT],
    };
  }

  /**
   * 更新主题设置
   */
  async updateThemeSettings(settings: Partial<ThemeSettings>): Promise<ThemeSettings> {
    const keyMap: Record<keyof ThemeSettings, string> = {
      primaryColor: THEME_CONFIG_KEYS.PRIMARY_COLOR,
      defaultThemeMode: THEME_CONFIG_KEYS.DEFAULT_THEME_MODE,
      brandName: THEME_CONFIG_KEYS.BRAND_NAME,
      brandSlogan: THEME_CONFIG_KEYS.BRAND_SLOGAN,
      headerLogo: THEME_CONFIG_KEYS.HEADER_LOGO,
      headerLogoDark: THEME_CONFIG_KEYS.HEADER_LOGO_DARK,
      footerLogo: THEME_CONFIG_KEYS.FOOTER_LOGO,
      footerLogoDark: THEME_CONFIG_KEYS.FOOTER_LOGO_DARK,
      headerShowName: THEME_CONFIG_KEYS.HEADER_SHOW_NAME,
      headerShowSlogan: THEME_CONFIG_KEYS.HEADER_SHOW_SLOGAN,
      footerShowName: THEME_CONFIG_KEYS.FOOTER_SHOW_NAME,
      footerShowSlogan: THEME_CONFIG_KEYS.FOOTER_SHOW_SLOGAN,
      headerLayout: THEME_CONFIG_KEYS.HEADER_LAYOUT,
      footerLayout: THEME_CONFIG_KEYS.FOOTER_LAYOUT,
    };

    const configs: { key: string; value: any }[] = [];

    for (const [field, value] of Object.entries(settings)) {
      if (value !== undefined && keyMap[field as keyof ThemeSettings]) {
        configs.push({
          key: keyMap[field as keyof ThemeSettings],
          value,
        });
      }
    }

    if (configs.length > 0) {
      await this.setMultiple(configs);
    }

    return this.getThemeSettings();
  }

  // ============================================
  // 轮播图设置专用方法
  // ============================================

  /**
   * 获取轮播图设置
   */
  async getBannerSettings(): Promise<BannerSettings> {
    const keys = Object.values(BANNER_CONFIG_KEYS);
    const configs = await this.getMultiple(keys);

    return {
      home: {
        enabled:
          configs[BANNER_CONFIG_KEYS.HOME_ENABLED] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.HOME_ENABLED],
        width:
          configs[BANNER_CONFIG_KEYS.HOME_WIDTH] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.HOME_WIDTH],
        height:
          configs[BANNER_CONFIG_KEYS.HOME_HEIGHT] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.HOME_HEIGHT],
        title: BANNER_AREAS.home.title,
        description: BANNER_AREAS.home.description,
      },
      services: {
        enabled:
          configs[BANNER_CONFIG_KEYS.SERVICES_ENABLED] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICES_ENABLED],
        width:
          configs[BANNER_CONFIG_KEYS.SERVICES_WIDTH] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICES_WIDTH],
        height:
          configs[BANNER_CONFIG_KEYS.SERVICES_HEIGHT] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICES_HEIGHT],
        title: BANNER_AREAS.services.title,
        description: BANNER_AREAS.services.description,
      },
      profile: {
        enabled:
          configs[BANNER_CONFIG_KEYS.PROFILE_ENABLED] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.PROFILE_ENABLED],
        width:
          configs[BANNER_CONFIG_KEYS.PROFILE_WIDTH] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.PROFILE_WIDTH],
        height:
          configs[BANNER_CONFIG_KEYS.PROFILE_HEIGHT] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.PROFILE_HEIGHT],
        title: BANNER_AREAS.profile.title,
        description: BANNER_AREAS.profile.description,
      },
      serviceDetail: {
        enabled:
          configs[BANNER_CONFIG_KEYS.SERVICE_DETAIL_ENABLED] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICE_DETAIL_ENABLED],
        width:
          configs[BANNER_CONFIG_KEYS.SERVICE_DETAIL_WIDTH] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICE_DETAIL_WIDTH],
        height:
          configs[BANNER_CONFIG_KEYS.SERVICE_DETAIL_HEIGHT] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.SERVICE_DETAIL_HEIGHT],
        title: BANNER_AREAS['service-detail'].title,
        description: BANNER_AREAS['service-detail'].description,
      },
      cases: {
        enabled:
          configs[BANNER_CONFIG_KEYS.CASES_ENABLED] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.CASES_ENABLED],
        width:
          configs[BANNER_CONFIG_KEYS.CASES_WIDTH] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.CASES_WIDTH],
        height:
          configs[BANNER_CONFIG_KEYS.CASES_HEIGHT] ??
          BANNER_CONFIG_DEFAULTS[BANNER_CONFIG_KEYS.CASES_HEIGHT],
        title: BANNER_AREAS.cases.title,
        description: BANNER_AREAS.cases.description,
      },
    };
  }

  /**
   * 获取单个区域的轮播图设置
   */
  async getBannerAreaConfig(position: BannerPosition): Promise<BannerAreaConfig> {
    const settings = await this.getBannerSettings();
    const keyMap: Record<BannerPosition, keyof BannerSettings> = {
      home: 'home',
      services: 'services',
      profile: 'profile',
      'service-detail': 'serviceDetail',
      cases: 'cases',
    };
    return settings[keyMap[position]];
  }

  /**
   * 更新单个区域的轮播图设置
   */
  async updateBannerAreaConfig(
    position: BannerPosition,
    config: Partial<Pick<BannerAreaConfig, 'enabled' | 'width' | 'height'>>,
  ): Promise<BannerSettings> {
    const configs: { key: string; value: any }[] = [];

    const keyMapping: Record<BannerPosition, { enabled: string; width: string; height: string }> = {
      home: {
        enabled: BANNER_CONFIG_KEYS.HOME_ENABLED,
        width: BANNER_CONFIG_KEYS.HOME_WIDTH,
        height: BANNER_CONFIG_KEYS.HOME_HEIGHT,
      },
      services: {
        enabled: BANNER_CONFIG_KEYS.SERVICES_ENABLED,
        width: BANNER_CONFIG_KEYS.SERVICES_WIDTH,
        height: BANNER_CONFIG_KEYS.SERVICES_HEIGHT,
      },
      profile: {
        enabled: BANNER_CONFIG_KEYS.PROFILE_ENABLED,
        width: BANNER_CONFIG_KEYS.PROFILE_WIDTH,
        height: BANNER_CONFIG_KEYS.PROFILE_HEIGHT,
      },
      'service-detail': {
        enabled: BANNER_CONFIG_KEYS.SERVICE_DETAIL_ENABLED,
        width: BANNER_CONFIG_KEYS.SERVICE_DETAIL_WIDTH,
        height: BANNER_CONFIG_KEYS.SERVICE_DETAIL_HEIGHT,
      },
      cases: {
        enabled: BANNER_CONFIG_KEYS.CASES_ENABLED,
        width: BANNER_CONFIG_KEYS.CASES_WIDTH,
        height: BANNER_CONFIG_KEYS.CASES_HEIGHT,
      },
    };

    const keys = keyMapping[position];

    if (config.enabled !== undefined) {
      configs.push({ key: keys.enabled, value: config.enabled });
    }
    if (config.width !== undefined) {
      configs.push({ key: keys.width, value: config.width });
    }
    if (config.height !== undefined) {
      configs.push({ key: keys.height, value: config.height });
    }

    if (configs.length > 0) {
      await this.setMultiple(configs);
    }

    return this.getBannerSettings();
  }

  // ============================================
  // 首页设置专用方法
  // ============================================

  /**
   * 获取首页设置
   */
  async getHomePageSettings(): Promise<HomePageSettings> {
    const keys = Object.values(HOME_CONFIG_KEYS);
    const configs = await this.getMultiple(keys);

    return {
      statsEnabled:
        configs[HOME_CONFIG_KEYS.STATS_ENABLED] ??
        HOME_CONFIG_DEFAULTS[HOME_CONFIG_KEYS.STATS_ENABLED],
      statsItems:
        configs[HOME_CONFIG_KEYS.STATS_ITEMS] ??
        HOME_CONFIG_DEFAULTS[HOME_CONFIG_KEYS.STATS_ITEMS],
      contentEnabled:
        configs[HOME_CONFIG_KEYS.CONTENT_ENABLED] ??
        HOME_CONFIG_DEFAULTS[HOME_CONFIG_KEYS.CONTENT_ENABLED],
      contentCode:
        configs[HOME_CONFIG_KEYS.CONTENT_CODE] ??
        HOME_CONFIG_DEFAULTS[HOME_CONFIG_KEYS.CONTENT_CODE],
      serviceRecommend:
        configs[HOME_CONFIG_KEYS.SERVICE_RECOMMEND_SETTINGS] ??
        HOME_CONFIG_DEFAULTS[HOME_CONFIG_KEYS.SERVICE_RECOMMEND_SETTINGS],
    };
  }

  /**
   * 更新首页设置
   */
  async updateHomePageSettings(settings: Partial<HomePageSettings>): Promise<HomePageSettings> {
    const configs: { key: string; value: any }[] = [];

    if (settings.statsEnabled !== undefined) {
      configs.push({ key: HOME_CONFIG_KEYS.STATS_ENABLED, value: settings.statsEnabled });
    }
    if (settings.statsItems !== undefined) {
      configs.push({ key: HOME_CONFIG_KEYS.STATS_ITEMS, value: settings.statsItems });
    }
    if (settings.contentEnabled !== undefined) {
      configs.push({ key: HOME_CONFIG_KEYS.CONTENT_ENABLED, value: settings.contentEnabled });
    }
    if (settings.contentCode !== undefined) {
      configs.push({ key: HOME_CONFIG_KEYS.CONTENT_CODE, value: settings.contentCode });
    }
    if (settings.serviceRecommend !== undefined) {
      configs.push({ key: HOME_CONFIG_KEYS.SERVICE_RECOMMEND_SETTINGS, value: settings.serviceRecommend });
    }

    if (configs.length > 0) {
      await this.setMultiple(configs);
    }

    return this.getHomePageSettings();
  }
}

