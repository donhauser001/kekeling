/**
 * 服务设置 API 测试
 * 
 * 测试 POST /escort/settings/service 接口
 */
import { Test, TestingModule } from '@nestjs/testing'
import { EscortAppService } from '../../src/modules/escort-app/escort-app.service'
import { PrismaService } from '../../src/prisma/prisma.service'
import { CommissionService } from '../../src/modules/escort-app/commission.service'

describe('Service Settings API', () => {
  let service: EscortAppService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscortAppService,
        {
          provide: PrismaService,
          useValue: {
            escort: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: CommissionService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<EscortAppService>(EscortAppService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('updateServiceSettings', () => {
    const mockEscort = {
      id: 'escort-1',
      userId: 'user-1',
    }

    beforeEach(() => {
      prisma.escort.findFirst = jest.fn().mockResolvedValue(mockEscort)
      prisma.escort.update = jest.fn().mockResolvedValue({})
    })

    it('should update service radius', async () => {
      await service.updateServiceSettings('user-1', {
        serviceRadius: 30,
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: { serviceRadius: 30 },
      })
    })

    it('should update max daily orders', async () => {
      await service.updateServiceSettings('user-1', {
        maxDailyOrders: 10,
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: { maxDailyOrders: 10 },
      })
    })

    it('should update service hours', async () => {
      const serviceHours = {
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '18:00' }],
      }

      await service.updateServiceSettings('user-1', {
        serviceHours: JSON.stringify(serviceHours),
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: {
          serviceHours: JSON.stringify(serviceHours),
        },
      })
    })

    it('should update all settings together', async () => {
      const serviceHours = {
        monday: [{ start: '09:00', end: '18:00' }],
      }

      await service.updateServiceSettings('user-1', {
        serviceHours: JSON.stringify(serviceHours),
        serviceRadius: 25,
        maxDailyOrders: 8,
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: {
          serviceHours: JSON.stringify(serviceHours),
          serviceRadius: 25,
          maxDailyOrders: 8,
        },
      })
    })

    it('should throw error for invalid service radius (< 5)', async () => {
      await expect(
        service.updateServiceSettings('user-1', {
          serviceRadius: 4,
        }),
      ).rejects.toThrow('服务半径必须在5-50公里之间')
    })

    it('should throw error for invalid service radius (> 50)', async () => {
      await expect(
        service.updateServiceSettings('user-1', {
          serviceRadius: 51,
        }),
      ).rejects.toThrow('服务半径必须在5-50公里之间')
    })

    it('should throw error for invalid max daily orders (< 1)', async () => {
      await expect(
        service.updateServiceSettings('user-1', {
          maxDailyOrders: 0,
        }),
      ).rejects.toThrow('每日最大接单数必须在1-20之间')
    })

    it('should throw error for invalid max daily orders (> 20)', async () => {
      await expect(
        service.updateServiceSettings('user-1', {
          maxDailyOrders: 21,
        }),
      ).rejects.toThrow('每日最大接单数必须在1-20之间')
    })

    it('should accept valid boundary values', async () => {
      await service.updateServiceSettings('user-1', {
        serviceRadius: 5, // 最小值
        maxDailyOrders: 1, // 最小值
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: {
          serviceRadius: 5,
          maxDailyOrders: 1,
        },
      })

      await service.updateServiceSettings('user-1', {
        serviceRadius: 50, // 最大值
        maxDailyOrders: 20, // 最大值
      })

      expect(prisma.escort.update).toHaveBeenCalledWith({
        where: { id: 'escort-1' },
        data: {
          serviceRadius: 50,
          maxDailyOrders: 20,
        },
      })
    })
  })
})
