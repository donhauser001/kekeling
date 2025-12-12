/**
 * 分润计算单元测试
 *
 * 目标：锁定 calculateDistribution 重构前后行为一致
 * 覆盖用例：
 * - 0.01 元极小金额
 * - 仅 1 级、2 级（不足 3 级）
 * - 费率 0 / 100%
 * - 超大金额 999999.99
 * - 多笔订单随机回归（50 组）
 */
import { Test, TestingModule } from '@nestjs/testing'
import { DistributionService, DistributionResult } from '../../src/modules/distribution/distribution.service'
import { PrismaService } from '../../src/prisma/prisma.service'

// ============================================================================
// 测试数据构造器
// ============================================================================

interface MockDistributionConfig {
    status: string
    l1CommissionRate: number // 城市合伙人费率
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

// ============================================================================
// 测试套件
// ============================================================================

// Mock PrismaService 类型
interface MockPrismaService {
    distributionConfig: {
        findFirst: jest.Mock
    }
    escort: {
        findUnique: jest.Mock
    }
}

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
    // 基础用例
    // --------------------------------------------------------------------------

    describe('基础场景', () => {
        it('should be defined', () => {
            expect(service).toBeDefined()
        })

        it('无激活配置时返回空结果', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(null)

            const result = await service.calculateDistribution('order-1', 'escort-1', 100)

            expect(result.records).toEqual([])
            expect(result.totalDistribution).toBe(0)
        })

        it('陪诊员不存在时抛出异常', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(createMockConfig() as any)
            prisma.escort.findUnique.mockResolvedValue(null)

            await expect(service.calculateDistribution('order-1', 'escort-1', 100))
                .rejects.toThrow('陪诊员不存在')
        })

        it('无上级链路时返回空结果', async () => {
            prisma.distributionConfig.findFirst.mockResolvedValue(createMockConfig() as any)
            prisma.escort.findUnique.mockResolvedValue(
                createMockEscort({ ancestorPath: null }) as any
            )

            const result = await service.calculateDistribution('order-1', 'escort-1', 100)

            expect(result.records).toEqual([])
            expect(result.totalDistribution).toBe(0)
        })
    })

    // --------------------------------------------------------------------------
    // 极小金额测试（0.01 元）
    // --------------------------------------------------------------------------

    describe('极小金额（0.01 元）', () => {
        it('0.01 元订单 - L1 上级（10%）应得 0 元（四舍五入）', async () => {
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
                .mockResolvedValueOnce(sourceEscort as any)  // 源陪诊员
                .mockResolvedValueOnce(l1Ancestor as any)    // L1 上级

            const result = await service.calculateDistribution('order-1', 'source', 0.01)

            // 0.01 * 10 = 0.1, Math.round(0.1) / 100 = 0
            expect(result.records.length).toBe(1)
            expect(result.records[0].amount).toBe(0)
            expect(result.totalDistribution).toBe(0)
        })

        it('0.01 元订单 - L1 上级（100%）应得 0.01 元', async () => {
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

            const result = await service.calculateDistribution('order-1', 'source', 0.01)

            // 0.01 * 100 = 1, Math.round(1) / 100 = 0.01
            expect(result.records[0].amount).toBe(0.01)
            expect(result.totalDistribution).toBe(0.01)
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records.length).toBe(1)
            expect(result.records[0].beneficiaryId).toBe('l2-ancestor')
            expect(result.records[0].relationLevel).toBe(1) // 直接上级
            expect(result.records[0].rate).toBe(5)
            expect(result.records[0].amount).toBe(5) // 100 * 5 / 100 = 5
            expect(result.totalDistribution).toBe(5)
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records.length).toBe(1)
            expect(result.records[0].amount).toBe(2)
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
                .mockResolvedValueOnce(l3Parent as any)      // relationLevel = 1，L3 可拿
                .mockResolvedValueOnce(l3Grandparent as any) // relationLevel = 2，L3 不可拿

            const result = await service.calculateDistribution('order-1', 'source', 100)

            // 只有直接上级 L3 能拿分润
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records.length).toBe(2)
            expect(result.records[0].beneficiaryId).toBe('l2-parent')
            expect(result.records[0].amount).toBe(5)
            expect(result.records[1].beneficiaryId).toBe('l1-grandparent')
            expect(result.records[1].amount).toBe(10)
            expect(result.totalDistribution).toBe(15)
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            // rate > 0 才会 push，所以 rate = 0 时不会有记录
            expect(result.records.length).toBe(0)
            expect(result.totalDistribution).toBe(0)
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records.length).toBe(1)
            expect(result.records[0].amount).toBe(100)
            expect(result.totalDistribution).toBe(100)
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

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records[0].amount).toBe(50)
        })
    })

    // --------------------------------------------------------------------------
    // 超大金额测试（999999.99 元）
    // --------------------------------------------------------------------------

    describe('超大金额（999999.99 元）', () => {
        it('999999.99 元订单 - L1（10%）应得 99999.999 -> 100000', async () => {
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

            const result = await service.calculateDistribution('order-1', 'source', 999999.99)

            // 999999.99 * 10 = 9999999.9, Math.round(9999999.9) / 100 = 100000
            expect(result.records[0].amount).toBe(100000)
        })

        it('999999.99 元订单 - 完整 3 级分润', async () => {
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
                .mockResolvedValueOnce(l3Parent as any)  // relationLevel = 1
                .mockResolvedValueOnce(l2Grand as any)   // relationLevel = 2
                .mockResolvedValueOnce(l1Great as any)   // relationLevel = 3

            const result = await service.calculateDistribution('order-1', 'source', 999999.99)

            // L3 直推：999999.99 * 2 / 100 = 20000 (Math.round(1999999.98) / 100)
            // L2：999999.99 * 5 / 100 = 50000
            // L1：999999.99 * 10 / 100 = 100000
            expect(result.records.length).toBe(3)
            expect(result.records[0].beneficiaryId).toBe('l3-parent')
            expect(result.records[0].amount).toBe(20000)
            expect(result.records[1].beneficiaryId).toBe('l2-grand')
            expect(result.records[1].amount).toBe(50000)
            expect(result.records[2].beneficiaryId).toBe('l1-great')
            expect(result.records[2].amount).toBe(100000)
            expect(result.totalDistribution).toBe(170000)
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
                status: 'suspended', // 非 active
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(inactiveAncestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 100)

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
                distributionActive: false, // 分销未激活
                status: 'active',
            })

            prisma.distributionConfig.findFirst.mockResolvedValue(config as any)
            prisma.escort.findUnique
                .mockResolvedValueOnce(sourceEscort as any)
                .mockResolvedValueOnce(disabledAncestor as any)

            const result = await service.calculateDistribution('order-1', 'source', 100)

            expect(result.records.length).toBe(0)
        })
    })

    // --------------------------------------------------------------------------
    // 随机回归测试（50 组）
    // --------------------------------------------------------------------------

    describe('随机回归测试（50 组）', () => {
        // 生成随机测试数据
        const randomTestCases = generateRandomTestCases(50)

        it.each(randomTestCases)(
            '随机用例 #$index: 金额=$orderAmount, L1费率=$l1Rate%, L2费率=$l2Rate%, L3费率=$l3Rate%, 层级数=$levelCount',
            async ({ orderAmount, l1Rate, l2Rate, l3Rate, levelCount, expectedTotal }) => {
                const config = createMockConfig({
                    l1CommissionRate: l1Rate,
                    l2CommissionRate: l2Rate,
                    l3CommissionRate: l3Rate,
                })

                // 构建 ancestor 链
                const ancestors: string[] = []
                const mockAncestors: MockEscort[] = []

                for (let i = 0; i < levelCount; i++) {
                    const level = (i % 3) + 1 // 循环使用 L1, L2, L3
                    const ancestorId = `ancestor-${i}`
                    ancestors.unshift(ancestorId) // 最近的在最后
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

                // 按 ancestorPath 逆序 mock（从最近的上级开始）
                for (let i = mockAncestors.length - 1; i >= 0 && i >= mockAncestors.length - 3; i--) {
                    findUniqueSpy.mockResolvedValueOnce(mockAncestors[i] as any)
                }

                const result = await service.calculateDistribution('order-1', 'source', orderAmount)

                // 验证总分润计算正确
                const calculatedTotal = result.records.reduce((sum, r) => sum + r.amount, 0)
                expect(result.totalDistribution).toBeCloseTo(calculatedTotal, 2)

                // 验证每条记录的金额计算公式正确
                for (const record of result.records) {
                    const expectedAmount = Math.round(orderAmount * record.rate) / 100
                    expect(record.amount).toBeCloseTo(expectedAmount, 2)
                }
            }
        )
    })
})

// ============================================================================
// 辅助函数
// ============================================================================

interface RandomTestCase {
    index: number
    orderAmount: number
    l1Rate: number
    l2Rate: number
    l3Rate: number
    levelCount: number
    expectedTotal: number
}

function generateRandomTestCases(count: number): RandomTestCase[] {
    const cases: RandomTestCase[] = []

    // 固定种子确保可重复
    let seed = 12345

    function random(): number {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
    }

    for (let i = 0; i < count; i++) {
        // 随机金额：0.01 ~ 100000
        const orderAmount = Math.round(random() * 10000000) / 100

        // 随机费率：0 ~ 30%
        const l1Rate = Math.round(random() * 30)
        const l2Rate = Math.round(random() * 20)
        const l3Rate = Math.round(random() * 10)

        // 随机层级数：0 ~ 5
        const levelCount = Math.floor(random() * 6)

        cases.push({
            index: i + 1,
            orderAmount,
            l1Rate,
            l2Rate,
            l3Rate,
            levelCount,
            expectedTotal: 0, // 由测试验证
        })
    }

    return cases
}

