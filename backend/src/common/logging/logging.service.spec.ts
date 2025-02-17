import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from './logging.service';
import * as winston from 'winston';

jest.mock('winston', () => ({
  format: {
    timestamp: jest.fn().mockReturnValue(() => {}),
    errors: jest.fn().mockReturnValue(() => {}),
    json: jest.fn().mockReturnValue(() => {}),
    combine: jest.fn().mockReturnValue(() => {}),
    colorize: jest.fn().mockReturnValue(() => {}),
    simple: jest.fn().mockReturnValue(() => {}),
  },
  transports: {
    Console: jest.fn(),
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  }),
}));

describe('LoggingService', () => {
  let service: LoggingService;
  let configService: ConfigService;
  let mockLogger: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'NODE_ENV':
                  return 'test';
                case 'LOG_LEVEL':
                  return 'debug';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    configService = module.get<ConfigService>(ConfigService);
    mockLogger = (winston.createLogger as jest.Mock)();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log messages at different levels', () => {
    const testMessage = 'test message';
    const testContext = 'test-context';

    service.log(testMessage, testContext);
    service.error(testMessage, undefined, testContext);
    service.warn(testMessage, testContext);
    service.debug(testMessage, testContext);
    service.verbose(testMessage, testContext);

    expect(mockLogger.info).toHaveBeenCalledWith(testMessage, { context: testContext });
    expect(mockLogger.error).toHaveBeenCalledWith(testMessage, { context: testContext });
    expect(mockLogger.warn).toHaveBeenCalledWith(testMessage, { context: testContext });
    expect(mockLogger.debug).toHaveBeenCalledWith(testMessage, { context: testContext });
    expect(mockLogger.verbose).toHaveBeenCalledWith(testMessage, { context: testContext });
  });
});
