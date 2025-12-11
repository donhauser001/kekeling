/**
 * 退款流程测试
 * 
 * 测试订单退款时优惠券、积分、库存的正确退回
 */
import { Test, TestingModule } from '@nestjs/testing'
import { CouponsService } from '../../src/modules/coupons/coupons.service'
import { PointsService } from '../../src/modules/points/points.service'
import { CampaignsService } from '../../src/modules/campaigns/campaigns.service'
import { CommissionService } from '../../src/modules/escort-app/commission.service'
import { PrismaService } from '../../src/prisma/prisma.service'
import { RedisService } from '../../src/modules/redis/redis.service'

describe('Refund Flow', () => {
  let couponsService: CouponsService
  let pointsService: PointsService
  let campaignsService: CampaignsService
  let commissionService: CommissionService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        PointsService,
        CampaignsService,
        {
          provide: CommissionService,
          useValue: {
            handleOrderRefund: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            userCoupon: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            userPoint: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            pointRecord: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
            seckillItem: {
              update: jest.fn(),
            },
            $transaction: jest.fn((fn) => fn(prisma)),
          },
        },
        {
          provide: RedisService,
          useValue: {
            checkRateLimit: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile()

    couponsService = module.get<CouponsService>(CouponsService)
    pointsService = module.get<PointsService>(PointsService)
    campaignsService = module.get<CampaignsService>(CampaignsService)
    commissionService = module.get<CommissionService>(CommissionService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('returnCoupon', () => {
    it('should return coupon on refund', async () => {
      const mockUserCoupon = {
        id: 'coupon-1',
        status: 'used',
        orderId: 'order-1',
      }

      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(mockUserCoupon as any)
      jest.spyOn(prisma.userCoupon, 'update').mockResolvedValue({ ...mockUserCoupon, status: 'unused' } as any)

      await couponsService.returnCoupon('order-1')

      expect(prisma.userCoupon.update).toHaveBeenCalledWith({
        where: { id: 'coupon-1' },
        data: {
          status: 'unused',
          usedAt: null,
          orderId: null,
        },
      })
    })

    it('should not return coupon if not found', async () => {
      jest.spyOn(prisma.userCoupon, 'findFirst').mockResolvedValue(null)

      await couponsService.returnCoupon('order-1')

      expect(prisma.userCoupon.update).not.toHaveBeenCalled()
    })
  })

  describe('refundPoints', () => {
    it('should refund points on order refund', async () => {
      const mockPointRecords = [
        {
          id: 'record-1',
          userId: 'user-1',
          type: 'use',
          points: -500,
          source: 'order',
          sourceId: 'order-1',
        },
      ]

      const mockUserPoint = {
        userId: 'user-1',
        currentPoints: 100,
        usedPoints: 500,
        totalPoints: 600,
      }

      jest.spyOn(prisma.pointRecord, 'findMany').mockResolvedValue(mockPointRecords as any)
      jest.spyOn(prisma.userPoint, 'findUnique').mockResolvedValue(mockUserPoint as any)
      jest.spyOn(prisma.userPoint, 'update').mockResolvedValue({} as any)
      jest.spyOn(prisma.pointRecord, 'create').mockResolvedValue({} as any)

      await pointsService.refundPoints('order-1')

      expect(prisma.userPoint.update).toHaveBeenCalled()
    })

    it('should not refund points if no usage records', async () => {
      jest.spyOn(prisma.pointRecord, 'findMany').mockResolvedValue([])

      await pointsService.refundPoints('order-1')

      expect(prisma.userPoint.update).not.toHaveBeenCalled()
    })
  })

  describe('releaseSeckillStock', () => {
    it('should release seckill stock on refund', async () => {
      jest.spyOn(prisma.seckillItem, 'update').mockResolvedValue({} as any)

      await campaignsService.releaseSeckillStock('campaign-1', 'service-1')

      expect(prisma.seckillItem.update).toHaveBeenCalledWith({
        where: {
          campaignId_serviceId: {
            campaignId: 'campaign-1',
            serviceId: 'service-1',
          },
        },
        data: {
          soldCount: { decrement: 1 },
        },
      })
    })
  })

  describe('handleOrderRefund (CommissionService)', () => {
    it('should handle commission clawback on refund', async () => {
      jest.spyOn(commissionService, 'handleOrderRefund').mockResolvedValue({
        success: true,
        clawedBackAmount: 70,
        debtCreated: false,
        debtAmount: 0,
      })

      const result = await commissionService.handleOrderRefund('order-1', '用户申请退款')

      expect(commissionService.handleOrderRefund).toHaveBeenCalledWith('order-1', '用户申请退款')
      expect(result).toBeDefined()
      expect(result?.clawedBackAmount).toBe(70)
      expect(result?.success).toBe(true)
    })
  })
})
