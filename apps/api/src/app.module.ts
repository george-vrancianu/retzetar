import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CartsModule } from './carts/carts.module';
import { validateEnv } from './config/env';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { FavoritesModule } from './favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { PantryModule } from './pantry/pantry.module';
import { RecipesModule } from './recipes/recipes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    RecipesModule,
    PantryModule,
    FavoritesModule,
    DashboardModule,
    CartsModule,
    UsersModule,
  ],
})
export class AppModule {}
