import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import * as Sentry from '@sentry/node';

jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  startTransaction: jest.fn().mockReturnValue({
    finish: jest.fn(),
  }),
  Integrations: {
    Http: jest.fn(),
    Express: jest.fn(),
    Postgres: jest.fn(),
  },
}));

describe('MonitoringService', () => {
  let service: MonitoringService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'NODE_ENV':
                  return 'test';
                case 'SENTRY_DSN':
                  return 'https://fake-dsn@sentry.io/123';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Sentry on module init', () => {
    service.onModuleInit();
    expect(Sentry.init).toHaveBeenCalled();
  });

  it('should capture exceptions', () => {
    const error = new Error('Test error');
    service.captureException(error, 'test-context');
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { context: 'test-context' },
    });
  });

  it('should capture messages', () => {
    service.captureMessage('Test message', 'info');
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
  });

  it('should start transactions', () => {
    const transaction = service.startTransaction('test-context', 'test-op');
    expect(Sentry.startTransaction).toHaveBeenCalledWith({
      name: 'test-context',
      op: 'test-op',
    });
    expect(transaction).toBeDefined();
  });
});
