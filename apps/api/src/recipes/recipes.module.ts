import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  controllers: [RecipesController, IngredientsController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
