import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ORDER_CONFIG_KEYS,
  ORDER_CONFIG_DEFAULTS,
  type OrderSettings,
} from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

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
}

