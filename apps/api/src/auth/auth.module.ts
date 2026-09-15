import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import * as schema from '../database/schema';
import { AUTH } from './auth.constants';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [DATABASE, ConfigService],
      useFactory: (
        database: Database,
        config: ConfigService<AppConfig, true>,
      ) =>
        betterAuth({
          appName: 'Retzetar',
          baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
          basePath: '/api/auth',
          secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
          database: drizzleAdapter(database, {
            provider: 'pg',
            schema,
          }),
          emailAndPassword: { enabled: true },
          rateLimit: { enabled: true, window: 60, max: 100 },
          trustedOrigins: [config.get('CLIENT_ORIGIN', { infer: true })],
        }),
    },
    AuthGuard,
  ],
  exports: [AUTH, AuthGuard],
})
export class AuthModule {}
