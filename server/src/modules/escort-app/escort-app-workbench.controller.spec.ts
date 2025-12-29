import { Test, TestingModule } from '@nestjs/testing';
import { EscortAppWorkbenchController } from './escort-app-workbench.controller';
import { EscortAppService } from './escort-app.service';
import { UnauthorizedException } from '@nestjs/common';

describe('EscortAppWorkbenchController', () => {
  let controller: EscortAppWorkbenchController;
  let service: EscortAppService;

  const mockEscortAppService = {
    getWorkbenchSettingsByEscortId: jest.fn(),
    updateWorkbenchSettingsByEscortId: jest.fn(),
    updateWorkbenchPreferences: jest.fn(),
    updateWorkbenchNotifications: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscortAppWorkbenchController],
      providers: [
        {
          provide: EscortAppService,
          useValue: mockEscortAppService,
        },
      ],
    }).compile();

    controller = module.get<EscortAppWorkbenchController>(EscortAppWorkbenchController);
    service = module.get<EscortAppService>(EscortAppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return settings when escort is authenticated', async () => {
      const mockSettings = {
        profile: { name: '张三', avatar: null, level: '金牌陪诊员', rating: 4.9 },
        onlineStatus: 'working',
        autoAcceptOrders: false,
        preferences: {
          serviceTypes: ['basic'],
          serviceAreas: ['北京协和医院'],
          departments: ['内科'],
          workingHours: { start: '08:00', end: '18:00' },
        },
        notifications: {
          newOrder: true,
          orderStatus: true,
          system: true,
          marketing: false,
        },
      };

      mockEscortAppService.getWorkbenchSettingsByEscortId.mockResolvedValue(mockSettings);

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const result = await controller.getSettings(req);

      expect(result.data).toEqual(mockSettings);
      expect(mockEscortAppService.getWorkbenchSettingsByEscortId).toHaveBeenCalledWith('escort-123');
    });

    it('should throw UnauthorizedException when not an escort', async () => {
      const req = { user: { isEscort: false } };

      await expect(controller.getSettings(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateSettings', () => {
    it('should update settings when escort is authenticated', async () => {
      mockEscortAppService.updateWorkbenchSettingsByEscortId.mockResolvedValue({ success: true });

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const body = { autoAcceptOrders: true };
      const result = await controller.updateSettings(req, body);

      expect(result.data).toEqual({ success: true });
      expect(mockEscortAppService.updateWorkbenchSettingsByEscortId).toHaveBeenCalledWith('escort-123', body);
    });

    it('should throw UnauthorizedException when not an escort', async () => {
      const req = { user: { isEscort: false } };
      const body = { autoAcceptOrders: true };

      await expect(controller.updateSettings(req, body)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences when escort is authenticated', async () => {
      mockEscortAppService.updateWorkbenchPreferences.mockResolvedValue({ success: true });

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const body = {
        serviceAreas: ['北京协和医院', '北京友谊医院'],
        departments: ['内科', '外科'],
        workingHours: { start: '09:00', end: '17:00' },
      };
      const result = await controller.updatePreferences(req, body);

      expect(result.data).toEqual({ success: true });
      expect(mockEscortAppService.updateWorkbenchPreferences).toHaveBeenCalledWith('escort-123', body);
    });

    it('should throw UnauthorizedException when not an escort', async () => {
      const req = { user: { isEscort: false } };
      const body = { serviceAreas: ['北京协和医院'] };

      await expect(controller.updatePreferences(req, body)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle partial preference updates', async () => {
      mockEscortAppService.updateWorkbenchPreferences.mockResolvedValue({ success: true });

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const body = { workingHours: { start: '10:00', end: '20:00' } };
      const result = await controller.updatePreferences(req, body);

      expect(result.data).toEqual({ success: true });
      expect(mockEscortAppService.updateWorkbenchPreferences).toHaveBeenCalledWith('escort-123', body);
    });
  });

  describe('updateNotifications', () => {
    it('should update notifications when escort is authenticated', async () => {
      mockEscortAppService.updateWorkbenchNotifications.mockResolvedValue({ success: true });

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const body = { newOrder: false, marketing: true };
      const result = await controller.updateNotifications(req, body);

      expect(result.data).toEqual({ success: true });
      expect(mockEscortAppService.updateWorkbenchNotifications).toHaveBeenCalledWith('escort-123', body);
    });

    it('should throw UnauthorizedException when not an escort', async () => {
      const req = { user: { isEscort: false } };
      const body = { newOrder: false };

      await expect(controller.updateNotifications(req, body)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle single notification update', async () => {
      mockEscortAppService.updateWorkbenchNotifications.mockResolvedValue({ success: true });

      const req = { user: { isEscort: true, escortId: 'escort-123' } };
      const body = { system: false };
      const result = await controller.updateNotifications(req, body);

      expect(result.data).toEqual({ success: true });
      expect(mockEscortAppService.updateWorkbenchNotifications).toHaveBeenCalledWith('escort-123', body);
    });
  });
});


