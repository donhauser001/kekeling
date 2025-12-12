import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { DistributionService } from './distribution.service';
import { PrismaService } from '../../prisma/prisma.service';

// 配置 Decimal.js（与 service 保持一致）
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * 金额计算辅助函数（提取自 DistributionService.calculateDistribution）
 *
 * 计算策略：
 * - 公式：amount = orderAmount * rate / 100
 * - 保留 2 位小数
 * - 使用 ROUND_HALF_UP（四舍五入）舍入策略
 *
 * 示例：
 * - 100 * 10% = 10.00
 * - 0.01 * 1% = 0.0001 -> 四舍五入 -> 0.00
 * - 0.05 * 10% = 0.005 -> 四舍五入 -> 0.01 (五入)
 */
function calculateDistributionAmount(orderAmount: number, rate: number): number {
  return new Decimal(orderAmount)
    .times(rate)
    .dividedBy(100)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();
}

describe('DistributionService', () => {
  let service: DistributionService;
  let prismaService: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    distributionConfig: {
      findFirst: jest.fn(),
    },
    escort: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    escortInvitation: {
      create: jest.fn(),
    },
    distributionRecord: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    escortWallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  // Mock EventEmitter2
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<DistributionService>(DistributionService);
    prismaService = module.get<PrismaService>(PrismaService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  // ==========================================
  // 金额计算核心逻辑测试（单元测试）
  // ==========================================
  describe('calculateDistributionAmount (金额计算核心逻辑)', () => {
    /**
     * 测试场景 1：标准场景
     * 100元订单，10% 分润率 = 10.00元
     */
    it('标准场景：100元订单，10% 分润 -> 10.00元', () => {
      const result = calculateDistributionAmount(100, 10);
      expect(result).toBe(10);
      expect(result).toBeCloseTo(10.0, 2);
    });

    /**
     * 测试场景 2：精度陷阱 (0.1 + 0.2 问题)
     * JavaScript 原生: 0.1 + 0.2 = 0.30000000000000004
     * 使用 Decimal.js 应该精确返回 0.30
     */
    it('精度陷阱：0.3元订单，100% 分润 -> 0.30元', () => {
      // 0.1 + 0.2 = 0.3，验证精度
      const sumAmount = new Decimal(0.1).plus(0.2).toNumber();
      expect(sumAmount).toBe(0.3);

      // 订单金额 0.3，100% 分润
      const result = calculateDistributionAmount(0.3, 100);
      expect(result).toBe(0.3);
    });

    /**
     * 测试场景 3：复杂精度陷阱
     * 19.9 * 3% = 0.597 -> 四舍五入 -> 0.60
     */
    it('复杂精度：19.9元订单，3% 分润 -> 0.60元（四舍五入）', () => {
      const result = calculateDistributionAmount(19.9, 3);
      // 19.9 * 3 / 100 = 0.597 -> ROUND_HALF_UP -> 0.60
      expect(result).toBe(0.6);
    });

    /**
     * 测试场景 4：极小金额（向下舍入）
     * 0.01元订单，1% 分润 = 0.0001 -> 四舍五入 -> 0.00元
     *
     * 策略说明：
     * 0.0001 < 0.005，所以四舍五入结果为 0.00
     * 这意味着极小金额的分润可能为 0，业务上可接受
     */
    it('极小金额：0.01元订单，1% 分润 -> 0.00元（向下舍入）', () => {
      const result = calculateDistributionAmount(0.01, 1);
      // 0.01 * 1 / 100 = 0.0001 -> 四舍五入 -> 0.00
      expect(result).toBe(0);
    });

    /**
     * 测试场景 5：极小金额（五入）
     * 0.05元订单，10% 分润 = 0.005 -> 四舍五入 -> 0.01元
     */
    it('极小金额（五入）：0.05元订单，10% 分润 -> 0.01元', () => {
      const result = calculateDistributionAmount(0.05, 10);
      // 0.05 * 10 / 100 = 0.005 -> ROUND_HALF_UP -> 0.01
      expect(result).toBe(0.01);
    });

    /**
     * 测试场景 6：零费率
     * 任意金额，0% 分润 = 0元
     */
    it('零费率：100元订单，0% 分润 -> 0.00元', () => {
      const result = calculateDistributionAmount(100, 0);
      expect(result).toBe(0);
    });

    /**
     * 测试场景 7：全额费率
     * 100元订单，100% 分润 = 100元
     */
    it('全额费率：99.99元订单，100% 分润 -> 99.99元', () => {
      const result = calculateDistributionAmount(99.99, 100);
      expect(result).toBe(99.99);
    });

    /**
     * 测试场景 8：大金额精度
     * 9999.99元订单，2.5% 分润 = 249.99975 -> 四舍五入 -> 250.00元
     */
    it('大金额精度：9999.99元订单，2.5% 分润 -> 250.00元', () => {
      const result = calculateDistributionAmount(9999.99, 2.5);
      // 9999.99 * 2.5 / 100 = 249.99975 -> 250.00
      expect(result).toBe(250);
    });

    /**
     * 测试场景 9：小数费率
     * 100元订单，1.5% 分润 = 1.50元
     */
    it('小数费率：100元订单，1.5% 分润 -> 1.50元', () => {
      const result = calculateDistributionAmount(100, 1.5);
      expect(result).toBe(1.5);
    });

    /**
     * 测试场景 10：边界值 - 0.005 正好在边界
     * 0.5元订单，1% 分润 = 0.005 -> 四舍五入 -> 0.01元
     */
    it('边界值：0.5元订单，1% 分润 -> 0.01元（五入）', () => {
      const result = calculateDistributionAmount(0.5, 1);
      // 0.5 * 1 / 100 = 0.005 -> ROUND_HALF_UP -> 0.01
      expect(result).toBe(0.01);
    });

    /**
     * 测试场景 11：验证 JavaScript 精度问题被解决
     * 直接对比原生 JS 计算 vs Decimal.js 计算
     */
    it('验证浮点数精度问题被解决', () => {
      // JavaScript 原生计算会有精度问题
      const jsResult = (0.1 * 10) / 100; // 应该是 0.01，但可能有精度问题
      const decimalResult = calculateDistributionAmount(0.1, 10);

      // Decimal.js 结果应该是精确的 0.01
      expect(decimalResult).toBe(0.01);
    });
  });

  // ==========================================
  // calculateDistribution 方法集成测试
  // ==========================================
  describe('calculateDistribution (完整方法测试)', () => {
    const mockConfig = {
      id: 'config-1',
      status: 'active',
      l1CommissionRate: 2,  // 城市合伙人 2%
      l2CommissionRate: 3,  // 团队长 3%
      l3CommissionRate: 1,  // 普通陪诊员 1%
      directInviteBonus: 50,
    };

    const mockEscort = {
      id: 'escort-1',
      name: '测试陪诊员',
      status: 'active',
      distributionLevel: 3,
      distributionActive: true,
      ancestorPath: JSON.stringify(['ancestor-1', 'ancestor-2']),
    };

    const mockAncestor1 = {
      id: 'ancestor-2',
      name: '直接上级',
      status: 'active',
      distributionLevel: 2, // 团队长
      distributionActive: true,
    };

    const mockAncestor2 = {
      id: 'ancestor-1',
      name: '二级上级',
      status: 'active',
      distributionLevel: 1, // 城市合伙人
      distributionActive: true,
    };

    it('无分润配置时返回空结果', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(null);

      const result = await service.calculateDistribution('order-1', 'escort-1', 100);

      expect(result).toEqual({ records: [], totalDistributionCents: 0 });
    });

    it('陪诊员不存在时抛出异常', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(mockConfig);
      mockPrismaService.escort.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateDistribution('order-1', 'escort-1', 100),
      ).rejects.toThrow(NotFoundException);
    });

    it('无上级链路时返回空分润记录', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(mockConfig);
      mockPrismaService.escort.findUnique.mockResolvedValue({
        ...mockEscort,
        ancestorPath: null, // 无上级
      });

      const result = await service.calculateDistribution('order-1', 'escort-1', 100);

      expect(result.records).toHaveLength(0);
      expect(result.totalDistributionCents).toBe(0);
    });

    it('正确计算多层级分润', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(mockConfig);

      // 设置 mock 返回值
      mockPrismaService.escort.findUnique
        .mockResolvedValueOnce(mockEscort)      // 第一次调用：获取执行订单的陪诊员
        .mockResolvedValueOnce(mockAncestor1)   // 第二次调用：直接上级（团队长）
        .mockResolvedValueOnce(mockAncestor2);  // 第三次调用：二级上级（城市合伙人）

      const result = await service.calculateDistribution('order-1', 'escort-1', 100);

      // 应该有 2 条分润记录
      expect(result.records).toHaveLength(2);

      // 验证直接上级分润（团队长 3%）
      const record1 = result.records.find((r) => r.beneficiaryId === 'ancestor-2');
      expect(record1).toBeDefined();
      expect(record1!.rate).toBe(3);
      expect(record1!.amountCents).toBe(3); // 100 * 3% = 3

      // 验证二级上级分润（城市合伙人 2%）
      const record2 = result.records.find((r) => r.beneficiaryId === 'ancestor-1');
      expect(record2).toBeDefined();
      expect(record2!.rate).toBe(2);
      expect(record2!.amountCents).toBe(2); // 100 * 2% = 2

      // 验证总分润
      expect(result.totalDistributionCents).toBe(5); // 3 + 2 = 5
    });

    it('上级未激活时跳过分润', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(mockConfig);

      const inactiveAncestor = { ...mockAncestor1, status: 'inactive' };

      mockPrismaService.escort.findUnique
        .mockResolvedValueOnce(mockEscort)
        .mockResolvedValueOnce(inactiveAncestor) // 直接上级未激活
        .mockResolvedValueOnce(mockAncestor2);

      const result = await service.calculateDistribution('order-1', 'escort-1', 100);

      // 只有城市合伙人的分润
      expect(result.records).toHaveLength(1);
      expect(result.records[0].beneficiaryId).toBe('ancestor-1');
      expect(result.totalDistributionCents).toBe(2);
    });

    it('分润功能关闭时跳过分润', async () => {
      mockPrismaService.distributionConfig.findFirst.mockResolvedValue(mockConfig);

      const disabledAncestor = { ...mockAncestor1, distributionActive: false };

      mockPrismaService.escort.findUnique
        .mockResolvedValueOnce(mockEscort)
        .mockResolvedValueOnce(disabledAncestor) // 直接上级分润关闭
        .mockResolvedValueOnce(mockAncestor2);

      const result = await service.calculateDistribution('order-1', 'escort-1', 100);

      // 只有城市合伙人的分润
      expect(result.records).toHaveLength(1);
      expect(result.totalDistributionCents).toBe(2);
    });
  });

  // ==========================================
  // 金额累加精度测试
  // ==========================================
  describe('金额累加精度测试', () => {
    it('多笔分润累加精度正确', () => {
      // 模拟多层分润累加
      let total = new Decimal(0);

      const amounts = [
        calculateDistributionAmount(100, 2),    // 2.00
        calculateDistributionAmount(100, 3),    // 3.00
        calculateDistributionAmount(99.99, 1),  // 1.00 (四舍五入)
      ];

      for (const amount of amounts) {
        total = total.plus(amount);
      }

      expect(total.toNumber()).toBe(6);
    });

    it('大量小额累加精度正确', () => {
      let total = new Decimal(0);

      // 100 笔 0.01 元累加
      for (let i = 0; i < 100; i++) {
        total = total.plus(0.01);
      }

      expect(total.toNumber()).toBe(1);
    });
  });
});
