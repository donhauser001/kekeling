/**
 * 价格引擎测试
 * 
 * 测试价格计算逻辑的正确性
 */
import { Test, TestingModule } from '@nestjs/testing'
import { PricingService } from '../../src/modules/pricing/pricing.service'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('PricingService', () => {
  let service: PricingService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: {
            pricingConfig: {
              findFirst: jest.fn(),
            },
            userMembership: {
              findFirst: jest.fn(),
            },
            campaign: {
              findFirst: jest.fn(),
            },
            userCoupon: {
              findFirst: jest.fn(),
            },
            userPoint: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<PricingService>(PricingService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('calculate', () => {
    it('should calculate price with no discounts', async () => {
      // Mock data
      const mockService = {
        id: '1',
        price: 100,
      }

      const mockPricingConfig = {
        discountStackMode: 'sequential',
        couponStackWithMember: true,
        pointsEnabled: true,
        pointsRate: 100,
        pointsMaxRate: 0.5,
        minPayAmount: 0,
      }

      jest.spyOn(prisma.pricingConfig, 'findFirst').mockResolvedValue(mockPricingConfig as any)
      jest.spyOn(prisma.userMembership, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.campaign, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(null)

      const result = await service.calculate({
        userId: '1',
        serviceId: '1',
        service: mockService as any,
      })

      expect(result.finalPrice).toBe(100)
      expect(result.originalPrice).toBe(100)
      expect(result.totalSavings).toBe(0)
    })

    it('should calculate price with member discount', async () => {
      const mockService = {
        id: '1',
        price: 100,
      }

      const mockPricingConfig = {
        discountStackMode: 'sequential',
        couponStackWithMember: true,
        pointsEnabled: true,
        pointsRate: 100,
        pointsMaxRate: 0.5,
        minPayAmount: 0,
      }

      const mockMembership = {
        id: '1',
        status: 'active',
        level: {
          discount: 10, // 10% discount
        },
      }

      jest.spyOn(prisma.pricingConfig, 'findFirst').mockResolvedValue(mockPricingConfig as any)
      jest.spyOn(prisma.userMembership, 'findFirst').mockResolvedValue(mockMembership as any)
      jest.spyOn(prisma.campaign, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(null)

      const result = await service.calculate({
        userId: '1',
        serviceId: '1',
        service: mockService as any,
      })

      // 100 * (1 - 0.1) = 90
      expect(result.finalPrice).toBe(90)
      expect(result.memberPrice).toBe(90)
      expect(result.totalSavings).toBe(10)
    })

    it('should calculate price with coupon discount', async () => {
      const mockService = {
        id: '1',
        price: 100,
      }

      const mockPricingConfig = {
        discountStackMode: 'sequential',
        couponStackWithMember: true,
        pointsEnabled: true,
        pointsRate: 100,
        pointsMaxRate: 0.5,
        minPayAmount: 0,
      }

      const mockCoupon = {
        id: '1',
        type: 'amount',
        value: 20,
        minAmount: 50,
      }

      jest.spyOn(prisma.pricingConfig, 'findFirst').mockResolvedValue(mockPricingConfig as any)
      jest.spyOn(prisma.userMembership, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.campaign, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(mockCoupon as any)
      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(null)

      const result = await service.calculate({
        userId: '1',
        serviceId: '1',
        service: mockService as any,
        couponId: '1',
      })

      // 100 - 20 = 80
      expect(result.finalPrice).toBe(80)
      expect(result.couponDiscount).toBe(20)
      expect(result.totalSavings).toBe(20)
    })

    it('should calculate price with points deduction', async () => {
      const mockService = {
        id: '1',
        price: 100,
      }

      const mockPricingConfig = {
        discountStackMode: 'sequential',
        couponStackWithMember: true,
        pointsEnabled: true,
        pointsRate: 100, // 100 points = 1 yuan
        pointsMaxRate: 0.5, // max 50% deduction
        minPayAmount: 0,
      }

      const mockUserPoint = {
        currentPoints: 5000, // 50 yuan worth
      }

      jest.spyOn(prisma.pricingConfig, 'findFirst').mockResolvedValue(mockPricingConfig as any)
      jest.spyOn(prisma.userMembership, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.campaign, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(mockUserPoint as any)

      const result = await service.calculate({
        userId: '1',
        serviceId: '1',
        service: mockService as any,
        pointsToUse: 5000,
      })

      // 100 - 50 (max 50% of 100) = 50
      expect(result.finalPrice).toBe(50)
      expect(result.pointsDiscount).toBe(50)
      expect(result.pointsUsed).toBe(5000)
    })

    it('should respect minimum pay amount', async () => {
      const mockService = {
        id: '1',
        price: 100,
      }

      const mockPricingConfig = {
        discountStackMode: 'sequential',
        couponStackWithMember: true,
        pointsEnabled: true,
        pointsRate: 100,
        pointsMaxRate: 0.5,
        minPayAmount: 20, // minimum 20 yuan
      }

      const mockCoupon = {
        id: '1',
        type: 'amount',
        value: 90, // would make final price 10, but min is 20
        minAmount: 0,
      }

      jest.spyOn(prisma.pricingConfig, 'findFirst').mockResolvedValue(mockPricingConfig as any)
      jest.spyOn(prisma.userMembership, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.campaign, 'findFirst').mockResolvedValue(null)
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(mockCoupon as any)
      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(null)

      const result = await service.calculate({
        userId: '1',
        serviceId: '1',
        service: mockService as any,
        couponId: '1',
      })

      // Should be 20 (min pay amount), not 10
      expect(result.finalPrice).toBe(20)
    })
  })
})

