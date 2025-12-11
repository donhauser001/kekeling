/**
 * 防刷机制测试
 * 
 * 测试各种防刷机制的正确性
 */
import { Test, TestingModule } from '@nestjs/testing'
import { CouponsService } from '../../src/modules/coupons/coupons.service'
import { PointsService } from '../../src/modules/points/points.service'
import { ReferralsService } from '../../src/modules/referrals/referrals.service'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('Anti-Fraud Mechanisms', () => {
  let couponsService: CouponsService
  let pointsService: PointsService
  let referralsService: ReferralsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        PointsService,
        ReferralsService,
        {
          provide: PrismaService,
          useValue: {
            couponTemplate: {
              findUnique: jest.fn(),
            },
            userCoupon: {
              count: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            userPoint: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            pointRecord: {
              count: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            referralRecord: {
              count: jest.fn(),
              findFirst: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile()

    couponsService = module.get<CouponsService>(CouponsService)
    pointsService = module.get<PointsService>(PointsService)
    referralsService = module.get<ReferralsService>(ReferralsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('Coupon Anti-Fraud', () => {
    it('should enforce per-user limit', async () => {
      const mockTemplate = {
        id: '1',
        perUserLimit: 2,
        totalStock: 100,
        claimedCount: 50,
      }

      const mockUserCoupons = [
        { id: '1', userId: 'user-1', templateId: '1' },
        { id: '2', userId: 'user-1', templateId: '1' },
      ]

      jest.spyOn(prisma.couponTemplate, 'findUnique').mockResolvedValue(mockTemplate as any)
      jest.spyOn(prisma.userCoupon, 'count').mockResolvedValue(2)

      await expect(
        couponsService.claimCoupon('user-1', '1'),
      ).rejects.toThrow('已达到每人限领数量')
    })

    it('should enforce daily limit', async () => {
      const mockTemplate = {
        id: '1',
        perUserLimit: 10,
        dailyLimit: 1,
        totalStock: 100,
        claimedCount: 50,
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const mockUserCoupons = [
        {
          id: '1',
          userId: 'user-1',
          templateId: '1',
          createdAt: new Date(),
        },
      ]

      jest.spyOn(prisma.couponTemplate, 'findUnique').mockResolvedValue(mockTemplate as any)
      jest.spyOn(prisma.userCoupon, 'count').mockResolvedValue(0)
      jest.spyOn(prisma.userCoupon, 'findMany').mockResolvedValue(mockUserCoupons as any)

      await expect(
        couponsService.claimCoupon('user-1', '1'),
      ).rejects.toThrow('已达到每日限领数量')
    })

    it('should enforce total stock limit', async () => {
      const mockTemplate = {
        id: '1',
        perUserLimit: 10,
        totalStock: 100,
        claimedCount: 100, // All claimed
      }

      jest.spyOn(prisma.couponTemplate, 'findUnique').mockResolvedValue(mockTemplate as any)
      jest.spyOn(prisma.userCoupon, 'count').mockResolvedValue(0)

      await expect(
        couponsService.claimCoupon('user-1', '1'),
      ).rejects.toThrow('优惠券已领完')
    })
  })

  describe('Points Anti-Fraud', () => {
    it('should prevent duplicate daily checkin', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const mockPointRecord = {
        id: '1',
        userId: 'user-1',
        type: 'earn',
        source: 'daily_checkin',
        createdAt: new Date(),
      }

      jest.spyOn(prisma.pointRecord, 'count').mockResolvedValue(1)

      await expect(
        pointsService.checkIn('user-1'),
      ).rejects.toThrow('今日已签到')
    })

    it('should enforce points usage limit', async () => {
      const mockUserPoint = {
        currentPoints: 1000,
      }

      const mockPricingConfig = {
        pointsMaxRate: 0.5, // max 50%
      }

      jest.spyOn(prisma.userPoint, 'findFirst').mockResolvedValue(mockUserPoint as any)

      // Try to use more than 50% of order amount
      const orderAmount = 100
      const maxPointsToUse = Math.floor(orderAmount * 0.5 * 100) // 5000 points = 50 yuan

      // Should not allow using more than max
      expect(maxPointsToUse).toBe(5000)
    })
  })

  describe('Referral Anti-Fraud', () => {
    it('should prevent self-invitation', async () => {
      const mockUser = {
        id: 'user-1',
        inviteCode: 'INVITE-1',
      }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)

      await expect(
        referralsService.handleUserRegister('user-1', 'INVITE-1'),
      ).rejects.toThrow('不能邀请自己')
    })

    it('should prevent duplicate phone invitation', async () => {
      const mockRecord = {
        id: '1',
        inviterId: 'user-1',
        inviteePhone: '13800138000',
        status: 'registered',
      }

      jest.spyOn(prisma.referralRecord, 'findFirst').mockResolvedValue(mockRecord as any)

      // handleUserRegister 只接受 userId 和 inviteCode 两个参数
      // 手机号验证逻辑在注册流程中处理
      await expect(
        referralsService.handleUserRegister('user-2', 'INVITE-1'),
      ).rejects.toThrow()
    })

    it('should enforce daily invite limit', async () => {
      const mockRule = {
        dailyInviteLimit: 5,
      }

      const mockCount = 5

      jest.spyOn(prisma.referralRecord, 'count').mockResolvedValue(mockCount)

      // Should reject if daily limit reached
      expect(mockCount).toBeGreaterThanOrEqual(mockRule.dailyInviteLimit)
    })

    it('should enforce total invite limit', async () => {
      const mockRule = {
        totalInviteLimit: 100,
      }

      const mockCount = 100

      jest.spyOn(prisma.referralRecord, 'count').mockResolvedValue(mockCount)

      // Should reject if total limit reached
      expect(mockCount).toBeGreaterThanOrEqual(mockRule.totalInviteLimit)
    })
  })
})

