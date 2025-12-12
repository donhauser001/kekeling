/**
 * 分润计算单元测试
 *
 * 目标：锁定 calculateDistribution 重构前后行为一致
 *
 * ⚠️ 重要：所有金额使用「分」（cents）进行计算
 *
 * 覆盖用例：
 * - 1 分（0.01 元）极小金额
 * - 仅 1 级、2 级（不足 3 级）
 * - 费率 0 / 100%
 * - 超大金额 99999999 分（999999.99 元）
 * - 多笔订单随机回归（50 组 + 1000 组）
 */
import { Test, TestingModule } from '@nestjs/testing'
import { DistributionService, DistributionResult, yuanToCents, centsToYuan } from '../../src/modules/distribution/distribution.service'
import { PrismaService } from '../../src/prisma/prisma.service'

// ============================================================================
// 测试数据构造器
// ============================================================================

interface MockDistributionConfig {
    status: string
    l1CommissionRate: number // 城市合伙人费率（百分比）
    l2CommissionRate: number // 团队长费率
    l3CommissionRate: number // 普通陪诊员费率（仅直推）
    directInviteBonus: number
}

interface MockEscort {
    id: string
    status: string
    distributionLevel: number // 1=城市合伙人, 2=团队长, 3=普通
    distributionActive: boolean
    ancestorPath: string | null
}

function createMockConfig(overrides: Partial<MockDistributionConfig> = {}): MockDistributionConfig {
    return {
        status: 'active',
        l1CommissionRate: 10, // 10%
        l2CommissionRate: 5,  // 5%
        l3CommissionRate: 2,  // 2%（仅直推）
        directInviteBonus: 50,
        ...overrides,
    }
}

function createMockEscort(overrides: Partial<MockEscort> = {}): MockEscort {
    return {
        id: 'escort-test',
        status: 'active',
        distributionLevel: 3,
        distributionActive: true,
        ancestorPath: null,
        ...overrides,
    }
}

// Mock PrismaService 类型
interface MockPrismaService {
    distributionConfig: {
        findFirst: jest.Mock
    }
    escort: {
        findUnique: jest.Mock
    }
}

// ============================================================================
// 测试套件
// ============================================================================

describe('DistributionService.calculateDistribution', () => {
    let service: DistributionService
    let prisma: MockPrismaService

    beforeEach(async () => {
        const mockPrisma: MockPrismaService = {
            distributionConfig: {
                findFirst: jest.fn(),
            },
            escort: {
                findUnique: jest.fn(),
            },
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DistributionService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile()

        service = module.get<DistributionService>(DistributionService)
        prisma = module.get(PrismaService) as unknown as MockPrismaService
    })

    // --------------------------------------------------------------------------
    // 工具函数测试
    // --------------------------------------------------------------------------

    describe('金额转换工具函数', () => {
        it('yuanToCents: 1 元 = 100 分', () => {
            expect(yuanToCents(1)).toBe(100)
        })

        it('yuanToCents: 0.01 元 = 1 分', () => {
            expect(yuanToCents(0.01)).toBe(1)
        })

        it('yuanToCents: 999999.99 元 = 99999999 分', () => {
            expect(yuanToCents(999999.99)).toBe(99999999)
        })

        it('yuanToCents: 处理浮点精度（0.1 + 0.2）', () => {
            // 0.1 + 0.2 在 JS 中是 0.30000000000000004
            expect(yuanToCents(0.1 + 0.2)).toBe(30)
        })

        it('centsToYuan: 100 分 = 1 元', () => {
            expect(centsToYuan(100)).toBe(1)
        })

        it('centsToYuan: 1 分 = 0.01 元', () => {
            expect(centsToYuan(1)).toBe(0.01)
        })
    })

    // --------------------------------------------------------------------------
    // 基础用例
    // --------------------------------------------------------------------------

    describe('基础场景', () => {
        it('should be defined', () => {
            expect(service).toBeDefined()
        })

        it('无激活配置时返回空结果', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(null)

            const result = await service.calculateDistribution('order-1', 'escort-1', 10000) // 100 元

            expect(result.records).toEqual([])
            expect(result.totalDistributionCents).toBe(0)
        })

        it('陪诊员不存在时抛出异常', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(createMockConfig() as any)
            prisma.escort.findUnique.mockResolvedValue(null)

            await expect(service.calculateDistribution('order-1', 'escort-1', 10000))
                .rejects.toThrow('陪诊员不存在')
        })

        it('无上级链路时返回空结果', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(createMockConfig() as any)
            prisma.escort.findUnique.mockResolvedValue(
                createMockEscort({ ancestorPath: null }) as any
            )

            const result = await service.calculateDistribution('order-1', 'escort-1', 10000)

            expect(result.records).toEqual([])
            expect(result.totalDistributionCents).toBe(0)
        })
    })

    // --------------------------------------------------------------------------
    // 极小金额测试（1 分 = 0.01 元）
    // --------------------------------------------------------------------------

    describe('极小金额（1 分 = 0.01 元）', () => {
        it('1 分订单 - L1 上级（10%）应得 0 分（四舍五入）', async () => {
            const config = createMockConfig({ l1CommissionRate: 10 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 1) // 1 分

            // 1 * 10 / 100 = 0.1, Math.round(0.1) = 0
            expect(result.records.length).toBe(1)
            expect(result.records[0].amountCents).toBe(0)
            expect(result.totalDistributionCents).toBe(0)
        })

        it('1 分订单 - L1 上级（100%）应得 1 分', async () => {
            const config = createMockConfig({ l1CommissionRate: 100 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 1)

            // 1 * 100 / 100 = 1
            expect(result.records[0].amountCents).toBe(1)
            expect(result.totalDistributionCents).toBe(1)
        })

        it('10 分订单 - L1 上级（10%）应得 1 分', async () => {
            const config = createMockConfig({ l1CommissionRate: 10 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10) // 10 分 = 0.1 元

            // 10 * 10 / 100 = 1
            expect(result.records[0].amountCents).toBe(1)
        })
    })

    // --------------------------------------------------------------------------
    // 层级不足测试（仅 1 级、2 级）
    // --------------------------------------------------------------------------

    describe('层级不足（不足 3 级）', () => {
        it('仅 1 级上级 - L2（团队长）应得 5%', async () => {
            const config = createMockConfig({ l2CommissionRate: 5 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l2-ancestor']),
            })
            const l2Ancestor = createMockEscort({
                id: 'l2-ancestor',
                distributionLevel: 2,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l2Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000) // 100 元

            expect(result.records.length).toBe(1)
            expect(result.records[0].beneficiaryId).toBe('l2-ancestor')
            expect(result.records[0].relationLevel).toBe(1)
            expect(result.records[0].rate).toBe(5)
            expect(result.records[0].amountCents).toBe(500) // 10000 * 5 / 100 = 500 分 = 5 元
            expect(result.totalDistributionCents).toBe(500)
        })

        it('仅 1 级上级 - L3（普通）仅直推应得 2%', async () => {
            const config = createMockConfig({ l3CommissionRate: 2 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l3-ancestor']),
            })
            const l3Ancestor = createMockEscort({
                id: 'l3-ancestor',
                distributionLevel: 3,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l3Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(1)
            expect(result.records[0].amountCents).toBe(200) // 10000 * 2 / 100 = 200 分 = 2 元
        })

        it('仅 2 级上级 - 第 2 级 L3 不应获得分润（L3 只能拿直推）', async () => {
            const config = createMockConfig({ l3CommissionRate: 2 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l3-grandparent', 'l3-parent']),
            })
            const l3Parent = createMockEscort({
                id: 'l3-parent',
                distributionLevel: 3,
                distributionActive: true,
            })
            const l3Grandparent = createMockEscort({
                id: 'l3-grandparent',
                distributionLevel: 3,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l3Parent as any)
                .mockResolvedValueOnce(l3Grandparent as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(1)
            expect(result.records[0].beneficiaryId).toBe('l3-parent')
            expect(result.records[0].relationLevel).toBe(1)
        })

        it('2 级上级 - L1 和 L2 都应获得分润', async () => {
            const config = createMockConfig({ l1CommissionRate: 10, l2CommissionRate: 5 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-grandparent', 'l2-parent']),
            })
            const l2Parent = createMockEscort({
                id: 'l2-parent',
                distributionLevel: 2,
                distributionActive: true,
            })
            const l1Grandparent = createMockEscort({
                id: 'l1-grandparent',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l2Parent as any)
                .mockResolvedValueOnce(l1Grandparent as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(2)
            expect(result.records[0].beneficiaryId).toBe('l2-parent')
            expect(result.records[0].amountCents).toBe(500) // 5%
            expect(result.records[1].beneficiaryId).toBe('l1-grandparent')
            expect(result.records[1].amountCents).toBe(1000) // 10%
            expect(result.totalDistributionCents).toBe(1500) // 15 元
        })
    })

    // --------------------------------------------------------------------------
    // 费率边界测试（0% / 100%）
    // --------------------------------------------------------------------------

    describe('费率边界（0% / 100%）', () => {
        it('费率 0% - 不应产生分润记录', async () => {
            const config = createMockConfig({ l1CommissionRate: 0 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(0)
            expect(result.totalDistributionCents).toBe(0)
        })

        it('费率 100% - 应获得全额分润', async () => {
            const config = createMockConfig({ l1CommissionRate: 100 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(1)
            expect(result.records[0].amountCents).toBe(10000) // 100%
            expect(result.totalDistributionCents).toBe(10000)
        })

        it('费率 50% - 应获得一半分润', async () => {
            const config = createMockConfig({ l2CommissionRate: 50 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l2-ancestor']),
            })
            const l2Ancestor = createMockEscort({
                id: 'l2-ancestor',
                distributionLevel: 2,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l2Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records[0].amountCents).toBe(5000)
        })
    })

    // --------------------------------------------------------------------------
    // 超大金额测试（99999999 分 = 999999.99 元）
    // --------------------------------------------------------------------------

    describe('超大金额（99999999 分 = 999999.99 元）', () => {
        it('99999999 分订单 - L1（10%）应得 9999999.9 -> 10000000 分', async () => {
            const config = createMockConfig({ l1CommissionRate: 10 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-ancestor']),
            })
            const l1Ancestor = createMockEscort({
                id: 'l1-ancestor',
                distributionLevel: 1,
                distributionActive: true,
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l1Ancestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 99999999)

            // 99999999 * 10 / 100 = 9999999.9, Math.round = 10000000
            expect(result.records[0].amountCents).toBe(10000000)
        })

        it('99999999 分订单 - 完整 3 级分润', async () => {
            const config = createMockConfig({
                l1CommissionRate: 10,
                l2CommissionRate: 5,
                l3CommissionRate: 2,
            })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['l1-great', 'l2-grand', 'l3-parent']),
            })
            const l3Parent = createMockEscort({ id: 'l3-parent', distributionLevel: 3, distributionActive: true })
            const l2Grand = createMockEscort({ id: 'l2-grand', distributionLevel: 2, distributionActive: true })
            const l1Great = createMockEscort({ id: 'l1-great', distributionLevel: 1, distributionActive: true })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(l3Parent as any)
                .mockResolvedValueOnce(l2Grand as any)
                .mockResolvedValueOnce(l1Great as any)

            const result = await service.calculateDistribution('order-1', 'source', 99999999)

            // L3 直推：99999999 * 2 / 100 = 1999999.98 -> 2000000
            // L2：99999999 * 5 / 100 = 4999999.95 -> 5000000
            // L1：99999999 * 10 / 100 = 9999999.9 -> 10000000
            expect(result.records.length).toBe(3)
            expect(result.records[0].beneficiaryId).toBe('l3-parent')
            expect(result.records[0].amountCents).toBe(2000000)
            expect(result.records[1].beneficiaryId).toBe('l2-grand')
            expect(result.records[1].amountCents).toBe(5000000)
            expect(result.records[2].beneficiaryId).toBe('l1-great')
            expect(result.records[2].amountCents).toBe(10000000)
            expect(result.totalDistributionCents).toBe(17000000) // 170000 元
        })
    })

    // --------------------------------------------------------------------------
    // 上级状态过滤测试
    // --------------------------------------------------------------------------

    describe('上级状态过滤', () => {
        it('上级状态非 active 时跳过', async () => {
            const config = createMockConfig({ l1CommissionRate: 10 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['inactive-ancestor']),
            })
            const inactiveAncestor = createMockEscort({
                id: 'inactive-ancestor',
                distributionLevel: 1,
                distributionActive: true,
                status: 'suspended',
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(inactiveAncestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(0)
        })

        it('上级 distributionActive 为 false 时跳过', async () => {
            const config = createMockConfig({ l1CommissionRate: 10 })
            const sourceEscort = createMockEscort({
                id: 'source',
                ancestorPath: JSON.stringify(['disabled-ancestor']),
            })
            const disabledAncestor = createMockEscort({
                id: 'disabled-ancestor',
                distributionLevel: 1,
                distributionActive: false,
                status: 'active',
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(disabledAncestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 10000)

            expect(result.records.length).toBe(0)
        })
    })

    // --------------------------------------------------------------------------
    // 随机回归测试（50 组）
    // --------------------------------------------------------------------------

    describe('随机回归测试（50 组）', () => {
        const randomTestCases = generateRandomTestCases(50)

        it.each(randomTestCases)(
            '随机用例 #$index: 金额=$orderAmountCents分, L1费率=$l1Rate%, L2费率=$l2Rate%, L3费率=$l3Rate%, 层级数=$levelCount',
            async ({ orderAmountCents, l1Rate, l2Rate, l3Rate, levelCount }) => {
                const config = createMockConfig({
                    l1CommissionRate: l1Rate,
                    l2CommissionRate: l2Rate,
                    l3CommissionRate: l3Rate,
                })

                const ancestors: string[] = []
                const mockAncestors: MockEscort[] = []

                for (let i = 0; i < levelCount; i++) {
                    const level = (i % 3) + 1
                    const ancestorId = `ancestor-${i}`
                    ancestors.unshift(ancestorId)
                    mockAncestors.push(createMockEscort({
                        id: ancestorId,
                        distributionLevel: level,
                        distributionActive: true,
                    }))
                }

                const sourceEscort = createMockEscort({
                    id: 'source',
                    ancestorPath: ancestors.length > 0 ? JSON.stringify(ancestors) : null,
                })

                prisma.distributionConfig.findFirst.mockResolvedValue(config as any)

                const findUniqueSpy = prisma.escort.findUnique
                findUniqueSpy.mockResolvedValueOnce(sourceEscort as any)

                for (let i = mockAncestors.length - 1; i >= 0 && i >= mockAncestors.length - 3; i--) {
                    findUniqueSpy.mockResolvedValueOnce(mockAncestors[i] as any)
                }

                const result = await service.calculateDistribution('order-1', 'source', orderAmountCents)

                // 验证总分润计算正确（整数累加）
                const calculatedTotal = result.records.reduce((sum, r) => sum + r.amountCents, 0)
                expect(result.totalDistributionCents).toBe(calculatedTotal)

                // 验证每条记录的金额计算公式正确（整数计算）
                for (const record of result.records) {
                    const expectedAmountCents = Math.round(orderAmountCents * record.rate / 100)
                    expect(record.amountCents).toBe(expectedAmountCents)
                }
            }
        )
    })

    // --------------------------------------------------------------------------
    // 大规模随机回归测试（1000 组）- 验证精度一致性
    // --------------------------------------------------------------------------

    describe('大规模随机回归测试（1000 组）', () => {
        it('1000 笔订单分润合计一致性验证', async () => {
            const testCases = generateRandomTestCases(1000)
            let totalExpectedCents = 0
            let totalCalculatedCents = 0

            for (const { orderAmountCents, l1Rate, l2Rate, l3Rate, levelCount } of testCases) {
                const config = createMockConfig({
                    l1CommissionRate: l1Rate,
                    l2CommissionRate: l2Rate,
                    l3CommissionRate: l3Rate,
                })

                const ancestors: string[] = []
                const mockAncestors: MockEscort[] = []

                for (let i = 0; i < levelCount; i++) {
                    const level = (i % 3) + 1
                    const ancestorId = `ancestor-${i}`
                    ancestors.unshift(ancestorId)
                    mockAncestors.push(createMockEscort({
                        id: ancestorId,
                        distributionLevel: level,
                        distributionActive: true,
                    }))
                }

                const sourceEscort = createMockEscort({
                    id: 'source',
                    ancestorPath: ancestors.length > 0 ? JSON.stringify(ancestors) : null,
                })

                prisma.distributionConfig.findFirst.mockResolvedValue(config as any)

                const findUniqueSpy = prisma.escort.findUnique
                findUniqueSpy.mockReset()
                findUniqueSpy.mockResolvedValueOnce(sourceEscort as any)

                for (let i = mockAncestors.length - 1; i >= 0 && i >= mockAncestors.length - 3; i--) {
                    findUniqueSpy.mockResolvedValueOnce(mockAncestors[i] as any)
                }

                const result = await service.calculateDistribution('order-1', 'source', orderAmountCents)

                // 累计计算的总分润
                totalCalculatedCents += result.totalDistributionCents

                // 累计预期的总分润（使用相同公式验证）
                for (const record of result.records) {
                    totalExpectedCents += Math.round(orderAmountCents * record.rate / 100)
                }
            }

            // 核心验证：1000 笔订单的分润合计必须完全一致
            expect(totalCalculatedCents).toBe(totalExpectedCents)

            // 输出统计信息
            console.log(`\n📊 1000 笔订单分润统计:`)
            console.log(`   总计算分润: ${totalCalculatedCents} 分 = ${centsToYuan(totalCalculatedCents)} 元`)
            console.log(`   总预期分润: ${totalExpectedCents} 分 = ${centsToYuan(totalExpectedCents)} 元`)
            console.log(`   差异: ${totalCalculatedCents - totalExpectedCents} 分`)
        })
    })
})

// ============================================================================
// 辅助函数
// ============================================================================

interface RandomTestCase {
    index: number
    orderAmountCents: number // 分
    l1Rate: number
    l2Rate: number
    l3Rate: number
    levelCount: number
}

function generateRandomTestCases(count: number): RandomTestCase[] {
    const cases: RandomTestCase[] = []
    let seed = 12345

    function random(): number {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
    }

    for (let i = 0; i < count; i++) {
        // 随机金额：1 ~ 10000000 分（0.01 ~ 100000 元）
        const orderAmountCents = Math.floor(random() * 10000000) + 1

        // 随机费率：0 ~ 30%
        const l1Rate = Math.round(random() * 30)
        const l2Rate = Math.round(random() * 20)
        const l3Rate = Math.round(random() * 10)

        // 随机层级数：0 ~ 5
        const levelCount = Math.floor(random() * 6)

        cases.push({
            index: i + 1,
            orderAmountCents,
            l1Rate,
            l2Rate,
            l3Rate,
            levelCount,
        })
    }

    return cases
}
