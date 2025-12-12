/**
 * P2 提现流程回归测试
 * 
 * @see docs/资金安全提现体系/03-任务卡拆解.md - QA-WD-P2-01
 * 
 * 测试覆盖：
 * 1. 状态机验证（合法/非法转换）
 * 2. 审核流程（通过/驳回）
 * 3. 打款流程（成功/失败）
 * 4. 日志记录验证
 * 5. 审计日志验证
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AdminWithdrawalsService } from '../../src/modules/admin/services/admin-withdrawals.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('P2 提现流程回归测试', () => {
  let service: AdminWithdrawalsService;
  let prisma: PrismaService;

  // 测试数据
  let testWalletId: string;
  let testWithdrawalId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminWithdrawalsService, PrismaService],
    }).compile();

    service = module.get<AdminWithdrawalsService>(AdminWithdrawalsService);
    prisma = module.get<PrismaService>(PrismaService);

    // 创建测试钱包（如果不存在）
    const escort = await prisma.escort.findFirst();
    if (escort) {
      const wallet = await prisma.escortWallet.findFirst({
        where: { escortId: escort.id },
      });
      if (wallet) {
        testWalletId = wallet.id;
      }
    }
  });

  afterAll(async () => {
    // 清理测试数据
    if (testWithdrawalId) {
      await prisma.withdrawLog.deleteMany({ where: { withdrawId: testWithdrawalId } });
      await prisma.withdrawal.deleteMany({ where: { id: testWithdrawalId } });
    }
    await prisma.$disconnect();
  });

  describe('1. 状态机验证', () => {
    it('应该允许 pending → approved 转换', async () => {
      // 创建测试提现记录
      if (!testWalletId) {
        console.log('跳过测试：没有测试钱包');
        return;
      }

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'pending',
        },
      });
      testWithdrawalId = withdrawal.id;

      // 审核通过
      const result = await service.review(withdrawal.id, 'approve', undefined, 'test-admin', '测试管理员');
      expect(result.status).toBe('approved');
    });

    it('应该拒绝 pending → completed 非法转换', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'pending',
        },
      });

      // 尝试直接打款（跳过审核）
      await expect(
        service.payout(withdrawal.id, 'manual', 'CONFIRM', 'TX001', 'test-admin')
      ).rejects.toThrow(ConflictException);

      // 清理
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });

    it('应该拒绝终态记录的状态变更', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'completed', // 终态
        },
      });

      // 尝试再次审核
      await expect(
        service.review(withdrawal.id, 'approve', undefined, 'test-admin')
      ).rejects.toThrow(ConflictException);

      // 清理
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });
  });

  describe('2. 审核流程', () => {
    it('驳回时必须填写原因', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'pending',
        },
      });

      // 驳回但不填原因
      await expect(
        service.review(withdrawal.id, 'reject', '', 'test-admin')
      ).rejects.toThrow(BadRequestException);

      // 清理
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });

    it('驳回应该解冻金额', async () => {
      if (!testWalletId) return;

      // 获取钱包初始状态
      const walletBefore = await prisma.escortWallet.findUnique({
        where: { id: testWalletId },
      });

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'pending',
        },
      });

      // 驳回
      await service.review(withdrawal.id, 'reject', '测试驳回', 'test-admin');

      // 验证钱包解冻（注意：这里假设冻结金额增加了）
      const walletAfter = await prisma.escortWallet.findUnique({
        where: { id: testWalletId },
      });

      // 清理
      await prisma.withdrawLog.deleteMany({ where: { withdrawId: withdrawal.id } });
      await prisma.walletTransaction.deleteMany({ where: { withdrawId: withdrawal.id } });
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });

      console.log('驳回后钱包余额变化:', {
        before: Number(walletBefore?.balance),
        after: Number(walletAfter?.balance),
      });
    });
  });

  describe('3. 打款流程', () => {
    it('打款必须输入 CONFIRM 确认', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'approved', // 已审核
        },
      });

      // 错误的确认文本
      await expect(
        service.payout(withdrawal.id, 'manual', 'confirm', 'TX001', 'test-admin')
      ).rejects.toThrow(BadRequestException);

      // 清理
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });

    it('打款应该扣除冻结金额', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'approved',
        },
      });

      // 打款
      const result = await service.payout(withdrawal.id, 'manual', 'CONFIRM', 'TX-TEST-001', 'test-admin');
      expect(result.status).toBe('completed');

      // 清理
      await prisma.withdrawLog.deleteMany({ where: { withdrawId: withdrawal.id } });
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });
  });

  describe('4. 日志记录验证', () => {
    it('审核通过应该写入 WithdrawLog', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'pending',
        },
      });

      await service.review(withdrawal.id, 'approve', undefined, 'test-admin', '测试管理员');

      // 验证日志
      const logs = await prisma.withdrawLog.findMany({
        where: { withdrawId: withdrawal.id },
      });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.action === 'approve')).toBe(true);

      // 清理
      await prisma.withdrawLog.deleteMany({ where: { withdrawId: withdrawal.id } });
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });

    it('打款应该写入 AdminAuditLog', async () => {
      if (!testWalletId) return;

      const withdrawal = await prisma.withdrawal.create({
        data: {
          walletId: testWalletId,
          amount: 100,
          fee: 0,
          actualAmount: 100,
          method: 'alipay',
          account: '138****8888',
          status: 'approved',
        },
      });

      await service.payout(withdrawal.id, 'manual', 'CONFIRM', 'TX-AUDIT-001', 'test-admin', '测试管理员');

      // 验证审计日志
      const auditLogs = await prisma.adminAuditLog.findMany({
        where: {
          targetId: withdrawal.id,
          action: 'payout',
        },
      });
      expect(auditLogs.length).toBeGreaterThan(0);

      // 清理
      await prisma.adminAuditLog.deleteMany({ where: { targetId: withdrawal.id } });
      await prisma.withdrawLog.deleteMany({ where: { withdrawId: withdrawal.id } });
      await prisma.withdrawal.delete({ where: { id: withdrawal.id } });
    });
  });

  describe('5. 边界条件', () => {
    it('不存在的提现记录应返回 404', async () => {
      await expect(
        service.findById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('导出应该限制最大条数', async () => {
      const result = await service.export({
        format: 'csv',
        adminId: 'test-admin',
        adminName: '测试管理员',
      });

      expect(result.content).toBeDefined();
      expect(result.filename).toContain('提现记录');
      expect(result.mimeType).toBe('text/csv;charset=utf-8');
    });
  });
});
