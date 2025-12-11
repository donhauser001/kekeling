/**
 * 测试数据准备脚本
 * 
 * 使用方法：
 * 1. 确保数据库已连接
 * 2. 运行: ts-node test/marketing/test-data-setup.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupTestData() {
  console.log('📦 开始准备测试数据...\n')

  try {
    // 1. 创建测试服务
    console.log('1. 创建测试服务...')
    let testService = await prisma.service.findFirst({
      where: { name: '测试服务-营销中心' },
    })

    if (!testService) {
      testService = await prisma.service.create({
        data: {
          name: '测试服务-营销中心',
          description: '用于营销中心测试的服务',
          price: 100,
          originalPrice: 100,
          duration: '2小时',
          orderCount: 0,
          rating: 0,
          status: 'active',
        },
      })
      console.log(`   ✅ 创建服务: ${testService.id}`)
    } else {
      console.log(`   ℹ️  服务已存在: ${testService.id}`)
    }

    // 2. 创建会员等级
    console.log('\n2. 创建会员等级...')
    let testLevel = await prisma.membershipLevel.findFirst({
      where: { name: '测试会员' },
    })

    if (!testLevel) {
      testLevel = await prisma.membershipLevel.create({
        data: {
          name: '测试会员',
          level: 1,
          discount: 10, // 10% 折扣
          price: 99,
          duration: 30,
          benefits: ['测试权益1', '测试权益2'],
          status: 'active',
        },
      })
      console.log(`   ✅ 创建会员等级: ${testLevel.id}`)
    } else {
      console.log(`   ℹ️  会员等级已存在: ${testLevel.id}`)
    }

    // 3. 创建会员方案
    console.log('\n3. 创建会员方案...')
    let testPlan = await prisma.membershipPlan.findFirst({
      where: { levelId: testLevel.id },
    })

    if (!testPlan) {
      testPlan = await prisma.membershipPlan.create({
        data: {
          levelId: testLevel.id,
          code: 'test_plan',
          name: '测试方案',
          price: 99,
          duration: 30,
          status: 'active',
        },
      })
      console.log(`   ✅ 创建会员方案: ${testPlan.id}`)
    } else {
      console.log(`   ℹ️  会员方案已存在: ${testPlan.id}`)
    }

    // 4. 创建优惠券模板
    console.log('\n4. 创建优惠券模板...')
    let testCouponTemplate = await prisma.couponTemplate.findFirst({
      where: { name: '测试优惠券' },
    })

    if (!testCouponTemplate) {
      testCouponTemplate = await prisma.couponTemplate.create({
        data: {
          name: '测试优惠券',
          type: 'amount',
          value: 20,
          minAmount: 50,
          applicableScope: 'all',
          perUserLimit: 2,
          totalQuantity: 100,
          validityType: 'relative',
          validDays: 30,
          status: 'active',
        },
      })
      console.log(`   ✅ 创建优惠券模板: ${testCouponTemplate.id}`)
    } else {
      console.log(`   ℹ️  优惠券模板已存在: ${testCouponTemplate.id}`)
    }

    // 5. 创建活动
    console.log('\n5. 创建活动...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    let testCampaign = await prisma.campaign.findFirst({
      where: { name: '测试活动' },
    })

    if (!testCampaign) {
      testCampaign = await prisma.campaign.create({
        data: {
          name: '测试活动',
          type: 'flash_sale',
          startAt: tomorrow,
          endAt: nextWeek,
          discountType: 'percent',
          discountValue: 10, // 10% 折扣
          minAmount: 0,
          applicableScope: 'all',
          status: 'pending',
        },
      })
      console.log(`   ✅ 创建活动: ${testCampaign.id}`)
    } else {
      console.log(`   ℹ️  活动已存在: ${testCampaign.id}`)
    }

    // 6. 创建价格配置
    console.log('\n6. 创建价格配置...')
    let pricingConfig = await prisma.pricingConfig.findFirst()

    if (!pricingConfig) {
      pricingConfig = await prisma.pricingConfig.create({
        data: {
          discountStackMode: 'sequential',
          couponStackWithMember: true,
          pointsEnabled: true,
          pointsRate: 100, // 100积分 = 1元
          pointsMaxRate: 0.5, // 最大抵扣50%
          minPayAmount: 0,
          showOriginalPrice: true,
          showMemberPrice: true,
          showSavings: true,
        },
      })
      console.log(`   ✅ 创建价格配置: ${pricingConfig.id}`)
    } else {
      console.log(`   ℹ️  价格配置已存在: ${pricingConfig.id}`)
    }

    // 7. 创建积分规则
    console.log('\n7. 创建积分规则...')
    const pointRules = [
      {
        name: '订单消费',
        code: 'order_consume',
        points: 0, // 固定积分值（使用 pointsRate 计算）
        pointsRate: 1, // 1元 = 1积分
        dailyLimit: null,
        totalLimit: null,
      },
      {
        name: '每日签到',
        code: 'daily_checkin',
        points: 10, // 固定10积分
        pointsRate: null,
        dailyLimit: 1,
        totalLimit: null,
      },
    ]

    for (const rule of pointRules) {
      const existing = await prisma.pointRule.findUnique({
        where: { code: rule.code },
      })

      if (!existing) {
        await prisma.pointRule.create({
          data: {
            ...rule,
            status: 'active',
          },
        })
        console.log(`   ✅ 创建积分规则: ${rule.code}`)
      } else {
        console.log(`   ℹ️  积分规则已存在: ${rule.code}`)
      }
    }

    // 8. 创建邀请规则
    console.log('\n8. 创建邀请规则...')
    let referralRule = await prisma.referralRule.findFirst({
      where: { type: 'user' },
    })

    if (!referralRule) {
      referralRule = await prisma.referralRule.create({
        data: {
          name: '用户邀请规则',
          type: 'user',
          inviterPoints: 100, // 邀请人获得100积分
          inviteePoints: 50, // 被邀请人获得50积分
          requireFirstOrder: true,
          dailyLimit: 10,
          totalLimit: 100,
          status: 'active',
        },
      })
      console.log(`   ✅ 创建邀请规则: ${referralRule.id}`)
    } else {
      console.log(`   ℹ️  邀请规则已存在: ${referralRule.id}`)
    }

    console.log('\n✅ 测试数据准备完成！')
    console.log('\n测试数据ID:')
    console.log(`  服务ID: ${testService.id}`)
    console.log(`  会员等级ID: ${testLevel.id}`)
    console.log(`  会员方案ID: ${testPlan.id}`)
    console.log(`  优惠券模板ID: ${testCouponTemplate.id}`)
    console.log(`  活动ID: ${testCampaign.id}`)
    console.log(`  价格配置ID: ${pricingConfig.id}`)
    console.log(`  邀请规则ID: ${referralRule.id}`)
  } catch (error) {
    console.error('❌ 测试数据准备失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  setupTestData()
    .then(() => {
      console.log('\n完成！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('错误:', error)
      process.exit(1)
    })
}

export { setupTestData }

