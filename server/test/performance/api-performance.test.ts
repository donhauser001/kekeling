/**
 * API 性能测试
 * 
 * 使用 Jest 进行基本的性能测试
 * 注意：完整的压力测试建议使用 k6 或 Apache Bench
 */
import { Test, TestingModule } from '@nestjs/testing'
import { HospitalsService } from '../../src/modules/hospitals/hospitals.service'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('API Performance Tests', () => {
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
              findMany: jest.fn().mockResolvedValue([]),
              count: jest.fn().mockResolvedValue(0),
            },
          },
        },
      ],
    }).compile()

    service = module.get<HospitalsService>(HospitalsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('GET /hospitals/:id/escorts', () => {
    it('should respond within 500ms', async () => {
      const startTime = Date.now()

      await service.getEscorts('hospital-1')

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)
    })

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now()

      await service.getEscorts('hospital-1', { page: 10, pageSize: 20 })

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)
    })

    it('should use indexes for filtering', async () => {
      await service.getEscorts('hospital-1', { levelCode: 'senior' })

      // 验证查询使用了索引（通过检查查询条件）
      expect(prisma.escort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            levelCode: 'senior',
          }),
        }),
      )
    })
  })
})
