/**
 * 威尔逊评分算法测试
 * 
 * 测试威尔逊评分算法的正确性和边界情况
 */
import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from '../../src/modules/orders/orders.service'
import { PrismaService } from '../../src/prisma/prisma.service'
import { PricingService } from '../../src/modules/pricing/pricing.service'

// 创建一个 token 来匹配 forwardRef 的注入
const MEMBERSHIP_SERVICE_TOKEN = Symbol('MembershipService')

describe('Wilson Rating Algorithm', () => {
  let service: OrdersService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrdersService,
          useFactory: (prisma: PrismaService, pricingService: PricingService) => {
            return new OrdersService(prisma, pricingService, {} as any)
          },
          inject: [PrismaService, PricingService],
        },
        {
          provide: PrismaService,
          useValue: {
            escortReview: {
              findMany: jest.fn(),
            },
            escort: {
              update: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback({
              escortReview: {
                findMany: jest.fn(),
              },
              escort: {
                update: jest.fn(),
              },
            })),
          },
        },
        {
          provide: PricingService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('calculateWilsonScore', () => {
    it('should return 0 for zero total reviews', () => {
      // 使用反射访问私有方法进行测试
      const result = (service as any).calculateWilsonScore(0, 0)
      expect(result).toBe(0)
    })

    it('should calculate score correctly for all positive reviews', () => {
      const result = (service as any).calculateWilsonScore(100, 100)
      expect(result).toBeGreaterThan(0.9)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should calculate score correctly for mixed reviews', () => {
      const result = (service as any).calculateWilsonScore(80, 100) // 80% positive
      expect(result).toBeGreaterThan(0.7)
      expect(result).toBeLessThan(0.9)
    })

    it('should be more conservative for fewer reviews', () => {
      const score10 = (service as any).calculateWilsonScore(8, 10) // 80% positive, 10 reviews
      const score100 = (service as any).calculateWilsonScore(80, 100) // 80% positive, 100 reviews

      // 评价数少的应该更保守（分数更低）
      expect(score10).toBeLessThan(score100)
    })
  })

  describe('updateEscortRating', () => {
    it('should set default rating for escort with no reviews', async () => {
      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      expect(mockTx.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-id' },
        data: { rating: 5.0, ratingCount: 0 },
      })
    })

    it('should calculate rating correctly for new escort (few reviews)', async () => {
      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue([
            { rating: 5 },
            { rating: 4 },
            { rating: 5 },
          ]),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      expect(mockTx.escort.update).toHaveBeenCalled()
      const updateCall = mockTx.escort.update.mock.calls[0][0]
      expect(updateCall.data.rating).toBeGreaterThan(4.5) // 应该向4.8倾斜
      expect(updateCall.data.rating).toBeLessThan(5.0)
      expect(updateCall.data.ratingCount).toBe(3)
    })

    it('should use actual rating for escort with many reviews', async () => {
      // 创建20条评价（平滑因子为1）
      const reviews = Array(20).fill(null).map((_, i) => ({
        rating: i < 16 ? 5 : 4, // 16个5星，4个4星 = 80% positive
      }))

      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue(reviews),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      expect(mockTx.escort.update).toHaveBeenCalled()
      const updateCall = mockTx.escort.update.mock.calls[0][0]
      // 20条评价后应该完全使用实际分数，不再向4.8倾斜
      expect(updateCall.data.rating).toBeGreaterThan(4.0)
      expect(updateCall.data.ratingCount).toBe(20)
    })

    it('should handle all 5-star reviews correctly', async () => {
      const reviews = Array(10).fill(null).map(() => ({ rating: 5 }))

      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue(reviews),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      const updateCall = mockTx.escort.update.mock.calls[0][0]
      expect(updateCall.data.rating).toBeGreaterThan(4.5)
    })

    it('should handle all 1-star reviews correctly', async () => {
      const reviews = Array(10).fill(null).map(() => ({ rating: 1 }))

      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue(reviews),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      const updateCall = mockTx.escort.update.mock.calls[0][0]
      // 全部1星，好评率为0，威尔逊得分应该接近0，映射到3.0
      expect(updateCall.data.rating).toBeGreaterThan(3.0)
      expect(updateCall.data.rating).toBeLessThan(4.0)
    })
  })

  describe('Smoothing Factor', () => {
    it('should apply smoothing for reviews < 20', async () => {
      const reviews = Array(5).fill(null).map(() => ({ rating: 3 })) // 5条3星评价

      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue(reviews),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      const updateCall = mockTx.escort.update.mock.calls[0][0]
      // 5条评价，平滑因子 = 5/20 = 0.25
      // 应该介于4.8（基础分）和实际分之间
      expect(updateCall.data.rating).toBeGreaterThan(3.0)
      expect(updateCall.data.rating).toBeLessThan(4.8)
    })

    it('should not apply smoothing for reviews >= 20', async () => {
      // 使用混合评价，确保评分不是3.0
      const reviews = Array(20).fill(null).map((_, i) => ({
        rating: i < 16 ? 5 : 4 // 16个5星，4个4星 = 80% positive
      }))

      const mockTx = {
        escortReview: {
          findMany: jest.fn().mockResolvedValue(reviews),
        },
        escort: {
          update: jest.fn().mockResolvedValue({}),
        },
      }

      await (service as any).updateEscortRating(mockTx, 'escort-id')

      const updateCall = mockTx.escort.update.mock.calls[0][0]
      // 20条评价，平滑因子 = 1，应该完全使用实际分数
      // 80% positive 应该得到较高的评分
      expect(updateCall.data.rating).toBeGreaterThan(4.0)
      expect(updateCall.data.rating).toBeLessThan(5.0)
    })
  })
})
