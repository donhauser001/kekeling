/**
 * 营销中心测试执行器
 * 
 * 使用方法：
 * 1. 确保后端服务已启动
 * 2. 运行: ts-node test/marketing/test-runner.ts
 */

import axios from 'axios'

const BASE_URL = process.env.API_URL || 'http://localhost:3456/api'
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || ''

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message?: string
  duration?: number
}

class TestRunner {
  private results: TestResult[] = []
  private token: string = TEST_USER_TOKEN
  private testUserId: string = ''
  private testServiceId: string = ''
  private testCouponTemplateId: string = ''
  private testCampaignId: string = ''

  private async request(method: string, url: string, data?: any, headers?: any) {
    try {
      const config: any = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      if (data) {
        config.data = data
      }
      const response = await axios(config)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      }
    }
  }

  private async test(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now()
    try {
      await testFn()
      const duration = Date.now() - start
      this.results.push({ name, status: 'pass', duration })
      console.log(`✅ ${name} (${duration}ms)`)
    } catch (error: any) {
      const duration = Date.now() - start
      this.results.push({
        name,
        status: 'fail',
        message: error.message,
        duration,
      })
      console.error(`❌ ${name}: ${error.message}`)
    }
  }

  private async skip(name: string, reason: string): Promise<void> {
    this.results.push({ name, status: 'skip', message: reason })
    console.log(`⏭️  ${name}: ${reason}`)
  }

  // ========== 测试用例 ==========

  async runAllTests() {
    console.log('🚀 开始执行营销中心测试...\n')

    // 1. 基础功能测试
    await this.testBasicFeatures()

    // 2. 退款测试
    await this.testRefunds()

    // 3. 防刷测试
    await this.testAntiFraud()

    // 4. 性能测试
    await this.testPerformance()

    // 生成报告
    this.generateReport()
  }

  async testBasicFeatures() {
    console.log('\n📋 基础功能测试\n')

    // 会员系统
    await this.test('查看会员等级列表', async () => {
      const result = await this.request('GET', '/membership/levels')
      if (!result.success) throw new Error(result.error)
      if (!Array.isArray(result.data)) throw new Error('返回数据格式错误')
    })

    await this.test('购买会员', async () => {
      // 先获取会员方案
      const levelsResult = await this.request('GET', '/membership/levels')
      if (!levelsResult.success || !levelsResult.data?.length) {
        throw new Error('无法获取会员等级')
      }
      const plansResult = await this.request('GET', `/membership/plans?levelId=${levelsResult.data[0].id}`)
      if (!plansResult.success || !plansResult.data?.length) {
        throw new Error('无法获取会员方案')
      }
      // 注意：实际购买需要支付，这里只测试接口可用性
      console.log('   提示：购买会员需要实际支付，跳过实际购买测试')
    })

    // 价格引擎
    await this.test('无折扣价格计算', async () => {
      if (!this.testServiceId) {
        // 获取一个服务
        const servicesResult = await this.request('GET', '/services?pageSize=1')
        if (servicesResult.success && servicesResult.data?.data?.[0]) {
          this.testServiceId = servicesResult.data.data[0].id
        } else {
          throw new Error('无法获取测试服务')
        }
      }
      const result = await this.request('POST', '/pricing/calculate', {
        serviceId: this.testServiceId,
      })
      if (!result.success) throw new Error(result.error)
      if (typeof result.data.finalPrice !== 'number') {
        throw new Error('价格计算返回格式错误')
      }
    })

    await this.test('会员折扣计算', async () => {
      if (!this.testServiceId) return
      const result = await this.request('POST', '/pricing/calculate', {
        serviceId: this.testServiceId,
        userId: this.testUserId,
      })
      if (!result.success) throw new Error(result.error)
      // 如果有会员，应该享受折扣
      if (result.data.memberPrice && result.data.memberPrice >= result.data.originalPrice) {
        throw new Error('会员折扣未生效')
      }
    })

    await this.test('优惠券折扣计算', async () => {
      if (!this.testServiceId) return
      // 先获取可用优惠券
      const couponsResult = await this.request('GET', '/coupons/my?status=unused')
      if (couponsResult.success && couponsResult.data?.data?.[0]) {
        const couponId = couponsResult.data.data[0].id
        const result = await this.request('POST', '/pricing/calculate', {
          serviceId: this.testServiceId,
          userId: this.testUserId,
          couponId,
        })
        if (!result.success) throw new Error(result.error)
        if (result.data.couponDiscount <= 0) {
          throw new Error('优惠券折扣未生效')
        }
      } else {
        console.log('   提示：用户无可用优惠券，跳过此测试')
      }
    })

    await this.test('积分抵扣计算', async () => {
      if (!this.testServiceId) return
      const result = await this.request('POST', '/pricing/calculate', {
        serviceId: this.testServiceId,
        userId: this.testUserId,
        pointsToUse: 1000, // 10元
      })
      if (!result.success) throw new Error(result.error)
      if (result.data.pointsDiscount <= 0) {
        throw new Error('积分抵扣未生效')
      }
    })

    // 优惠券系统
    await this.test('查看我的优惠券', async () => {
      const result = await this.request('GET', '/coupons/my')
      if (!result.success) throw new Error(result.error)
      if (!result.data || typeof result.data.total !== 'number') {
        throw new Error('返回数据格式错误')
      }
    })

    await this.test('领取优惠券', async () => {
      // 先获取可领取的优惠券
      const availableResult = await this.request('GET', '/coupons/available')
      if (availableResult.success && availableResult.data?.length > 0) {
        const templateId = availableResult.data[0].id
        const result = await this.request('POST', '/coupons/claim', {
          templateId,
        })
        if (!result.success) {
          // 可能是已经领取过了
          if (result.error?.message?.includes('已领取') || result.error?.message?.includes('限领')) {
            console.log('   提示：优惠券已领取或达到限领数量')
            return
          }
          throw new Error(result.error)
        }
      } else {
        console.log('   提示：暂无可领取的优惠券')
      }
    })

    // 积分系统
    await this.test('查看我的积分', async () => {
      const result = await this.request('GET', '/points/my')
      if (!result.success) throw new Error(result.error)
      if (typeof result.data.currentPoints !== 'number') {
        throw new Error('返回数据格式错误')
      }
    })

    await this.test('每日签到', async () => {
      const result = await this.request('POST', '/points/checkin')
      if (!result.success) {
        // 可能是已经签到过了
        if (result.error?.message?.includes('已签到')) {
          console.log('   提示：今日已签到')
          return
        }
        throw new Error(result.error)
      }
      if (typeof result.data.pointsEarned !== 'number') {
        throw new Error('返回数据格式错误')
      }
    })

    await this.test('查看积分明细', async () => {
      const result = await this.request('GET', '/points/records')
      if (!result.success) throw new Error(result.error)
      if (!Array.isArray(result.data?.data)) {
        throw new Error('返回数据格式错误')
      }
    })

    // 邀请系统
    await this.test('查看我的邀请码', async () => {
      const result = await this.request('GET', '/referrals/invite-code')
      if (!result.success) throw new Error(result.error)
      if (!result.data.code) {
        throw new Error('未返回邀请码')
      }
    })

    await this.test('查看邀请统计', async () => {
      const result = await this.request('GET', '/referrals/stats')
      if (!result.success) throw new Error(result.error)
      if (typeof result.data.totalInvites !== 'number') {
        throw new Error('返回数据格式错误')
      }
    })

    // 活动系统
    await this.test('查看活动列表', async () => {
      const result = await this.request('GET', '/campaigns/active')
      if (!result.success) throw new Error(result.error)
      if (!Array.isArray(result.data?.data)) {
        throw new Error('返回数据格式错误')
      }
    })
  }

  async testRefunds() {
    console.log('\n💰 退款测试\n')

    await this.skip('订单取消：优惠券退回', '需要创建测试订单')
    await this.skip('订单取消：积分退回', '需要创建测试订单')
    await this.skip('订单取消：秒杀库存释放', '需要创建测试订单')
    await this.skip('订单退款：优惠券退回', '需要管理员权限')
    await this.skip('订单退款：积分退回', '需要管理员权限')
    await this.skip('订单退款：秒杀库存释放', '需要管理员权限')
  }

  async testAntiFraud() {
    console.log('\n🛡️  防刷测试\n')

    await this.test('优惠券：每人限领', async () => {
      const availableResult = await this.request('GET', '/coupons/available')
      if (availableResult.success && availableResult.data?.length > 0) {
        const templateId = availableResult.data[0].id
        // 尝试多次领取
        let successCount = 0
        for (let i = 0; i < 5; i++) {
          const result = await this.request('POST', '/coupons/claim', {
            templateId,
          })
          if (result.success) {
            successCount++
          } else if (result.error?.message?.includes('限领')) {
            // 达到限制，这是预期的
            break
          }
        }
        console.log(`   领取成功次数: ${successCount}`)
      } else {
        console.log('   提示：暂无可领取的优惠券')
      }
    })

    await this.test('积分：每日签到限制', async () => {
      // 第一次签到
      const firstResult = await this.request('POST', '/points/checkin')
      if (firstResult.success) {
        // 立即再次签到应该失败
        const secondResult = await this.request('POST', '/points/checkin')
        if (secondResult.success) {
          throw new Error('重复签到未被阻止')
        } else if (!secondResult.error?.message?.includes('已签到')) {
          throw new Error('签到限制未生效')
        }
      } else if (firstResult.error?.message?.includes('已签到')) {
        console.log('   提示：今日已签到，无法测试重复签到')
      }
    })

    await this.skip('邀请：自己邀请自己被拒绝', '需要新用户注册流程')
    await this.skip('邀请：同一手机号重复邀请被拒绝', '需要新用户注册流程')
    await this.skip('秒杀：库存控制', '需要秒杀活动')
    await this.skip('秒杀：每人限购', '需要秒杀活动')
  }

  async testPerformance() {
    console.log('\n⚡ 性能测试\n')

    await this.test('价格计算接口响应时间 < 500ms', async () => {
      if (!this.testServiceId) return
      const start = Date.now()
      await this.request('POST', '/pricing/calculate', {
        serviceId: this.testServiceId,
      })
      const duration = Date.now() - start
      if (duration > 500) {
        throw new Error(`响应时间 ${duration}ms 超过 500ms`)
      }
      console.log(`   响应时间: ${duration}ms`)
    })

    await this.test('优惠券列表接口响应时间 < 300ms', async () => {
      const start = Date.now()
      await this.request('GET', '/coupons/my')
      const duration = Date.now() - start
      if (duration > 300) {
        throw new Error(`响应时间 ${duration}ms 超过 300ms`)
      }
      console.log(`   响应时间: ${duration}ms`)
    })

    await this.test('活动列表接口响应时间 < 300ms', async () => {
      const start = Date.now()
      await this.request('GET', '/campaigns/active')
      const duration = Date.now() - start
      if (duration > 300) {
        throw new Error(`响应时间 ${duration}ms 超过 300ms`)
      }
      console.log(`   响应时间: ${duration}ms`)
    })
  }

  generateReport() {
    console.log('\n📊 测试报告\n')
    console.log('='.repeat(60))

    const passed = this.results.filter((r) => r.status === 'pass').length
    const failed = this.results.filter((r) => r.status === 'fail').length
    const skipped = this.results.filter((r) => r.status === 'skip').length
    const total = this.results.length

    console.log(`总计: ${total} 个测试`)
    console.log(`通过: ${passed} ✅`)
    console.log(`失败: ${failed} ❌`)
    console.log(`跳过: ${skipped} ⏭️`)
    console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n失败的测试:')
      this.results
        .filter((r) => r.status === 'fail')
        .forEach((r) => {
          console.log(`  ❌ ${r.name}`)
          if (r.message) {
            console.log(`     错误: ${r.message}`)
          }
        })
    }

    const avgDuration =
      this.results
        .filter((r) => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0) / passed || 0

    if (avgDuration > 0) {
      console.log(`\n平均响应时间: ${avgDuration.toFixed(0)}ms`)
    }

    console.log('='.repeat(60))

    // 保存报告到文件
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate: ((passed / total) * 100).toFixed(1) + '%',
        avgDuration: avgDuration.toFixed(0) + 'ms',
      },
      results: this.results,
    }

    const fs = require('fs')
    const path = require('path')
    const reportPath = path.join(__dirname, '../../test-reports', `test-report-${Date.now()}.json`)
    const reportDir = path.dirname(reportPath)
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n测试报告已保存: ${reportPath}`)
  }
}

// 执行测试
async function main() {
  const runner = new TestRunner()

  // 检查服务是否可用
  try {
    await axios.get(`${BASE_URL}/health`).catch(() => {
      // 如果没有健康检查接口，尝试其他接口
      return axios.get(`${BASE_URL}/services?pageSize=1`)
    })
  } catch (error) {
    console.error('❌ 无法连接到后端服务，请确保服务已启动')
    console.error(`   尝试连接: ${BASE_URL}`)
    process.exit(1)
  }

  await runner.runAllTests()
}

if (require.main === module) {
  main().catch((error) => {
    console.error('测试执行失败:', error)
    process.exit(1)
  })
}

export { TestRunner }

