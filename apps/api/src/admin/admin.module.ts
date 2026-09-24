import { Module } from '@nestjs/common';
import { AdminIngredientsController } from './admin-ingredients.controller';
import { AdminIngredientsService } from './admin-ingredients.service';

@Module({
  controllers: [AdminIngredientsController],
  providers: [AdminIngredientsService],
})
export class AdminModule {}
