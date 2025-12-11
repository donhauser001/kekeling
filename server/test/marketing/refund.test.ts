/**
 * 退款流程测试
 * 
 * 测试订单退款时优惠券、积分、库存的正确退回
 */
import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from '../../src/modules/orders/orders.service'
import { CouponsService } from '../../src/modules/coupons/coupons.service'
import { PointsService } from '../../src/modules/points/points.service'
import { CampaignsService } from '../../src/modules/campaigns/campaigns.service'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('Refund Flow', () => {
  let ordersService: OrdersService
  let couponsService: CouponsService
  let pointsService: PointsService
  let campaignsService: CampaignsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        CouponsService,
        PointsService,
        CampaignsService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            userCoupon: {
              update: jest.fn(),
            },
            userPoint: {
              update: jest.fn(),
            },
            pointRecord: {
              create: jest.fn(),
            },
            seckillItem: {
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile()

    ordersService = module.get<OrdersService>(OrdersService)
    couponsService = module.get<CouponsService>(CouponsService)
    pointsService = module.get<PointsService>(PointsService)
    campaignsService = module.get<CampaignsService>(CampaignsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('handleOrderRefund', () => {
    it('should return coupon on refund', async () => {
      const mockOrder = {
        id: '1',
        couponId: 'coupon-1',
        pointsUsed: 1000,
        campaignId: 'campaign-1',
        serviceId: 'service-1',
        status: 'paid',
      }

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any)
      jest.spyOn(couponsService, 'returnCouponOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(pointsService, 'refundPointsOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(campaignsService, 'releaseSeckillStock').mockResolvedValue(undefined)

      await ordersService.handleOrderRefund('1', '用户申请退款')

      expect(couponsService.returnCouponOnOrderRefund).toHaveBeenCalledWith('1')
    })

    it('should return points on refund', async () => {
      const mockOrder = {
        id: '1',
        couponId: 'coupon-1',
        pointsUsed: 1000,
        campaignId: 'campaign-1',
        serviceId: 'service-1',
        status: 'paid',
      }

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any)
      jest.spyOn(couponsService, 'returnCouponOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(pointsService, 'refundPointsOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(campaignsService, 'releaseSeckillStock').mockResolvedValue(undefined)

      await ordersService.handleOrderRefund('1', '用户申请退款')

      expect(pointsService.refundPointsOnOrderRefund).toHaveBeenCalledWith('1')
    })

    it('should release seckill stock on refund', async () => {
      const mockOrder = {
        id: '1',
        couponId: 'coupon-1',
        pointsUsed: 1000,
        campaignId: 'campaign-1',
        serviceId: 'service-1',
        status: 'paid',
      }

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any)
      jest.spyOn(couponsService, 'returnCouponOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(pointsService, 'refundPointsOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(campaignsService, 'releaseSeckillStock').mockResolvedValue(undefined)

      await ordersService.handleOrderRefund('1', '用户申请退款')

      expect(campaignsService.releaseSeckillStock).toHaveBeenCalledWith('campaign-1', 'service-1')
    })

    it('should handle refund without coupon', async () => {
      const mockOrder = {
        id: '1',
        couponId: null,
        pointsUsed: 0,
        campaignId: null,
        serviceId: 'service-1',
        status: 'paid',
      }

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any)
      jest.spyOn(couponsService, 'returnCouponOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(pointsService, 'refundPointsOnOrderRefund').mockResolvedValue(undefined)
      jest.spyOn(campaignsService, 'releaseSeckillStock').mockResolvedValue(undefined)

      await ordersService.handleOrderRefund('1', '用户申请退款')

      // Should not call returnCouponOnOrderRefund if no coupon
      expect(couponsService.returnCouponOnOrderRefund).not.toHaveBeenCalled()
    })
  })
})

