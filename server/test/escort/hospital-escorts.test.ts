/**
 * 医院关联陪诊员 API 测试
 * 
 * 测试 GET /hospitals/:id/escorts 接口
 */
import { Test, TestingModule } from '@nestjs/testing'
import { HospitalsService } from '../../src/modules/hospitals/hospitals.service'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('Hospital Escorts API', () => {
  let service: HospitalsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalsService,
        {
          provide: PrismaService,
          useValue: {
            escort: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<HospitalsService>(HospitalsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('getEscorts', () => {
    it('should return escorts for a hospital', async () => {
      const mockEscorts = [
        {
          id: 'escort-1',
          name: '陪诊员1',
          avatar: 'avatar1.jpg',
          rating: 4.8,
          ratingCount: 10,
          orderCount: 50,
          experience: '3年',
          level: { code: 'senior', name: '高级', badge: '高级' },
          hospitals: [{ familiarDepts: ['内科', '外科'], isPrimary: true }],
          _count: { reviews: 10 },
        },
      ]

      prisma.escort.findMany = jest.fn().mockResolvedValue(mockEscorts)
      prisma.escort.count = jest.fn().mockResolvedValue(1)

      const result = await service.getEscorts('hospital-1')

      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('escort-1')
      expect(result.data[0].familiarDepts).toEqual(['内科', '外科'])
      expect(result.data[0].isPrimary).toBe(true)
      expect(result.total).toBe(1)
    })

    it('should filter by levelCode', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      await service.getEscorts('hospital-1', { levelCode: 'senior' })

      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            levelCode: 'senior',
          }),
        }),
      )
    })

    it('should sort by rating by default', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      await service.getEscorts('hospital-1')

      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ rating: 'desc' }, { orderCount: 'desc' }],
        }),
      )
    })

    it('should sort by orderCount when specified', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      await service.getEscorts('hospital-1', { sortBy: 'orderCount' })

      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ orderCount: 'desc' }, { rating: 'desc' }],
        }),
      )
    })

    it('should handle pagination', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      await service.getEscorts('hospital-1', { page: 2, pageSize: 10 })

      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      )
    })

    it('should return empty list when hospital has no escorts', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      const result = await service.getEscorts('hospital-1')

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should only return active escorts', async () => {
      prisma.escort.findMany = jest.fn().mockResolvedValue([])
      prisma.escort.count = jest.fn().mockResolvedValue(0)

      await service.getEscorts('hospital-1')

      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            deletedAt: null,
          }),
        }),
      )
    })
  })
})
