import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './modules/payments/stripe/stripe.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { SmtpModule } from './modules/smtp/smtp.module';
import { CorsModule } from './cors/cors.module';
import { CachePolicyModule } from './common/cache-policy/cache-policy.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    
    // Feature Modules
    AuthModule,
    StripeModule,
    SubscriptionModule,
    SmtpModule,
    CorsModule,
    CachePolicyModule,
    
    // Development Modules (not used in production)
    process.env.NODE_ENV !== 'production' ? SeedModule : undefined,
  ].filter(Boolean),
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AuthModule,
    },
  ],
})
export class AppModule {}
