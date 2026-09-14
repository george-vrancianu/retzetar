import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AUTH } from './auth/auth.constants';
import type { AuthInstance } from './auth/auth.types';
import { registerAuthHandler } from './auth/register-auth-handler';
import type { AppConfig } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = app.get(ConfigService<AppConfig, true>);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get('CLIENT_ORIGIN', { infer: true }),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Retzetar API')
    .setDescription('Recipe, pantry, dashboard, favorites, and cart API')
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const fastify = app.getHttpAdapter().getInstance();
  registerAuthHandler(fastify, app.get<AuthInstance>(AUTH));

  const port = config.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
