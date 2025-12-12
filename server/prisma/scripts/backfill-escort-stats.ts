/**
 * 回填脚本：更新陪诊员统计数据 (冗余字段)
 *
 * 用途：
 *   - 计算并更新每个陪诊员的 totalOrders (累计订单数)
 *   - 计算并更新每个陪诊员的 totalDistributionAmount (累计分润总额)
 *
 * 执行方式：
 *   cd server && npx ts-node prisma/scripts/backfill-escort-stats.ts
 *
 * 或者使用 tsx (更快):
 *   cd server && npx tsx prisma/scripts/backfill-escort-stats.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface EscortStats {
  escortId: string;
  escortName: string;
  totalOrders: number;
  totalDistributionAmount: Prisma.Decimal;
}

async function backfillEscortStats() {
  console.log('========================================');
  console.log('🚀 开始回填陪诊员统计数据');
  console.log('========================================\n');

  const startTime = Date.now();

  // 1. 获取所有陪诊员
  console.log('📋 正在获取所有陪诊员...');
  const escorts = await prisma.escort.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
    },
  });
  console.log(`   找到 ${escorts.length} 个陪诊员\n`);

  if (escorts.length === 0) {
    console.log('⚠️  没有找到任何陪诊员，退出脚本');
    return;
  }

  // 2. 遍历每个陪诊员，计算统计数据
  const stats: EscortStats[] = [];
  let successCount = 0;
  let errorCount = 0;

  console.log('📊 开始计算每个陪诊员的统计数据...\n');

  for (let i = 0; i < escorts.length; i++) {
    const escort = escorts[i];
    const progress = `[${i + 1}/${escorts.length}]`;

    try {
      console.log(`${progress} 处理陪诊员: ${escort.name} (${escort.phone})`);

      // 2.1 查询订单总数
      // 只统计有效订单 (已完成的订单)
      const orderCount = await prisma.order.count({
        where: {
          escortId: escort.id,
          status: 'completed', // 只计算已完成的订单
        },
      });
      console.log(`   - 订单总数: ${orderCount}`);

      // 2.2 查询分润总额
      // 只统计已结算的分润记录
      const distributionSum = await prisma.distributionRecord.aggregate({
        where: {
          beneficiaryId: escort.id,
          status: 'settled', // 只计算已结算的分润
        },
        _sum: {
          amount: true,
        },
      });
      const totalAmount = distributionSum._sum.amount || new Prisma.Decimal(0);
      console.log(`   - 分润总额: ¥${totalAmount.toFixed(2)}`);

      // 2.3 更新陪诊员记录
      await prisma.escort.update({
        where: { id: escort.id },
        data: {
          totalOrders: orderCount,
          totalDistributionAmount: totalAmount,
        },
      });
      console.log(`   ✅ 更新成功\n`);

      stats.push({
        escortId: escort.id,
        escortName: escort.name,
        totalOrders: orderCount,
        totalDistributionAmount: totalAmount,
      });

      successCount++;
    } catch (error) {
      console.error(`   ❌ 更新失败: ${error}\n`);
      errorCount++;
    }
  }

  // 3. 输出统计汇总
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('========================================');
  console.log('📈 回填完成，统计汇总:');
  console.log('========================================');
  console.log(`   总陪诊员数: ${escorts.length}`);
  console.log(`   成功更新: ${successCount}`);
  console.log(`   失败数量: ${errorCount}`);
  console.log(`   耗时: ${duration} 秒`);
  console.log('');

  // 4. 输出详细统计表
  if (stats.length > 0) {
    console.log('📊 详细统计:');
    console.log('----------------------------------------');
    console.log('| 陪诊员名称 | 订单数 | 分润总额 (元) |');
    console.log('|------------|--------|---------------|');

    // 按订单数降序排列
    stats.sort((a, b) => b.totalOrders - a.totalOrders);

    for (const stat of stats) {
      const name = stat.escortName.padEnd(10, ' ');
      const orders = stat.totalOrders.toString().padStart(6, ' ');
      const amount = stat.totalDistributionAmount.toFixed(2).padStart(13, ' ');
      console.log(`| ${name} | ${orders} | ${amount} |`);
    }
    console.log('----------------------------------------');
  }

  // 5. 汇总统计
  const totalOrdersSum = stats.reduce((sum, s) => sum + s.totalOrders, 0);
  const totalAmountSum = stats.reduce(
    (sum, s) => sum.add(s.totalDistributionAmount),
    new Prisma.Decimal(0),
  );

  console.log('');
  console.log('📊 平台汇总:');
  console.log(`   累计完成订单: ${totalOrdersSum} 单`);
  console.log(`   累计分润金额: ¥${totalAmountSum.toFixed(2)}`);
  console.log('');
  console.log('🎉 回填脚本执行完毕！');
}

// 执行主函数
backfillEscortStats()
  .catch((error) => {
    console.error('❌ 脚本执行出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
