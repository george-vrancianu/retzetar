import { Module } from '@nestjs/common';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { AdminIngredientsController } from './admin-ingredients.controller';
import { AdminIngredientsService } from './admin-ingredients.service';

@Module({
  imports: [IngredientCatalogModule],
  controllers: [AdminIngredientsController],
  providers: [AdminIngredientsService],
})
export class AdminModule {}
