import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResourceMonitoringService } from './resource.monitoring.service';
import { monitoringConfig } from '../../config/monitoring.config';
import * as newrelic from 'newrelic';

// Mock newrelic
jest.mock('newrelic', () => ({
  addCustomAttribute: jest.fn(),
  recordMetric: jest.fn(),
}));

describe('ResourceMonitoringService', () => {
  let service: ResourceMonitoringService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'environment') return 'test';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceMonitoringService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ResourceMonitoringService>(ResourceMonitoringService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize monitoring and set up alerts', async () => {
      // Spy on private methods
      const setupCPUAlertsSpy = jest.spyOn<any, any>(service, 'setupCPUAlerts');
      const setupMemoryAlertsSpy = jest.spyOn<any, any>(service, 'setupMemoryAlerts');
      const setupRedisAlertsSpy = jest.spyOn<any, any>(service, 'setupRedisAlerts');
      const startResourceMonitoringSpy = jest.spyOn<any, any>(service, 'startResourceMonitoring');

      await service.onModuleInit();

      expect(setupCPUAlertsSpy).toHaveBeenCalled();
      expect(setupMemoryAlertsSpy).toHaveBeenCalled();
      expect(setupRedisAlertsSpy).toHaveBeenCalled();
      expect(startResourceMonitoringSpy).toHaveBeenCalled();
    });
  });

  describe('Alert Setup', () => {
    it('should set up CPU alerts with correct thresholds', async () => {
      await service.onModuleInit();

      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'cpuWarningThreshold',
        monitoringConfig.cpu.warning
      );
      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'cpuCriticalThreshold',
        monitoringConfig.cpu.critical
      );
    });

    it('should set up memory alerts with correct thresholds', async () => {
      await service.onModuleInit();

      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'memoryWarningThreshold',
        monitoringConfig.memory.warning
      );
      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'memoryCriticalThreshold',
        monitoringConfig.memory.critical
      );
    });

    it('should set up Redis alerts with correct thresholds', async () => {
      // Mock production environment for alert creation
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'environment') return 'production';
        return undefined;
      });

      await service.onModuleInit();

      // Verify Redis memory alert
      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'alert.High Redis Memory Usage.condition',
        expect.stringContaining(String(monitoringConfig.redis.memoryWarning))
      );

      // Verify Redis eviction rate alert
      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'alert.High Redis Eviction Rate.condition',
        expect.stringContaining(String(monitoringConfig.redis.evictionRate))
      );

      // Verify Redis hit rate alert
      expect(newrelic.addCustomAttribute).toHaveBeenCalledWith(
        'alert.Low Redis Cache Hit Rate.condition',
        expect.stringContaining(String(monitoringConfig.redis.hitRateWarning))
      );
    });
  });

  describe('Resource Monitoring', () => {
    it('should record system metrics', async () => {
      const monitorSystemResourcesSpy = jest.spyOn<any, any>(
        service,
        'monitorSystemResources'
      );

      await service['monitorSystemResources']();

      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        'system.cpu.usage',
        expect.any(Number)
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        'system.memory.usage',
        expect.any(Number)
      );
      expect(monitorSystemResourcesSpy).toHaveReturned();
    });

    it('should record Redis metrics', async () => {
      const monitorRedisResourcesSpy = jest.spyOn<any, any>(
        service,
        'monitorRedisResources'
      );

      await service['monitorRedisResources']();

      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        'redis.memory.usage',
        expect.any(Number)
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        'redis.eviction.rate',
        expect.any(Number)
      );
      expect(newrelic.recordMetric).toHaveBeenCalledWith(
        'redis.hit.rate',
        expect.any(Number)
      );
      expect(monitorRedisResourcesSpy).toHaveReturned();
    });
  });

  describe('Dyno Scaling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not attempt scaling in non-production environment', async () => {
      const scaleDynosSpy = jest.spyOn<any, any>(service, 'scaleDynos');

      await service['checkDynoScaling']();

      expect(scaleDynosSpy).not.toHaveBeenCalled();
    });

    it('should attempt scaling in production environment when thresholds are exceeded', async () => {
      // Mock production environment
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'environment') return 'production';
        return undefined;
      });

      const scaleDynosSpy = jest.spyOn<any, any>(service, 'scaleDynos')
        .mockImplementation(async () => {});
      
      // Force high CPU usage
      jest.spyOn<any, any>(service, 'getSystemMetrics').mockResolvedValue({
        cpu: 90,
        memory: 50,
      });

      await service['checkDynoScaling']();
      await jest.runAllTimersAsync();

      expect(scaleDynosSpy).toHaveBeenCalledWith('up');
    });
  });
});
