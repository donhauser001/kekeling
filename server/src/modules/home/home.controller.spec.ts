import { Test, TestingModule } from '@nestjs/testing'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'

describe('HomeController', () => {
    let controller: HomeController

    const mockService: Partial<HomeService> = {
        getStatistics: async () => ({
            totalServices: 10,
            totalHospitals: 5,
            totalEscorts: 3,
            totalOrders: 100,
        } as any),
        getBanners: async () => ({
            enabled: true,
            width: 750,
            height: 360,
            items: [{ id: '1', title: 't', imageUrl: '/x.png', linkUrl: null }],
        }),
        getHomeConfig: async () => ({ theme: 'default' } as any),
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HomeController],
            providers: [{ provide: HomeService, useValue: mockService }],
        }).compile()

        controller = module.get<HomeController>(HomeController)
    })

    it('should get statistics wrapped in ApiResponse', async () => {
        const res = await controller.getStatistics()
        expect(res.code).toBe(0)
        expect(res.data).toHaveProperty('totalOrders', 100)
    })

    it('should get banners wrapped in ApiResponse', async () => {
        const res = await controller.getBanners()
        expect(res.code).toBe(0)
        expect(res.data).toHaveProperty('enabled', true)
        expect(res.data).toHaveProperty('items')
        expect(Array.isArray(res.data.items)).toBe(true)
    })

    it('should get config wrapped in ApiResponse', async () => {
        const res = await controller.getHomeConfig()
        expect(res.code).toBe(0)
        expect(res.data).toHaveProperty('theme', 'default')
    })
})
